// TouchCric Posts Module
// Returns posts/matches for a given catalog

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

var API_URL = "https://vidict.net/api/channelsList_touchcric.php?sn=M8Jj-0NKO-aYb8-NXYQ-6a3gc";

function getPosts(catalogId, page) {
    console.log("TouchCric getPosts:", catalogId, "page:", page);

    if (page > 0) {
        return [];
    }

    try {
        // Fetch homepage for token
        var homeResponse = axios.get("https://mob.touchcric.com/", { headers: headers });
        var homeHtml = homeResponse.data;

        var token = "";
        var tokenMatch = homeHtml.match(/showChannels\s*\(\s*["']([^"']+)["']\s*\)/);
        if (tokenMatch) {
            token = tokenMatch[1];
        }

        // Fetch channels from API
        var apiResponse = axios.get(API_URL, { headers: headers });
        var channels = [];

        if (apiResponse && apiResponse.data) {
            if (Array.isArray(apiResponse.data)) {
                channels = apiResponse.data;
            } else if (apiResponse.data.channels) {
                channels = apiResponse.data.channels;
            }
        }

        var posts = [];
        for (var i = 0; i < channels.length; i++) {
            var ch = channels[i];
            posts.push({
                title: ch.channelName || ch.title || ("Channel " + (i + 1)),
                image: ch.logo || "https://mob.touchcric.com/favicon.ico",
                link: JSON.stringify({
                    fmsUrl: ch.fmsUrl || ch.server || "tgs1.myluck1.top",
                    streamName: ch.streamName || ch.stream,
                    streamId: ch.streamId || ch.id || (i + 1),
                    token: token,
                    channelName: ch.channelName || ch.title
                }),
                type: "live"
            });
        }

        // Default matches if API returns empty
        if (posts.length === 0) {
            var defaults = [
                { title: "SA20 2026 - Live", id: 1 },
                { title: "Big Bash League - Live", id: 2 },
                { title: "Australia vs England - 4th Test", id: 3 },
                { title: "Bangladesh Premier League", id: 4 },
                { title: "International League T20", id: 5 }
            ];

            for (var j = 0; j < defaults.length; j++) {
                posts.push({
                    title: defaults[j].title,
                    image: "https://mob.touchcric.com/favicon.ico",
                    link: JSON.stringify({
                        fmsUrl: "tgs1.myluck1.top",
                        streamName: "stream" + defaults[j].id,
                        streamId: defaults[j].id,
                        token: token,
                        channelName: defaults[j].title
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
    var posts = getPosts("live", 0);
    var results = [];
    var q = query.toLowerCase();

    for (var i = 0; i < posts.length; i++) {
        if (posts[i].title.toLowerCase().indexOf(q) !== -1) {
            results.push(posts[i]);
        }
    }

    return results;
}
