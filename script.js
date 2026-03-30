const apiBaseURL = "https://anime.anibiplay.my.id/api";
const animeListContainer = document.getElementById('animeList');
const searchBar = document.getElementById('searchBar');
const sectionTitle = document.querySelector('h2');

// 1. FUNGSI UNTUK MENAMPILKAN KARTU ANIME (Re-usable)
function renderAnime(dataArray) {
    animeListContainer.innerHTML = ''; // Kosongkan container
    
    if (!dataArray || dataArray.length === 0) {
        animeListContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Tidak ada anime ditemukan.</p>`;
        return;
    }

    dataArray.forEach(anime => {
        const card = `
            <div class="anime-card" onclick="playAnime('${anime.id}')">
                <img src="${anime.image}" alt="${anime.title}" loading="lazy">
                <div class="anime-info">
                    <h3>${anime.title}</h3>
                    <span class="episode-tag">${anime.episode || 'Detail'}</span>
                </div>
            </div>
        `;
        animeListContainer.innerHTML += card;
    });
}

// 2. FUNGSI LOAD ANIME TERBARU (Home)
async function fetchRecentAnime() {
    sectionTitle.innerText = "Update Terbaru";
    animeListContainer.innerHTML = "<p>Memuat anime terbaru...</p>";
    
    try {
        const response = await fetch(`${apiBaseURL}/home`);
        const data = await response.json();
        // Asumsi struktur API: { recent: [...] }
        renderAnime(data.recent);
    } catch (error) {
        console.error("Error Home:", error);
        animeListContainer.innerHTML = "<p>Gagal memuat data. Periksa koneksi atau API.</p>";
    }
}

// 3. FUNGSI PENCARIAN
async function searchAnime(query) {
    sectionTitle.innerText = `Hasil Pencarian: ${query}`;
    animeListContainer.innerHTML = `<p>Mencari "${query}"...</p>`;

    try {
        const response = await fetch(`${apiBaseURL}/search?q=${query}`);
        const data = await response.json();
        // Asumsi struktur API search: { results: [...] }
        renderAnime(data.results);
    } catch (error) {
        console.error("Error Search:", error);
        animeListContainer.innerHTML = "<p>Terjadi kesalahan saat mencari.</p>";
    }
}

// 4. EVENT LISTENER UNTUK INPUT SEARCH (ENTER)
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchBar.value.trim();
        if (query.length > 0) {
            searchAnime(query);
        } else {
            fetchRecentAnime(); // Jika input kosong, balik ke home
        }
    }
});

// 5. EKSEKUSI PERTAMA KALI SAAT WEBSITE DIBUKA
document.addEventListener('DOMContentLoaded', () => {
    fetchRecentAnime();
});

// Fungsi Placeholder untuk Klik
function playAnime(id) {
    console.log("Membuka anime ID:", id);
    alert("Fitur nonton untuk ID " + id + " sedang dikembangkan!");
}
