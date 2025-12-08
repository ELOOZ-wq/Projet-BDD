
import dotenv from "dotenv"; 
import express from "express"; 
import { connectToDb } from './config/mongoClient.js';
import resourceRoutes from './routes/resourceRoutes.js';
import logRoutes from './routes/logRoutes.js';
//import userRoutes from './routes/userRoutes.js';
//import bookingRoutes from './routes/bookingRoutes.js';
 
dotenv.config(); 

const app = express();
app.use(express.json()); 

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToDb(); 
        
        app.use("/api/resources", resourceRoutes); 
        app.use("/api/logs", logRoutes);
        //app.use("/api/users", userRoutes);        
        //app.use("/api/bookings", bookingRoutes);    

        app.listen(PORT, () => console.log(`Serveur Express sur http://localhost:${PORT}`));

    } catch (error) {
        console.error("Erreur de démarrage critique:", error);
        process.exit(1); 
    }
}

// Lancement du serveur
startServer();