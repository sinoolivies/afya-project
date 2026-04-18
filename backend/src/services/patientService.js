import Patient from '../models/Patient.js';

export const upsertPatient = async ({ fullName, email, phone, location, dateOfBirth, gender, notes }) => {
  const updates = {
    fullName,
    email,
    phone,
    dateOfBirth,
    gender,
    notes,
  };

  if (location?.coordinates?.length === 2) {
    updates.location = location;
  }

  return Patient.findOneAndUpdate({ phone }, updates, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
};
