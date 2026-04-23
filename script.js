(function() {
  function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.innerHTML = `
      <button class="lb-close" aria-label="Zatvori">×</button>
      <img src="${src}" alt="${alt || ''}">
    `;
    const close = () => {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lb-close')) close();
    });
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);
  }

  function reduceImageResolution(imageSrc, callback, quality = 0.6) {
    if (imageSrc.toLowerCase().includes('.svg') || imageSrc.startsWith('data:image/svg+xml')) {
      callback(imageSrc);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      // Smanji na 20% originalnih dimenzija (bilo je 40%)
      const width = Math.ceil(img.width * 0.2);
      const height = Math.ceil(img.height * 0.2);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        // Kvaliteta smanjena na 0.3 (bilo 0.6)
        const compressedSrc = canvas.toDataURL('image/jpeg', 0.3);
        callback(compressedSrc);
      } catch (e) {
        callback(imageSrc);
      }
    };
    img.onerror = () => callback(imageSrc);
    img.src = imageSrc;
  }

  function compressAndStore(imgElement, quality = 0.6) {
    if (!imgElement || imgElement.dataset.processed === 'true') return;
    const originalSrc = imgElement.src;
    if (!originalSrc) return;
    imgElement.dataset.fullres = originalSrc;
    reduceImageResolution(originalSrc, (compressedSrc) => {
      if (compressedSrc !== originalSrc) {
        imgElement.src = compressedSrc;
      }
      imgElement.dataset.processed = 'true';
    }, quality);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Hero slike – kvaliteta 0.3 (već je smanjena unutar reduceImageResolution)
    document.querySelectorAll('.img-card img').forEach((img) => {
      compressAndStore(img, 0.3);
      const card = img.closest('.img-card');
      if (card) {
        card.style.cursor = 'zoom-in';
        card.addEventListener('click', (e) => {
          e.preventDefault();
          const fullSrc = img.dataset.fullres || img.src;
          openLightbox(fullSrc, img.alt);
        });
      }
    });

    // Profilne slike – dodatno lošija kvaliteta (0.25)
    document.querySelectorAll('button[aria-label^="Povećaj"]').forEach((btn) => {
      const img = btn.querySelector('img');
      if (!img) return;
      compressAndStore(img, 0.25);
      btn.style.cursor = 'zoom-in';
      btn.addEventListener('click', () => {
        const fullSrc = img.dataset.fullres || img.src;
        openLightbox(fullSrc, img.alt);
      });
    });

    // Galerijske slike – kvaliteta 0.3
    document.querySelectorAll('.gallery-btn').forEach((btn) => {
      const img = btn.querySelector('img');
      if (!img) return;
      compressAndStore(img, 0.3);
      btn.addEventListener('click', () => {
        const fullSrc = img.dataset.fullres || img.src;
        openLightbox(fullSrc, img.alt);
      });
    });
  });
})();
