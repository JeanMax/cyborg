# Architecture 
(L'architecture ci-dessous  est à débattre)

Le raspberry pi propose un "portail captif" (port 80) lorsque l'utilisateur se connecte au Wi-Fi ou lorsqu'il ouvre un navigateur.
Ce portail captif doit comporter les élèments suivants:
- Formulaire demande du nom du joueur
- Choix du jeu dans une liste de jeux (lien url)

Chaque jeu à son propre serveur web sur le port de son choix (ex entre 3001 et 4000). Le lien vers le jeu doit comporter le nom du joueur.

C'est le serveur de ce portail qui propose à un joueur de créer une partie et ensuite chaque joueur peut rejoindre ou créer sa partie. C'est ensuite ce serveur qui va créer le processus fils serveur du jeu.
