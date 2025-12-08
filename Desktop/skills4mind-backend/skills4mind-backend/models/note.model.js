import mongoose from 'mongoose';

const noteSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Le titre est requis'],
            trim: true
        },
        description: {
            type: String,
            required: false,
        },
        user: { 
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true 
    }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;