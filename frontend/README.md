# Roman Buildings Frontend

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Map/                # Map-related components
│   │   ├── MapComponent.tsx
│   │   ├── SitePopup.tsx
│   │   └── index.ts
│   ├── VisitedSites/       # Visited sites components
│   │   ├── CountrySection.tsx
│   │   ├── SiteItem.tsx
│   │   └── index.ts
│   ├── ChatBot/            # Chat functionality
│   │   ├── ChatBot.tsx
│   │   └── index.ts
│   └── common/             # Shared components
│       ├── ProfileSidebar.tsx
│       ├── UploadLocationForm.tsx
│       └── index.ts
│
├── pages/                  # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Map.tsx
│   ├── VisitedSitesPage.tsx
│   └── ChatBot.tsx
│
├── services/               # API services (split by feature)
│   ├── authService.ts      # Authentication (login, register)
│   ├── siteService.ts      # Sites CRUD operations
│   ├── visitService.ts     # Visit tracking (mark/unmark visited)
│   ├── chatService.ts      # Chat functionality
│   └── index.ts            # Barrel exports
│
├── types/                  # TypeScript type definitions
│   └── index.ts
│
├── styles/                 # Global styles
│   └── theme.ts
│
├── utils/                  # Utility functions
│   └── helpers.ts
│
├── assets/                 # Static assets (images, icons)
│   └── icons/
│
├── App.tsx                 # Main app component
└── main.tsx               # Entry point
```

## 🎯 Key Design Decisions

### Services Layer
Services are split by feature for better maintainability:
- **authService.ts**: Handles authentication, JWT token management
- **siteService.ts**: CRUD operations for ancient sites
- **visitService.ts**: User-specific visit tracking
- **chatService.ts**: Chat/AI functionality

All services import from a single `index.ts` for clean imports:
```typescript
import { login, getSites, markSiteAsVisited } from '../services';
```

### Components Organization
- **Feature folders** (Map, VisitedSites, ChatBot): Components specific to a feature
- **common/**: Shared/reusable components used across multiple pages
- Each folder has an `index.ts` for barrel exports

### Pages
Top-level route components that compose smaller components.

## 🚀 Development

```bash
npm install
npm start
```

## 🔑 Environment Variables
Backend API: `http://localhost:8080/api`
