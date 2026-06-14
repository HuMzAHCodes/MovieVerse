const axios  = require('axios');
const logger = require('./logger');

// =====================
// TMDB Configuration
// =====================
const TMDB_BASE_URL  = process.env.TMDB_BASE_URL;
const TMDB_API_KEY   = process.env.TMDB_API_KEY;
const TMDB_IMAGE_URL = process.env.TMDB_IMAGE_BASE_URL;

// =====================
// Axios TMDB Instance
// =====================
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params:  { api_key: TMDB_API_KEY },
  timeout: 10000, // 10 seconds
});

// =====================
// Get Full Image URL
// =====================
const getImageUrl = (imagePath, size = 'w500') => {
  if (!imagePath) return '/images/placeholder.jpg';
  return `https://image.tmdb.org/t/p/${size}${imagePath}`;
};

// =====================
// Get Trending Movies
// =====================
const getTrendingMovies = async () => {
  try {
    const response = await tmdbClient.get('/trending/movie/week');
    return response.data.results.map((movie) => ({
      ...movie,
      poster_path:   getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
    }));
  } catch (error) {
    logger.error(`TMDB getTrendingMovies error: ${error.message}`);
    return [];
  }
};

// =====================
// Get Popular Movies
// =====================
const getPopularMovies = async () => {
  try {
    const response = await tmdbClient.get('/movie/popular');
    return response.data.results.map((movie) => ({
      ...movie,
      poster_path:   getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
    }));
  } catch (error) {
    logger.error(`TMDB getPopularMovies error: ${error.message}`);
    return [];
  }
};

// =====================
// Get Top Rated Movies
// =====================
const getTopRatedMovies = async () => {
  try {
    const response = await tmdbClient.get('/movie/top_rated');
    return response.data.results.map((movie) => ({
      ...movie,
      poster_path:   getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
    }));
  } catch (error) {
    logger.error(`TMDB getTopRatedMovies error: ${error.message}`);
    return [];
  }
};

// =====================
// Get Movie Details
// =====================
const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbClient.get(`/movie/${movieId}`);
    const movie    = response.data;
    return {
      ...movie,
      poster_path:   getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
    };
  } catch (error) {
    logger.error(`TMDB getMovieDetails error: ${error.message}`);
    return null;
  }
};

// =====================
// Get Movie Trailer
// =====================
const getMovieTrailer = async (movieId) => {
  try {
    const response = await tmdbClient.get(`/movie/${movieId}/videos`);
    const videos   = response.data.results;

    // Find official YouTube trailer first
    const trailer = videos.find(
      (video) =>
        video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true
    );

    // Fallback to any YouTube trailer
    const fallbackTrailer = videos.find(
      (video) =>
        video.type === 'Trailer' &&
        video.site === 'YouTube'
    );

    return trailer || fallbackTrailer || null;
  } catch (error) {
    logger.error(`TMDB getMovieTrailer error: ${error.message}`);
    return null;
  }
};

// =====================
// Search Movies
// =====================
const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: { query, page },
    });

    return {
      results: response.data.results.map((movie) => ({
        ...movie,
        poster_path:   getImageUrl(movie.poster_path),
        backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      })),
      totalPages:   response.data.total_pages,
      totalResults: response.data.total_results,
      currentPage:  response.data.page,
    };
  } catch (error) {
    logger.error(`TMDB searchMovies error: ${error.message}`);
    return { results: [], totalPages: 0, totalResults: 0, currentPage: 1 };
  }
};

// =====================
// Get Movies By Genre
// =====================
const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await tmdbClient.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });

    return {
      results: response.data.results.map((movie) => ({
        ...movie,
        poster_path:   getImageUrl(movie.poster_path),
        backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      })),
      totalPages:  response.data.total_pages,
      currentPage: response.data.page,
    };
  } catch (error) {
    logger.error(`TMDB getMoviesByGenre error: ${error.message}`);
    return { results: [], totalPages: 0, currentPage: 1 };
  }
};

// =====================
// Get All Genres
// =====================
const getAllGenres = async () => {
  try {
    const response = await tmdbClient.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    logger.error(`TMDB getAllGenres error: ${error.message}`);
    return [];
  }
};

module.exports = {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMovieDetails,
  getMovieTrailer,
  searchMovies,
  getMoviesByGenre,
  getAllGenres,
  getImageUrl,
};