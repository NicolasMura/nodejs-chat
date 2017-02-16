var addMessage = function(message) {
  $('#messages-list').append(
    '<li class="list-group-item message-item">' +
      '<div class="row">' +
        '<div class="col-xs-2 col-sm-1 text-center">' +
          '<a href="#"><img class="circular" src="charlouze.jpg" width="40"></a>' +
        '</div>' +
        '<div class="col-xs-10 col-sm-11">' +
          '<span><strong>' + message.pseudo + '</strong></span>' +
          '<div class="row">' +
            '<div class="col-xs-10 col-xs-offset-2">' +
              '<p class="message me">' + message.text + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</li>'
  );
};

var addMessageBroadcast = function(message) {
  $('#messages-list').append(
    '<li class="list-group-item message-item">' +
      '<div class="row">' +
        '<div class="col-xs-2 col-sm-1 text-center">' +
          '<a href="#"><img class="circular" src="charlouze.jpg" width="40"></a>' +
        '</div>' +
        '<div class="col-xs-10 col-sm-11">' +
          '<span><strong>' + message.pseudo + '</strong></span>' +
          '<div class="row">' +
            '<div class="col-xs-10">' +
              '<p class="message somebody-else">' + message.text + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</li>'
  );
};

var infoNewUser = function(userServiceMessage) {
  $('#messages-list').append(
    '<li class="list-group-item message-item message-info text-center">' +
      '<strong><i>' + userServiceMessage.text + '</i></strong>' +
    '</li>'
  );
};

var infoNewUserBroadcast = function(userServiceMessageBroadcast) {
  $('#messages-list').append(
    '<li class="list-group-item message-item message-info text-center">' +
      '<strong><i>' + userServiceMessageBroadcast.text + '</i></strong>' +
    '</li>'
  );
};

var infoDisconnectedUser = function(userServiceMessage) {
  $('#messages-list').append(
    '<li class="list-group-item message-item message-info text-center">' +
      '<strong><i>' + userServiceMessage.text + '</i></strong>' +
    '</li>'
  );
};

var infoDisconnectedUserBroadcast = function(userServiceMessageBroadcast) {
  $('#messages-list').append(
    '<li class="list-group-item message-item message-info text-center">' +
      '<strong><i>' + userServiceMessageBroadcast.text + '</i></strong>' +
    '</li>'
  );
};

// Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
var scrollToBottom = function() {
  console.log($(window).scrollTop() + $(window).height() + 2 * $('#messages-list li').last().outerHeight());
  console.log($(document).height());
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages-list li').last().outerHeight() >= $(document).height()) {
    // console.log('GO to BOTTOM !');
    $('html, body').animate({ scrollTop: $(document).height() }, 500);
  }
}

// Connexion à socket.io (pas besoin de spécifier l'URL à laquelle le client Socket.io doit se connecter, par défaut il va tenter de se connecter sur le serveur qui héberge la page cliente)
var socket = io();
// var socket = io.connect('http://localhost:8080', {'forceNew':true });

$('#loginModal').modal('show');
// scrollToBottom();
$('#pseudo').focus();

// Connexion d'un utilisateur
$('#loginForm').on('submit', function(e) {
  e.preventDefault();

  // Objet JSON correspondant à l'utilisateur
  var user = {
    pseudo : $('#pseudo').val().trim()
  }

  if(user.pseudo.length > 0){
    console.log('Hello, ' + user.pseudo);
    // On cache la modale de connexion
    $('#loginModal').modal('hide');

    scrollToBottom();
    $('#chat input').focus();

    // On envoie le pseudo avec le signal "new-user-pseudo"
    socket.emit('new-user-pseudo', user);
    // On affiche le chat
    $('.main-container').removeClass('logged-out');
  }
});

// Envoi d'un message
$('#chat form').on('submit', function(e) {
  e.preventDefault();

  // Objet JSON correspondant au message
  var message = {
    text : $('#newMessage').val()
  };
  $('#newMessage').val('');
  if (message.text.trim().length !== 0) { // Gestion message vide
    console.log('Message to be sent : ' + message.text);
    socket.emit('new-message', message);
  }
  $('#chat input').focus(); // Focus sur le champ du message
});

// Connexion de l'utilisateur courant
socket.on('new-user', function(userServiceMessage) {
  console.log('You just logged in!');
  infoNewUser(userServiceMessage);
  scrollToBottom();
});

// Connexion d'un nouvel utilisateur (autre utilisateur)
socket.on('new-user-broadcast', function(userServiceMessageBroadcast) {
  console.log(userServiceMessageBroadcast.pseudo + ' just logged in');
  infoNewUserBroadcast(userServiceMessageBroadcast);
  scrollToBottom();
});

// Réception d'un message (utilisateur courant)
socket.on('new-message', function(message) {
  console.log('New message successfully sent from ' + message.pseudo + ' : ' + message.text);
  addMessage(message);
  scrollToBottom();
});

// Réception d'un message broadcast (autre utilisateur)
socket.on('new-message-broadcast', function(message) {
  console.log('New message received from ' + message.pseudo + ' : ' + message.text);
  addMessageBroadcast(message);
  scrollToBottom();
});

// Déconnexion de l'utilisateur courant
socket.on('user-logged-out', function(userServiceMessage) {
  console.log(userServiceMessage.pseudo + ' logged out!');
  infoDisconnectedUser(userServiceMessage);
  scrollToBottom();
});

// Déconnexion broadcast (autre utilisateur)
socket.on('user-logged-out-broadcast', function(userServiceMessageBroadcast) {
  console.log(userServiceMessageBroadcast.pseudo + ' logged out!');
  infoDisconnectedUserBroadcast(userServiceMessageBroadcast);
  scrollToBottom();
});