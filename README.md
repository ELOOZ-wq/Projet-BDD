# Projet BDD - API ES Modules

## Presentation

Mini API Express (ES Modules) connectee a MongoDB pour gerer des ressources et journaliser les activites critiques.  
Technos principales: Node.js 20+, Express 5, Mongoose 9.

## Prerequis

- Node.js >= 20
- Acces a une base MongoDB (local ou Atlas)

## Installation

```bash
npm install
```

## Variables d'environnement

Creer un fichier `.env` a la racine du projet avec les cles suivantes:

```
PORT=3000                # optionnel, 3000 par defaut
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true
MONGO_DB=nomDeLaBase     # optionnel, sinon defini dans l'URI
```

## Lancement

```bash
node index.js
```

La console affiche `Serveur Express sur http://localhost:<PORT>` quand la connexion Mongo est prete.

## Routes disponibles

### Ressources (`/api/resources`)

- `POST /resource-types` - cree un type de ressource.
- `GET /` - liste les ressources avec filtres `?categorie=` et/ou `?statut=`.
- `GET /stats/by-location` - aggregation donnant le volume de ressources par ville.

Exemple de creation de type via `curl`:

```bash
curl -X POST http://localhost:3000/api/resources/resource-types \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Salle informatique",
        "description": "Laboratoire reseau niveau 2"
      }'
```

### Journaux critiques (`/api/logs`)

`POST /` - enregistre un log JSON representant une action critique (audit trail).

Champs requis: `action`, `performedBy`, `status`.  
Champs optionnels: `severity` (`critical` par defaut), `context`, `metadata`.

Exemple:

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
        "action": "booking.cancelled",
        "performedBy": "admin-42",
        "status": "success",
        "context": { "bookingId": "65fa5f8b12" },
        "metadata": { "reason": "No-show" }
      }'
```

Reponse attendue:

```json
{
  "message": "Activite critique consignee avec succes.",
  "logId": "<ObjectId>"
}
```

Le document insere contient automatiquement l'adresse IP, l'agent utilisateur et `createdAt`.

## Strategie de connexion MongoDB

Le module `config/mongoClient.js` expose `connectToDb()` (utilise dans `index.js`).  
Il garantit qu'une seule connexion Mongoose est ouverte, logue la reussite/fermeture et leve une erreur claire si `MONGO_URI` est absente.

## Tests rapides

1. Verifier la connexion: lancer `node index.js`.  
2. Essayer les requetes `curl` ci-dessus ou utiliser un outil (Postman, Insomnia).  
3. Consulter la collection `logs`/`resourceTypes` dans MongoDB pour valider les insertions.

## Structure du projet

```
Projet-BDD/
├── config/
│   └── mongoClient.js      # connexion Mongoose unique
├── routes/
│   ├── logRoutes.js        # POST /api/logs
│   └── resourceRoutes.js   # CRUD + aggregations sur les ressources
├── index.js                # point d'entree Express
└── package.json
```

