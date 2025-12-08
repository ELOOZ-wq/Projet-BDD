import express from "express";
import dotenv from "dotenv";
import { connectToDb } from "./config/mongoClient.js"; 

// Import des routes
import resourceRoutes from "./routes/resourceRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.locals.start = (async () => {
    try {
        // 1. Connexion à la Base de Données (Mongoose)
        await connectToDb();
        console.log("Connexion BDD réussie");

        // 2. Chargement des Routes
        app.use("/api/resources", resourceRoutes); // Etudiants 2 & 4
        app.use("/api/logs", logRoutes);           // Etudiant 6
        app.use("/api/bookings", bookingRoutes);   // Etudiant 3
        app.use("/api/events", eventRoutes);       // Etudiant 5
        app.use("/api/users", userRoutes);         // Étudiant 1

        app.get('/', (req, res) => {
            res.send('API Projet BDD en ligne ');
        });

        // 3. Lancement du serveur
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`📡 Serveur disponible sur http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Erreur critique au démarrage :", error);
        process.exit(1); // Arrête le processus 
    }
})();