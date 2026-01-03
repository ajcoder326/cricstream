// TouchCric Posts Module
// Uses proxy to access blocked site

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

// Proxy URL - proxyium encodes the target URL in base64
var PROXY_BASE = "https://195.3.220.74/?__cpo=";
var HOME_URL_ENCODED = "aHR0cHM6Ly9tb2IudG91Y2hjcmljLmNvbQ"; // base64 of https://mob.touchcric.com

function getPosts(catalogId, page) {
    console.log("TouchCric getPosts:", catalogId, "page:", page);

    if (page > 0) {
        return [];
    }

    try {
        // Try to fetch token via proxy
        var token = "";
        try {
            var proxyUrl = PROXY_BASE + HOME_URL_ENCODED;
            console.log("Fetching via proxy:", proxyUrl);
            var homeResponse = axios.get(proxyUrl, { headers: headers });
            var homeHtml = homeResponse.data;

            var tokenMatch = homeHtml.match(/showChannels\s*\(\s*["']([^"']+)["']\s*\)/);
            if (tokenMatch) {
                token = tokenMatch[1];
                console.log("Got token:", token.substring(0, 20) + "...");
            }
        } catch (e) {
            console.log("Proxy fetch failed, using fallback");
        }

        // Return default matches with token
        var matches = [
            { title: "SA20 2026 - Live", id: 1, server: "tgs1.myluck1.top" },
            { title: "Big Bash League - Live", id: 2, server: "tgs1.myluck1.top" },
            { title: "Australia vs England - 4th Test", id: 3, server: "tgs1.myluck1.top" },
            { title: "Bangladesh Premier League", id: 4, server: "tgs1.myluck1.top" },
            { title: "International League T20", id: 5, server: "tgs1.myluck1.top" }
        ];

        var posts = [];
        for (var i = 0; i < matches.length; i++) {
            var m = matches[i];
            posts.push({
                title: m.title,
                image: "https://mob.touchcric.com/favicon.ico",
                link: JSON.stringify({
                    fmsUrl: m.server,
                    streamName: "stream" + m.id,
                    streamId: m.id,
                    token: token,
                    channelName: m.title
                }),
                type: "live"
            });
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
