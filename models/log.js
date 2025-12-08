import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: { type: String, required: true }, // Nom ou ID user
    status: { type: String, required: true },      // "success" ou "failure"
    severity: { 
        type: String, 
        enum: ['info', 'warning', 'critical'], 
        default: 'info' 
    },
    context: { type: Object },  // Données supplémentaires
    metadata: { type: Object }, // Infos techniques
    ipAddress: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Log', logSchema);