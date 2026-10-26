# ZeroMSG

I built ZeroMSG as a simple, privacy-focused messaging web app where you can chat with people without creating an account or signing up for anything.

My main goal was to make messaging simple and private. No accounts, no unnecessary personal information, and no permanent server-side chat history. Just create a room, share the invite link, and start chatting.

## What can you do with it?

- Create a chat room or join one using a room ID.
- Chat in real time with WebSockets.
- Send encrypted messages using AES-GCM encryption.
- Share an invite link that includes the encryption key.
- Keep your chat history stored locally in your browser.
- Start using the app without an account, login, or registration.

## How I built it

- React and JavaScript for the frontend.
- Vite for development and building.
- Node.js for the backend.
- WebSockets using the ws library for real-time messaging.
- Web Crypto API for AES-GCM encryption.
- localStorage to keep chat history on the user's device.
- React Router DOM for navigation.

## Getting Started

First, clone the repository:

>git clone <repo-url>

>cd ZeroMSG


Install the frontend dependencies and start the app:

>npm install

>npm run dev


In a separate terminal, start the backend:

>cd server

>npm install

>node index.js


Make sure both the frontend and backend are running.

## How to use it

1. Open ZeroMSG in your browser.
2. Create a room or join one using a room ID.
3. Share the invite link with the person you want to chat with.
4. Start chatting.

That's it. No account required.

## Privacy and Security

Privacy was one of the main things I wanted to focus on while building ZeroMSG.

- Messages are encrypted in the browser before being sent to the server.
- The server relays encrypted messages.
- The encryption key is shared through the invite link.
- Chat history stays in the browser's local storage.
- Clearing the browser's site data removes the locally stored chat history.

The project is designed to keep things private and simple. However, encryption doesn't replace user authentication, and anyone who obtains an invite link containing the key may be able to access the chat. The app is still a work in progress.

## Future improvement

I plan to keep improving ZeroMSG, especially the encryption key verification, connection handling, and deployment of the backend.

