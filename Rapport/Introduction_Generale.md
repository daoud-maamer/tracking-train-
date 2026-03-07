# Introduction Générale

## 1. Contexte du projet

Le secteur du transport en Tunisie, et plus particulièrement le transport ferroviaire, traverse une phase de mutation profonde. La Société Nationale des Chemins de Fer Tunisiens (SNCFT) assure une mission vitale de mobilité pour des milliers de citoyens, notamment sur l'axe stratégique de la Banlieue Sud de Tunis. Cependant, l'un des obstacles majeurs à l'optimisation de l'expérience usager réside dans l'asymétrie d'information concernant la position réelle des trains et les horaires de passage effectifs.

Actuellement, les voyageurs font face à une absence de visibilité en temps réel, dépendant uniquement d'horaires théoriques souvent mis à mal par des aléas techniques ou logistiques. Ce manque de transparence génère une frustration croissante et une perte de productivité pour les usagers qui ne peuvent planifier leurs déplacements avec précision.

Le passage à une ère de "Mobilité Intelligente" (Smart Mobility) devient donc une nécessité impérieuse. L'importance des services numériques dans le transport n'est plus à démontrer : ils permettent non seulement de réduire l'incertitude, mais aussi de moderniser l'image de l'institution publique. C'est dans cette optique que s'inscrit notre projet de fin d'études, motivé par la volonté d'apporter une solution technologique concrète aux usagers de la SNCFT.

## 2. Présentation de l’organisme d’accueil (SNCFT)

La **Société Nationale des Chemins de Fer Tunisiens (SNCFT)** est une entreprise publique tunisienne chargée de la gestion du réseau ferroviaire national. Fondée pour structurer les échanges commerciaux et humains, elle est aujourd'hui un pilier du transport interurbain et de banlieue.

*   **Nom :** SNCFT (Société Nationale des Chemins de Fer Tunisiens)
*   **Domaine :** Transport ferroviaire de voyageurs et de marchandises.
*   **Mission :** Assurer un transport sûr, régulier et accessible sur l'ensemble du territoire tunisien.
*   **Importance :** Elle joue un rôle socio-économique majeur en reliant les pôles industriels et résidentiels.

La ligne de la **Banlieue Sud**, reliant Tunis Ville à Borj Cédria, est l'une des plus fréquentées du pays. Elle dessert des zones résidentielles et estudiantines denses, faisant d'elle le terrain d'application idéal pour notre solution de suivi GPS.

## 3. Organisation de l’organisme

La SNCFT est structurée en plusieurs directions centrales et régionales. Au cœur de cette organisation, on retrouve :
*   **La Direction du Mouvement :** Responsable de la coordination des flux ferroviaires et de la sécurité des circulations.
*   **Le Service Informatique :** Chargé de la gestion des infrastructures numériques et de l'intégration des nouvelles technologies de communication.

Dans le cadre de ce projet, le service informatique et la direction du mouvement collaborent pour fournir les ressources nécessaires, notamment l'accès aux flux de données GPS bruts provenant des balises installées sur le matériel roulant.

## 4. Étude de l’existant

Une analyse de la situation actuelle révèle un décalage entre les ressources technologiques de la SNCFT et les services offerts au grand public. Bien que la SNCFT utilise des systèmes internes pour la gestion du trafic, aucune application mobile n'est mise à la disposition des citoyens pour le suivi en temps réel.

En comparaison avec des pays développés ou même certaines métropoles régionales, où les applications de "Live Tracking" pour métros et trains sont la norme, le passager tunisien est contraint de se rendre physiquement en gare pour obtenir une information, souvent approximative. Les limitations actuelles sont techniques (disponibilité des données) et ergonomiques (absence d'interface de consultation mobile).

## 5. Problématique

La problématique centrale de ce projet peut se résumer ainsi :
*   L'impossibilité pour le passager de connaître la position géographique exacte de son train en temps réel.
*   L'absence d'outils de prédiction pour l'heure d'arrivée estimée (ETA) basée sur les conditions réelles de trafic.
*   La difficulté de gestion des retards impromptus, faute d'un canal de notification direct.

## 6. Objectifs du projet

L'objectif principal est de développer une **application mobile hybride** dédiée au suivi en temps réel des trains de la Banlieue Sud.
Les objectifs spécifiques incluent :
1.  **Géolocalisation précise :** Utiliser les données GPS de la SNCFT pour afficher les trains sur une carte.
2.  **Calcul d'ETA :** Développer un algorithme capable d'estimer l'arrivée en station.
3.  **Visualisation intuitive :** Concevoir une interface utilisateur moderne et accessible.
4.  **Information continue :** Permettre la consultation des stations et des horaires théoriques vs réels.

## 7. Solution proposée

Pour répondre à ces besoins, nous proposons une architecture logicielle robuste :
*   **Frontend Mobile :** Développé avec **React Native**, permettant une compatibilité iOS et Android avec une expérience utilisateur fluide.
*   **Backend API :** Un serveur sous **Node.js** agissant comme passerelle entre les données brutes de la SNCFT et les utilisateurs.
*   **Base de données :** Utilisation de **MySQL** pour la persistance des informations de trains et des logs de circulation.
*   **Source de données :** Intégration par API REST des flux GPS provenant des dispositifs embarqués sur les rames.
