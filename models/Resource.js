import mongoose from 'mongoose';

// Définition du schéma selon les besoins de tes routes
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // Utilisé pour ton filtre GET [cite: 12]
  capacity: { type: Number, required: true }, // Utilisé pour ton filtre GET [cite: 12]
  location: { type: String },
  status: { type: String, default: 'disponible', enum: ['disponible', 'maintenance', 'réservé'] }
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;