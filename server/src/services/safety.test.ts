import { describe, expect, it } from 'vitest';
import { emergencyAssessment, emergencyDetected, sanitizeAssessment } from './safety.js';

describe('layered emergency detection', () => {
  it.each([
    'I have crushing pressure in my chest and cold sweats',
    'I cannot get enough air and I am gasping',
    'my face is drooping and one arm feels weak',
    'my partner passed out and is not waking up',
    'the cut is bleeding heavily and will not stop',
    'the seizure is still going on',
    'my tongue is swelling and I can barely breathe',
    'this is the worst headache of my life, it came on suddenly',
  ])('detects potentially urgent descriptions: %s', (description) => {
    expect(emergencyDetected(description)).toBe(true);
  });
  it('does not label a routine symptom an emergency', () => expect(emergencyDetected('I have had mild tiredness for a week')).toBe(false));
  it('returns immediate emergency guidance without a diagnosis', () => {
    expect(emergencyAssessment().urgency).toBe('emergency');
    expect(emergencyAssessment().message).toContain('112');
    expect(emergencyAssessment().possibleCauses).toHaveLength(0);
  });
  it('replaces unsafe model claims with cautious guidance', () => {
    const unsafe = sanitizeAssessment({ ...emergencyAssessment(), urgency: 'routine', message: 'You definitely have a disease; take 20 mg and stop taking your medication.' });
    expect(unsafe.message).not.toContain('definitely');
    expect(unsafe.urgency).toBe('soon');
  });
  it('checks structured sections for unsafe dosage advice too', () => {
    const unsafe = sanitizeAssessment({ ...emergencyAssessment(), urgency: 'routine', message: 'Some general information.', possibleCauses: [{ name: 'Example', explanation: 'Take 2 tablets.', uncertainty: 'This may be wrong.' }] });
    expect(unsafe.possibleCauses).toEqual([]);
    expect(unsafe.urgency).toBe('soon');
  });
});
