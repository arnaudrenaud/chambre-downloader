require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const minimist = require("minimist");
const path = require("path");
const ytdl = require("ytdl-core");

const YOUTUBE_DATA_API_KEY = process.env.YOUTUBE_DATA_API_KEY;
const DOWNLOADED_VIDEOS_DIRECTORY =
  process.env.DOWNLOADED_VIDEOS_DIRECTORY || "downloaded-videos";

if (!fs.existsSync(DOWNLOADED_VIDEOS_DIRECTORY)) {
  fs.mkdirSync(DOWNLOADED_VIDEOS_DIRECTORY);
}

const PATH_TO_WRITE_TO = path.join(
  DOWNLOADED_VIDEOS_DIRECTORY,
  new Date().toISOString().replace(/:/g, "-")
);
fs.mkdirSync(PATH_TO_WRITE_TO);

const getVideoIds = async (keyword, limit) => {
  const searchForXLastHours = process.env.SEARCH_FOR_X_LAST_HOURS || 2;
  const now = new Date();
  const startDate = new Date(
    now.setHours(now.getHours() - searchForXLastHours)
  );
  const searchKeyword = keyword;
  console.log(`searchKeyword is ${searchKeyword}`);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?order=date&publishedAfter=${startDate.toISOString()}&q=${searchKeyword}&maxResults=50&key=${YOUTUBE_DATA_API_KEY}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  const searchResults = await response.json();
  // console.dir(searchResults, {depth:null});
  return searchResults.items.map((item) => item.id.videoId);
};

const fetchChannelStatistics = async (channelId) => {
  const response = await fetch (
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_DATA_API_KEY}`,
      {
      headers: {
          Accept: "application/json",
        },
      }
    );
  const results = await response.json();
  return results;
}

const fetchVideoCompleteInfo = async (videoId) => {
  console.log(`Fetching info for ${videoId}`);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_DATA_API_KEY}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  const videoInfo = await response.json();

  const channelId = videoInfo.items[0].snippet.channelId
  const channelStatistics = await fetchChannelStatistics(channelId);

  return {videoInfo, channelStatistics};
};

const writeVideoCompleteInfo = (videoId, info) => {
  fs.writeFileSync(
    path.join(PATH_TO_WRITE_TO, `${videoId}.json`),
    JSON.stringify(info, null, 2)
  );
}

const downloadVideo = (videoId) => {
  console.log(`Downloading video for ${videoId}`);
  const videoUrl = `http://www.youtube.com/watch?v=${videoId}`;
  ytdl(videoUrl).pipe(
    fs.createWriteStream(path.join(PATH_TO_WRITE_TO, `${videoId}.mp4`))
  );
};

const downloadVideosAndInfo = async () => {
  const scriptArguments = minimist(process.argv.slice(2));

  const videoIds = await getVideoIds(scriptArguments.searchKeyword);
  
  const channelSubscriberLimit = scriptArguments.channelSubscriberLimit;
  console.log(`the channel's subscriber count limit is set on ${channelSubscriberLimit}`)

  videoIds.forEach(async (videoId) => {
    const videoCompleteInfo = await fetchVideoCompleteInfo(videoId);
    const channelSubscriberCount = parseInt(videoCompleteInfo.channelStatistics.items[0].statistics.subscriberCount, 10);

    console.log(`${videoId}'s channel has ${channelSubscriberCount} subscribers`)
    if (channelSubscriberCount < (channelSubscriberLimit || 150)) {  
      writeVideoCompleteInfo(videoId, videoCompleteInfo); 
      downloadVideo(videoId);
    }
  });
};

downloadVideosAndInfo();
