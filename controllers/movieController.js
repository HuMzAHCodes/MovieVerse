const {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMovieDetails,
  getMovieTrailer,
  searchMovies,
  getMoviesByGenre,
  getAllGenres,
}                  = require('../utils/tmdb');
const { AppError } = require('../middleware/errorMiddleware');
const logger       = require('../utils/logger');

// =====================
// @route   GET /browse
// @desc    Main browse page
// @access  Private
// =====================
const browsePage = async (req, res, next) => {
  try {
    // Fetch all movie categories in parallel
    const [
      trendingMovies,
      popularMovies,
      topRatedMovies,
      allGenres,
    ] = await Promise.all([
      getTrendingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
      getAllGenres(),
    ]);

    // Use first trending movie as hero banner
    const heroMovie = trendingMovies[0] || null;

    res.render('pages/browse', {
      title:          'Browse — Netflix Clone',
      user:           req.user,
      heroMovie,
      trendingMovies: trendingMovies.slice(1), // Skip hero movie
      popularMovies,
      topRatedMovies,
      allGenres,
    });
  } catch (error) {
    logger.error(`Browse page error: ${error.message}`);
    next(error);
  }
};

// =====================
// @route   GET /movie/:tmdbId
// @desc    Movie detail page
// @access  Private
// =====================
const movieDetailPage = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    // Validate tmdbId is a number
    if (isNaN(tmdbId)) {
      return next(new AppError('Invalid movie ID', 400));
    }

    // Fetch movie details and trailer in parallel
    const [movieDetails, movieTrailer] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieTrailer(tmdbId),
    ]);

    // Movie not found
    if (!movieDetails) {
      return next(new AppError('Movie not found', 404));
    }

    res.render('pages/movie', {
      title:        `${movieDetails.title} — Netflix Clone`,
      user:         req.user,
      movie:        movieDetails,
      trailer:      movieTrailer,
    });
  } catch (error) {
    logger.error(`Movie detail page error: ${error.message}`);
    next(error);
  }
};

// =====================
// @route   GET /search
// @desc    Search movies
// @access  Private
// =====================
const searchPage = async (req, res, next) => {
  try {
    const query       = req.query.q    || '';
    const currentPage = parseInt(req.query.page) || 1;

    // Don't search if query is empty
    if (!query.trim()) {
      return res.render('pages/search', {
        title:        'Search — Netflix Clone',
        user:         req.user,
        query:        '',
        results:      [],
        totalPages:   0,
        totalResults: 0,
        currentPage:  1,
      });
    }

    // Search TMDB
    const searchResults = await searchMovies(query, currentPage);

    res.render('pages/search', {
      title:        `Search: ${query} — Netflix Clone`,
      user:         req.user,
      query,
      results:      searchResults.results,
      totalPages:   searchResults.totalPages,
      totalResults: searchResults.totalResults,
      currentPage:  searchResults.currentPage,
    });
  } catch (error) {
    logger.error(`Search page error: ${error.message}`);
    next(error);
  }
};

// =====================
// @route   GET /genre/:genreId
// @desc    Movies by genre
// @access  Private
// =====================
const genrePage = async (req, res, next) => {
  try {
    const { genreId }  = req.params;
    const currentPage  = parseInt(req.query.page) || 1;

    // Validate genreId
    if (isNaN(genreId)) {
      return next(new AppError('Invalid genre ID', 400));
    }

    // Fetch genres and movies in parallel
    const [genreMovies, allGenres] = await Promise.all([
      getMoviesByGenre(genreId, currentPage),
      getAllGenres(),
    ]);

    // Find current genre name
    const currentGenre = allGenres.find(
      (genre) => genre.id === parseInt(genreId)
    );

    res.render('pages/genre', {
      title:       `${currentGenre?.name || 'Genre'} — Netflix Clone`,
      user:        req.user,
      movies:      genreMovies.results,
      totalPages:  genreMovies.totalPages,
      currentPage: genreMovies.currentPage,
      currentGenre,
      allGenres,
    });
  } catch (error) {
    logger.error(`Genre page error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  browsePage,
  movieDetailPage,
  searchPage,
  genrePage,
};