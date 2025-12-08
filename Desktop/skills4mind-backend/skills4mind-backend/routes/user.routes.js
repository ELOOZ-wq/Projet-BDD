import express from 'express';
import { createUser, getUsers, getUserStats, importUsers } from '../controllers/user.controller.js'; 

const router = express.Router();

router.post('/', createUser); 

router.get('/', getUsers); 

router.get('/stats/roles', getUserStats);

export default router;