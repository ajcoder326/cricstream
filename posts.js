// TouchCric Posts Module
// Fetches API via Proxy for reliable match listing

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

var PROXY_BASE = "https://195.3.220.74/?__cpo=";
// API: https://vidict.net/api/channelsList_touchcric.php?sn=M8Jj-0NKO-aYb8-NXYQ-6a3gc
var API_URL_B64 = "aHR0cHM6Ly92aWRpY3QubmV0L2FwaS9jaGFubmVsc0xpc3RfdG91Y2hjcmljLnBocD9zbj1NOEpqLTBOS08tYVliOC1OWFlRLTZhM2dj";
var HOME_URL_B64 = "aHR0cHM6Ly9tb2IudG91Y2hjcmljLmNvbQ";

// Matches HDHub4u signature exactly: filter, page, providerContext
function getPosts(filter, page, providerContext) {
    console.log("TouchCric getPosts filter:", filter, "page:", page);
    // App sends page 1 for first page
    if (page > 1) return [];

    try {
        var posts = [];
        var token = "";

        // 1. Fetch Homepage for Token (needed for playback)
        try {
            var homeProxy = PROXY_BASE + HOME_URL_B64;
            var homeResponse = axios.get(homeProxy, { headers: headers });
            var homeHtml = homeResponse.data;
            var tokenMatch = homeHtml.match(/showChannels\s*\(\s*["']([^"']+)["']\s*\)/);
            if (tokenMatch) {
                token = tokenMatch[1];
                console.log("Token:", token.substring(0, 10) + "...");
            }
        } catch (e) {
            console.error("Token fetch failed:", e);
        }

        // 2. Fetch API for Channels via Proxy
        try {
            var apiProxy = PROXY_BASE + API_URL_B64;
            console.log("Fetching API via proxy:", apiProxy);

            var apiResponse = axios.get(apiProxy, { headers: headers });
            var data = apiResponse.data;

            var channels = [];
            if (Array.isArray(data)) {
                channels = data;
            } else if (data && data.channels) {
                channels = data.channels;
            } else if (typeof data === "string") {
                try { channels = JSON.parse(data); } catch (e) { }
            }

            console.log("API returned channels:", channels.length);

            for (var i = 0; i < channels.length; i++) {
                var ch = channels[i];
                var title = ch.channelName || ch.title || "Match " + (i + 1);
                var server = ch.fmsUrl || ch.server || "tgs1.myluck1.top";
                var stream = ch.streamName || ch.stream || ("stream" + ch.streamId);
                var id = ch.streamId || ch.id || (i + 1);

                posts.push({
                    title: title,
                    image: ch.logo || "https://www.google.com/favicon.ico",
                    link: JSON.stringify({
                        fmsUrl: server,
                        streamName: stream,
                        streamId: id,
                        token: token,
                        channelName: title
                    }),
                    type: "live"
                });
            }

        } catch (apiErr) {
            console.error("API proxy failed:", apiErr);
        }

        // 3. Add Fallback/Debug matches if API failed OR if we just want defaults visible
        if (posts.length === 0) {
            console.log("Using fallback matches");
            var defaults = [
                { t: "Live Cricket 1 (Fallback)", id: 1 },
                { t: "Live Cricket 2 (Fallback)", id: 2 }
            ];
            for (var j = 0; j < defaults.length; j++) {
                posts.push({
                    title: defaults[j].t,
                    image: "https://www.google.com/favicon.ico",
                    link: JSON.stringify({
                        fmsUrl: "tgs1.myluck1.top",
                        streamName: "stream" + defaults[j].id,
                        streamId: defaults[j].id,
                        token: token, // Attempt to use fetched token even for fallback
                        channelName: defaults[j].t
                    }),
                    type: "live"
                });
            }
        }

        return posts;

    } catch (err) {
        console.error("Critical error in getPosts:", err);
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
