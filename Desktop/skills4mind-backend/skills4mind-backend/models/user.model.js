import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Le nom est requis'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'L\'email est requis'],
            unique: true, 
            trim: true
        },
        role: {
            type: String,
            required: [true, 'Le rôle est requis'],
            enum: ['client', 'admin', 'guest'], 
            default: 'client'
        },
        age: {
            type: Number,
            required: false 
        }
    },
    {
        timestamps: true 
    }
);

const User = mongoose.model('User', userSchema);

export default User;