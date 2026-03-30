const BASE_URL = 'https://anime.anibiplay.my.id/api';

// 1. Ambil 'endpoint' dari URL browser
const urlParams = new URLSearchParams(window.location.search);
const episodeEndpoint = urlParams.get('id');

async function loadVideo() {
    if (!episodeEndpoint) {
        document.getElementById('video-title').innerText = "Episode tidak ditemukan!";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/episode/${episodeEndpoint}`);
        const result = await response.json();
        const data = result.data || result;

        // Update Judul
        document.getElementById('video-title').innerText = data.title || "Watching Anime";

        // 2. Setup ArtPlayer
        // Kita ambil link video pertama dari array stream_list (biasanya resolusi tertinggi/360p)
        const videoUrl = data.stream_list[0].url;

        const art = new ArtPlayer({
            container: '#player',
            url: videoUrl,
            title: data.title,
            volume: 0.5,
            isLive: false,
            muted: false,
            autoplay: false,
            pip: true,
            autoSize: true,
            fullscreen: true,
            playbackRate: true,
            aspectRatio: true,
            setting: true,
            // Fitur ganti resolusi (jika ada lebih dari 1 link)
            quality: data.stream_list.map(item => ({
                default: item === data.stream_list[0],
                html: item.quality,
                url: item.url,
            })),
        });

    } catch (error) {
        console.error("Gagal memuat video:", error);
        document.getElementById('video-title').innerText = "Gagal memuat stream video.";
    }
}

// Jalankan saat halaman dibuka
loadVideo();
