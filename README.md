# ZeroMSG

ZeroMSG is a privacy-focused real-time messaging application built using React and Node.js. It allows users to create or join chat rooms and exchange encrypted messages... No account is needed to use this webapp

## Features

- Create and join chat rooms using room IDs
- Real-time messaging using WebSockets
- AES-GCM encryption for messages
- Encryption key sharing through invite links
- Chat history stored locally in the browser
- No user accounts or traditional database
- The server relays messages without storing chat history permanently

## Tech Stack

- Frontend: React, JavaScript, Vite, CSS
- Backend: Node.js
- Communication: WebSocket using the ws library
- Encryption: Web Crypto API with AES-GCM
- Local Storage: Browser localStorage
- Routing: React Router DOM

## Installation

1. Clone the repository.


>>git clone <repo url>


2. Navigate to the project folder.


>>cd ZeroMSG


3. Install frontend dependencies.


>>npm install


4. Start the frontend.


>>npm run dev


5. Navigate to the server folder in another terminal.


>>cd server
>>npm install
>>node index.js


Make sure the frontend and backend are running.

## Usage

1. Open the application in your browser.
2. Create a new chat room or join an existing room.
3. Share the room invite link with others.
4. Exchange messages in real time.

## Privacy

Messages are encrypted in the browser before being sent to the server. The server relays the encrypted messages, while chat history is stored locally in each user's browser.

Clearing the browser's site data will remove locally stored chat history.

## Current Limitations

- Encryption key sharing depends on the invite link.
- The backend must be hosted separately from the frontend for production deployment.

## Future Improvements
- Improve encryption key verification.
- Add more connection and error handling.
- Deploy the backend for public use.
