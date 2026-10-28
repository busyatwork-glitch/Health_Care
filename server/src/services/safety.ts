import type { Assessment } from '@care-kind/shared';

const patterns = [
  /\b(crushing|severe|heavy|tight).{0,25}(chest|heart).{0,15}(pain|pressure|tightness)\b/i,
  /\b(crushing|severe|heavy|tight).{0,45}(pressure|pain|tightness).{0,25}(chest|heart)\b/i,
  /\b(chest|heart).{0,30}(pain|pressure|tightness).{0,35}(cold sweats|sweating|jaw|arm pain|breathless)\b/i,
  /\b(chest|heart) (pain|pressure|tightness).{0,45}(severe|crushing|heavy|sweating|jaw|arm|breathless)?/i,
  /\b(can't|cannot|unable to) get enough air|air hunger|gasping for air|severe shortness of breath/i,
  /\b(can't|cannot|unable to|struggling to) breathe|gasping for air|severe shortness of breath/i,
  /\b(face is )?drooping|one side.{0,20}(weak|numb)|slurred speech|sudden weakness|stroke symptoms/i,
  /\b(face droop|one side.{0,25}(weak|numb)|slurred speech|sudden weakness|stroke symptoms)\b/i,
  /\b(unconscious|passed out and.{0,30}(not waking|confused)|not responding)\b/i,
  /\b(severe|uncontrolled|won't stop).{0,25}(bleeding|haemorrhage|hemorrhage)|bleeding.{0,20}(heavily|profusely)\b/i,
  /\b(seizure|convulsion).{0,35}(first|ongoing|won't stop|repeated)?/i,
  /\b(throat|tongue|face).{0,35}(swelling|swollen).{0,30}(allerg|breath)/i,
  /\b(sudden|worst).{0,25}(severe )?headache|worst headache of my life\b/i,
  /\b(overdose|poisoned|poisoning|suicidal.{0,25}(right now|tonight|plan)|want to kill myself)\b/i,
];
export const emergencyDetected = (input: string): boolean =>
  patterns.some((pattern) => pattern.test(input));
export const emergencyAssessment = (): Assessment => ({
  message:
    'Your symptoms may need emergency attention. Please call 112 in India or your local emergency number now, or go to the nearest emergency department. Do not wait for an online appointment. If possible, ask someone nearby to stay with you.',
  symptomSummary: [],
  possibleCauses: [],
  urgency: 'emergency',
  urgencyExplanation:
    'The symptoms described can be associated with time-sensitive emergencies and need prompt in-person assessment.',
  recommendedSpecialties: [],
  redFlags: [
    'Worsening symptoms, loss of consciousness, severe breathing difficulty, or heavy bleeding',
  ],
  recommendedActions: [
    'Call 112 in India or your local emergency number now',
    'Do not drive yourself if you feel faint or severely unwell',
  ],
  showDoctorCTA: false,
  showHospitalCTA: true,
});
export function sanitizeAssessment(assessment: Assessment): Assessment {
  const text = [
    assessment.message,
    assessment.urgencyExplanation,
    ...assessment.possibleCauses.flatMap((cause) => [
      cause.name,
      cause.explanation,
      cause.uncertainty,
    ]),
    ...assessment.recommendedActions,
    ...assessment.redFlags,
  ].join(' ');
  const unsafe =
    /\b(you definitely have|you have been diagnosed with|(?:take|use|start)\s+\d+\s?(?:mg|ml|mcg|g|tablets?|capsules?|doses?)|(?:take|use)\s+(?:this|the)\s+(?:medicine|medication|drug)|stop taking your (?:prescription|medication)|no need to see a doctor|avoid (?:seeing|contacting) (?:a )?(?:doctor|clinician|hospital))\b/i.test(
      text,
    );
  if (!unsafe) return assessment;
  return {
    ...assessment,
    possibleCauses: [],
    urgency: assessment.urgency === 'emergency' ? 'emergency' : 'soon',
    message:
      'Symptoms can have different causes, and an online chat cannot confirm a diagnosis. A qualified healthcare professional can assess you and recommend appropriate care.',
    urgencyExplanation:
      'A personalized assessment is not possible from this response; a clinician can review your symptoms.',
    recommendedActions: ['Arrange an appointment with a qualified healthcare professional'],
    showDoctorCTA: true,
  };
}
