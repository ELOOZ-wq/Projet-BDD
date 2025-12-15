#  API de Gestion de Campus / Centre de Formation

Projet Backend Node.js & MongoDB réalisé dans le cadre du module de développement serveur.
Cette API REST complète permet de gérer les ressources d'un établissement, les utilisateurs, les réservations, les événements et la journalisation des activités.

L'architecture respecte le modèle MVC, intègre des agrégations complexes, la manipulation de fichiers système (fs) et une validation stricte des données.

---

##  Installation et Démarrage

### 1. Prérequis
* Node.js (v18 ou supérieur)
* MongoDB (Local ou Atlas)

### 2. Installation

# Installer les dépendances
npm install
## Module Utilisateurs (Étudiant 1)

[cite_start]Responsable de la mise en place de l'initialisation du projet (Express, MongoDB) et de la structure de base du dossier `/config`[cite: 1].

### Modèle de Données (Users)
- `name` (String) : Nom complet.
- `email` (String) : Email unique.
- `role` (String) : Rôle (client, admin).
- `createdAt` (Date) : Date de création.

### Routes API

#### 1. Écriture (POST)
Créer un nouvel utilisateur.
* **URL** : `/users`
* **Body** : JSON avec les infos utilisateur.
* **Exemple** : `POST /users`

#### 2. Lecture Avancée (GET)
Lister les utilisateurs avec filtres par rôle.
* **URL** : `/users`
* **Query Params** : `role` (ex: `client`).
* **Exemple** : `GET /users?role=client`

#### 3. Agrégation (GET)
Statistiques sur l'activité des utilisateurs (ex. nombre total d'utilisateurs par rôle).
* **URL** : `/users/stats/roles`

---
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
---
## Module Réservations (Étudiant 3)

Responsable du système de réservation, incluant la pagination des historiques et le calcul des revenus.

### Modèle de Données (Booking)
- `userId` (String) : Identifiant de l'utilisateur.
- `resourceId` (ObjectId) : Référence vers la ressource réservée.
- `date_debut` (Date) : Date et heure de début.
- `duration` (Number) : Durée en minutes.
- `price` (Number) : Coût de la réservation.
- `status` (String) : État (confirmed, cancelled, pending).

### Routes API

#### 1. Créer une réservation (POST)
Enregistre une nouvelle réservation en base.
* **URL** : `/api/bookings`
* **Body** : JSON complet de la réservation.
* **Exemple** : `POST /api/bookings` avec `{"userId": "Jean", "price": 50, ...}`

#### 2. Historique Utilisateur (GET)
Affiche les réservations d'un utilisateur spécifique avec pagination.
* **URL** : `/api/bookings/users/:userId`
* **Query Params** :
    * `page` : Numéro de la page (défaut 1).
    * `limit` : Nombre d'éléments par page (défaut 10).
* **Exemple** : `GET /api/bookings/users/Jean_Dupont?page=1&limit=5`

#### 3. Agrégation : Revenu Moyen (GET)
Calcule le revenu moyen généré par les réservations confirmées.
* **URL** : `/api/bookings/stats/average-revenue`

---

## Module Extension Ressources (Étudiant 4)

Extension du module ressources pour gérer les types de ressources et les statistiques géographiques.

### Modèle de Données (ResourceType)
- `name` (String) : Nom du type (ex: "Laboratoire").
- `description` (String) : Description détaillée.

### Routes API

#### 1. Créer un type de ressource (POST)
Ajoute une nouvelle catégorie de ressource au système.
* **URL** : `/api/resources/resource-types`
* **Body** : `{"name": "Salle VR", "description": "Réalité virtuelle"}`

#### 2. Agrégation : Stats par Localisation (GET)
Compte le nombre de ressources disponibles par bâtiment ou zone.
* **URL** : `/api/resources/stats/by-location`

---

## Module Événements (Étudiant 5)

Gestion complète des événements, des inscriptions et de l'exportation des données statistiques.

### Modèle de Données (Event & Registration)
- `titre` (String) : Titre de l'événement.
- `categorie` (String) : Type (Conférence, Atelier).
- `statut` (String) : État (planifie, termine, annule).
- `registrations` : Collection liée gérant les participants et le statut de leur inscription.

### Routes API

#### 1. Recherche d'événements (GET)
Recherche textuelle et filtrage multi-critères avec pagination.
* **URL** : `/api/events/recherche`
* **Query Params** : `recherche` (titre), `categorie`, `statut`, `page`.
* **Exemple** : `GET /api/events/recherche?categorie=Atelier&page=1`

#### 2. Gestion Inscription (PUT)
Modifie le statut d'une inscription (confirme, attente, annule).
* **URL** : `/api/events/registrations/:id/statut`
* **Body** : `{"statut": "confirme"}`

#### 3. Export Statistiques (GET)
Génère un fichier JSON dans le dossier `/data` contenant les stats par catégorie.
* **URL** : `/api/events/statistiques/export`

---

## Module Logs & Sécurité (Étudiant 6)

Système de journalisation centralisé pour suivre les activités critiques et les erreurs.

### Modèle de Données (Log)
- `action` (String) : Type d'action (ex: LOGIN_FAILED).
- `performedBy` (String) : Auteur de l'action.
- `severity` (String) : Niveau (info, warning, critical).
- `metadata` (Object) : Détails techniques.

### Routes API

#### 1. Consigner un log (POST)
Permet d'enregistrer manuellement une activité critique.
* **URL** : `/api/logs`
* **Body** : `{"action": "SERVER_RESTART", "performedBy": "Admin", "severity": "info"}`

#### 2. Lecture des Logs (GET)
Consulter l'historique des logs avec filtre de sévérité.
* **URL** : `/api/logs`
* **Query Params** :
    * `severity` (ex: `critical`).
    * `limit`.
* **Exemple** : `GET /api/logs?severity=critical&limit=10`

#### 3. Agrégation : Comptage par Sévérité (GET)
Retourne le nombre total de logs groupés par niveau de sévérité.
* **URL** : `/api/logs/stats/count-by-severity`