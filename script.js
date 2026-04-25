(function() {
  // === Lightbox – prikaz slike preko cijelog ekrana (klik na sliku) ===
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

  // === Kompresija slike – smanjuje dimenzije i kvalitetu radi bržeg učitavanja ===
  function compressImage(imageSrc, callback) {
    // Preskoči SVG slike
    if (imageSrc.toLowerCase().includes('.svg') || imageSrc.startsWith('data:image/svg+xml')) {
      callback(imageSrc);
      return;
    }
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const width = Math.ceil(img.width * 0.4);  // 40% originalne širine
      const height = Math.ceil(img.height * 0.4); // 40% originalne visine
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const compressedSrc = canvas.toDataURL('image/jpeg', 0.4); // Kvaliteta 40%
        callback(compressedSrc);
      } catch(e) { callback(imageSrc); }
    };
    img.onerror = () => callback(imageSrc);
    img.src = imageSrc;
  }

  // === Obrada jedne slike: sprema original (za lightbox), prikazuje komprimiranu verziju ===
  function processImage(imgEl) {
    if (!imgEl || imgEl.dataset.processed === 'true') return;
    const orig = imgEl.src;
    if (!orig) return;
    imgEl.dataset.fullres = orig;
    compressImage(orig, (compressed) => {
      if (compressed !== orig) imgEl.src = compressed;
      imgEl.dataset.processed = 'true';
    });
  }

  // === Prikaz trajanja audio zapisa ===
  function displayAudioDuration() {
    document.querySelectorAll('audio').forEach(audio => {
      let durationSpan = audio.parentNode.querySelector('.audio-duration');
      if (!durationSpan) {
        durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.style.marginLeft = '0.75rem';
        durationSpan.style.fontSize = '0.75rem';
        durationSpan.style.color = 'var(--muted-foreground)';
        audio.parentNode.appendChild(durationSpan);
      }
      const setDuration = () => {
        const seconds = Math.round(audio.duration);
        if (!isNaN(seconds)) {
          durationSpan.textContent = `⏱️ ${seconds} sek`;
        } else {
          durationSpan.textContent = `⏱️ učitavanje...`;
        }
      };
      if (audio.readyState >= 1) {
        setDuration();
      } else {
        audio.addEventListener('loadedmetadata', setDuration);
      }
    });
  }

  // === Glavna funkcija – nakon učitavanja stranice ===
  document.addEventListener('DOMContentLoaded', () => {
    // Hero kartice
    document.querySelectorAll('.img-card img').forEach(img => {
      processImage(img);
      const card = img.closest('.img-card');
      if (card) {
        card.style.cursor = 'zoom-in';
        card.addEventListener('click', (e) => {
          e.preventDefault();
          openLightbox(img.dataset.fullres || img.src, img.alt);
        });
      }
    });

    // Profilne slike
    document.querySelectorAll('button[aria-label^="Povećaj"] img').forEach(img => {
      processImage(img);
      const btn = img.closest('button');
      if (btn) {
        btn.style.cursor = 'zoom-in';
        btn.addEventListener('click', () => openLightbox(img.dataset.fullres || img.src, img.alt));
      }
    });

    // Galerijske slike
    document.querySelectorAll('.gallery-btn img').forEach(img => {
      processImage(img);
      const btn = img.closest('.gallery-btn');
      if (btn) {
        btn.addEventListener('click', () => openLightbox(img.dataset.fullres || img.src, img.alt));
      }
    });

    // Hamburger meni
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true' ? false : true;
        hamburger.setAttribute('aria-expanded', expanded);
        navMenu.classList.toggle('open');
      });
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Audio trajanje
    displayAudioDuration();

    // Footer slika
    document.querySelectorAll('.footer-image img').forEach(img => {
      processImage(img);
    });
  });
})();
