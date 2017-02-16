var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP);
    io = require('socket.io')(http); // Chargement de socket.io

// Static middleware - On gère les requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
app.use(express.static(__dirname + '/public'));

// Chargement du fichier index.html affiché au client
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Quand un client se connecte
io.on('connection', function(socket) {
  // On le note dans la console server
  console.log('New user connected!');

  // Utilisateur connecté à la socket
  var loggedUser;

  // Dès qu'un nouvel utilisateur renseigne un pseudo, on l'enregistre et on informe les autres utilisateurs
  socket.on('new-user-pseudo', function(user) {
    console.log(user.pseudo + ' just logged in');
    loggedUser = user;
    // var pseudo = ent.encode(user.pseudo);
    // On renvoie l'info à l'utilisateur courant
    var userServiceMessage = {
      pseudo: loggedUser.pseudo,
      text  : loggedUser.pseudo + ', vous avez rejoint le chat !',
      type  : 'login'
    };
    socket.emit('new-user', userServiceMessage)
    // On signale aux autres clients qu'il y a un nouveau venu
    var userServiceMessageBroadcast = {
      pseudo: loggedUser.pseudo,
      text  : loggedUser.pseudo + ' a rejoint le chat !',
      type  : 'login'
    };
    socket.broadcast.emit('new-user-broadcast', userServiceMessageBroadcast);
  });

  // Réception d'un message utilisateur et broadcast vers les autres utilisateurs
  socket.on('new-message', function(message) {
    message.pseudo = loggedUser.pseudo; // On intègre ici le nom d'utilisateur au message
    console.log('New message from ' + message.pseudo + ' : ' + message.text);
    // On le renvoie à l'utilisateur courant
    socket.emit('new-message', message);
    // On le broadcaste aux autres clients
    socket.broadcast.emit('new-message-broadcast', message);
  });

  // Quand un client se déconnecte
  socket.on('disconnect', function() {
    if(loggedUser !== undefined) {
      console.log(loggedUser.pseudo + ' logged out!');
      // On renvoie l'info à l'utilisateur courant
      var userServiceMessage = {
        pseudo: loggedUser.pseudo,
        text  : loggedUser.pseudo + ', vous avez quitté le chat !',
        type  : 'logout'
      };
      socket.emit('user-logged-out', userServiceMessage);
      // On envoie l'info aux autres utilisateurs
      var userServiceMessageBroadcast = {
        pseudo: loggedUser.pseudo,
        text  : loggedUser.pseudo + ' a quitté le chat !',
        type  : 'logout'
      };
      socket.broadcast.emit('user-logged-out-broadcast', userServiceMessageBroadcast);
    }
  });

});

PORT = 8080;
http.listen(PORT, function() {
  console.log('listening on *:' + PORT);
})