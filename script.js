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
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const width = Math.ceil(img.width * 0.4);
      const height = Math.ceil(img.height * 0.4);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const compressedSrc = canvas.toDataURL('image/jpeg', quality);
      callback(compressedSrc);
    };
    img.onerror = () => callback(imageSrc);
    img.src = imageSrc;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // YouTube error handling
    const youtubeVideo = document.getElementById('youtube-video');
    if (youtubeVideo) {
      youtubeVideo.addEventListener('load', () => {
        youtubeVideo.style.opacity = '1';
      });
      
      setTimeout(() => {
        if (youtubeVideo.style.opacity !== '1') {
          youtubeVideo.style.opacity = '1';
          youtubeVideo.style.filter = 'brightness(0.95)';
        }
      }, 3000);
    }

    document.querySelectorAll('.img-card').forEach((card) => {
      const img = card.querySelector('img');
      if (!img) return;
      
      const originalSrc = img.src;
      img.dataset.fullres = originalSrc;
      
      reduceImageResolution(originalSrc, (compressedSrc) => {
        img.src = compressedSrc;
      });
      
      card.style.cursor = 'zoom-in';
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(originalSrc, img.alt);
      });
    });

    document.querySelectorAll('button[aria-label^="Povećaj"]').forEach((btn) => {
      const img = btn.querySelector('img');
      if (!img) return;
      
      const originalSrc = img.src;
      btn.dataset.fullres = originalSrc;
      
      reduceImageResolution(originalSrc, (compressedSrc) => {
        img.src = compressedSrc;
      }, 0.45);
      
      btn.style.cursor = 'zoom-in';
      btn.addEventListener('click', () => openLightbox(originalSrc, img.alt));
    });
    
    document.querySelectorAll('.gallery-btn').forEach((btn) => {
      const img = btn.querySelector('img');
      if (img) btn.addEventListener('click', () => openLightbox(img.src, img.alt));
    });
  });
})();
