# 🎬 Netflix Clone — Project Context

## 📌 Project Overview
This project is a full-featured, Netflix-inspired streaming platform built using **Node.js** and **Express.js** on the backend, **EJS** as the server-side templating engine, and **MongoDB Atlas** as the cloud database. Movie data, posters, and banners are fetched dynamically from the **TMDB API**, with trailers embedded via YouTube.

---

## 🛠️ Technology Stack
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Templating Engine:** EJS
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Authentication:** JWT (stored in HTTP-Only Cookies) + bcryptjs
* **External APIs:** TMDB API (Movie data & posters)
* **Logging:** Morgan (HTTP logging) + Winston (Application error & activity logging)
* **Email System:** Nodemailer (Gmail SMTP)
* **Validation:** Joi (Request payload validation)

---

## 🚀 Project Roadmap & Status

### Completed Phases
* **Phase 1: Project Setup & Express Server**
  * Express server structure established in [app.js](file:///D:/netflix-clone/app.js).
  * MongoDB Atlas connection configuration in [db.js](file:///D:/netflix-clone/config/db.js).
  * Logger setup in [logger.js](file:///D:/netflix-clone/utils/logger.js).
* **Phase 2: Authentication System**
  * EJS pages for Register, Login, Forgot Password, and Reset Password.
  * User model with password hashing and verification in [User.js](file:///D:/netflix-clone/models/User.js).
  * JWT Auth with cookies and route protection/restriction middleware.
  * Welcome and reset emails configured in [email.js](file:///D:/netflix-clone/utils/email.js).
* **Phase 3: TMDB Integration & Browse Page**
  * Custom API helpers in [tmdb.js](file:///D:/netflix-clone/utils/tmdb.js) fetching Trending, Popular, and Top Rated movies.
  * Home/Landing EJS page and main browse page showing Netflix-style movie categories.
  * Search routes with pagination support and filtering by Genre.

### Current Phase (In Progress)
* **Phase 4: Movie Detail Page & YouTube Trailer**
  * Details page rendering structure exists in [movie.ejs](file:///D:/netflix-clone/views/pages/movie.ejs) and [movieController.js](file:///D:/netflix-clone/controllers/movieController.js).
  * Client-side JavaScript file (`public/js/movie.js`) is missing and needs to be created to complete page interactions.

### Future Phases
* **Phase 5: User Features (Watchlist & Profile)**
  * Watchlist schema, add/delete controllers, profile page, and avatar upload to Cloudinary.
* **Phase 6: Admin Panel**
  * Admin dashboard and user management routes/views.
* **Phase 7: API Documentation (Swagger)**
  * Endpoint documentation at `/api-docs`.
* **Phase 8: Polish & Deployment**
  * Responsive dark CSS polishing and hosting setup.
