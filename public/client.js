var addMessage = function(message) {
  divClass = '';
  messageClass = 'somebody-else';
  if (user !== undefined) {
    divClass = user.pseudo === message.pseudo ? 'col-xs-offset-2' : '';
    messageClass = user.pseudo === message.pseudo ? 'me' : 'somebody-else';
  }
  $('#messages-list').append(
    '<li class="list-group-item message-item ' + message.pseudo + '">' +
      '<div class="row">' +
        '<div class="col-xs-2 col-sm-1 text-center avatar">' +
          '<a href="#"><img class="circular" src="charlouze.jpg" width="40"></a>' +
        '</div>' +
        '<div class="col-xs-10 col-sm-11">' +
          '<span class="pseudo"><strong>' + message.pseudo + '</strong></span>' +
          '<div class="row">' +
            '<div class="col-xs-10 message-wrapper ' + divClass + '">' +
              '<p class="message-content ' + messageClass + '">' + message.text + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</li>'
  );
};

var addInfoMessage = function(userServiceMessageBroadcast) {
  $('#messages-list').append(
    '<li class="list-group-item message-item message-info text-center">' +
      '<strong><i>' + userServiceMessageBroadcast.text + '</i></strong>' +
    '</li>'
  );
};

var addNewUser = function(user) {
  $('#users-list').append(
    '<li class="list-group-item user-item ' + user.pseudo + '">' +
      '<div class="new">' +
        '<a href="#"><img class="circular" src="charlouze.jpg" width="25"></a>' +
        '<span>' + user.pseudo + '</span>' +
        '<span class="typing">typing...</span>' +
      '</div>' +
    '</li>'
  );
  setTimeout(function() {
    $('#users-list div.new').removeClass('new');
  }, 1000);
};

var removeUser = function(pseudo) {
  $('#users-list li.' + pseudo).remove();
};

// Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
var scrollToBottom = function() {
  // console.log($(window).scrollTop() + $(window).height() + 2 * $('#messages-list li').last().outerHeight());
  // console.log($(document).height());
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages-list li').last().outerHeight() >= $(document).height()) {
    // console.log('GO to BOTTOM !');
    $('html, body').animate({ scrollTop: $(document).height() }, 500);
  }
}

// Connexion à socket.io (pas besoin de spécifier l'URL à laquelle le client Socket.io doit se connecter, par défaut il va tenter de se connecter sur le serveur qui héberge la page cliente)
var socket = io();
// var socket = io.connect('http://localhost:8080', {'forceNew':true });

var user = undefined;

$('#loginModal').modal('show');
// scrollToBottom();
$('#pseudo').focus();

// Connexion d'un utilisateur
$('#loginForm').on('submit', function(e) {
  e.preventDefault();
  
  // On efface les erreurs précédentes éventuelles
  $('.error').remove();

  // Objet JSON correspondant à l'utilisateur
  user = {
    pseudo : $('#pseudo').val().trim()
  }

  if (user.pseudo.length > 0){
    socket.emit('new-user-pseudo', user, function(success){
      // On n'affiche le chat que si success vaut true
      if (success) {
        console.log('Hello, ' + user.pseudo);

        // On cache la modale de connexion
        $('#loginModal').modal('hide');
        $('#chat input').focus();
        scrollToBottom();

        // Si reconnexion d'un utilisateur ayant déjà des messages enregistrés,
        // on lui réaffecte ses messages avec les classes 'col-xs-offset-2' et 'me' 
        userMessages = $('#messages-list li.' + user.pseudo);
        if(userMessages.length > 0) {
          for(var i = 0; i < userMessages.length; i++) {
            $(userMessages[i]).find('.message-wrapper').addClass('col-xs-offset-2');
            $(userMessages[i]).find('.message-content').removeClass('somebody-else').addClass('me');
          }
        }
        
        // On affiche le chat
        $('.main-container').removeClass('logged-out'); 
      } else{
        console.log('Ce pseudo existe déjà !');
        $('#loginModal #loginForm .form-group').append('<p class="error">Désolé, ce pseudo existe déjà !</p>');
      }
    });
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
    socket.emit('new-message', message);
  }
  $('#chat input').focus(); // Focus sur le champ du message
});

// Récupération de la liste des utilisateurs déjà connectés
socket.on('user-already-logged', function(user) {
  addNewUser(user);
});

// Connexion d'un utilisateur
socket.on('user-login', function(serviceMessage) {
  addInfoMessage(serviceMessage);
  addNewUser(serviceMessage);
  scrollToBottom();
});

// Déconnexion d'un utilisateur
socket.on('user-logout', function(serviceMessage) {
  addInfoMessage(serviceMessage);
  removeUser(serviceMessage.pseudo);
  scrollToBottom();
});

// Réception d'un message
socket.on('new-message', function(message) {
  addMessage(message);
  scrollToBottom();
});

// Réception d'une info service
socket.on('new-info', function(info) {
  addInfoMessage(info);
  scrollToBottom();
});
