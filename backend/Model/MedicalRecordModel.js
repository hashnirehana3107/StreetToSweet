const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  route: { type: String }, // oral, IM, IV, SQ, etc.
  durationDays: { type: Number },
  notes: { type: String }
}, { _id: false });

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: { type: String },
  batchNumber: { type: String },
  doseNumber: { type: Number },
  totalDoses: { type: Number },
  administeredAt: { type: Date },
  nextDueDate: { type: Date }
}, { _id: false });

const medicalRecordSchema = new mongoose.Schema({
  dog: { type: mongoose.Schema.Types.ObjectId, ref: 'DogModel', required: true },
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
  recordType: { type: String, enum: ['treatment', 'medication', 'vaccination', 'note'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  medications: [medicationSchema],
  treatment: {
    procedure: { type: String },
    details: { type: String }
  },
  vaccination: vaccinationSchema,
  vitals: {
    weightKg: { type: Number },
    temperatureC: { type: Number },
    heartRate: { type: Number }
  },
  adoptionPhase: { type: String, enum: ['pre', 'post'], default: 'pre' },
  adoptionRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'AdoptionRequest', default: null },
  attachments: [{ type: String }]
}, { timestamps: true });

medicalRecordSchema.index({ dog: 1, createdAt: -1 });
medicalRecordSchema.index({ administeredBy: 1, createdAt: -1 });

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);
