// Data for the playlist
const playlist = [
    {
        title: "Video 1",
        src: "dji_fly_20240702_145850_99_1719926651729_video~3.mp4",
        thumbnail: "dji_fly_20240702_145256_94_1719924967222_photo_optimized.jpg",
        description: "This is the description for Video 1."
    },
    {
        title: "Video 1",
        src: "dji_fly_20240702_145850_99_1719926651729_video~3.mp4",
        thumbnail: "dji_fly_20240702_145256_94_1719924967222_photo_optimized.jpg",
        description: "This is the description for Video 1."
    },
    // {
    //     title: "Video 2",
    //     src: "video2.mp4",
    //     thumbnail: "thumb2.jpg",
    //     description: "This is the description for Video 2."
    // },
    // {
    //     title: "Video 3",
    //     src: "video3.mp4",
    //     thumbnail: "thumb3.jpg",
    //     description: "This is the description for Video 3."
    // }
];

// Initialize VideoJS player
const player = videojs('video-player');

// Function to load video into player
function loadVideo(video) {
    player.src({ type: 'video/mp4', src: video.src });
    player.play();
}

// Function to render playlist
function renderPlaylist() {
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
    loadVideo(playlist[0]);
    renderPlaylist();
    document.querySelector('.playlist-item').classList.add('active');
};
