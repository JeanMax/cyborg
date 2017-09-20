Ce dossier contient tous les jeux et appli installé sur le serveur.

Ils devront respecter une certaine API qui reste à définir.
Il doivent fournir une commande de lancement qui prend en parametre un numero de port qui leur sera fourni pour la plateforme.

[propostion]
A file, load.json must be a the top level folder.
cat load.json
<pre>
{
	"config":
	{
		"name":	"name of the game",
		"main":	"theNameOfTheMainFile" //ex: "index.js" or "src/index.js"
	}
}
Il doivent fournir une commande de lancement qui prend en parametre un numero de port qui leur sera fourni.

The function "process.send({state:"READY"});" must be add in the callback of the function "server.listen
ex:
	server.listen(PORT, function () {
		process.send({state:"READY"});
});
