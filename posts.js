// TouchCric Posts Module
// Scrapes mob.touchcric.com for live matches

var headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Referer": "https://mob.touchcric.com/"
};

var HOME_URL = "https://mob.touchcric.com/";

function getPosts(filter, page, providerContext) {
    console.log("TouchCric getPosts filter:", filter, "page:", page);
    if (page > 1) return [];

    try {
        // Use CodeTabs proxy as requested
        var PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(HOME_URL);
        console.log("Fetching Homepage via Proxy:", PROXY_URL);

        var response = axios.get(PROXY_URL, { headers: headers });
        var html = response.data;

        var $ = cheerio.load(html);
        var posts = [];
        var seen = {};

        // Extract Token if present (useful for later)
        var token = "";
        var tokenMatch = html.match(/showChannels\s*\(\s*["']?([^"'\)]+)["']?\s*\)/);
        if (tokenMatch) {
            token = tokenMatch[1];
            console.log("Token found:", token);
        }

        // Logic: Find all matches (usually in <a> tags or grid items)
        // Adjust selectors based on actual site structure. 
        // Based on previous knowledge, look for links containing "vs", "live", "league"
        $("a").each(function () {
            var el = $(this);
            var title = el.text().trim();
            var href = el.attr("href") || "";

            if (!title || seen[title] || title.length < 5) return;

            // Filter logic
            var isMatch = title.toLowerCase().indexOf("vs") !== -1 ||
                title.toLowerCase().indexOf("live") !== -1 ||
                title.toLowerCase().indexOf("league") !== -1 ||
                title.toLowerCase().indexOf("t20") !== -1 ||
                href.indexOf("match") !== -1;

            if (isMatch) {
                seen[title] = true;

                // Construct link data
                // We need to pass enough info for meta.js and stream.js
                // If we don't have stream ID yet, we might need to parse it from href or assign one
                var streamId = posts.length + 1;

                posts.push({
                    title: title,
                    image: "https://mob.touchcric.com/favicon.ico",
                    link: JSON.stringify({
                        title: title,
                        url: href,
                        token: token,
                        streamId: streamId
                    }),
                    type: "live" // This type usually triggers meta.js if configured
                });
            }
        });

        // Debug/Fallback if no matches found
        if (posts.length === 0) {
            console.log("No matches found via scraping. Adding Debug Items.");
            posts.push({
                title: "Live Cricket - Debug Scrape Failed",
                image: "https://www.google.com/favicon.ico",
                link: JSON.stringify({ title: "Debug Match", streamId: 1, token: token }),
                type: "live"
            });
        }

        console.log("Found", posts.length, "matches");
        return posts;

    } catch (err) {
        console.error("getPosts Scraping Error:", err);
        return [{
            title: "Error Checking Matches",
            image: "https://www.google.com/favicon.ico",
            link: "{}",
            type: "live"
        }];
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
