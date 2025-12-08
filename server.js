import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import resourceRoutes from './routes/resourceRoutes.js'; // Import de tes routes

dotenv.config();

const app = express();
app.use(express.json()); // Pour lire le JSON dans le body (PUT/POST)

// Connexion MongoDB (Assure-toi d'avoir ta propre string de connexion ou celle du groupe)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projet_bdd')
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error(err));

// Montage de tes routes sur /resources
app.use('/resources', resourceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});