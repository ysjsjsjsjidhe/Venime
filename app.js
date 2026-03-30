/**
 * Konfigurasi API
 * Jika menggunakan local development, pastikan fitur CORS diizinkan di browser.
 */
const BASE_URL = 'https://anime.anibiplay.my.id/api';

/**
 * 1. Fungsi Fetch Universal
 * Menangani request ke API dengan proteksi error.
 */
async function callApi(path) {
    try {
        const response = await fetch(`${BASE_URL}${path}`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Deteksi Otomatis: API sering membungkus data di dalam properti 'data' atau 'result'
        if (result.data) return result.data;
        if (result.result) return result.result;
        if (Array.isArray(result)) return result;
        
        return [];
    } catch (error) {
        console.error("API Fetch Error:", error);
        return null;
    }
}

/**
 * 2. Fungsi Render Kartu ke HTML
 * Mengubah data JSON menjadi elemen visual.
 */
function renderAnimeList(data) {
    const container = document.getElementById('anime-list');
    container.innerHTML = ''; // Hapus loader

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-slate-500 text-lg">Tidak ada anime yang ditemukan.</p>
                <button onclick="init()" class="text-blue-500 underline mt-2">Kembali ke Beranda</button>
            </div>
        `;
        return;
    }

    data.forEach(anime => {
        // Buat elemen card
        const card = document.createElement('div');
        card.className = "anime-card bg-slate-800 rounded-xl overflow-hidden shadow-lg cursor-pointer group";
        
        // Gunakan placeholder jika gambar thumb kosong
        const imageSrc = anime.thumb || 'https://via.placeholder.com/300x450?text=No+Image';

        card.innerHTML = `
            <div class="relative overflow-hidden aspect-[3/4]">
                <img src="${imageSrc}" alt="${anime.title}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                     loading="lazy">
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/60 to-transparent">
                    <span class="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                        ${anime.episode || 'Update'}
                    </span>
                </div>
            </div>
            <div class="p-3">
                <h3 class="text-sm font-semibold line-clamp-2 group-hover:text-blue-400" title="${anime.title}">
                    ${anime.title}
                </h3>
                <p class="text-[10px] text-slate-500 mt-1 italic">${anime.uploaded_on || ''}</p>
            </div>
        `;

        // Event klik untuk pindah ke halaman nonton
        card.onclick = () => {
            if (anime.endpoint) {
                window.location.href = `watch.html?id=${anime.endpoint}`;
            } else {
                alert("Maaf, link streaming tidak tersedia untuk judul ini.");
            }
        };

        container.appendChild(card);
    });
}

/**
 * 3. Fungsi Pencarian (Search)
 */
async function handleSearch() {
    const query = document.getElementById('search-input').value.trim();
    
    // Jangan kirim jika input kosong
    if (!query) {
        alert("Masukkan judul anime yang ingin dicari!");
        return;
    }

    const container = document.getElementById('anime-list');
    const titleHeader = document.getElementById('section-title');
    
    container.innerHTML = '<div class="col-span-full text-center">Mencari "' + query + '"...</div>';
    titleHeader.innerText = `Hasil Pencarian: ${query}`;

    try {
        // Gunakan encodeURIComponent agar spasi/karakter unik tidak error di URL
        const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`);
        
        if (!response.ok) throw new Error('Server API bermasalah');
        
        const result = await response.json();
        
        // Cek apakah data ada di result.data atau langsung di result
        const finalData = result.data || result;
        
        renderCards(finalData);
        
    } catch (err) {
        console.error("Detail Error:", err);
        container.innerHTML = `<p class="col-span-full text-center text-red-500">Gagal mencari: ${err.message}</p>`;
    }
}


/**
 * 4. Inisialisasi Halaman Utama
 */
async function init() {
    const titleHeader = document.getElementById('section-title');
    if(titleHeader) titleHeader.innerText = "Ongoing Anime";

    const data = await callApi('/ongoing');
    renderAnimeList(data);
}

/**
 * 5. Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Trigger pencarian saat tombol Enter ditekan
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});
/**
 * 6. Fungsi Filter Berdasarkan Genre
 */
async function filterGenre(genreName) {
    const container = document.getElementById('anime-list');
    const titleHeader = document.getElementById('section-title');

    // Tampilan Loading
    titleHeader.innerText = `Genre: ${genreName.toUpperCase()}`;
    container.innerHTML = '<div class="col-span-full text-center py-20 animate-pulse">Menyaring anime...</div>';

    /**
     * Endpoint API biasanya menggunakan format /api/genres/{nama-genre}
     * Kita asumsikan endpoint-nya adalah /genres/
     */
    const results = await callApi(`/genres/${genreName}`);
    
    // Jika API mengembalikan data, tampilkan. 
    // Jika tidak (karena genre tertentu kosong), tampilkan pesan.
    if (results && results.length > 0) {
        renderAnimeList(results);
    } else {
        container.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-slate-500">Belum ada anime di genre ${genreName} untuk saat ini.</p>
                <button onclick="init()" class="text-blue-500 underline mt-2">Lihat Ongoing</button>
            </div>
        `;
    }
}

