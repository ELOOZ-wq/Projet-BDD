import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    categorie: { type: String, required: true }, // ex: "Conférence", "Atelier"
    date: { type: Date, required: true },
    lieu: { type: String },
    statut: { 
        type: String, 
        enum: ['planifie', 'termine', 'annule'], 
        default: 'planifie' 
    },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Event', eventSchema);