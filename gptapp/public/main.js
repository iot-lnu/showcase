// Initialize VideoJS player
const player = videojs('video-player');

// Function to load video into player
function loadVideo(video) {
    player.src({ type: 'video/mp4', src: video.src });
    player.play();
}

// Function to render playlist
function renderPlaylist(playlist) {
    const playlistElement = document.querySelector('.playlist');
    playlistElement.innerHTML = '';

    playlist.forEach((video, index) => {
        const item = document.createElement('li');
        item.classList.add('playlist-item');
        item.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div>
                <div><strong>${video.title}</strong></div>
                <span>${video.description}</span>
            </div>
        `;
        item.addEventListener('click', () => {
            document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            loadVideo(video);
        });
        playlistElement.appendChild(item);
    });
}

// Load first video and render playlist on page load
window.onload = () => {
    fetch('/api/playlist')
        .then(response => response.json())
        .then(playlist => {
            loadVideo(playlist[0]);
            renderPlaylist(playlist);
            document.querySelector('.playlist-item').classList.add('active');
        })
        .catch(error => console.error('Error fetching playlist:', error));
};
