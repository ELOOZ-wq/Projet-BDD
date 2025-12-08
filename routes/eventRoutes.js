import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Met à jour le statut d'une inscription (confirme, attente ou annule)
router.put('/registrations/:id/statut', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    // On vérifie que le statut est bien un des trois autorisés
    if (!statut || !['confirme', 'attente', 'annule'].includes(statut)) {
      return res.status(400).json({
        message: 'Statut invalide. Utilisez: confirme, attente ou annule'
      });
    }

    const db = mongoose.connection.db;
    const registrationsCollection = db.collection('registrations');

    // On update le statut dans la bdd
    const result = await registrationsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { statut: statut } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // On récupère l'inscription mise à jour pour la renvoyer
    const inscription = await registrationsCollection.findOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    res.json({
      message: 'Statut mis à jour avec succès',
      inscription: inscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

// Recherche d'événements avec filtres (titre, catégorie, statut) + pagination
router.get('/events/recherche', async (req, res) => {
  try {
    const { recherche, categorie, statut, page = 1, limit = 10 } = req.query;

    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');

    // On construit le filtre au fur et à mesure selon les paramètres
    const filtre = {};

    // Si recherche est fourni, on cherche dans le titre (insensible à la casse)
    if (recherche) {
      filtre.titre = { $regex: recherche, $options: 'i' };
    }

    if (categorie) {
      filtre.categorie = categorie;
    }

    if (statut) {
      filtre.statut = statut;
    }

    // Calcul de la pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const events = await eventsCollection
      .find(filtre)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // On compte le total pour la pagination
    const total = await eventsCollection.countDocuments(filtre);

    res.json({
      events: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

// Stats par catégorie avec agrégation MongoDB
router.get('/statistiques', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const registrationsCollection = db.collection('registrations');
    const eventsCollection = db.collection('events');

    // On fait un lookup pour joindre les événements, on filtre les confirmées,
    // on groupe par catégorie et on trie par nombre d'inscriptions
    const stats = await registrationsCollection.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'evenement',
          foreignField: '_id',
          as: 'evenement'
        }
      },
      {
        $unwind: '$evenement'
      },
      {
        $match: {
          statut: 'confirme'
        }
      },
      {
        $group: {
          _id: '$evenement.categorie',
          nombreInscriptions: { $sum: 1 },
          revenuTotal: { $sum: '$montantTotal' }
        }
      },
      {
        $sort: { nombreInscriptions: -1 }
      }
    ]).toArray();

    // Totaux globaux
    const totalInscriptions = await registrationsCollection.countDocuments({ statut: 'confirme' });
    const totalEvenements = await eventsCollection.countDocuments();

    res.json({
      statistiquesParCategorie: stats,
      totalInscriptions: totalInscriptions,
      totalEvenements: totalEvenements
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

// Export des stats en JSON dans le dossier data/
router.get('/statistiques/export', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const registrationsCollection = db.collection('registrations');

    // Même agrégation que pour les stats, mais sans le revenu
    const stats = await registrationsCollection.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'evenement',
          foreignField: '_id',
          as: 'evenement'
        }
      },
      {
        $unwind: '$evenement'
      },
      {
        $match: { statut: 'confirme' }
      },
      {
        $group: {
          _id: '$evenement.categorie',
          nombreInscriptions: { $sum: 1 }
        }
      }
    ]).toArray();

    const exportData = {
      dateExport: new Date().toISOString(),
      statistiques: stats
    };

    // On crée le dossier data s'il n'existe pas déjà
    const dataDir = path.join(__dirname, '../data');
    await fs.mkdir(dataDir, { recursive: true });

    // On écrit le fichier avec un timestamp dans le nom
    const filename = `statistiques_${Date.now()}.json`;
    const filepath = path.join(dataDir, filename);
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf-8');

    res.json({
      message: 'Export réussi',
      fichier: filename,
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

// Import d'événements depuis un fichier JSON dans data/
router.post('/events/import', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ message: 'Nom du fichier requis' });
    }

    const dataDir = path.join(__dirname, '../data');
    const filepath = path.join(dataDir, filename);

    // On lit le fichier et on parse le JSON
    const fileContent = await fs.readFile(filepath, 'utf-8');
    const eventsData = JSON.parse(fileContent);

    if (!Array.isArray(eventsData)) {
      return res.status(400).json({ message: 'Le fichier doit contenir un tableau' });
    }

    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');

    // On insère tout d'un coup avec insertMany
    const result = await eventsCollection.insertMany(eventsData);

    res.json({
      message: 'Import réussi',
      nombreImporte: result.insertedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur: ' + error.message });
  }
});

export default router;
