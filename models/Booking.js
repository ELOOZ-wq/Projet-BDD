import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // ID de l'utilisateur qui réserve
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true }, // Lien vers la ressource
    date_debut: { type: Date, required: true },
    duration: { type: Number, required: true }, // Durée en minutes ou heures
    price: { type: Number, required: true },    // Prix pour le calcul du revenu moyen
    status: { 
        type: String, 
        enum: ['confirmed', 'cancelled', 'pending'], 
        default: 'confirmed' 
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);