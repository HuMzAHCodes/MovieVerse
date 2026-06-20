# 🗄️ Netflix Clone — Database Schema

We use **MongoDB Atlas** as our cloud database, managed via **Mongoose ODM**. Below is the detailed schema specification for both current and planned models.

---

## 👤 User Model
* **Collection:** `users`
* **File:** [User.js](file:///D:/netflix-clone/models/User.js)
* Represents registered users on the platform.

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated | Unique identifier for each user |
| `name` | `String` | Required, trimmed, min length 2, max length 50 | Display name of the user |
| `email` | `String` | Required, unique, lowercase, regex-validated email | Email address used for login and notifications |
| `password` | `String` | Required, min length 6, excluded from default queries | bcrypt hashed password |
| `role` | `String` | Enum: `['user', 'admin']`, default: `'user'` | Determines dashboard access permissions |
| `avatar` | `String` | Default: `/images/default-avatar.png` | Path/URL to the user's profile image |
| `isVerified` | `Boolean` | Default: `false` | Indicates if the user verified their email address |
| `resetPasswordToken` | `String` | Optional | Hashed password reset token |
| `resetPasswordExpire`| `Date` | Optional | Expiry timestamp for the reset token |
| `createdAt` | `Date` | Auto-generated (`timestamps: true`) | User registration timestamp |
| `updatedAt` | `Date` | Auto-generated (`timestamps: true`) | User details update timestamp |

---

## 📋 Watchlist Model (Planned - Phase 5)
* **Collection:** `watchlists`
* **File:** `models/Watchlist.js`
* Represents a user's curated "My List" collection.

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated | Unique identifier for the watchlist entry |
| `user` | `ObjectId` | Required, reference to `User` | The owner of the watchlist |
| `movies` | `Array` | List of movie sub-documents | Collection of saved movies |

### Movies Array Sub-document Schema
* We do not duplicate entire movie details in our database; we fetch live movie details from TMDB. Only metadata and references are stored:

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `tmdbId` | `Number` | Required | Movie ID from TMDB API |
| `title` | `String` | Required | Title of the movie (for quick rendering) |
| `poster` | `String` | Required | Poster image path/URL from TMDB CDN |
| `addedAt` | `Date` | Default: `Date.now` | When the movie was saved |
