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

        // Logic: Parse Meta Description for matches
        // The description contains text like: "Tournament Name, Team A vs Team B Live Cricket Streaming..."
        var description = $("meta[property='description']").attr("content") ||
            $("meta[name='description']").attr("content") || "";

        console.log("Meta Description found:", description.length, "chars");

        // Split into sentences/segments
        var segments = description.split(". ");

        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            // Look for "vs" and "Live" to identify match strings
            if (seg.indexOf(" vs ") !== -1 && (seg.indexOf("Live") !== -1 || seg.indexOf("Streaming") !== -1)) {

                // Clean up title
                // Example: "SA20 League 2026, MI Cape Town vs Paarl Royals Live Streaming on Touchcric"
                // Target: "MI Cape Town vs Paarl Royals" or "SA20: MI Cape Town vs Paarl Royals"

                var title = seg.replace(/Live.*$/, "").trim(); // Remove "Live Streaming..." suffix
                if (title.endsWith(" on Touchcric")) title = title.replace(" on Touchcric", "");

                // Optional: Shorten tournament names if needed, but full text is fine

                if (title.length > 10 && !seen[title]) {
                    seen[title] = true;
                    // Assume sequential Stream IDs based on appearance order
                    var streamId = posts.length + 1;

                    posts.push({
                        title: title,
                        image: "https://mob.touchcric.com/favicon.ico",
                        link: JSON.stringify({
                            title: title,
                            url: HOME_URL, // No specific URL needed, we build it
                            token: token,
                            streamId: streamId
                        }),
                        type: "live"
                    });
                }
            }
        }

        // Fallback: If description parsing fails, try the link text method again as backup
        if (posts.length === 0) {
            $("a").each(function () {
                var el = $(this);
                var title = el.text().trim();
                var href = el.attr("href") || "";

                if (!title || seen[title] || title.length < 5) return;

                // Filter logic
                var isMatch = title.toLowerCase().indexOf("vs") !== -1 ||
                    title.toLowerCase().indexOf("live") !== -1 ||
                    href.indexOf("match") !== -1;

                if (isMatch) {
                    seen[title] = true;
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
                        type: "live"
                    });
                }
            });
        }

        // Debug/Fallback if no matches found
        // Dump the first few links found to help debug selectors
        if (posts.length === 0) {
            console.log("No matches found via filter. Dumping raw links.");
            var rawCount = 0;
            $("a").each(function () {
                if (rawCount >= 10) return;
                var t = $(this).text().trim();
                var h = $(this).attr("href");
                if (t && t.length > 3 && h) {
                    posts.push({
                        title: "Debug: " + t,
                        image: "https://www.google.com/favicon.ico",
                        link: JSON.stringify({ title: t, url: h, token: token, streamId: 900 + rawCount }),
                        type: "live"
                    });
                    rawCount++;
                }
            });

            if (posts.length === 0) {
                posts.push({
                    title: "Live Cricket - No Links Found at all",
                    image: "https://www.google.com/favicon.ico",
                    link: JSON.stringify({ title: "Debug Match", streamId: 1, token: token }),
                    type: "live"
                });
            }
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
