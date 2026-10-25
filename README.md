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
   - Run `npm install --legacy-peer-deps`
   - Run `npm start`
4. Open a web browser and go to `http://localhost:5173`

## Site Data

- The backend seeds about 1,180 ancient sites (about 960 of them in Europe) from
  `roman-sites-backend/src/main/resources/seed/`:
  - `curated-sites.sql` – the hand-picked starter sites (loaded into an empty database only)
  - `wikidata-sites.sql` – generated from Wikidata (coordinates, photo, country, year built).
    It is merged on every start, so newly imported sites appear without losing what you marked as seen.
- The database is a file in `roman-sites-backend/data/`, so "seen" ticks survive restarts.
  Delete that folder to start over from the seed data.
- To refresh the Wikidata list, run `node scripts/import-wikidata-sites.mjs` from the repo root and restart the backend.
- `public-ratings.sql` gives every site a 1–5 star public rating, applied on every start. It comes from
  `node scripts/compute-public-ratings.mjs` (run it after importing new sites), which scores each site on
  English Wikipedia page views over the last 12 months, how many Wikipedias cover it, and UNESCO World Heritage
  status, then splits all sites evenly into five star levels. Small, little-known sites end up with fewer stars.
- `site-photos.sql` sets each site's photo, photographer credit and licence, applied on every start. It comes from
  `node scripts/pick-site-photos.mjs`, which compares Wikidata's image, the lead image of the site's article on six
  Wikipedias and photos in its Commons category, rejects maps, plans, drawings, renders, models, coins and other
  non-photos, and prefers Commons Featured/Quality/Valued images. Sites with no suitable photo show a placeholder.
  Downloaded candidates are cached in `scripts/.cache/` (git-ignored); add `--refresh` to fetch them again.

### Using the map

- Pins are coloured by civilization; the tip of each pin is the exact location.
- Switch to **Satellite** (layers button, top left) and zoom in to see the actual ruins under a pin.
- Open a pin to see its card. Tick **Mark as seen** (seen sites get a green tick on their pin).
- Each card shows the site's **public rating** (paler stars) until you give it your own 1–5 stars, which then
  take over. **Use public** (or clicking your current star again) goes back to the public rating.
  Seen marks and your ratings are saved to your account.
- **Want to visit** on a card adds the site to your wishlist (a pink bookmark badge on its pin); it is saved to
  your account and is separate from "seen".
- The **Explore** panel (top right) filters the map by All / Seen / Unseen / Wishlist, by civilization and by your rating.
  Your filter choice is remembered in this browser.

## AI Chat

The **Chat** page talks to an AI through the backend (`POST /api/chat`), which calls OpenCode's
OpenAI-compatible API. The key stays on the server:

1. Create an API key in the [OpenCode Console](https://opencode.ai) (the account needs credit:
   OpenCode's free models only work inside the OpenCode app).
2. Put it in `roman-sites-backend/.env` (git-ignored) as `OPENCODE_API_KEY=...` and restart the backend.

The model is `opencode.model` in `application.properties` (default `glm-5.3-flash`, a low-cost one).
Each request includes a short summary of the sites you've seen and rated, so the AI can suggest what to visit next.

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