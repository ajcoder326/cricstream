// TouchCric Meta Module
// Handles the "Info" page where users see High/Medium/Low options

function getMetaData(link, providerContext) {
    console.log("TouchCric getMetaData:", link);

    try {
        var data = JSON.parse(link);
        var title = data.title || "Live Match";

        // Return structured data for the Info Page
        // "linkList" contains the playback options
        return {
            title: title,
            synopsis: "Select Quality to Play",
            image: "https://mob.touchcric.com/favicon.ico",
            type: "live",
            linkList: [
                {
                    title: "Select Stream Quality",
                    // These direct links will be passed to stream.js when clicked
                    directLinks: [
                        { title: "High Quality (720p/HD)", link: JSON.stringify({ ...data, quality: "high" }) },
                        { title: "Medium Quality (480p)", link: JSON.stringify({ ...data, quality: "medium" }) },
                        { title: "Low Quality (360p)", link: JSON.stringify({ ...data, quality: "low" }) }
                    ]
                }
            ]
        };

    } catch (err) {
        console.error("getMetaData error:", err);
        return {
            title: "Error",
            synopsis: "Could not load match info",
            image: "",
            type: "live",
            linkList: []
        };
    }
}
