
const fs = require('fs');

// Mock Rhino environment
global.axios = {
    get: function (url) {
        console.log("[MockAxios] GET", url);
        return {
            data: '<html><script>showChannels("TOKEN123")</script></html>'
        };
    }
};

global.cheerio = {
    load: function (html) {
        return function (selector) {
            return {
                each: function () { },
                text: function () { return ""; },
                attr: function () { return ""; }
            };
        };
    }
};

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

try {
    // Eval in global scope
    const catalogSrc = read('d:/lens/StreamBox/extensions/touchcric/catalog.js');
    eval(catalogSrc);
    console.log("Loaded catalog.js");

    const postsSrc = read('d:/lens/StreamBox/extensions/touchcric/posts.js');
    eval(postsSrc);
    console.log("Loaded posts.js");

    console.log("---------------------------------------------------");

    if (typeof getCatalog !== 'function') {
        console.error("getCatalog is not defined!");
    } else {
        const cat = getCatalog();
        console.log("getCatalog() returned:", JSON.stringify(cat, null, 2));
    }

    if (typeof getPosts !== 'function') {
        console.error("getPosts is not defined!");
    } else {
        // Test getPosts
        console.log("Calling getPosts('live', 0)...");
        const posts = getPosts("live", 0);
        console.log("getPosts returned " + (posts ? posts.length : 'null') + " items.");
        if (posts && posts.length > 0) {
            console.log("First post:", JSON.stringify(posts[0], null, 2));
        }
    }

} catch (e) {
    console.error("Runtime Error:", e);
}
