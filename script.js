// script.js
// Funkcija za otvaranje slike u većoj rezoluciji (novi prozor)
function openBigImage(imageUrl, title = 'Povećana slika') {
    if (!imageUrl) return;
    const newWindow = window.open();
    newWindow.document.write(`
        <html>
        <head><title>${title}</title>
        <style>body{margin:0;display:flex;justify-content:center;align-items:center;background:#1e2a3a;} img{max-width:90vw;max-height:90vh;box-shadow:0 0 30px black;border-radius:12px;}</style>
        </head>
        <body><img src="${imageUrl}" alt="Povećana slika"></body>
        </html>
    `);
    newWindow.document.close();
}

// Audio predstavljanje (govorna sinteza)
function speakText(person) {
    window.speechSynthesis.cancel();
    let text = '';
    if (person === 'ana') {
        text = "Poštovani poslodavče, ja sam Ana Horvat, studentica treće godine Multimedijske tehnike na FERIT-u u Osijeku. Rođena sam u Osijeku, volim fotografiju i rad u timu. Aktivno se bavim frontend razvojem i dizajnom. Veselim se prilici za suradnju! Hvala.";
    } else if (person === 'marko') {
        text = "Poštovani, moje ime je Marko Kovač. Dolazim iz Vukovara, studiram računarstvo na FERIT-u. Iskusan sam u razvoju web aplikacija, posebno React i Node. Osim toga, volim šah i košarku. Radujem se mogućnosti da vam se pridružim. Hvala vam.";
    }
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hr-HR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

// Inicijalizacija nakon učitavanja DOM-a
document.addEventListener('DOMContentLoaded', () => {
    // 1. Audio gumbi
    const audioBtns = document.querySelectorAll('.audio-btn');
    audioBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const person = btn.getAttribute('data-person');
            if (person) speakText(person);
        });
    });

    // 2. Klik na profilne slike studenata -> otvaranje veće verzije
    const studentWrappers = document.querySelectorAll('.student-img-wrapper');
    studentWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            const img = wrapper.querySelector('img');
            if (img && img.src) {
                // Koristi istu sliku kao "veću" (randomuser nema veću rezoluciju, ali otvorit ćemo istu)
                openBigImage(img.src, 'Studentska fotografija - veća rezolucija');
            }
        });
    });

    // 3. Galerija: klik na .gallery-item otvara data-large URL
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const largeUrl = item.getAttribute('data-large');
            if (largeUrl) openBigImage(largeUrl, 'Multimedijska slika - veća rezolucija');
        });
    });

    // 4. Dodatni linkovi za kolege (fake-linkovi – otvaraju se u novom prozoru)
    const fakeLinks = document.querySelectorAll('.fake-link');
    fakeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('data-url');
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
    });

    // 5. Osiguraj da svi vanjski linkovi (škole, rođenja, hobi) imaju target="_blank" (već imaju, ali dodatno)
    // Nema potrebe – već je u HTML-u postavljeno.
});