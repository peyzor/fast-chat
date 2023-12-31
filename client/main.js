document.addEventListener('DOMContentLoaded', (DOMEvent) => {
    DOMEvent.preventDefault();

    const messageFormEl = document.getElementById('message-form');
    const messageEl = document.getElementById('message');
    const messageBoxEl = document.getElementById('message-box');

    // Unique ID for all user
    const userId = window.crypto.randomUUID();

    function messageAppend(myMessage, msgContent) {
        let sideOff = 'justify-start',
            bgColor = 'bg-slate-700',
            specificUser = userId;
        if (myMessage) {
            sideOff = 'justify-end';
            bgColor = 'bg-indigo-500';
        } else {
            specificUser = msgContent.userId;
        }
        const msgString = `
            <div class="w-full flex ${sideOff}">
                <div class="box-bordered p-1 ${bgColor} w-8/12 text-slate-100 rounded mb-1">
                    <p>${msgContent.msg}</p>
                    <p>${specificUser}</p>
                </div>
            </div>
            `;


        const domParser = new DOMParser();
        const msgEl = domParser.parseFromString(msgString, 'text/html').body.firstElementChild;
        messageBoxEl.append(msgEl);
    }

    // Create WebSocket connection.
    const socket = new WebSocket(`ws://localhost:8000/ws/${userId}`);

    // // Connection opened
    socket.addEventListener('open', (socketEvent) => {
        console.log("Connection is open");
    });

    // Close connection
    socket.addEventListener('close', (socketEvent) => {
        console.log("Connection is closed");
    });

    // // Listen for messages
    socket.addEventListener('message', (socketEvent) => {
        console.log("Message from server ", socketEvent.data);
        // console.log(JSON.parse(socketEvent.data));
        messageAppend(false, JSON.parse(socketEvent.data));
    });

    const errorMap = new Map();
    messageFormEl.addEventListener('submit', (event) => {
        event.preventDefault();
        if (messageEl.value === '') {
            console.log("Enter a message");
            errorMap.set('invalid_message', 'Please enter a message');
        } else {
            socket.send(messageEl.value);
            messageAppend(true, {msg: messageEl.value, userId: null});
            errorMap.clear();
            event.target.reset();
        }
    });
});
