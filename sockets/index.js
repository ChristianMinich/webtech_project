module.exports = (io) => {
    const users = {} // Sichern der angemeldeten Clients u.A. für Nutzerlisten und Namensänderungen.

    console.log("hello there");

    io.on("connection", (socket) => {
        console.log(socket.id);
        console.log(socket.rooms);
        users[socket.id] = socket.request.connection.remoteAddress;
        console.log(users);
        // Ereignisbehandlung: Neuer Benutzer meldet sich an.
        socket.on("new-user", (name) => {
            users[socket.id] = name;
            socket.broadcast.emit("user-connected", name);
            io.emit("all-connections", JSON.stringify(users));
        });

        // Ereignisbehandlung: Nachricht wurde gesendet (Vom Client an Server).
        socket.on("send-chat-message", (message) => {
            socket.broadcast.emit("chat-message", {message: message, name: users[socket.id]});
        })

        // Ereignisbehandlung: Name wurde geändert.
        socket.on("send-new-username", (name) => {
            let oldName = users[socket.id];
            users[socket.id] = name;
            socket.broadcast.emit("username-changed", {oldName: oldName, newName: name});
            io.emit("all-connections", JSON.stringify(users));
        })

        // Ereignisbehandlung: Verbindung getrennt.
        socket.on("disconnect", () => {
            socket.broadcast.emit("user-disconnected", users[socket.id]);
            delete users[socket.id];
            io.emit("all-connections", JSON.stringify(users));
        });
    });
};