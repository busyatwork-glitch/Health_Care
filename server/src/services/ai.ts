import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { assessmentSchema, type Assessment } from '@care-kind/shared';
import { env } from '../config/env.js';
import { emergencyAssessment, emergencyDetected, sanitizeAssessment } from './safety.js';
import { ApiError } from '../middleware/errors.js';

const system = `You provide cautious general health information, never diagnosis. Do not prescribe medicines or dosages, tell people to stop prescribed treatment, or discourage clinical care. Ask a few concise follow-up questions when information is insufficient. Be calm and non-alarmist. Assess urgency as routine, soon, urgent, or emergency with reasoning. Never invent patient details. Mention uncertainty. For emergencies say seek emergency services immediately. Return ONLY JSON matching: {message,symptomSummary:string[],possibleCauses:{name,explanation,uncertainty}[],urgency,urgencyExplanation,recommendedSpecialties:string[],redFlags:string[],recommendedActions:string[],showDoctorCTA:boolean,showHospitalCTA:boolean}.`;
export type ChatTurn = { role: 'user' | 'assistant'; text: string };
export async function assess(text: string, history: ChatTurn[]): Promise<{ assessment: Assessment; provider: 'gemini' | 'safety'; demo: boolean }> {
  if (emergencyDetected(`${history.slice(-6).map((m) => m.text).join('\n')}\n${text}`)) return { assessment: emergencyAssessment(), provider: 'safety', demo: false };
  if (!env.GEMINI_API_KEY) {
    if (env.NODE_ENV === 'production') throw Object.assign(new Error('AI service is not configured'), { status: 503 });
    return { assessment: { message: 'Demo mode: Gemini is not configured, so I cannot generate an AI health assessment. You can still explore the sample doctor and hospital directory. If symptoms feel severe or rapidly worsen, seek urgent medical care.', symptomSummary: [], possibleCauses: [], urgency: 'routine', urgencyExplanation: 'No medical assessment was generated in demo mode.', recommendedSpecialties: [], redFlags: [], recommendedActions: ['Configure Gemini to enable AI health conversations', 'Seek professional care for health concerns'], showDoctorCTA: true, showHospitalCTA: true }, provider: 'safety', demo: true };
  }
  const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  let response;
  try {
    response = await client.models.generateContent({ model: env.GEMINI_MODEL, contents: [...history.slice(-10).map((turn) => ({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.text }] })), { role: 'user', parts: [{ text }] }], config: { systemInstruction: system, responseMimeType: 'application/json', maxOutputTokens: 1200, temperature: 0.2, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, httpOptions: { timeout: env.GEMINI_TIMEOUT_MS, retryOptions: { attempts: 1 } } } });
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0;
    const upstreamMessage = error instanceof Error
      ? error.message.replaceAll(env.GEMINI_API_KEY, '[redacted]').slice(0, 400)
      : 'Unknown Gemini API error';
    console.error(JSON.stringify({ level: 'error', event: 'gemini_request_failed', ...(status ? { status } : {}), message: upstreamMessage }));
    if (status === 429) throw new ApiError(503, 'The AI service is busy. Please try again in a little while.');
    throw new ApiError(502, 'The AI service could not complete this request. Your message was saved; please try again.');
  }
  let parsed;
  try { parsed = assessmentSchema.parse(JSON.parse(response.text ?? '')); }
  catch { throw new ApiError(502, 'The AI service returned an unusable response. Please try again.'); }
  return { assessment: sanitizeAssessment(parsed), provider: 'gemini', demo: false };
}
