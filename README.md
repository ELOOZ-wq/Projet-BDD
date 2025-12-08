## Module Ressources (Étudiant 2)

Responsable de la gestion des ressources (salles, équipements) et de l'import initial des données.

### Modèle de Données (Resource)
- `name` (String) : Nom de la ressource.
- `type` (String) : Type de ressource (ex: salle, equipement).
- `capacity` (Number) : Capacité d'accueil.
- `location` (String) : Localisation.
- `status` (String) : Disponibilité (disponible, maintenance, réservé).

### Routes API

#### 1. Modifier une ressource (PUT)
Permet de mettre à jour les informations d'une ressource existante.
* **URL** : `/resources/:id`
* **Body** : JSON contenant les champs à modifier.
* **Exemple** : `PUT /resources/64f8a...` avec `{"capacity": 100}`

#### 2. Recherche Avancée (GET)
Lister les ressources avec filtres.
* **URL** : `/resources`
* **Query Params** :
    * `type` : Filtrer par type (ex: `salle`).
    * `capa_min` : Capacité minimum requise.
* **Exemple** : `GET /resources?type=salle&capa_min=10`

#### 3. Agrégation : Top Réservations (GET)
Affiche les 5 ressources les plus réservées (jointure avec les réservations).
* **URL** : `/resources/top-reserved`