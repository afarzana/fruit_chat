const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const moment = require('moment');
const http = require('http').Server(app);
const io = require('socket.io')(http);
let onlineUsersSocketIDs=[];
let onlineUsersUsernames=[];
let messages = [];
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
    "Passion fruit",
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

/*
app.use(function (req, res, next) {
    // check if client sent cookie
    let cookieName= "nickname";
    const cookie = req.cookies.cookieName;
    if (cookie === undefined)
    {
        // no: set a new cookie
        let nickname = ;
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
        console.log('cookie created successfully');
    }
    else
    {
        // yes, cookie was already present
        console.log('cookie exists', cookie);
    }
    next(); // <-- important!
});
*/

app.use(express.static('public'));

app.get('/', function(req, res){
    console.log('Cookies: ', req.cookies);
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    let userName = fruits.shift();
    onlineUsersUsernames.push(userName);
    onlineUsersSocketIDs.push(socket.id);
    socket.emit('username', userName);
    socket.emit('user list', onlineUsersUsernames);
    socket.emit('message list', messages);
    socket.broadcast.emit('user addition', userName);
    socket.on('chat message', function(msg, userName){
        console.log('message: ' + msg);
        let time = moment().format("HH:mm");
        let message = time+" "+ userName+": "+msg;
        if(messages.length === 200){
            messages.shift();
        }
        messages.push(message);
        io.emit('chat message', message, userName);
    });
    socket.on('username change', function(newName, userName){


    });
    socket.on('disconnect', function(){
        let index = onlineUsersSocketIDs.indexOf(socket.id);
        onlineUsersSocketIDs.splice(index, 1);
        let fruit = onlineUsersUsernames.splice(index, 1);
        fruits.push(fruit[0]);
        socket.broadcast.emit('user removal', index);
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});