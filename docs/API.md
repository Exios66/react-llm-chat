# API Documentation

This document provides details about the API endpoints available in the Chat Application.

## Base URL

All API requests should be prefixed with:

```

http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### User Authentication

#### Register a new user

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth required**: No
- **Data constraints**:

  ```json
  {
    "name": "[valid name]",
    "email": "[valid email address]",
    "password": "[password in plain text]"
  }
  ```

- **Success Response**:
  - **Code**: 201
  - **Content**: `{ "user": { "id": "user_id", "name": "user_name", "email": "user_email" }, "token": "jwt_token" }`

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Data constraints**:

  ```json
  {
    "email": "[valid email address]",
    "password": "[password in plain text]"
  }
  ```

- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "user": { "id": "user_id", "name": "user_name", "email": "user_email" }, "token": "jwt_token" }`

#### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth required**: Yes
- **Success Response**:
  - **Code**: 200

#### Get current user

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "id": "user_id", "name": "user_name", "email": "user_email" }`

### Chat Rooms

#### Get all rooms

- **URL**: `/chat/rooms`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "rooms": [{ "id": "room_id", "name": "room_name" }, ...], "currentPage": 1, "totalPages": 5 }`

#### Create a new room

- **URL**: `/chat/rooms`
- **Method**: `POST`
- **Auth required**: Yes
- **Data constraints**:

  ```json
  {
    "name": "[room name]"
  }
  ```

- **Success Response**:
  - **Code**: 201
  - **Content**: `{ "id": "room_id", "name": "room_name", "creator": "user_id" }`

### Messages

#### Get messages for a room

- **URL**: `/chat/messages/:roomId`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Params**: `roomId=[string]`
- **Query Params**: `page=[integer]&limit=[integer]`
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "messages": [{ "id": "message_id", "content": "message_content", "sender": { "id": "user_id", "name": "user_name" }, "createdAt": "timestamp" }, ...], "currentPage": 1, "hasMore": true }`

#### Send a message

- **URL**: `/chat/messages`
- **Method**: `POST`
- **Auth required**: Yes
- **Data constraints**:

  ```json
  {
    "content": "[message content]",
    "roomId": "[valid room id]"
  }
  ```

- **Success Response**:
  - **Code**: 201
  - **Content**: `{ "id": "message_id", "content": "message_content", "sender": { "id": "user_id", "name": "user_name" }, "room": "room_id", "createdAt": "timestamp" }`

## Error Responses

- **Condition**: If a request fails, the server will respond with an appropriate HTTP status code and an error message.
- **Content**: `{ "error": "Error message" }`

Common error codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

For more detailed information about the API implementation, refer to the backend code in the `routes` and `controllers` directories.
