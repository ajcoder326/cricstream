// TouchCric Meta Module
// Returns metadata for a match/channel

function getMetaData(link, providerContext) {
    console.log("TouchCric getMetaData:", link);

    try {
        var channelData = JSON.parse(link);

        return {
            title: channelData.channelName || "Live Cricket",
            synopsis: "Live Cricket Streaming from TouchCric. Watch SA20 2026, Big Bash League, IPL and more.",
            image: "https://mob.touchcric.com/favicon.ico",
            poster: "https://mob.touchcric.com/favicon.ico",
            type: "live",
            imdbId: "",
            linkList: [{
                title: "Watch Live",
                directLinks: [{
                    title: "Play Stream",
                    link: link
                }]
            }]
        };

    } catch (err) {
        console.error("getMetaData error:", err);
        return {
            title: "Live Cricket",
            synopsis: "Live Cricket Streaming",
            image: "https://mob.touchcric.com/favicon.ico",
            poster: "",
            type: "live",
            imdbId: "",
            linkList: []
        };
    }
}
