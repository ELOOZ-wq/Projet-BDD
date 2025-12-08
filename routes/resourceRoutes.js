import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// POST : Ajouter un nouveau type de ressource/catégorie
router.post('/resource-types', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom du type est requis.' });
    }

    const db = mongoose.connection.db;
    const typesCollection = db.collection('resourceTypes');

    const result = await typesCollection.insertOne({
      name,
      description,
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'Type de ressource créé avec succès',
      id: result.insertedId,
      data: { name, description }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

//GET : Lister les ressources par catégorie ou statut
router.get('/', async (req, res) => {
  try {
    const { categorie, statut } = req.query; 
    const db = mongoose.connection.db;
    const resourcesCollection = db.collection('resources');

   
    const filtre = {};
    if (categorie) filtre.categorie = categorie; 
    if (statut) filtre.statut = statut;

    const resources = await resourcesCollection.find(filtre).toArray();

    res.json({
      message: 'Liste des ressources',
      count: resources.length,
      resources: resources
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

//AGREGATION : Ressources par ville/localisation
router.get('/stats/by-location', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const resourcesCollection = db.collection('resources');

    const stats = await resourcesCollection.aggregate([
      {
        $group: {
          _id: "$ville", 
          totalResources: { $sum: 1 }
        }
      },
      {
        $sort: { totalResources: -1 }
      }
    ]).toArray();

    res.json({
      message: 'Statistiques par localisation',
      data: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

export default router;