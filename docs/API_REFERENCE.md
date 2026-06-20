# 📄 Netflix Clone — API Reference

Below is the API reference documentation listing all user-facing EJS page routes and JSON API endpoints.

---

## 🔐 Authentication & Session Routes

### Page Routes
All Page Routes render HTML EJS templates.

* **`GET /`** (Public)
  * **Description:** Landing / Hero home page.
  * **View:** [home.ejs](file:///D:/netflix-clone/views/pages/home.ejs)
* **`GET /register`** (Public - Guest only)
  * **Description:** User registration form.
  * **View:** [register.ejs](file:///D:/netflix-clone/views/pages/register.ejs)
* **`GET /login`** (Public - Guest only)
  * **Description:** User login form.
  * **View:** [login.ejs](file:///D:/netflix-clone/views/pages/login.ejs)
* **`GET /forgot-password`** (Public)
  * **Description:** Forgot password email request form.
  * **View:** [forgot-password.ejs](file:///D:/netflix-clone/views/pages/forgot-password.ejs)
* **`GET /reset-password/:token`** (Public)
  * **Description:** Password reset form using verification token.
  * **View:** [reset-password.ejs](file:///D:/netflix-clone/views/pages/reset-password.ejs)

### API Endpoints
* **`POST /api/auth/register`** (Public)
  * **Description:** Creates a new user account, logs them in automatically (stores JWT in cookie), and sends a welcome email.
  * **Request Body:**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "securepassword123",
      "confirmPassword": "securepassword123"
    }
    ```
  * **Response:** Redirects to `/browse` (302) or returns 400 validation error.
* **`POST /api/auth/login`** (Public)
  * **Description:** Authenticates user credentials and sends JWT cookie.
  * **Request Body:**
    ```json
    {
      "email": "jane@example.com",
      "password": "securepassword123"
    }
    ```
  * **Response:** Redirects to `/admin` for admins or `/browse` for regular users (302).
* **`GET /logout`** (Private - Requires authentication)
  * **Description:** Clears the HTTP-only JWT authentication cookie.
  * **Response:** Redirects to `/login` (302).
* **`POST /api/auth/forgot-password`** (Public)
  * **Description:** Validates user email, generates a unique reset token, hashes it, saves it to database, and emails a reset link.
  * **Request Body:**
    ```json
    {
      "email": "jane@example.com"
    }
    ```
  * **Response:** 200 JSON success status message.
* **`POST /api/auth/reset-password/:token`** (Public)
  * **Description:** Verifies valid reset token, hashes the new password, clears the token, generates a new session JWT, and logs the user in.
  * **Request Body:**
    ```json
    {
      "password": "newsecurepassword123",
      "confirmPassword": "newsecurepassword123"
    }
    ```
  * **Response:** Redirects to `/browse` (302).

---

## 🎬 Movie Discovery Routes
All routes below require authentication (`protectRoute` middleware).

* **`GET /browse`**
  * **Description:** Main browse page showing Trending, Popular, and Top Rated movies.
  * **View:** [browse.ejs](file:///D:/netflix-clone/views/pages/browse.ejs)
* **`GET /movie/:tmdbId`**
  * **Description:** Movie details page with official YouTube trailer embed, cast info, and production details.
  * **View:** [movie.ejs](file:///D:/netflix-clone/views/pages/movie.ejs)
* **`GET /search`**
  * **Description:** Search movies by query term with pagination support.
  * **Query Params:** `?q=batman&page=2`
  * **View:** [search.ejs](file:///D:/netflix-clone/views/pages/search.ejs)
* **`GET /genre/:genreId`**
  * **Description:** Browse movies filtered by TMDB genre.
  * **Query Params:** `?page=1`
  * **View:** [genre.ejs](file:///D:/netflix-clone/views/pages/genre.ejs)

---

## 👤 User Profile & Watchlist Routes (Planned - Phase 5)
Require authentication (`protectRoute` middleware).

* **`GET /profile`**
  * **Description:** Renders profile management page.
* **`PUT /api/users/profile`**
  * **Description:** Update profile name and avatar image (Cloudinary upload via Multer).
* **`GET /watchlist`**
  * **Description:** Renders saved watchlist.
* **`POST /api/users/watchlist`**
  * **Description:** Adds a movie item to watchlist database model.
* **`DELETE /api/users/watchlist/:tmdbId`**
  * **Description:** Removes a movie item from watchlist.

---

## 🛡️ Admin Management Routes (Planned - Phase 6)
Require admin authentication (`protectRoute` + restrict to `admin` role).

* **`GET /admin`**
  * **Description:** Renders admin stats dashboard.
* **`GET /admin/users`**
  * **Description:** Renders list of registered users.
* **`DELETE /api/admin/users/:id`**
  * **Description:** Deletes a user account.
