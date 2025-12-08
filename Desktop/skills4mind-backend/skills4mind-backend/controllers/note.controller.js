import Note from '../models/note.model.js';

const createNote = async (req, res) => {
    const { title, description, user } = req.body; 

    if (!title || !user) {
        return res.status(400).json({ message: 'Le titre et l\'ID utilisateur sont requis.' });
    }

    try {
        const note = await Note.create({ title, description, user });

        res.status(201).json({
            message: 'Note créée avec succès',
            data: note 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erreur serveur lors de la création de la note.', 
            details: error.message 
        });
    }
};

const getNotesWithUsersLookup = async (req, res) => {
    try {
        const result = await Note.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: '$userInfo._id',
                    name: { $first: '$userInfo.name' },
                    totalNotes: { $sum: 1 },
                    notes: {
                        $push: {
                            noteTitle: '$title',
                            noteId: '$_id',
                            createdAt: '$createdAt'
                        }
                    }
                }
            },
            {
                $sort: { name: 1 }
            }
        ]);

        res.status(200).json({
            message: "Agrégation Lookup: Utilisateurs avec leurs notes",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de l\'agrégation Lookup.',
            details: error.message
        });
    }
};

export { createNote, getNotesWithUsersLookup };