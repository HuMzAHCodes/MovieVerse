# 🏗️ Netflix Clone — Architecture

This document describes the high-level architecture and system interactions of the Netflix Clone platform.

---

## 🗺️ System Interaction Diagram

The system operates as a classic Multi-Page Application (MPA) with server-side rendering, interacting with several external APIs and a cloud database:

```mermaid
graph TD
    Client[Browser Client]
    Express[Express.js App Server]
    Mongo[MongoDB Atlas Database]
    TMDB[TMDB Movie API]
    Cloudinary[Cloudinary CDN]
    Gmail[Gmail SMTP Email Server]

    Client -- HTTP Requests / Cookie --&gt; Express
    Express -- Rendered HTML / CSS / JS --&gt; Client
    
    Express -- Read / Write Auth & Watchlists --&gt; Mongo
    Express -- Live Movie Details / Search --&gt; TMDB
    Express -- Upload Profile Images --&gt; Cloudinary
    Express -- Send Welcome / Reset Emails --&gt; Gmail
    
    Client -- Stream Banners & Posters --&gt; TMDB
    Client -- Stream User Avatars --&gt; Cloudinary
```

---

## ⚙️ Core Architecture Layers

### 1. Presentation Layer (Views - EJS)
* Located in `views/`
* Renders EJS pages server-side and serves them to the client.
* Shared UI components (like header, navigation, footer, movie-cards) are split into `views/partials/` for reusability.

### 2. Routing & Controller Layer
* Routes are split by concern:
  * `routes/authRoutes.js` - Sign up, login, password resets, and session pages.
  * `routes/movieRoutes.js` - Browse, search, filter, and detail pages.
* Controllers manage business logic:
  * `controllers/authController.js` - Handles password hashing, cookie signing, email triggers.
  * `controllers/movieController.js` - Integrates TMDB API responses and feeds data to EJS renderers.

### 3. Middleware Layer
* Intercepts incoming requests to manage cross-cutting concerns:
  * `authMiddleware.js` - Validates the incoming JWT cookie and populates `req.user`.
  * `roleMiddleware.js` - Restricts routes based on user role (`admin` or `user`).
  * `errorMiddleware.js` - Centralizes 404 routes and catches standard runtime errors.

### 4. Integration Layer (External APIs)
* **TMDB API Integration:** Handled via helper functions in `utils/tmdb.js`. Performs HTTP requests to TMDB to search and fetch movie data, genre lists, and trailers.
* **Email System:** Handled via `utils/email.js`. Integrates Gmail SMTP with Nodemailer to email users for registration welcomes or password resets.
* **Image CDN:** (Planned - Phase 5) Integrates Cloudinary with Multer to stream profile images directly to the cloud and save their URLs in MongoDB.
