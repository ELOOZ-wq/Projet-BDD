import mongoose from "mongoose";

/**
 * Etablit une connexion unique a MongoDB en utilisant Mongoose.
 * Rejette immediatement si la variable d'environnement requise est absente.
 */
export async function connectToDb() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("La variable MONGO_URI est manquante dans l'environnement.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    // Une connexion est deja en cours d'etablissement
    return mongoose.connection;
  }

  mongoose.set("strictQuery", false);

  const connection = await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB,
  });

  console.log("Connexion MongoDB etablie.");
  return connection;
}

export async function disconnectFromDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("Connexion MongoDB fermee.");
  }
}
