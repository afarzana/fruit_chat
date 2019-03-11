$(document).ready(function() {
    let socket = io();
    let i = 0;
    let name="";
    let color="";
    let message="";
    let uuid="";
    let nameExists = false;
    let colorExists = false;
    let uuidExists = false;

    if (document.cookie.split(';').filter(function(item) {
        return item.trim().indexOf('nickname=') === 0
    }).length) {
        nameExists = true;
        name = document.cookie.replace(/(?:(?:^|.*;\s*)nickname\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        $('#n').text(name);
    }
    else{
        name = "";

    }
    if (document.cookie.split(';').filter(function(item) {
        return item.trim().indexOf('color=') === 0
    }).length) {
        colorExists = true;
        color = document.cookie.replace(/(?:(?:^|.*;\s*)color\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }
    else{
        color = "";
    }
    if (document.cookie.split(';').filter(function(item) {
        return item.trim().indexOf('uuid=') === 0
    }).length) {
        uuidExists = true;
        uuid = document.cookie.replace(/(?:(?:^|.*;\s*)uuid\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }
    else{
        uuid = "";
    }
    socket.emit('username color uuid', nameExists, name, colorExists, color, uuidExists, uuid);

    socket.on('set username', function(nickname){
        $('#n').text(nickname);
        name = nickname;
        document.cookie = "nickname="+name;
    });

    socket.on('set color', function(col){
        color = col;
        document.cookie = "color="+col;
    });

    socket.on('set uuid', function(id){
        uuid = id;
        document.cookie = "uuid="+id;
    });

    $('form').submit(function(e){
        e.preventDefault();
        message = $('#m').val();
        if(message.startsWith("/n")){
            let command = message.split(' ');
            if(command.length === 2){
                if(command[0] === "/nick"){
                    if(command[1].length > 11){
                        alert("The maximum length for a nickname is 11 characters!");
                    }
                    else{
                        socket.emit('username change', command[1], name);
                    }
                }
                else if(command[0] === "/nickcolor"){
                    if(command[1].length !== 6){
                        alert("The color value should be in the format RRGGBB (hex color), exactly 6 characters...");
                    }
                    else{
                        color = '#'+command[1];
                        let colorOk = /^#[0-9A-F]{6}$/i.test(color);
                        if(colorOk){
                            document.cookie = "color="+color;
                            socket.emit('color change', color, name);
                        }
                        else{
                            alert("You have invalid characters in your hex color (only characters 0-9 and A-F are allowed)...");
                        }
                    }
                }
                else{
                    socket.emit('chat message', message, name, color, uuid);
                    alert("Did you want to change your nickname or nickname color? " +
                        "The two commands are: /nick newNickname and /nickcolor RRGGBB");
                }
            }
            else {
                socket.emit('chat message', message, name, color, uuid);
                alert("Did you want to change your nickname or nickname color? " +
                    "The two commands are: /nick newNickname and /nickcolor RRGGBB");
            }
        }
        else{
            socket.emit('chat message', message, name, color, uuid);
        }
        $('#m').val('');
        return false;
    });
    socket.on('username change fail', function(message){
        alert(message);
    });
    socket.on('message relay', function(msg, nickname, col, id){
        if(id === ""){
            $('#messages').append($('<li>').text(msg));
        }
        else{
            let index = msg.indexOf(': ');
            let t = msg.substring(0, 5);
            let u = msg.substring(6, index);
            let m = msg.substring(index + 1);
            $('#messages').append(
                $('<li/>').append($('<span/>', {text: t + " "})
                        .append($('<span/>', {text: u, style:"color: "+col}))
                    .append($('<span/>', {text: ": " + m}))
                ));
            if(uuid === id){
                $('#messages li').last().css("font-weight", "bold");
            }
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
    socket.on('message list', function(messageList, messageColors, messageUUIDs){
        $('#messages').empty();
        for(i = 0; i < messageList.length; i++){
            let msg = messageList[i];
            let col = messageColors[i];
            let id = messageUUIDs[i];
            if(col === 'black'){
                $('#messages').append($('<li>').text(msg));
            }
            else {
                let index = msg.indexOf(': ');
                let t = msg.substring(0, 5);
                let u = msg.substring(6, index);
                let m = msg.substring(index + 1);
                $('#messages').append(
                    $('<li/>').append($('<span/>', {text: t + " "})
                        .append($('<span/>', {text: u, style: "color: " + col}))
                        .append($('<span/>', {text: ": " + m}))
                    ));
                if(uuid === id){
                    $('#messages li').last().css("font-weight", "bold");
                }
            }
        }
    });
});