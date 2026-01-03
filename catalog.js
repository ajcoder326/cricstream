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
                items: [
                    {
                        title: "Live Cricket - SA20 (Direct)",
                        image: "https://mob.touchcric.com/favicon.ico",
                        link: JSON.stringify({
                            fmsUrl: "tgs1.myluck1.top",
                            streamName: "stream1_720p",
                            streamId: 1,
                            token: "",
                            channelName: "Live Cricket - SA20"
                        }),
                        type: "live"
                    },
                    {
                        title: "Live Cricket - BBL (Direct)",
                        image: "https://mob.touchcric.com/favicon.ico",
                        link: JSON.stringify({
                            fmsUrl: "tgs1.myluck1.top",
                            streamName: "stream2_720p",
                            streamId: 2,
                            token: "",
                            channelName: "Live Cricket - BBL"
                        }),
                        type: "live"
                    }
                ]
            }
        ];
    } catch (err) {
        console.error("getCatalog error:", err);
        return [];
    }
}
