import express from "express";
import Log from "../models/log.js"; // Assure-toi que le model est bien Log.js ou log.js

const router = express.Router();

// --- ROUTE 1 : Écriture (POST) ---
//Consigner une activité critique
router.post("/", async (req, res, next) => {
  try {
    const newLog = new Log(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    next(error);
  }
});

// Lecture Avancée (GET) ---
// Filtrer par sévérité et limiter les résultats (pagination) [cite: 44]
//GET /api/logs?severity=critical&limit=5
router.get("/", async (req, res, next) => {
  try {
    const { severity, limit } = req.query;
    const filter = {};
    
    if (severity) {
      filter.severity = severity;
    }

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 }) // Les plus récents en premier
      .limit(parseInt(limit) || 20);

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// --- ROUTE 3 : Agrégation (GET) ---
// Compter les logs par type de sévérité [cite: 45]
//GET /api/logs/stats/count-by-severity
router.get("/stats/count-by-severity", async (req, res, next) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: "$severity",           
          count: { $sum: 1 }          
        }
      },
      {
        $project: {
          severity: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;