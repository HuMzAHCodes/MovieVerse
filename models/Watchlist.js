const mongoose = require('mongoose');

// =====================
// Watchlist Schema
// =====================
const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true, // A user has exactly one watchlist document
    },

    movies: [
      {
        tmdbId: {
          type:     Number,
          required: [true, 'TMDB movie ID is required'],
        },
        title: {
          type:     String,
          required: [true, 'Movie title is required'],
        },
        poster: {
          type:     String,
          required: [true, 'Movie poster path is required'],
        },
        addedAt: {
          type:    Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
