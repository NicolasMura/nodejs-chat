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

// Liste des utilisateurs connectés
var users = [];  

// Historique des messages
var messages = [];

// Liste des utilisateurs en train de saisir un message
var typingUsers = [];

// Quand un client se connecte
io.on('connection', function(socket) {
  // On le note dans la console server
  console.log('New user connected!');

  // Utilisateur connecté à la socket
  var loggedUser;

  // Emission d'un événement "user-already-logged" pour chaque utilisateur déjà connecté
  for (var i = 0; i < users.length; i++) {
    socket.emit('user-already-logged', users[i]);
    console.log(users[i]);
  }

  // Emission d'un événement pour chaque message (chat only) de l'historique
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].type === 'chat-message') {
      socket.emit('new-message', messages[i]);
    } else {
      socket.emit('new-info', messages[i]);
    }
      
  }

  // Dès qu'un nouvel utilisateur renseigne un pseudo, on l'enregistre et on informe les autres utilisateurs
  socket.on('new-user-pseudo', function(user, callback) {
    // On vérifie que l'utilisateur n'existe pas déjà
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].pseudo === user.pseudo) {
        userIndex = i;
      }
    }
    // Si l'utilisateur est bien nouveau
    if (user !== undefined && userIndex === -1) {
      console.log(user.pseudo + ' just logged in');
      loggedUser = user;
      users.push(loggedUser);
      // TO DO --> utiliser ent.encode
      
      // On renvoie l'info à l'utilisateur courant
      var serviceMessage = {
        pseudo: loggedUser.pseudo,
        avatar: loggedUser.avatar,
        text  : loggedUser.pseudo + ', vous avez rejoint le chat !',
        type  : 'service-message'
      };
      socket.emit('user-login', serviceMessage)
      
      // On signale aux autres clients qu'il y a un nouveau venu
      var serviceMessageBroadcast = {
        pseudo: loggedUser.pseudo,
        avatar: loggedUser.avatar,
        text  : loggedUser.pseudo + ' a rejoint le chat !',
        type  : 'service-message'
      };
      socket.broadcast.emit('user-login', serviceMessageBroadcast);
      callback(true);
    } else {
      callback(false);
    }
  });

  // Réception d'un message utilisateur et broadcast vers tous les utilisateurs
  socket.on('new-message', function(message) {
    message.pseudo = loggedUser.pseudo; // On intègre ici le nom d'utilisateur au message
    message.avatar = loggedUser.avatar; // On intègre ici l'avatar de l'utilisateur au message
    message.type = 'chat-message'; // On intègre ici le type de message (pour l'historique)
    console.log('New message from ' + message.pseudo + ' : ' + message.text);
  
    // Emission du signal 'new-message'
    io.emit('new-message', message);

    // Ajout à la liste des messages et purge si nécessaire
    messages.push(message);
    if (messages.length > 50) {
      messages.splice(0, 1);
    }
  });

  // Réception de l'événement 'start-typing'
  socket.on('start-typing', function() {
    // Ajout de l'utilisateur à la liste des utilisateurs en cours de saisie
    var typingUserIndex = typingUsers.indexOf(loggedUser);
    if (typingUserIndex === -1) {
      typingUsers.push(loggedUser);
    }
    io.emit('update-typing', typingUsers);
  });

  // Réception de l'événement 'stop-typing'
  socket.on('stop-typing', function() {
    // Actualisation de la liste des utilisateurs en cours de saisie
    var typingUserIndex = typingUsers.indexOf(loggedUser);
    if (typingUserIndex !== -1) {
      typingUsers.splice(typingUserIndex, 1);
    }
    io.emit('update-typing', typingUsers);
  });

  // Quand un client se déconnecte
  socket.on('disconnect', function() {
    if (loggedUser !== undefined) {
      console.log(loggedUser.pseudo + ' logged out!');
      
      // On renvoie l'info à l'utilisateur courant
      var serviceMessage = {
        pseudo: loggedUser.pseudo,
        text  : loggedUser.pseudo + ', vous avez quitté le chat !',
        type  : 'service-message'
      };
      socket.emit('user-logout', serviceMessage);
      
      // On envoie l'info aux autres utilisateurs
      var serviceMessageBroadcast = {
        pseudo: loggedUser.pseudo,
        text  : loggedUser.pseudo + ' a quitté le chat !',
        type  : 'service-message'
      };
      socket.broadcast.emit('user-logout', serviceMessageBroadcast);
      
      // On supprime l'utilisateur de la liste des utilisateurs connectés
      var userIndex = users.indexOf(loggedUser);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }

      // Si jamais il était en train de saisir un texte, on l'enlève de la liste
      var typingUserIndex = typingUsers.indexOf(loggedUser);
      if (typingUserIndex !== -1) {
        typingUsers.splice(typingUserIndex, 1);
      }
    }
  });

});

PORT = 8080;
HOST = 'localhost';
http.listen(PORT, HOST, function() {
  console.log('listening on ' + HOST + ':' + PORT);
})