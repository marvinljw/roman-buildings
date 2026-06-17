# Roman History Map

An interactive web application that allows users to explore ancient Roman sites across Europe.

## Project Structure

The project is divided into two main parts: frontend and backend.

### Frontend

The frontend is built with React, TypeScript, and Material-UI. It's structured as follows:

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Main page components
│   ├── services/       # API communication and other services
│   ├── styles/         # Global styles and theme
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

### Backend

The backend is built with Java and Spring Boot. It's structured as follows:

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── romanhistorymap/
│   │   │               ├── config/       # Configuration classes
│   │   │               ├── controller/   # REST API controllers
│   │   │               ├── model/        # Data models
│   │   │               ├── repository/   # Data access layer
│   │   │               ├── security/     # Security configuration
│   │   │               └── service/      # Business logic
│   │   └── resources/
│   │       └── application.properties    # Application configuration
│   └── test/                             # Unit and integration tests
└── pom.xml                               # Dependencies and build configuration
```

## Architecture

The application follows a client-server architecture:

1. The frontend (React) communicates with the backend (Spring Boot) via RESTful APIs.
2. The backend handles data persistence, business logic, and authentication.
3. JWT (JSON Web Tokens) are used for user authentication.

## Key Features

- Interactive map of ancient Roman sites
- User authentication and profile management
- Ability to mark sites as visited
- Achievement system based on visited sites
- Chat functionality for learning more about Roman history

## Getting Started

1. Clone the repository
2. Set up the backend:
   - Navigate to the `backend` directory
   - Run `mvn spring-boot:run`
3. Set up the frontend:
   - Navigate to the `frontend` directory
   - Run `npm install`
   - Run `npm start`
4. Open a web browser and go to `http://localhost:3000`

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - React Router
  - Axios
- Backend:
  - Java
  - Spring Boot
  - Spring Security
  - JWT
  - JPA / Hibernate
- Database:
  - PostgreSQL (you may need to update this based on your actual database choice)

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.