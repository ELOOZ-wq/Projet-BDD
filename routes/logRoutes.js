import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * POST /api/logs
 * Permet d'ecrire un log JSON representant une activite critique.
 */
router.post("/", async (req, res) => {
  try {
    const {
      action,
      performedBy,
      status,
      severity = "critical",
      context = {},
      metadata = {},
    } = req.body;

    if (!action || !performedBy || !status) {
      return res.status(400).json({
        message:
          "Les champs 'action', 'performedBy' et 'status' sont obligatoires.",
      });
    }

    const db = mongoose.connection.db;
    const logsCollection = db.collection("logs");

    const logEntry = {
      action,
      performedBy,
      status,
      severity,
      context,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      createdAt: new Date(),
    };

    const result = await logsCollection.insertOne(logEntry);

    res.status(201).json({
      message: "Activite critique consignee avec succes.",
      logId: result.insertedId,
    });
  } catch (error) {
    console.error("Erreur lors de l'ecriture du log:", error);
    res.status(500).json({ message: "Erreur: " + error.message });
  }
});

export default router;

