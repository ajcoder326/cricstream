// TouchCric Stream Module - HLS Stream Extraction
// Constructs m3u8 URLs from channel data

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

function getStreams(link, type) {
    console.log("TouchCric getStreams:", link);

    try {
        // Parse channel data from link
        var channelData = JSON.parse(link);

        var fmsUrl = channelData.fmsUrl || "tgs1.myluck1.top";
        var streamId = channelData.streamId || 1;
        var token = channelData.token || "";
        var channelName = channelData.channelName || "Live Stream";

        // If no token, try to fetch it from homepage via proxy
        if (!token) {
            console.log("No token, fetching from homepage...");
            try {
                // Proxy URL - proxyium encodes the target URL in base64
                var PROXY_BASE = "https://195.3.220.74/?__cpo=";
                var HOME_URL_B64 = "aHR0cHM6Ly9tb2IudG91Y2hjcmljLmNvbQ"; // https://mob.touchcric.com
                var PROXY_URL = PROXY_BASE + HOME_URL_B64;

                console.log("Fetching token via:", PROXY_URL);
                var homeResponse = axios.get(PROXY_URL, { headers: headers });
                var homeHtml = homeResponse.data;
                var tokenMatch = homeHtml.match(/showChannels\s*\(\s*["']([^"']+)["']\s*\)/);
                if (tokenMatch) {
                    token = tokenMatch[1];
                    console.log("Got token via proxy:", token.substring(0, 10) + "...");
                } else {
                    console.error("Token regex match failed on proxy HTML");
                }
            } catch (e) {
                console.error("Failed to get token via proxy:", e);
                // Last resort omitted to avoid hanging
            }
        }

        // Quality options
        var qualities = [
            { name: "High (720p)", suffix: "_720p", quality: "720p" },
            { name: "Medium (480p)", suffix: "_480p", quality: "480p" },
            { name: "Low (320p)", suffix: "_320p", quality: "320p" }
        ];

        var streams = [];

        // Generate stream URLs for each quality
        for (var i = 0; i < qualities.length; i++) {
            var q = qualities[i];
            var streamName = "stream" + streamId + q.suffix;

            // If streamName is provided in channel data, use it as base
            if (channelData.streamName) {
                // Replace quality suffix if present
                streamName = channelData.streamName.replace(/_\d+p$/, q.suffix);
                if (streamName === channelData.streamName) {
                    // No suffix found, append it
                    streamName = channelData.streamName + q.suffix;
                }
            }

            // Construct m3u8 URL
            // Pattern: https://{fmsUrl}:8088/mobile/{streamName}/playlist.m3u8?id={streamId}&pk={token}
            var m3u8Url = "https://" + fmsUrl + ":8088/mobile/" + streamName + "/playlist.m3u8";
            m3u8Url += "?id=" + streamId;
            if (token) {
                m3u8Url += "&pk=" + token;
            }

            console.log("Stream URL:", m3u8Url);

            streams.push({
                server: channelName + " - " + q.name,
                link: m3u8Url,
                type: "hls",
                quality: q.quality,
                headers: headers
            });
        }

        // Also add the direct stream if available
        if (channelData.streamName) {
            var directUrl = "https://" + fmsUrl + ":8088/mobile/" + channelData.streamName + "/playlist.m3u8";
            directUrl += "?id=" + streamId;
            if (token) {
                directUrl += "&pk=" + token;
            }

            streams.unshift({
                server: channelName + " - Auto Quality",
                link: directUrl,
                type: "hls",
                quality: "Auto",
                headers: headers
            });
        }

        return streams;

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
