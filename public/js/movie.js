document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Smooth Scroll to Trailer Section
  // ==========================================
  const watchTrailerBtn = document.getElementById('watchTrailerBtn');
  if (watchTrailerBtn) {
    watchTrailerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const trailerSection = document.getElementById('trailer');
      if (trailerSection) {
        trailerSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // "+ My List" (Watchlist) Toggle Interaction
  // ==========================================
  const addToListBtn = document.getElementById('addToListBtn');
  if (addToListBtn) {
    addToListBtn.addEventListener('click', async () => {
      const tmdbId = addToListBtn.dataset.movieId;
      const title  = addToListBtn.dataset.movieTitle;
      const poster = addToListBtn.dataset.moviePoster;

      const isAdded = addToListBtn.classList.contains('btn--added');

      try {
        if (isAdded) {
          // Send DELETE request to remove from watchlist
          const response = await fetch(`/api/users/watchlist/${tmdbId}`, {
            method: 'DELETE',
          });
          const data = await response.json();

          if (data.success) {
            addToListBtn.classList.remove('btn--added');
            addToListBtn.textContent = '+ My List';
            addToListBtn.style.color = '';
          }
        } else {
          // Send POST request to add to watchlist
          const response = await fetch('/api/users/watchlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tmdbId, title, poster }),
          });
          const data = await response.json();

          if (data.success) {
            addToListBtn.classList.add('btn--added');
            addToListBtn.textContent = '✓ In My List';
            addToListBtn.style.color = '#2ecc71';
          }
        }
      } catch (error) {
        console.error('Watchlist toggle error:', error);
      }
    });
  }
});
