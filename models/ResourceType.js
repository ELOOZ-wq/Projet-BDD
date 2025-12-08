// Fichier: models/ResourceType.js
import mongoose from 'mongoose';

const resourceTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ResourceType', resourceTypeSchema);