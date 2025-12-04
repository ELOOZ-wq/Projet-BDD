import express from 'express';
import { getDb } from '../config/mongoClient.js'; 

const router = express.Router();


const getResourceCollection = () => {
    const db = getDb(); 
    return db.collection('Resources'); 
};

//  routes etudient 4 

// Route de test (Méthode GET /api/resources/test)
router.get("/test", (req, res) => {
    res.json({ message: "✅ Routes bien branchées" });
});

// POST ajou nouveau type de ressource (POST /api/resource-types)
router.post("/resource-types", async (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: "Le nom du type de ressource est requis." });
    }
    
    try {
        const resourceTypesCollection = getResourceCollection();
        
        // Ceci utilise la méthode factice .insertOne() ou la méthode réelle une fois la DB connectée.
        const result = await resourceTypesCollection.insertOne({ name, description, createdAt: new Date() });
        
        res.status(201).json({ 
            message: `Nouveau type de ressource '${name}' créé.`,
            id: result.insertedId
        });
    } catch (error) {
        // En mode réel, l'erreur ici pourrait être une erreur de validation ou de DB.
        res.status(500).json({ error: "Erreur serveur lors de la création du type de ressource." });
    }
});


// GET liste les ressources par catégorie ou par statut (GET /api/resources?type=...)
router.get("/", async (req, res) => {
    const { type, status } = req.query;
    
    const filter = {};
    if (type) {
        filter.type = type; 
    }
    if (status) {
        filter.status = status;
    }

    try {
        const resourcesCollection = getResourceCollection();
        
        // Ceci utilise la méthode factice .find(filter).toArray() ou la méthode réelle.
        const filteredResources = await resourcesCollection.find(filter).toArray();

        res.status(200).json({ 
            message: "Liste des ressources filtrées.", 
            data: filteredResources, 
            applied_filters: filter
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du filtrage des ressources." });
    }
});


// GET Regroupement du nombre total de ressources par ville/localisation (GET /api/resources/stats/by-location)
router.get("/stats/by-location", async (req, res) => {
    try {
        const resourcesCollection = getResourceCollection();
        
        const pipeline = [
            {
                $group: {
                    _id: "$city", 
                    totalResources: { $sum: 1 } 
                }
            },
            {
                $sort: { totalResources: -1 }
            }
        ];

        // Ceci utilise la méthode factice .aggregate().toArray() ou la méthode réelle.
        const stats = await resourcesCollection.aggregate(pipeline).toArray();

        res.status(200).json({ 
            message: "Statistiques de regroupement des ressources par localisation.", 
            data: stats,
            pipeline_used: pipeline
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de l'agrégation des ressources." });
    }
});


export default router;