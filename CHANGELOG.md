# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2024-10-12

### Added

- Comprehensive documentation in the `docs/` folder:
  - INSTALLATION.md: Step-by-step setup instructions
  - CUSTOMIZATION.md: Guide for customizing the application
  - DEBUGGING.md: Instructions for debugging frontend and backend
  - API.md: Detailed API endpoint documentation
  - REPOSITORY_STRUCTURE.md: Overview of the project structure

## [0.0.2] - 2024-10-12

### Added

- Implemented JWT authentication for enhanced security
- Created new authMiddleware for protecting routes
- Added authRoutes for user registration, login, and logout
- Implemented Redux actions and reducers for authentication
- Added error handling middleware
- Created custom useErrorHandler hook for consistent error handling
- Implemented pagination for chat messages and room list
- Added Cypress for end-to-end testing
- Implemented dark mode toggle functionality

### Changed

- Updated frontend components (Join, Chat, RoomList) to work with new authentication system
- Modified backend routes to handle authenticated requests
- Updated socket.io implementation to work with authenticated connections
- Refactored main server file to use new routes and socket configuration
- Updated README.md with new setup instructions and features
- Improved CI/CD pipeline to include frontend and backend tests

### Security

- Implemented JWT for secure authentication
- Added token verification in socket connections
- Updated dependencies to address potential vulnerabilities

## [0.0.1] - 2024-10-12

### Added

- Initial project setup
- React frontend with Redux for state management
- Express backend with Socket.IO for real-time communication
- User authentication system
- Chat room functionality
- Dark mode toggle

## [0.1.0] - 2023-06-01

### Added

- Initial release of the chat application

Some text with a valid \\d escape sequence

[Unreleased]: https://github.com/yourusername/your-repo-name/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/yourusername/your-repo-name/compare/v0.0.2...v0.1.2
[0.0.2]: https://github.com/yourusername/your-repo-name/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/yourusername/your-repo-name/compare/v0.1.0...v0.0.1
[0.1.0]: https://github.com/yourusername/your-repo-name/releases/tag/v0.1.0
