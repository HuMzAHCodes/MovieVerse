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
    addToListBtn.addEventListener('click', () => {
      const isAdded = addToListBtn.classList.contains('btn--added');
      if (isAdded) {
        addToListBtn.classList.remove('btn--added');
        addToListBtn.textContent = '+ My List';
        addToListBtn.style.color = '';
        addToListBtn.style.borderColor = '';
      } else {
        addToListBtn.classList.add('btn--added');
        addToListBtn.textContent = '✓ In My List';
        // Green feedback color when added
        addToListBtn.style.color = '#2ecc71';
      }
    });
  }
});
