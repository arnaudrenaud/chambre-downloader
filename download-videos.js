const fs = require("fs");
const path = require("path");
const { getInfo } = require("ytdl-core");
const ytdl = require("ytdl-core");

const DOWNLOAD_VIDEOS_DIRECTORY = "downloaded-videos";

const getVideos = () => {
  return ["HySUWruiU4A"];
};

const downloadVideos = () => {
  if (!fs.existsSync(DOWNLOAD_VIDEOS_DIRECTORY)) {
    fs.mkdirSync(DOWNLOAD_VIDEOS_DIRECTORY);
  }
  const pathToWriteTo = path.join(
    DOWNLOAD_VIDEOS_DIRECTORY,
    new Date().toISOString().replace(/:/g, "-")
  );
  fs.mkdirSync(pathToWriteTo);
  const videoIds = getVideos();
  videoIds.forEach(async (videoId) => {
    const videoUrl = `http://www.youtube.com/watch?v=${videoId}`;
    console.log(`Downloading info for ${videoUrl}`);
    const info = await getInfo(videoUrl);
    // console.log(info)
    console.log(`Downloading video for ${videoUrl}`);
    ytdl(videoUrl).pipe(
      fs.createWriteStream(path.join(pathToWriteTo, `${videoId}.mp4`))
    );
  });
};

downloadVideos();
