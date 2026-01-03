// TouchCric Stream Module - HLS Stream Extraction
// Constructs m3u8 URLs from channel data

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

function getStreams(link, type) {
    console.log("TouchCric getStreams:", link);

    try {
        var data = JSON.parse(link);
        var fmsUrl = data.fmsUrl || "tgs1.myluck1.top"; // Default if missing
        var streamId = data.streamId || 1;
        var token = data.token || "";
        var quality = data.quality || "high";

        // Map quality to suffix
        var suffix = "_720p"; // Default High
        if (quality === "medium") suffix = "_480p";
        if (quality === "low") suffix = "_320p";

        // Construct simplified stream name
        var streamName = "stream" + streamId + suffix;

        // Ensure token exists? (If missing, we might need to fetch it again here, skipping for now as posts.js tries to get it)

        var m3u8Url = "https://" + fmsUrl + ":8088/mobile/" + streamName + "/playlist.m3u8";
        m3u8Url += "?id=" + streamId;
        if (token) m3u8Url += "&pk=" + token;

        console.log("Stream URL:", m3u8Url);

        return [{
            server: "TouchCric " + quality,
            link: m3u8Url,
            type: "hls",
            quality: quality,
            headers: headers
        }];

    } catch (err) {
        console.error("getStreams error:", err);
        return [];
    }
}

function getMetaData(link, providerContext) {
    console.log("TouchCric getMetaData:", link);

    try {
        var channelData = JSON.parse(link);

        return {
            title: channelData.channelName || "Live Cricket",
            synopsis: "Live Cricket Streaming from TouchCric",
            image: "https://mob.touchcric.com/favicon.ico",
            poster: "https://mob.touchcric.com/favicon.ico",
            type: "live",
            linkList: [{
                title: "Watch Live",
                directLinks: [{ title: "Play", link: link }]
            }]
        };

    } catch (err) {
        console.error("getMetaData error:", err);
        return {
            title: "Live Cricket",
            synopsis: "Live Cricket Streaming",
            image: "",
            type: "live",
            linkList: []
        };
    }
}
