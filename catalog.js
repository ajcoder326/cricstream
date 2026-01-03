// TouchCric Catalog Module - Live Cricket Streaming
// Fetches available matches from TouchCric API

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

// API endpoint for channel list
var API_URL = "https://vidict.net/api/channelsList_touchcric.php?sn=M8Jj-0NKO-aYb8-NXYQ-6a3gc";

function getCatalog() {
    console.log("TouchCric getCatalog");

    try {
        // Return static categories for live cricket
        return [
            {
                title: "Live Cricket",
                id: "live",
                items: []
            }
        ];
    } catch (err) {
        console.error("getCatalog error:", err);
        return [];
    }
}

function getPosts(catalogId, page) {
    console.log("TouchCric getPosts:", catalogId, "page:", page);

    if (page > 0) {
        return []; // No pagination for live streams
    }

    try {
        // First fetch the homepage to get the token
        var homeResponse = axios.get("https://mob.touchcric.com/", { headers: headers });
        var homeHtml = homeResponse.data;

        // Extract token from showChannels("TOKEN")
        var token = "";
        var tokenMatch = homeHtml.match(/showChannels\s*\(\s*["']([^"']+)["']\s*\)/);
        if (tokenMatch) {
            token = tokenMatch[1];
            console.log("Found token:", token.substring(0, 20) + "...");
        }

        // Fetch channel list from API
        var apiResponse = axios.get(API_URL, { headers: headers });
        var channels = [];

        if (apiResponse && apiResponse.data) {
            var data = apiResponse.data;

            // Parse channels array
            if (Array.isArray(data)) {
                channels = data;
            } else if (data.channels) {
                channels = data.channels;
            }
        }

        console.log("Found", channels.length, "channels");

        // Convert channels to post format
        var posts = [];
        for (var i = 0; i < channels.length; i++) {
            var ch = channels[i];
            posts.push({
                title: ch.channelName || ch.title || ("Channel " + (i + 1)),
                image: ch.logo || "https://mob.touchcric.com/favicon.ico",
                link: JSON.stringify({
                    fmsUrl: ch.fmsUrl || ch.server,
                    streamName: ch.streamName || ch.stream,
                    streamId: ch.streamId || ch.id || i,
                    token: token,
                    channelName: ch.channelName || ch.title
                }),
                type: "live"
            });
        }

        // If no channels from API, create default entries from known matches
        if (posts.length === 0) {
            console.log("No channels from API, using default matches");
            var defaultMatches = [
                { title: "SA20 2026", streamName: "stream1_720p", id: 1 },
                { title: "Big Bash League", streamName: "stream2_720p", id: 2 },
                { title: "Australia vs England", streamName: "stream3_720p", id: 3 },
                { title: "Bangladesh Premier League", streamName: "stream4_720p", id: 4 },
                { title: "International League T20", streamName: "stream5_720p", id: 5 }
            ];

            for (var j = 0; j < defaultMatches.length; j++) {
                var match = defaultMatches[j];
                posts.push({
                    title: match.title,
                    image: "https://mob.touchcric.com/favicon.ico",
                    link: JSON.stringify({
                        fmsUrl: "tgs1.myluck1.top",
                        streamName: match.streamName,
                        streamId: match.id,
                        token: token,
                        channelName: match.title
                    }),
                    type: "live"
                });
            }
        }

        return posts;

    } catch (err) {
        console.error("getPosts error:", err);
        return [];
    }
}

function search(query) {
    console.log("TouchCric search:", query);

    var allPosts = getPosts("live", 0);
    var results = [];
    var queryLower = query.toLowerCase();

    for (var i = 0; i < allPosts.length; i++) {
        if (allPosts[i].title.toLowerCase().indexOf(queryLower) !== -1) {
            results.push(allPosts[i]);
        }
    }

    return results;
}
