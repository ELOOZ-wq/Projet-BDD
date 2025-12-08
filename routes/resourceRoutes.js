import express from 'express';
import Resource from '../models/Resource.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// --- TÂCHE SPECIALE : Import Initial JSON [cite: 10, 54] ---
// Cette fonction lit le JSON et remplit la base si elle est vide.
// Tu peux appeler cette logique au démarrage du serveur ou via une route spéciale de setup.
const importData = async () => {
    try {
        const count = await Resource.countDocuments();
        if (count === 0) {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const dataPath = path.join(__dirname, '../data/resources.json');
            const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // Lecture synchrone [cite: 56]
            
            await Resource.insertMany(jsonData);
            console.log("Données resources.json importées avec succès !");
        }
    } catch (error) {
        console.error("Erreur d'import JSON:", error);
    }
};
// On lance l'import (ou tu peux créer une route POST /setup pour le déclencher manuellement)
importData();


// --- ROUTE 1 : Écriture (PUT) ---
// Objectif : Modifier les détails d'une ressource [cite: 11]
router.put('/:id', async (req, res) => {
    try {
        const updatedResource = await Resource.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // Renvoie l'objet modifié
        );
        
        if (!updatedResource) return res.status(404).json({ message: "Ressource non trouvée" });
        res.json(updatedResource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// --- ROUTE 2 : Lecture Avancée (GET) ---
// Objectif : Rechercher par type et capacité min [cite: 12]
// Exemple appel : GET /resources?type=salle&capa_min=10
router.get('/', async (req, res) => {
    try {
        const { type, capa_min } = req.query;
        let filter = {};

        // Filtre par type si fourni
        if (type) {
            filter.type = type;
        }

        // Filtre par capacité minimum (greater than or equal - $gte)
        if (capa_min) {
            filter.capacity = { $gte: Number(capa_min) };
        }

        const resources = await Resource.find(filter);
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- ROUTE 3 : Agrégation ($lookup) ---
// Objectif : Top 5 des ressources les plus réservées [cite: 13]
// Note : Cela suppose que la collection "bookings" (gérée par l'Étudiant 3) existe 
// et possède un champ "resourceId".
router.get('/top-reserved', async (req, res) => {
    try {
        const stats = await Resource.aggregate([
            {
                // Jointure avec la collection 'bookings' [cite: 13, 50]
                $lookup: {
                    from: 'bookings',       // Nom de la collection cible (minuscule + s par défaut dans Mongo)
                    localField: '_id',      // Champ ID dans Resources
                    foreignField: 'resourceId', // Champ de liaison dans Bookings (supposé)
                    as: 'reservations'      // Nom du tableau résultant
                }
            },
            {
                // Ajout d'un champ calculant la taille du tableau 'reservations' (nombre de résas)
                $addFields: {
                    reservationCount: { $size: "$reservations" }
                }
            },
            {
                // Tri par nombre de réservations décroissant (le plus grand en premier)
                $sort: { reservationCount: -1 }
            },
            {
                // Limiter aux 5 premiers [cite: 13]
                $limit: 5
            },
            {
                // Projection pour nettoyer l'affichage (optionnel mais propre)
                $project: {
                    name: 1,
                    type: 1,
                    reservationCount: 1
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;