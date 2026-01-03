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

        // DEBUG: Force return defaults first to ensure page isn't blank
        // This confirms if the issue is network blocking or syntax error
        var defaults = [
            { t: "Live Cricket - SA20 (Debug " + (filter || "Live") + ")", id: 1 },
            { t: "Live Cricket - BBL (Debug " + (filter || "Live") + ")", id: 2 },
        ];
        for (var j = 0; j < defaults.length; j++) {
            posts.push({
                title: defaults[j].t,
                image: "https://www.google.com/favicon.ico", // Safe icon
                link: JSON.stringify({
                    fmsUrl: "tgs1.myluck1.top",
                    streamName: "stream" + defaults[j].id,
                    streamId: defaults[j].id,
                    token: "",
                    channelName: defaults[j].t
                }),
                type: "live"
            });
        }

        // Return debug items immediately to ensure visibility
        return posts;

        /* NETWORK CODE DISABLED until we see debug items
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
            // ... (rest of logic)
        } catch (apiErr) {
            console.error("API proxy failed:", apiErr);
        }
        */

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
