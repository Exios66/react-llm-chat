# Repository Structure

This document provides an overview of the repository structure for the Chat Application.

```
chat-application/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── label.yml
├── backend/
│   ├── config/
│   │   └── default.json
│   ├── controllers/
│   │   └── chatController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Message.js
│   │   ├── Room.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── ChatRoutes.js
│   ├── utils/
│   │   └── logger.js
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── socket.js
├── docs/
│   ├── API.md
│   ├── CUSTOMIZATION.md
│   ├── DEBUGGING.md
│   ├── INSTALLATION.md
│   └── REPOSITORY_STRUCTURE.md
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   └── Chat.jsx
│   │   │   ├── ErrorBoundary/
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── Join/
│   │   │   │   └── Join.jsx
│   │   │   ├── LoadingSpinner/
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── NotFound/
│   │   │   │   └── NotFound.jsx
│   │   │   ├── RoomList/
│   │   │   │   └── RoomList.jsx
│   │   │   └── RoomList.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── hooks/
│   │   │   └── useErrorHandler.js
│   │   ├── redux/
│   │   │   ├── actions/
│   │   │   │   ├── authActions.js
│   │   │   │   ├── roomActions.js
│   │   │   │   ├── themeActions.js
│   │   │   │   └── userActions.js
│   │   │   ├── reducers/
│   │   │   │   ├── roomsReducer.js
│   │   │   │   ├── themeReducer.js
│   │   │   │   └── userReducer.js
│   │   │   └── store.js
│   │   ├── themes/
│   │   │   └── theme.js
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── .gitignore
│   ├── cypress.json
│   └── package.json
├── .gitignore
├── CHANGELOG.md
├── package.json
├── README.md
└── requirements.txt
```

## Key Directories and Files

- `.github/workflows/`: Contains GitHub Actions workflow files for CI/CD.
- `backend/`: Contains all server-side code.
  - `config/`: Configuration files.
  - `controllers/`: Request handlers.
  - `middleware/`: Custom middleware functions.
  - `models/`: Database models.
  - `routes/`: API route definitions.
  - `utils/`: Utility functions.
  - `server.js`: Main server file.
  - `socket.js`: Socket.IO setup and event handlers.
- `docs/`: Documentation files.
- `frontend/`: Contains all client-side code.
  - `public/`: Public assets.
  - `src/`: React application source code.
    - `components/`: React components.
    - `contexts/`: React context providers.
    - `hooks/`: Custom React hooks.
    - `redux/`: Redux store, actions, and reducers.
    - `themes/`: Theme configuration.
  - `App.js`: Main React component.
  - `index.js`: Entry point of the React application.
- `CHANGELOG.md`: Version history and changes.
- `README.md`: Project overview and quick start guide.

This structure separates the frontend and backend code, making it easier to develop, test, and deploy each part independently. The `docs/` directory contains comprehensive documentation for setup, customization, debugging, and API reference.
