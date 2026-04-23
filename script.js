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

  // Kompresija – srednje jaka (15% dimenzija, 20% kvalitete)
  function compressExtreme(imageSrc, callback) {
    if (imageSrc.toLowerCase().includes('.svg') || imageSrc.startsWith('data:image/svg+xml')) {
      callback(imageSrc);
      return;
    }

    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const width = Math.ceil(img.width * 0.15);
      const height = Math.ceil(img.height * 0.15);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const compressedSrc = canvas.toDataURL('image/jpeg', 0.2);
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
    // *** SLIKE ***
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

    // *** HAMBURGER MENI (dodano) ***
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true' ? false : true;
        hamburger.setAttribute('aria-expanded', expanded);
        navMenu.classList.toggle('open');
      });

      // Zatvori meni kada se klikne na link
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  });
})();
