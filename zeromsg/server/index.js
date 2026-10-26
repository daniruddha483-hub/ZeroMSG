import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });
const rooms = new Map();

function send(socket, data) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
}

function validEncrypted(data) {
  return (
    data && typeof data.iv === "string" && typeof data.ciphertext === "string"
  );
}

server.on("connection", (socket) => {
  console.log("Browser connected!");

  socket.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch {
      send(socket, {
        type: "room-error",
        message: "Invalid message format.",
      });
      return;
    }

    if (data.type === "create-room" || data.type === "join-room") {
      const { roomId, clientId } = data;

      if (
        typeof roomId !== "string" ||
        !roomId ||
        typeof clientId !== "string" ||
        !clientId
      ) {
        send(socket, {
          type: "room-error",
          message: "Invalid room details.",
        });
        return;
      }

      if (socket.roomId) {
        send(socket, {
          type: "room-error",
          message: "This connection has already joined a room.",
        });
        return;
      }

      if (data.type === "create-room") {
        if (rooms.has(roomId)) {
          send(socket, {
            type: "room-error",
            message: "Could not create the chat. Please try again.",
          });
          return;
        }

        rooms.set(roomId, new Set());
      } else if (!rooms.has(roomId)) {
        send(socket, {
          type: "room-error",
          message: "Room not found. Check the Room ID and try again.",
        });
        return;
      }

      const room = rooms.get(roomId);
      room.add(socket);

      socket.roomId = roomId;
      socket.clientId = clientId;

      console.log(
        data.type === "create-room"
          ? `Room created: ${roomId}`
          : `Browser joined room: ${roomId}`,
      );

      send(socket, {
        type: data.type === "create-room" ? "room-created" : "room-joined",
        roomId,
      });

      return;
    }

    const room = rooms.get(socket.roomId);

    if (!room || !room.has(socket)) {
      send(socket, {
        type: "room-error",
        message: "This chat room is no longer available.",
      });
      return;
    }

    if (data.type === "message") {
      if (!validEncrypted(data.encrypted)) {
        send(socket, {
          type: "room-error",
          message: "Invalid encrypted message.",
        });
        return;
      }

      room.forEach((client) => {
        send(client, {
          type: "message",
          encrypted: data.encrypted,
          senderId: socket.clientId,
        });
      });

      return;
    }

    // Relay an encrypted verification challenge to other room members.
    if (data.type === "key-verification-challenge") {
      if (!validEncrypted(data.encrypted)) return;

      room.forEach((client) => {
        if (client !== socket) {
          send(client, {
            type: "key-verification-challenge",
            encrypted: data.encrypted,
            senderId: socket.clientId,
          });
        }
      });

      return;
    }

    // Route an encrypted verification response to its intended client.
    if (data.type === "key-verification-response") {
      if (!validEncrypted(data.encrypted)) return;
      if (typeof data.targetClientId !== "string") return;

      room.forEach((client) => {
        if (client.clientId === data.targetClientId) {
          send(client, {
            type: "key-verification-response",
            encrypted: data.encrypted,
            senderId: socket.clientId,
          });
        }
      });
    }
  });

  socket.on("close", () => {
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.delete(socket);

    if (room.size === 0) {
      rooms.delete(roomId);
    }

    console.log(`Browser left room: ${roomId}`);
  });
});

console.log("ZeroMSG WebSocket server running on port 8080");
