
# SupportFlow — real-time customer support

A production-oriented customer/support-agent chat workspace. Conversations and messages persist in MongoDB; Socket.IO supplies authenticated real-time delivery, typing, presence, read receipts, and inbox updates.

## Stack

- React, Vite, Redux Toolkit, Axios, Socket.IO client, Lucide
- Express, MongoDB/Mongoose, JWT, bcrypt, Socket.IO, Helmet, CORS, rate limiting
- Docker Compose with durable MongoDB storage

## Start locally

1. Copy `server/.env.example` to `server/.env` and set a strong `JWT_SECRET`.
2. Copy `client/.env.example` to `client/.env` if using non-default URLs.
3. Install packages: `npm install`, `npm install --prefix server`, and `npm install --prefix client`.
4. Start MongoDB, then run `npm run seed` for demo data.
5. Run `npm run dev`; visit `http://localhost:5173`.

Development credentials after seeding:

- Customer: `customer@example.com` / `SupportDemo2026!`
- Agent: `agent@example.com` / `SupportDemo2026!`

## Docker

Set `JWT_SECRET` in your shell or a root `.env`, then run `docker compose up --build`. The API runs on port 5000 and the packaged web client on port 5173. MongoDB remains private to Compose and persists in `mongo_data`.

## API

`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`

`POST|GET /api/conversations`, `GET /api/conversations/:id`, `PATCH /:id/accept`, `PATCH /:id/close`, `PATCH /:id/read`, `GET /:id/messages`, and `POST /:conversationId/messages`.

All private endpoints require `Authorization: Bearer <JWT>`. Customers are scoped to their own chats; agents can see waiting chats and chats assigned to them. `GET /api/health` reports server and MongoDB state.

## Socket events

Authenticated clients use `join_conversation`, `leave_conversation`, `send_message`, `typing_start`, `typing_stop`, `message_read`, `accept_conversation`, and `close_conversation`. Server events include `new_message`, `conversation_accepted`, `conversation_closed`, `user_online`, `user_offline`, and `unread_message`.

## Structure

`server/src` separates models, services, thin controllers, routes, middleware, and Socket.IO handling. `client/src` contains the UI, centralized Axios/socket services, and Redux state.

## Security notes

Passwords are bcrypt hashed and excluded from serialized users. JWT role claims are never trusted alone: every request resolves the server-side user. Helmet, CORS, rate limits, message length limits, authorization checks, and generic authentication errors are applied centrally. Use only a unique strong secret and HTTPS in production.


https://github.com/user-attachments/assets/fced1d3b-d1a0-4155-9d8f-b30654150cce
