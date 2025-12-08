import express from 'express'; 
import dotenv from 'dotenv'; 
import connectDB from './config/db.config.js'; 
import userRoutes from './routes/user.routes.js'; 
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB(); 

const app = express();

app.use(express.json()); 

app.use('/api/users', userRoutes); 

app.get('/', (req, res) => {
  res.send('API Node.js & MongoDB est opérationnelle.');
});
app.use(errorHandler);
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});