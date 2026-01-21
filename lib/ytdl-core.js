const axios = require("axios");

async function fetchWithTimeout(url, timeout = 60000) {
  return axios.get(url, { timeout });
}

class YTCore {

  // 🎬 VIDEO DOWNLOAD (WORKING LONG VIDEOS)
  static async mp4(url) {

    const apiUrl =
      `http://157.173.113.252:3010/download/youtube/videofhd?url=` +
      encodeURIComponent(url);

    const response = await fetchWithTimeout(apiUrl, 60000);
    const data = response.data;

    if (!data?.success || !data?.result?.download_url) {
      throw new Error("API did not return valid download url");
    }

    return {
      title: data.result.title,
      thumbnail: data.result.thumbnail,
      download: data.result.download_url
    };
  }
}

module.exports = YTCore;