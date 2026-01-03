// TouchCric Posts Module
// Scrapes live matches from proxied site

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
        var proxyUrl = PROXY_BASE + HOME_URL_ENCODED;
        console.log("Fetching via proxy:", proxyUrl);
        var homeResponse = axios.get(proxyUrl, { headers: headers });
        var homeHtml = homeResponse.data;

        // Extract token from showChannels("TOKEN")
        var token = "";
        var tokenMatch = homeHtml.match(/showChannels\s*\(\s*["']([^"']+)["']\s*\)/);
        if (tokenMatch) {
            token = tokenMatch[1];
            console.log("Got token:", token.substring(0, 20) + "...");
        }

        // Parse HTML to find matches using cheerio
        var $ = cheerio.load(homeHtml);
        var posts = [];
        var seen = {};

        // Find all match links - they typically link to #pagetwo or have match info
        $("a").each(function () {
            var el = $(this);
            var text = el.text().trim();
            var href = el.attr("href") || "";

            // Skip empty or duplicate
            if (!text || seen[text] || text.length < 5) return;

            // Skip navigation/footer links
            if (text.toLowerCase().indexOf("contact") !== -1) return;
            if (text.toLowerCase().indexOf("about") !== -1) return;
            if (text.toLowerCase().indexOf("privacy") !== -1) return;
            if (text.toLowerCase().indexOf("quality") !== -1) return;
            if (href.indexOf("#video") !== -1) return;

            // Match links typically go to #pagetwo or contain match keywords
            var isMatch = href.indexOf("#pagetwo") !== -1 ||
                href.indexOf("#page") !== -1 ||
                text.toLowerCase().indexOf("vs") !== -1 ||
                text.toLowerCase().indexOf("live") !== -1 ||
                text.toLowerCase().indexOf("league") !== -1 ||
                text.toLowerCase().indexOf("cup") !== -1 ||
                text.toLowerCase().indexOf("t20") !== -1 ||
                text.toLowerCase().indexOf("test") !== -1;

            if (isMatch && text.length > 3) {
                seen[text] = true;

                // Try to extract stream info from data attributes or onclick
                var onclick = el.attr("onclick") || "";
                var streamId = posts.length + 1;

                posts.push({
                    title: text,
                    image: "https://mob.touchcric.com/favicon.ico",
                    link: JSON.stringify({
                        fmsUrl: "tgs1.myluck1.top",
                        streamName: "stream" + streamId,
                        streamId: streamId,
                        token: token,
                        channelName: text,
                        proxyHome: proxyUrl
                    }),
                    type: "live"
                });

                console.log("Found match:", text);
            }
        });

        console.log("Total matches found:", posts.length);
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
