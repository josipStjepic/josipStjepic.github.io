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

  // EKSTREMNA kompresija: 10% dimenzija, 10% kvalitete
  function compressExtreme(imageSrc, callback) {
    if (imageSrc.toLowerCase().includes('.svg') || imageSrc.startsWith('data:image/svg+xml')) {
      callback(imageSrc);
      return;
    }

    const img = new Image();
    // OVDJE IZBRISAN crossOrigin kako bi radilo za lokalne datoteke
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const width = Math.ceil(img.width * 0.1);  // 10% originalne širine
      const height = Math.ceil(img.height * 0.1); // 10% originalne visine
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const compressedSrc = canvas.toDataURL('image/jpeg', 0.1); // 10% kvalitete
        console.log(`Komprimirana slika: ${imageSrc.substring(0, 50)} -> ${width}x${height}`);
        callback(compressedSrc);
      } catch (e) {
        console.warn('Greška pri kompresiji', e);
        callback(imageSrc);
      }
    };
    img.onerror = (e) => {
      console.error('Ne mogu učitati sliku:', imageSrc, e);
      callback(imageSrc);
    };
    img.src = imageSrc;
  }

  function compressAndStore(imgElement) {
    if (!imgElement || imgElement.dataset.processed === 'true') return;
    const originalSrc = imgElement.src;
    if (!originalSrc) return;
    imgElement.dataset.fullres = originalSrc;
    compressExtreme(originalSrc, (compressedSrc) => {
      if (compressedSrc !== originalSrc) {
        imgElement.src = compressedSrc;
        console.log('Postavljena komprimirana verzija za', originalSrc);
      }
      imgElement.dataset.processed = 'true';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Hero slike (studenti)
    const heroImages = document.querySelectorAll('.img-card img');
    console.log('Pronađeno hero slika:', heroImages.length);
    heroImages.forEach((img) => {
      compressAndStore(img);
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

    // 2. Profilne slike (pored audio)
    const profileImages = document.querySelectorAll('button[aria-label^="Povećaj"] img');
    console.log('Pronađeno profilnih slika:', profileImages.length);
    profileImages.forEach((img) => {
      compressAndStore(img);
      const btn = img.closest('button');
      if (btn) {
        btn.style.cursor = 'zoom-in';
        btn.addEventListener('click', () => {
          const fullSrc = img.dataset.fullres || img.src;
          openLightbox(fullSrc, img.alt);
        });
      }
    });

    // 3. Galerijske slike
    const galleryImages = document.querySelectorAll('.gallery-btn img');
    console.log('Pronađeno galerijskih slika:', galleryImages.length);
    galleryImages.forEach((img) => {
      compressAndStore(img);
      const btn = img.closest('.gallery-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const fullSrc = img.dataset.fullres || img.src;
          openLightbox(fullSrc, img.alt);
        });
      }
    });
  });
})();
