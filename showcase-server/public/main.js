// Initialize VideoJS player
const player = videojs('video-player');

let currentVideoIndex = 0;
let playlist = [];

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
        if (index === currentVideoIndex) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div>
                <div><strong>${video.title}</strong></div>
                <span>${video.description}</span>
            </div>
        `;
        item.addEventListener('click', () => {
            changeVideo(index);
        });
        playlistElement.appendChild(item);
    });
}

// Function to change the current video
function changeVideo(index) {
    if (index >= 0 && index < playlist.length) {
        currentVideoIndex = index;
        loadVideo(playlist[index]);
        renderPlaylist();
    }
}

// Function to handle keyboard controls
function handleKeyboardControls(event) {
    switch (event.code) {
        case 'Space':
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
            break;
        case 'ArrowDown':
            changeVideo(currentVideoIndex + 1);
            break;
        case 'ArrowUp':
            changeVideo(currentVideoIndex - 1);
            break;
        // case 'ArrowRight':
        //     player.currentTime(player.currentTime() + 10);
        //     break;
        // case 'ArrowLeft':
        //     player.currentTime(player.currentTime() - 10);
        //     break;
    }
}

// Function to handle video end event
function handleVideoEnd() {
    if (currentVideoIndex < playlist.length - 1) {
        changeVideo(currentVideoIndex + 1);
    } else {
        changeVideo(0);
    }
}

// Load first video and render playlist on page load
window.onload = () => {
    fetch('/api/playlist')
        .then(response => response.json())
        .then(data => {
            playlist = data;
            loadVideo(playlist[0]);
            renderPlaylist();
            document.querySelector('.playlist-item').classList.add('active');
        })
        .catch(error => console.error('Error fetching playlist:', error));

    document.addEventListener('keydown', handleKeyboardControls);
    player.on('ended', handleVideoEnd);

    // Automatically play the first video on page load
    player.on('ready', () => {
        player.play();
    });
};
