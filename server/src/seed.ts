import argon2 from 'argon2';
import { env } from './config/env.js';
import { db, database } from './db.js';

if (env.NODE_ENV === 'production') throw new Error('Seed is disabled in production.');
if (env.SEED_ADMIN_PASSWORD === 'development-only-change-this-password')
  console.warn('Using the documented development seed admin password. Change it before use.');
const names = [
  ['Dr. Ananya Rao', 'General Physician', 500],
  ['Dr. Arjun Mehta', 'Cardiologist', 900],
  ['Dr. Kavya Sharma', 'Dermatologist', 600],
  ['Dr. Rahul Nair', 'Orthopedic', 700],
  ['Dr. Sneha Iyer', 'Pediatrician', 650],
  ['Dr. Vikram Patel', 'Neurologist', 1000],
  ['Dr. Priya Menon', 'Gynecologist', 800],
  ['Dr. Aditya Rao', 'ENT Specialist', 550],
] as const;
async function seed(): Promise<void> {
  await database.connect();
  const passwordHash = await argon2.hash(env.SEED_ADMIN_PASSWORD);
  await db()`insert into public.users(name,email,password_hash,role) values('Demo Administrator',${env.SEED_ADMIN_EMAIL},${passwordHash},'admin') on conflict(email) do nothing`;
  for (const [name, specialty, fee] of names) {
    const email = `demo.${specialty.toLowerCase().replace(/[^a-z]+/g, '.')}@example.test`;
    const [user] =
      await db()`insert into public.users(name,email,password_hash,role) values(${name},${email},${await argon2.hash(`Demo-${Math.random().toString(36).slice(2)}-NotForLogin1`)},'doctor') on conflict(email) do update set email=excluded.email returning id`;
    if (!user) throw new Error(`Could not create seed account for ${email}.`);
    await db()`insert into public.doctor_profiles(user_id,specialty,qualifications,registration_number,years_experience,city,fee,bio,verification,demo,consultation_types,working_days,start_hour,end_hour,slot_minutes) values(${user.id}::uuid,${specialty},array['Sample qualification (demo)'],${`DEMO-${user.id.slice(-8)}`},5,'Demo City',${fee},'Fictional demonstration profile. Credentials and details are sample data.','approved',true,array['in-person','online'],array[1,2,3,4,5],9,17,30) on conflict(user_id) do nothing`;
  }
  const hospitals = [
    {
      name: 'Sage Grove Demo Hospital',
      city: 'Demo City',
      specialties: ['General Physician', 'Cardiologist', 'Neurologist'],
      facilities: ['Sample outpatient clinic'],
      description: 'Fictional hospital profile for product demonstration.',
    },
    {
      name: 'Riverbend Community Demo Clinic',
      city: 'Demo City',
      specialties: ['Dermatologist', 'Pediatrician', 'ENT Specialist'],
      facilities: ['Sample consultation rooms'],
      description:
        'Fictional clinic profile. Emergency services and live booking are not verified.',
    },
    {
      name: 'Meadowview Demo Medical Centre',
      city: 'Demo City',
      specialties: ['Orthopedic', 'Gynecologist', 'General Physician'],
      facilities: ['Sample diagnostic services'],
      description: 'Fictional medical centre profile for demonstration only.',
    },
  ];
  for (const hospital of hospitals)
    await db()`insert into public.hospitals(name,city,specialties,facilities,description,demo,emergency_services_verified) values(${hospital.name},${hospital.city},${hospital.specialties},${hospital.facilities},${hospital.description},true,false) on conflict(name) do nothing`;
  console.log('Seed complete. Doctor profiles and hospitals are fictional demonstration records.');
  await database.close();
}
seed().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  await database.close().catch(() => undefined);
  process.exitCode = 1;
});
