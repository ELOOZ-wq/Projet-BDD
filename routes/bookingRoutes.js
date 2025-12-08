import express from 'express';
import Booking from '../models/Booking.js'; // Attention au .js obligatoire

const router = express.Router();

// ==========================================
// 1. ROUTE D'ÉCRITURE (POST)
// Consigne : Créer une nouvelle réservation
// URL : POST /api/bookings
// ==========================================
router.post('/', async (req, res, next) => {
    try {
        // Création de l'instance avec les données reçues (req.body)
        const newBooking = new Booking(req.body);
        
        // Sauvegarde en base de données (asynchrone)
        const savedBooking = await newBooking.save();
        
        // Renvoi de la réponse (201 = Créé avec succès)
        res.status(201).json({
            success: true,
            data: savedBooking
        });
    } catch (error) {
        // Envoi de l'erreur au middleware de gestion des erreurs (ta responsabilité)
        next(error);
    }
});

// ==========================================
// 2. ROUTE DE LECTURE AVANCÉE (GET)
// Consigne : Lister les réservations d'un utilisateur avec pagination
// URL : GET /api/bookings/users/:userId?page=1&limit=5
// ==========================================
router.get('/users/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        // Gestion de la pagination (valeurs par défaut : page 1, 10 éléments)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Requête MongoDB avec filtres et pagination
        const bookings = await Booking.find({ userId: userId })
                                      .sort({ date_debut: -1 }) // Tri : du plus récent au plus ancien
                                      .skip(skip)
                                      .limit(limit);

        // Compte total pour le frontend (savoir combien de pages afficher)
        const total = await Booking.countDocuments({ userId: userId });

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                totalItems: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                itemsPerPage: limit
            }
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// 3. ROUTE D'AGRÉGATION (GET)
// Consigne : Calculer le revenu moyen par réservation (Pipeline obligatoire)
// URL : GET /api/bookings/stats/average-revenue
// ==========================================
router.get('/stats/average-revenue', async (req, res, next) => {
    try {
        const stats = await Booking.aggregate([
            {
                // Étape 1 : Filtrer uniquement les réservations validées
                $match: { status: 'confirmed' }
            },
            {
                // Étape 2 : Grouper pour calculer la moyenne
                $group: {
                    _id: null, // On veut la moyenne sur TOUTE la collection filtrée
                    averageRevenue: { $avg: "$price" }, // Moyenne du champ 'price'
                    totalRevenue: { $sum: "$price" },   // Somme totale
                    count: { $sum: 1 }                  // Nombre de réservations
                }
            },
            {
                // Étape 3 : Formater le résultat (arrondir le prix)
                $project: {
                    _id: 0,
                    averageRevenue: { $round: ["$averageRevenue", 2] },
                    totalRevenue: 1,
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || { message: "Aucune donnée disponible" }
        });
    } catch (error) {
        next(error);
    }
});

export default router;