// middlewares/validators.js
import validator from 'validator';

// Validation pour la création d'utilisateur
export const validateUser = (req, res, next) => {
    const { email, name } = req.body;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: "Email invalide." });
    }

    if (!name || validator.isEmpty(name)) {
        return res.status(400).json({ message: "Le nom est requis." });
    }

    next();
};

// Validation pour la création de réservation
export const validateBooking = (req, res, next) => {
    const { duration, price } = req.body;

    if (duration && !validator.isInt(String(duration), { min: 1 })) {
        return res.status(400).json({ message: "La durée doit être un entier positif." });
    }

    if (price && !validator.isFloat(String(price), { min: 0 })) {
        return res.status(400).json({ message: "Le prix doit être un nombre positif." });
    }

    next();
};