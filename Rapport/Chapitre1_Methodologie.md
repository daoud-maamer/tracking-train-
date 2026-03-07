# Chapitre 1 – Méthodologie et Conception Générale

## 1. Méthodologie de développement

Le choix d'une méthodologie de développement est une étape cruciale pour la réussite d'un projet informatique, en particulier pour une application mobile de suivi en temps réel nécessitant des itérations fréquentes et une réactivité face aux contraintes techniques.

### 1.1 La Méthodologie Agile

L'approche Agile repose sur un cycle de développement itératif et incrémental. Contrairement au modèle traditionnel en cascade (Waterfall), l'Agilité privilégie la flexibilité, la collaboration avec le client et la livraison rapide de fonctionnalités opérationnelles. Les quatre piliers du manifeste Agile guident cette démarche :
*   Les individus et leurs interactions au-delà des processus et des outils.
*   Des logiciels opérationnels plutôt qu’une documentation exhaustive.
*   La collaboration avec les clients au-delà de la négociation contractuelle.
*   L’adaptation au changement plutôt que le suivi d’un plan rigide.

### 1.2 La Méthodologie Scrum

Pour la gestion de notre projet, nous avons opté pour **Scrum**, qui est le cadre de travail (framework) Agile le plus répandu. Scrum structure le développement en cycles courts appelés **Sprints** (généralement de 2 à 4 semaines).

Les concepts clés de Scrum appliqués à notre projet sont :
*   **Product Backlog :** Une liste ordonnée de toutes les fonctionnalités souhaitées pour l'application.
*   **Sprint Backlog :** L'ensemble des tâches sélectionnées pour un sprint donné.
*   **Daily Meeting :** Une réunion quotidienne permettant de synchroniser le travail et d'identifier les obstacles.
*   **Rôles :** Le *Scrum Master* (garant de la méthode), le *Product Owner* (vision produit) et l'*Équipe de Développement*.

### 1.3 Comparaison et Choix de Scrum

Le tableau suivant résume la comparaison entre l'approche Agile globale et le framework Scrum :

| Critère | Méthodologie Agile | Framework Scrum |
| :--- | :--- | :--- |
| **Nature** | Philosophie / Ensemble de principes | Cadre de travail spécifique |
| **Structure** | Flexible, peu de règles imposées | Structuré (Sprints, Rôles, Cérémonies) |
| **Livraison** | Continue | À la fin de chaque Sprint |
| **Changements** | Acceptés à tout moment | Acceptés entre les Sprints |

**Pourquoi Scrum pour ce projet ?**
Le projet de suivi des trains SNCFT comporte des incertitudes techniques, notamment liées à la disponibilité et à la stabilité de l'API GPS. Scrum permet de diviser la complexité en blocs gérables, de tester la connectivité backend très tôt (Sprint 1 et 2) et d'ajuster l'interface mobile en fonction des retours réels. La cadence imposée par les Sprints assure une progression constante et visible.

## 2. Architecture du système

L'architecture logicielle définit la structure globale du système et la manière dont ses composants interagissent. Pour ce projet, nous avons adopté l'architecture **MVC (Modèle-Vue-Contrôleur)**, un patron de conception standard pour les applications web et mobiles.

### 2.1 Le Modèle MVC

L'objectif du MVC est de séparer la logique métier de l'interface utilisateur, facilitant ainsi la maintenance et l'évolution du code :
*   **Modèle (Model) :** Gère les données et la logique métier. Dans notre cas, il s'agit de la base de données MySQL et des services Node.js qui récupèrent les données GPS de la SNCFT.
*   **Vue (View) :** Représente l'interface utilisateur. Elle est développée avec React Native et affiche les informations (carte, listes, notifications) à l'usager.
*   **Contrôleur (Controller) :** Fait le lien entre le Modèle et la Vue. Les routes et contrôleurs de notre API Express traitent les requêtes de l'application mobile et renvoient les données appropriées.

### 2.2 Flux de données

1.  L'utilisateur interagit avec la **Vue** (clic sur un train).
2.  La Vue envoie une requête au **Contrôleur** (API Node.js).
3.  Le Contrôleur interroge le **Modèle** (Base de données ou Service GPS).
4.  Le Modèle renvoie les données traitées au Contrôleur.
5.  Le Contrôleur met à jour la **Vue** pour l'utilisateur.

## 3. Diagramme de Gantt (Planning prévisionnel)

La planification temporelle est essentielle pour respecter les échéances académiques de ce PFE. Le projet s'étale sur une durée de 6 mois, structurée comme suit :

| Phase | Activités | Durée |
| :--- | :--- | :--- |
| **Mois 1** | Cahier des charges, Etude de l'existant, Analyse des besoins | 4 semaines |
| **Mois 2** | Conception UML (Cas d'utilisation, Classes, Séquences) | 4 semaines |
| **Mois 3** | Développement du Backend (Node.js, MySQL, Service GPS) | 4 semaines |
| **Mois 4** | Développement de l'Application Mobile (React Native, Map) | 4 semaines |
| **Mois 5** | Tests unitaires, Tests d'intégration et Corrections | 4 semaines |
| **Mois 6** | Rédaction du rapport final et Préparation de la soutenance | 4 semaines |

Ce planning garantit que les composants critiques (Backend et GPS) sont développés avant l'interface mobile, permettant ainsi de travailler avec des données réelles lors de la phase de développement frontend.
