import { z } from 'zod';

export const urgencySchema = z.enum(['routine', 'soon', 'urgent', 'emergency']);
export const assessmentSchema = z.object({
  message: z.string().min(1).max(5000),
  symptomSummary: z.array(z.string().max(300)).max(12).default([]),
  possibleCauses: z
    .array(
      z.object({
        name: z.string().max(120),
        explanation: z.string().max(600),
        uncertainty: z.string().max(400),
      }),
    )
    .max(5)
    .default([]),
  urgency: urgencySchema,
  urgencyExplanation: z.string().max(1000),
  recommendedSpecialties: z.array(z.string().max(100)).max(5).default([]),
  redFlags: z.array(z.string().max(300)).max(8).default([]),
  recommendedActions: z.array(z.string().max(300)).max(8).default([]),
  showDoctorCTA: z.boolean().default(false),
  showHospitalCTA: z.boolean().default(false),
});
export type Assessment = z.infer<typeof assessmentSchema>;
export const roleSchema = z.enum(['patient', 'doctor', 'hospital', 'admin']);
export const appointmentStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
  'no-show',
]);
export const consultationSchema = z.enum(['in-person', 'online']);
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  role: z.enum(['patient', 'doctor', 'hospital']).default('patient'),
  phone: z.string().trim().max(30).optional(),
  specialty: z.string().trim().max(100).optional(),
  qualifications: z.array(z.string().max(100)).max(10).optional(),
  registrationNumber: z.string().trim().max(100).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  city: z.string().trim().max(100).optional(),
  fee: z.number().min(0).max(100000).optional(),
  facilities: z.array(z.string().max(100)).max(30).optional(),
  specialties: z.array(z.string().max(100)).max(30).optional(),
  description: z.string().trim().max(2000).optional(),
});
export const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().trim().min(1).max(4000),
});
export const bookingSchema = z.object({
  doctorId: z.string(),
  startsAt: z.string().datetime(),
  consultationType: consultationSchema,
  reason: z.string().trim().min(3).max(1000),
  sharedSummary: z.string().max(3000).optional(),
});
