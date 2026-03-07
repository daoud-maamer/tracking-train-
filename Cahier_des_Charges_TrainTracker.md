# Cahier des Charges : Système de Suivi en Temps Réel des Trains (Banlieue Sud - SNCFT)

**Binôme : Ahmed Idoudi & Daoud Ben Mamer**  
**Encadreur SNCFT : Hassen Soyed (Directeur de mouvement)**

## 1. Présentation du Projet
Ce projet consiste en la conception et le développement d'une solution logicielle complète (Mobile + Backend) permettant de suivre en temps réel la position des trains de la Banlieue Sud de la SNCFT (axe Tunis-Borj Cédria).

## 2. Besoins Fonctionnels
### 2.1 Application Mobile
- Cartographie interactive avec Polyline de la ligne ferroviaire.
- Stations mères : Tunis Ville, Mégrine, Radès, Ezzahra, Hammam Lif, Hammam Chott, Borj Cédria.
- Actualisation automatique toutes les 15 secondes.

## 3. Sécurité et Protection des Données
- **Chiffrement TLS/SSL** : Communication sécurisée entre le mobile et le serveur.
- **Sécurisation des API** : Protection des endpoints backend par masquage IP et authentification.
- **Requêtes Paramétrées** : Protection contre les injections SQL sur la base MySQL.

## 4. Évolutivité et Fonctionnalités Futures
- **Système d'Alertes** : Notifications Push en cas de retard.
- **Billetterie Numérique** : Intégration de paiement pour les titres de transport.
- **Prédiction par IA** : Calcul de l'Heure d'Arrivée Estimée (ETA) basée sur l'historique des trajets.
- **Extension Réseau** : Support multi-lignes (Banlieue Nord, Intercités).

## 5. Architecture Technique
- **Frontend** : React Native (SDK 54).
- **Backend** : Node.js (Express).
- **Base de données** : MySQL.
