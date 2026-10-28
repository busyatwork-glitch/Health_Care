import { GoogleGenAI } from '@google/genai';
import { assessmentSchema, type Assessment } from '@care-kind/shared';
import { env } from '../config/env.js';
import { emergencyAssessment, emergencyDetected, sanitizeAssessment } from './safety.js';
import { ApiError } from '../middleware/errors.js';

const system = `You provide cautious general health information, never diagnosis. Do not prescribe medicines or dosages, tell people to stop prescribed treatment, or discourage clinical care. Keep your response concise: message under 150 words, 2-3 possibleCauses, 2-4 recommendedActions. Be calm and non-alarmist. Assess urgency as routine, soon, urgent, or emergency with reasoning. Never invent patient details. Mention uncertainty. For emergencies say seek emergency services immediately. Return ONLY valid JSON matching: {message,symptomSummary:string[],possibleCauses:{name,explanation,uncertainty}[],urgency,urgencyExplanation,recommendedSpecialties:string[],redFlags:string[],recommendedActions:string[],showDoctorCTA:boolean,showHospitalCTA:boolean}.`;
export type ChatTurn = { role: 'user' | 'assistant'; text: string };

function cleanJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
}

export async function assess(
  text: string,
  history: ChatTurn[],
): Promise<{ assessment: Assessment; provider: 'gemini' | 'safety'; demo: boolean }> {
  if (
    emergencyDetected(
      `${history
        .slice(-6)
        .map((m) => m.text)
        .join('\n')}\n${text}`,
    )
  )
    return { assessment: emergencyAssessment(), provider: 'safety', demo: false };
  if (!env.GEMINI_API_KEY) {
    if (env.NODE_ENV === 'production')
      throw Object.assign(new Error('AI service is not configured'), { status: 503 });
    return {
      assessment: {
        message:
          'Demo mode: Gemini is not configured, so I cannot generate an AI health assessment. You can still explore the sample doctor and hospital directory. If symptoms feel severe or rapidly worsen, seek urgent medical care.',
        symptomSummary: [],
        possibleCauses: [],
        urgency: 'routine',
        urgencyExplanation: 'No medical assessment was generated in demo mode.',
        recommendedSpecialties: [],
        redFlags: [],
        recommendedActions: [
          'Configure Gemini to enable AI health conversations',
          'Seek professional care for health concerns',
        ],
        showDoctorCTA: true,
        showHospitalCTA: true,
      },
      provider: 'safety',
      demo: true,
    };
  }

  const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const contents = [
    ...history.slice(-10).map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    { role: 'user', parts: [{ text }] },
  ];

  const candidateModels = Array.from(
    new Set(
      [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        env.GEMINI_MODEL,
        'gemini-3.7-flash',
        'gemini-3.8-flash',
      ].filter(Boolean),
    ),
  );

  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          maxOutputTokens: 3500,
          temperature: 0.2,
          httpOptions: { timeout: env.GEMINI_TIMEOUT_MS, retryOptions: { attempts: 1 } },
        },
      });

      const responseText = response.text ? cleanJson(response.text) : '';
      let parsed;
      try {
        parsed = assessmentSchema.parse(JSON.parse(responseText));
      } catch (parseError) {
        console.warn(
          JSON.stringify({
            level: 'warn',
            event: 'gemini_parse_retry',
            model,
            message: parseError instanceof Error ? parseError.message : 'JSON parse failed',
          }),
        );
        continue;
      }

      return { assessment: sanitizeAssessment(parsed), provider: 'gemini', demo: false };
    } catch (error) {
      lastError = error;
      const status =
        typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0;
      const upstreamMessage =
        error instanceof Error
          ? error.message.replaceAll(env.GEMINI_API_KEY, '[redacted]').slice(0, 400)
          : 'Unknown Gemini API error';
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'gemini_model_failed',
          model,
          ...(status ? { status } : {}),
          message: upstreamMessage,
        }),
      );
    }
  }

  const status =
    typeof lastError === 'object' && lastError !== null && 'status' in lastError
      ? Number(lastError.status)
      : 0;
  if (status === 429 || status === 503) {
    throw new ApiError(
      503,
      'The AI service is experiencing high demand right now. Please try again in a moment.',
    );
  }
  throw new ApiError(
    502,
    'The AI service could not complete this request. Your message was saved; please try again.',
  );
}
