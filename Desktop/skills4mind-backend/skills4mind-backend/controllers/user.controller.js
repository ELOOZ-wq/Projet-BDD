import User from '../models/user.model.js';
import fs from 'fs'; 
import path from 'path';
import validator from 'validator';

const createUser = async (req, res) => {
    const { name, email, role, age } = req.body; 

    if (!name || !email) {
        return res.status(400).json({ message: 'Le nom et l\'email sont requis.' });
    }
if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'L\'adresse email n\'est pas valide.' });
}
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const user = await User.create({ name, email, role, age });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            data: user 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erreur serveur lors de la création.', 
            details: error.message 
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const query = {};
        const { role } = req.query;

        if (role) {
            query.role = role; 
        }

        const users = await User.find(query).select('-__v'); 

        res.status(200).json({
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erreur serveur lors de la récupération des utilisateurs.', 
            details: error.message 
        });
    }
};

const getUserStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role', 
                    totalUsers: { $count: {} }, 
                    averageAge: { $avg: '$age' } 
                }
            },
            {
                $project: {
                    _id: 0, 
                    role: '$_id', 
                    totalUsers: 1, 
                    averageAge: 1
                }
            },
            {
                $sort: { totalUsers: -1 } 
            }
        ]);
        const exportData = JSON.stringify({ timestamp: new Date(), stats: stats }, null, 2);
    const filePath = path.resolve('data', 'user_stats_export.json');
    
    fs.writeFileSync(filePath, exportData, 'utf8');

        res.status(200).json({
            message: "Statistiques par rôle",
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de l\'agrégation des statistiques.',
            details: error.message
        });
    }
};
const importUsers = async (req, res) => {
    try {
        const filePath = path.resolve('data', 'initial_users.json');
        
        const data = fs.readFileSync(filePath, 'utf8');
        const usersToImport = JSON.parse(data);

        const result = await User.insertMany(usersToImport, { ordered: false });

        res.status(201).json({
            message: `${result.length} utilisateurs importés avec succès.`,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de l\'importation des données.',
            details: error.message
        });
    }
};

export { 
    createUser,
    getUsers,
    getUserStats,
    importUsers 
};