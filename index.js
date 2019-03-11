const express = require('express');
const app = express();
const moment = require('moment');
const uuid = require('uuid-random');

const http = require('http').Server(app);
const io = require('socket.io')(http);
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
let onlineUsersSocketIDs=[];
let onlineUsersUsernames=[];

let messages = [];
let messageColors = [];
let messageUUIDs = [];

let fruits = [
    "Acai",
    "Apple",
    "Apricot",
    "Avocado",
    "Bananas",
    "Bilberry",
    "Blueberry",
    "Blackberry",
    "Boysenberry",
    "Cantaloupe",
    "Cherry",
    "Cranberry",
    "Cucumber",
    "Date",
    "Durian",
    "Eggplant",
    "Elderberry",
    "Fig",
    "Gooseberry",
    "Grape",
    "Grapefruit",
    "Guava",
    "Honeydew",
    "Huckleberry",
    "Jujube",
    "Kiwi",
    "Kumquat",
    "Lemon",
    "Lime",
    "Lychee",
    "Mango",
    "Mulberry",
    "Nectarine",
    "Olive",
    "Orange",
    "Papaya",
    "Peach",
    "Pear",
    "Pepper",
    "Persimmon",
    "Pineapple",
    "Plum",
    "Pomegranate",
    "Rambutan",
    "Raspberry",
    "Starfruit",
    "Strawberry",
    "Tamarind",
    "Tangerine",
    "Tomato",
    "Watermelon",
    "Zucchini",
];
let usedFruits = [];
let usedUsernames = [];

app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('username color uuid', function(usernameExists, name, colorExists, col, uuidExists, id){
        let username = "";
        let color = 'green';
        let userID = "";
        if(usernameExists){
            username = name;
        }
        else{
            username = fruits.shift();
            usedFruits.push(username);
            socket.emit('set username', username);
        }

        if(!colorExists){
            socket.emit('set color', color);
        }
        usedUsernames.push(username);
        onlineUsersUsernames.push(username);
        onlineUsersSocketIDs.push(socket.id);

        if(!uuidExists){
            userID = uuid();
            socket.emit('set uuid', userID);
        }

        let message = username+" has joined the chat...";
        if(messages.length === 200){
            messages.shift();
            messageColors.shift();
            messageUUIDs.shift();
        }
        messages.push(message);
        messageColors.push('black');
        messageUUIDs.push("");

        io.emit('message relay', message, "", 'black', "");
        io.emit('user list', onlineUsersUsernames);
        socket.emit('message list', messages, messageColors, messageUUIDs);
    });

    socket.on('chat message', function(msg, name, color, id){
        let time = moment().format("HH:mm");
        let message = time+" "+name+": "+msg;
        if(messages.length === 200){
            messages.shift();
            messageColors.shift();
            messageUUIDs.shift();
        }
        messages.push(message);
        messageColors.push(color);
        messageUUIDs.push(id);
        io.emit('message relay', message, name, color, id);
    });

    socket.on('username change', function(newName, name){
        if(usedUsernames.includes(newName)){
            socket.emit('username change fail', "Nickname already taken!");
        }
        else{
            let index = usedFruits.indexOf(name);
            let index2 = usedUsernames.indexOf(name);
            let index3 = fruits.indexOf(newName);
            if(index !== -1){
                fruits.push(name);
                usedFruits.splice(index, 1);
            }
            if(index3 !== -1){
                let fruit = fruits.splice(index3, 1);
                usedFruits.push(fruit[0]);
            }
            usedUsernames.splice(index2, 1);
            usedUsernames.push(newName);

            let index4 = onlineUsersSocketIDs.indexOf(socket.id);
            onlineUsersUsernames[index4] = newName;

            socket.emit('set username', newName);

            let message = name+" has changed their nickname to \""+newName+"\"...";
            if(messages.length === 200){
                messages.shift();
            }
            messages.push(message);
            messageColors.push('black');
            messageUUIDs.push("");

            io.emit('message relay', message, "", 'black', "");
            io.emit('user list', onlineUsersUsernames);
        }
    });
    socket.on('color change', function(color, name){
        let message = name+" has changed their nickname color to \""+color+"\"...";
        if(messages.length === 200){
            messages.shift();
            messageColors.shift();
            messageUUIDs.shift();
        }
        messages.push(message);
        messageColors.push('black');
        messageUUIDs.push("");
        io.emit('message relay', message, "", 'black', "");
    });
    socket.on('disconnect', function(){
        let index = onlineUsersSocketIDs.indexOf(socket.id);
        onlineUsersSocketIDs.splice(index, 1);
        let fruit = onlineUsersUsernames.splice(index, 1);
        if(fruits.length < 52){
            fruits.push(usedFruits[usedFruits.length - 1]+"+");
        }
        socket.broadcast.emit('user removal', index);

        let message = fruit[0]+" has left the chat...";
        if(messages.length === 200){
            messages.shift();
            messageColors.shift();
            messageUUIDs.shift();
        }
        messages.push(message);
        messageColors.push('black');
        messageUUIDs.push("");
        io.emit('message relay', message, "", 'black', "");

        console.log('user disconnected');
    });
});

http.listen(port, function(){
    console.log('listening on *:3000');
});