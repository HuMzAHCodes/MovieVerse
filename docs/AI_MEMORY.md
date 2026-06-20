# 🧠 Netflix Clone — AI Memory

This document stores important engineering and design decisions, architectural compromises, and custom configurations to ensure consistency during development.

---

## ⚡ Key Engineering Decisions

### 1. DNS Server Override in `app.js`
* **Decision:** Explicitly configure Node.js to use Google DNS (`8.8.8.8`, `8.8.4.4`) and prioritize IPv4 resolutions.
* **Rationale:** Resolves network timeout or DNS lookup failures when trying to reach MongoDB Atlas or the TMDB API, commonly caused by local ISP DNS blocks or restrictions.
* **Code Implementation:**
  ```javascript
  const dns = require('dns');
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  ```

### 2. HTTP-Only Cookies for JWT Session Storage
* **Decision:** We do not use authorization headers (`Bearer <token>`) or localStorage for JWT authentication. Instead, the JWT is stored in an HTTP-Only, Secure (where possible) cookie.
* **Rationale:** Prevents Cross-Site Scripting (XSS) attacks from accessing session credentials. It also makes SSR with EJS simple because the browser automatically attaches the cookie to all page requests.

### 3. Server-Side Rendering (SSR) via EJS
* **Decision:** The application is built as a traditional multipage app (MPA) using EJS server templates instead of a client-side SPA (like React or Vue).
* **Rationale:** Fits the project roadmap parameters, simplifies routing, improves SEO easily, and avoids the complexity of building a separate SPA.

### 4. Zero Movie Data Duplication
* **Decision:** Our MongoDB database only stores user credentials and watchlist mappings (linking a `userId` to a list of TMDB movie IDs).
* **Rationale:** The TMDB API acts as our single source of truth for movie metadata. By fetching detail pages dynamically, we avoid the need to store, parse, or synchronize movie metadata in our own database.

### 5. Multi-Layer Logging (Morgan + Winston)
* **Decision:** Utilize Morgan for dev terminal HTTP request logging and Winston to write error and combined logs to persistent files (`logs/error.log`, `logs/combined.log`).
* **Rationale:** Keeps clean console outputs in production while keeping detailed logs for debugging runtime failures.
