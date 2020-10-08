require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const { downloadFromInfo } = require("ytdl-core");

const DOWNLOAD_VIDEOS_DIRECTORY = "downloaded-videos";

if (!fs.existsSync(DOWNLOAD_VIDEOS_DIRECTORY)) {
  fs.mkdirSync(DOWNLOAD_VIDEOS_DIRECTORY);
}

const PATH_TO_WRITE_TO = path.join(
  DOWNLOAD_VIDEOS_DIRECTORY,
  new Date().toISOString().replace(/:/g, "-")
);
fs.mkdirSync(PATH_TO_WRITE_TO);

const getVideoIds = async () => {
  const searchForXLastHours = process.env.SEARCH_FOR_X_LAST_HOURS || 2;
  const now = new Date();
  const startDate = new Date(
    now.setHours(now.getHours() - searchForXLastHours)
  );
  const searchKeyword = process.env.SEARCH_KEYWORD || "chambre";
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?order=date&publishedAfter=${startDate.toISOString()}&q=${searchKeyword}&maxResults=50&key=${
      process.env.YOUTUBE_DATA_API_KEY
    }`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  const searchResults = await response.json();
  return searchResults.items.map((item) => item.id.videoId);
};

const downloadVideos = (videoIds) => {
  videoIds.forEach(async (videoId) => {
    const videoUrl = `http://www.youtube.com/watch?v=${videoId}`;
    console.log(`Downloading video for ${videoUrl}`);
    ytdl(videoUrl).pipe(
      fs.createWriteStream(path.join(PATH_TO_WRITE_TO, `${videoId}.mp4`))
    );
  });
};

const downloadVideosAndInfo = async () => {
  const videoIds = await getVideoIds();
  downloadVideos(videoIds);
};

downloadVideosAndInfo();
