const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const {
  getMovieDetails,
  getMovieTrailer,
  getImageUrl,
} = require('../utils/tmdb');

describe('TMDB Utility Helper Tests', () => {

  // ==========================================
  // getImageUrl Tests
  // ==========================================
  describe('getImageUrl', () => {
    test('should return placeholder image if no path is provided', () => {
      const result = getImageUrl(null);
      expect(result).toBe('/images/placeholder.jpg');
    });

    test('should prefix image path with base URL and default size', () => {
      const path = '/someimage.jpg';
      const result = getImageUrl(path);
      expect(result).toBe('https://image.tmdb.org/t/p/w500/someimage.jpg');
    });

    test('should support custom sizes', () => {
      const path = '/someimage.jpg';
      const result = getImageUrl(path, 'w1280');
      expect(result).toBe('https://image.tmdb.org/t/p/w1280/someimage.jpg');
    });
  });

  // ==========================================
  // getMovieDetails Tests
  // ==========================================
  describe('getMovieDetails', () => {
    test('should fetch valid movie details and format paths', async () => {
      const movieId = 550; // Fight Club
      const movie = await getMovieDetails(movieId);

      expect(movie).toBeDefined();
      expect(movie).not.toBeNull();
      expect(movie.title).toBe('Fight Club');
      expect(movie.poster_path).toContain('https://image.tmdb.org/t/p/');
      expect(movie.backdrop_path).toContain('https://image.tmdb.org/t/p/');
    }, 10000);

    test('should return null for non-existent movie ID', async () => {
      const movie = await getMovieDetails(999999999);
      expect(movie).toBeNull();
    }, 10000);
  });

  // ==========================================
  // getMovieTrailer Tests
  // ==========================================
  describe('getMovieTrailer', () => {
    test('should fetch movie trailer details', async () => {
      const movieId = 550; // Fight Club
      const trailer = await getMovieTrailer(movieId);

      expect(trailer).toBeDefined();
      expect(trailer).not.toBeNull();
      expect(trailer.site).toBe('YouTube');
      expect(trailer.type).toBe('Trailer');
      expect(trailer.key).toBeDefined();
    }, 10000);

    test('should return null for invalid or non-existent movie ID', async () => {
      const trailer = await getMovieTrailer(999999999);
      expect(trailer).toBeNull();
    }, 10000);
  });

});
