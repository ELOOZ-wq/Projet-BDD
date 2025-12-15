import express from 'express';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateUser } from '../middlewares/validators.js';

const router = express.Router();

// --- GESTION DES FICHIERS (fs) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/user.json');
const backupPath = path.join(__dirname, '../data/users_backup.json');

// 1. UTILISATION DE fs.readFileSync (Au démarrage)
// Si la base est vide, on charge les utilisateurs depuis le JSON local
const initUsers = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            if (fs.existsSync(dataPath)) {
                // LECTURE SYNCHRONE
                const fileData = fs.readFileSync(dataPath, 'utf-8');
                const users = JSON.parse(fileData);
                await User.insertMany(users);
                console.log(" (fs.readFileSync) Utilisateurs importés initialement.");
            }
        }
    } catch (error) {
        console.error("Erreur init users:", error);
    }
};
initUsers(); // On lance l'init

// --- ROUTES API ---

// 1. Écriture (POST) : Créer un nouvel utilisateur
router.post('/', validateUser, async (req, res, next) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();

        // À chaque création, on met à jour le fichier de backup local
        const allUsers = await User.find();
        fs.writeFileSync(backupPath, JSON.stringify(allUsers, null, 2), 'utf-8');
        console.log(" (fs.writeFileSync) Backup utilisateurs mis à jour.");

      res.status(201).json(savedUser);
    } catch (error) {
        next(error); // On passe l'erreur au middleware
    }
});

// 2. Lecture Avancée (GET) : Lister avec filtre par rôle
// Ex: GET /api/users?role=client
router.get('/', async (req, res) => {
    try {
        const { role } = req.query;
        let filter = {};
        
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Agrégation : Statistiques par rôle
// Ex: GET /api/users/stats/roles
router.get('/stats/roles', async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: "$role",            // On groupe par le champ 'role'
                    totalUsers: { $sum: 1 }  // On compte combien il y en a
                }
            },
            {
                $sort: { totalUsers: -1 }    // Tri décroissant
            }
        ]);

        res.json({
            message: "Répartition des utilisateurs par rôle",
            data: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;