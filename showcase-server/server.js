const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/playlist', (req, res) => {
    const videoDir = path.join(__dirname, 'public/videos');
    const thumbDir = path.join(__dirname, 'public/thumbnails');

    fs.readdir(videoDir, (err, videoFiles) => {
        if (err) {
            return res.status(500).send('Unable to scan videos directory');
        }

        const playlist = videoFiles.map(videoFile => {
            const title = path.parse(videoFile).name;
            const thumbnail = `${title}.jpg`;
            return {
                title: title,
                src: `videos/${videoFile}`,
                thumbnail: `thumbnails/${thumbnail}`,
                description: `This is the description for ${title}.`
            };
        });

        res.json(playlist);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
