# Chapitre 2 – Analyse des Besoins

L'analyse des besoins est une étape fondamentale qui permet de définir précisément ce que le système doit faire (besoins fonctionnels) et comment il doit se comporter (besoins non fonctionnels). Cette phase fait le pont entre la problématique et la réalisation technique.

## 1. Identification des acteurs

Trois acteurs principaux interagissent avec le système :
*   **Le Passager (Utilisateur Mobile) :** C'est l'acteur principal. Il utilise l'application pour consulter la position des trains, les horaires de passage et les retards éventuels.
*   **L'Administrateur SNCFT :** Il gère les données de base (stations, lignes) et peut envoyer des notifications globales aux usagers en cas d'incident majeur.
*   **Le Système SNCFT (Externe) :** Il fournit les flux de données GPS bruts via l'API SNCFT. Bien qu'externe, il interagit directement avec notre backend.

## 2. Besoins fonctionnels

Les besoins fonctionnels décrivent les actions que les utilisateurs peuvent effectuer via l'application :
*   **Visualisation en temps réel :** Afficher sur une carte interactive la position exacte des trains en circulation.
*   **Estimation de l'arrivée (ETA) :** Fournir une estimation du temps restant avant l'arrivée du train à une station sélectionnée.
*   **Consultation des stations :** Permettre à l'utilisateur de voir la liste des gares de la Banlieue Sud et d'obtenir des informations sur chacune (ex: Tunis Gare, Radès, etc.).
*   **Détails du train :** Afficher les informations spécifiques d'un convoi (ID du train, vitesse, direction).
*   **Notifications :** Alerter l'usager sur les changements d'horaires ou les incidents signalés sur la ligne.

## 3. Besoins non fonctionnels

Les besoins non fonctionnels définissent les qualités et les contraintes de performance du système :
*   **Performance :** Le temps de réponse de l'API doit être inférieur à 500ms pour garantir une expérience fluide.
*   **Sécurité :** Les échanges entre le mobile et le serveur doivent être sécurisés (HTTPS/TLS) et les données protégées contre les injections.
*   **Disponibilité :** Le système doit être opérationnel 24h/24, 7j/7, aligné sur les horaires de service ferroviaire.
*   **Fiabilité :** Les données de localisation affichées doivent être le reflet exact des données fournies par les capteurs GPS.
*   **Scalabilité :** L'architecture doit pouvoir supporter une montée en charge du nombre de passagers connectés simultanément.
*   **Usabilité :** L'interface doit être simple, épurée et utilisable par tous les profils d'usagers (accessibilité).

## 4. Product Backlog

Le Product Backlog regroupe et ordonne les fonctionnalités selon leur valeur métier.

| ID | Fonctionnalité | Priorité |
| :--- | :--- | :--- |
| 1 | Affichage de la carte et du tracé de la ligne | Haute |
| 2 | Visualisation des trains en mouvement (GPS) | Haute |
| 3 | Calcul et affichage de l'ETA (Arrivée estimée) | Haute |
| 4 | Liste des stations et recherche | Moyenne |
| 5 | Détails techniques du train au clic (Vitesse, ID) | Moyenne |
| 6 | Système de notifications d'incidents | Moyenne |
| 7 | Historique des passages en station | Faible |

## 5. User Stories

Voici 10 récits utilisateurs (User Stories) qui détaillent les besoins du passager :

1.  **US1 :** En tant que passager, je veux voir tous les trains de la ligne sur une carte afin de comprendre le trafic global.
    *   *Critère d'acceptation :* Les icônes de trains sont positionnées sur les rails réels.
2.  **US2 :** En tant que passager, je veux cliquer sur un train pour voir son identifiant et sa vitesse actuelle.
    *   *Critère d'acceptation :* Une fenêtre (Callout) s'affiche avec les détails mis à jour.
3.  **US3 :** En tant que passager, je veux sélectionner une gare pour savoir dans combien de minutes le prochain train arrivera.
    *   *Critère d'acceptation :* L'ETA est calculé et affiché clairement en minutes.
4.  **US4 :** En tant que passager, je veux que la carte se rafraîchisse automatiquement sans intervention de ma part.
    *   *Critère d'acceptation :* Les positions des trains bougent toutes les 15 secondes maximum.
5.  **US5 :** En tant que passager, je veux voir le tracé de la ligne Tunis - Borj Cédria pour savoir quelles gares sont desservies.
    *   *Critère d'acceptation :* Une ligne (Polyline) de couleur distincte suit le trajet ferroviaire.
6.  **US6 :** En tant que passager, je veux recevoir une notification si la circulation est interrompue sur mon trajet habituel.
    *   *Critère d'acceptation :* Un message d'alerte apparaît en haut de l'écran ou via notification système.
7.  **US7 :** En tant qu'usager pressé, je veux localiser la station la plus proche de ma position actuelle.
    *   *Critère d'acceptation :* Le bouton "Ma position" centre la carte sur l'utilisateur et les gares proches.
8.  **US8 :** En tant que passager, je veux différencier visuellement les trains qui vont vers Tunis de ceux qui vont vers Borj Cédria.
    *   *Critère d'acceptation :* L'icône ou le label indique le sens de circulation.
9.  **US9 :** En tant qu'administrateur, je veux pouvoir mettre à jour les coordonnées d'une gare si elle est déplacée temporairement pour travaux.
    *   *Critère d'acceptation :* Les changements en base de données sont répercutés immédiatement sur l'application.
10. **US10 :** En tant qu'utilisateur, je veux naviguer facilement entre l'écran d'accueil et la carte.
    *   *Critère d'acceptation :* Le menu est simple et les boutons sont explicites.

## 6. Planification des Sprints

Le développement suit une logique itérative découpée en 6 Sprints :
*   **Sprint 1 (Analyse & Design) :** Finalisation des besoins, conception des maquettes et du schéma de base de données.
*   **Sprint 2 (Infrastructure Backend) :** Mise en place du serveur Node.js, connexion MySQL et développement du service de récupération GPS.
*   **Sprint 3 (Core Mobile App) :** Initialisation du projet React Native, intégration de Maps et affichage de la ligne ferroviaire.
*   **Sprint 4 (Intégration Temps Réel) :** Connexion Frontend-Backend pour l'affichage dynamique des trains.
*   **Sprint 5 (Calculs & Optimisation) :** Implémentation de l'algorithme d'ETA et système de notifications.
*   **Sprint 6 (Tests & Documentation) :** Phase de stabilisation (Bug fixing) et finalisation du rapport technique.

## 7. Choix des technologies

Les technologies choisies pour ce projet garantissent une pérennité et une efficacité maximale :
*   **Frontend : React Native.** Ce choix permet de développer une seule base de code pour Android et iOS, réduisant les coûts de maintenance tout en offrant des performances proches du natif.
*   **Backend : Node.js (Express).** Son modèle non-bloquant est idéal pour gérer de multiples requêtes simultanées et des flux de données en temps réel.
*   **Base de données : MySQL.** Un système robuste et largement utilisé, parfait pour structurer les données transactionnelles de transport.
*   **Cartographie : Google Maps API.** C'est la référence mondiale pour la précision des données géographiques et l'ergonomie de manipulation des cartes sur mobile.
