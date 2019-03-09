$(document).ready(function() {
    let socket = io();
    let i = 0;
    let name="";
    let message="";

    if (document.cookie.split(';').filter(function(item) {
        return item.trim().indexOf('nickname=') === 0;
    }).length) {
        console.log('The cookie "reader" exists (ES5)')
    }

    $('form').submit(function(e){
        e.preventDefault();
        message = $('#m').val();
        if(message.startsWith("/nick ")){

        }
        else{

        }
        socket.emit('chat message', message, name);
        $('#m').val('');
        return false;
    });
    socket.on('username', function(nickname){
        $('#n').text(nickname);
        name = nickname;
    });
    socket.on('chat message', function(msg, nickname){
        if(nickname === name){
            $('#messages').append(($('<li>').text(msg)).css("font-weight", "bold"));
        }
        else {
            $('#messages').append($('<li>').text(msg));
        }
    });
    socket.on('user addition', function(nickname){
        $('#onlineUsers').append($('<li>').text(nickname));
    });
    socket.on('user removal', function(index){
        $("#onlineUsers li").eq(index).remove();
    });
    socket.on('user list', function(userList){
        $('#onlineUsers').empty();
        for(i = 0; i < userList.length; i++){
            $('#onlineUsers').append($('<li>').text(userList[i]));
        }
    });
    socket.on('message list', function(messageList){
        $('#messages').empty();
        for(i = 0; i < messageList.length; i++){
            $('#messages').append($('<li>').text(messageList[i]));
        }
    });
});