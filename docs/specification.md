# Architecture 
(L'architecture ci-dessous  est à débattre)

Le raspberry pi propose un "portail captif" (port 80) lorsque l'utilisateur se connecte au Wi-Fi ou lorsqu'il ouvre un navigateur.
Ce portail captif doit comporter les élèments suivants:
- Formulaire demande du nom du joueur
- Choix du jeu dans une liste de jeux (lien url)

Chaque jeu à son propre serveur web sur le port de son choix (ex entre 3001 et 4000). Le lien vers le jeu doit comporter le nom du joueur.

C'est à chaque "jeu" par la suite de géré ces utilisateurs, définir le début d'une partie etc...
