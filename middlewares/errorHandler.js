// middlewares/errorHandler.js

export const errorHandler = (err, req, res, next) => {
    console.error(" Error stack:", err.stack);

    // Erreur de validation Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: "Erreur de validation",
            messages: messages
        });
    }

    // Erreur de duplication (ex: email unique)
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: "Valeur dupliquée détectée (ex: email déjà pris)."
        });
    }

    // Erreur par défaut
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Erreur serveur interne"
    });
};