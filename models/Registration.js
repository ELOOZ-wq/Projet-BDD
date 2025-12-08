import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    evenement: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    participantName: { type: String, required: true }, // ou ref vers User si tu veux lier
    email: { type: String, required: true },
    statut: { 
        type: String, 
        enum: ['confirme', 'attente', 'annule'], 
        default: 'attente' 
    },
    montantTotal: { type: Number, default: 0 },
    dateInscription: { type: Date, default: Date.now }
});

export default mongoose.model('Registration', registrationSchema);