# Parlons carton

## Présentation

"Parlons carton" est un SaaS développé autour de **React** et **ASP.NET Core (.NET)**.

Le projet regroupe plusieurs briques complémentaires :

* une application web destinée aux utilisateurs ;
* une API REST sécurisée / CRUD ;
* des services backend dédiés au traitement des données ;
* des outils de reporting ;

L'objectif est de proposer une architecture moderne, performante et facilement maintenable reposant sur une séparation claire entre le frontend, le backend et la couche d'accès aux données.

---

# Architecture

```
React (Frontend)
        │
        ▼
 ASP.NET Core API
        │
        ▼
 Business Services
        │
        ▼
 Repositories
        │
        ▼
 SQL Database
```

Le projet suit une architecture en couches afin de séparer les responsabilités :

* **Frontend React** : interface utilisateur
* **API ASP.NET Core** : exposition des services REST
* **Services** : logique métier
* **Repositories** : accès aux données
* **Base SQL** : persistance

---

# Fonctionnalités

* Authentification sécurisée (JWT)
* Gestion des utilisateurs
* API REST
* Génération de rapports
* Reporting PDF
* Outils de traitement de données
* Tableaux de bord
* Gestion documentaire
* Architecture modulaire

---

# Stack technique

## Frontend

* React
* TypeScript
* React Router
* Context API
* CSS

## Backend

* ASP.NET Core
* C#
* Entity Framework Core
* JWT Authentication
* Dependency Injection

## Base de données

* SQL
* Entity Framework

## Reporting

* DevExpress Reporting

---

# Structure du projet

```
Frontend/
├── Components
├── Context
├── Hooks
├── Pages
├── Services
└── Types

Backend/
├── Controllers
├── DTO
├── Services
├── Repositories
├── Models
├── Middleware
└── Utils
```

---

# Principes de développement

Le projet repose notamment sur les principes suivants :

* séparation stricte des responsabilités ;
* architecture orientée services ;
* injection de dépendances ;
* composants React réutilisables ;
* typage fort avec TypeScript ;
* DTO pour les échanges entre le frontend et le backend ;
* développement orienté maintenabilité et évolutivité.

---

# Sécurité

* Authentification JWT
* Contrôle des autorisations
* Validation des entrées
* Gestion des erreurs
* Protection des endpoints

---

# Installation

## Prérequis

* .NET SDK
* Node.js
* npm
* SQL Server ou PostgreSQL (selon l'environnement)

## Backend

```bash
dotnet restore
dotnet build
dotnet run
```

## Frontend

```bash
npm install
npm run dev
```

---

# Objectifs du projet

Ce projet constitue une plateforme de production permettant de centraliser plusieurs fonctionnalités métier autour :

* de la gestion de données ;
* des traitements backend ;
* de la génération de rapports ;
* de l'exposition de services REST ;
* d'une interface web moderne développée avec React.

L'architecture est pensée pour faciliter les évolutions futures et permettre l'ajout de nouveaux modules sans remettre en cause les composants existants.

---

# Auteur

Développé par **Emmanuel Douillez**.
