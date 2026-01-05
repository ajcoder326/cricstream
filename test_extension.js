// Local Simulation of TouchCric Extension
const axios = require('axios');
const cheerio = require('cheerio');

// Mock dependencies
global.axios = axios;
global.cheerio = cheerio;

// Load Extension Modules
// We use 'eval' or 'require' hacks because these are not standard CommonJS modules export-wise
const fs = require('fs');
const path = require('path');

function loadModule(filename) {
    const content = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    // Remove "var headers =" duplicates to avoid redeclaration errors if we concat
    // But evaluating in global scope is easier for this specific legacy style
    eval(content);
}

async function runTest() {
    console.log("=== STARTING SIMULATION ===");

    try {
        console.log("Loading modules...");
        loadModule('posts.js');
        loadModule('meta.js');
        loadModule('stream.js'); // Assuming stream.js mainly defines getStreams

        console.log("\n--- STEP 1: Fetching Posts (Home Page) ---");
        // getPosts is async-ish in the real app but synchronous in code structure?
        // Wait, axios is async. The extension code uses axios.get which returns a Promise?
        // Ah, the extension code typically awaits? 
        // Let's look at posts.js content again.
        // It uses `var response = axios.get(...)`. This implies the extension runtime makes axios synchronous OR the code is actually async and I missed 'async/await'.
        // Checking previous file content...
        // `getPosts` in `posts.js` does `var response = axios.get(...)`. 
        // In the App, axios might be a synchronous wrapper, or the function should be async.
        // Standard axios returns a promise. If the code doesn't await, `response` is a Promise, and `response.data` will verify fail.
        // If the Code is written without await, it relies on a sync HTTP client provided by the app.
        // I need to patch axios to be sync OR wrap the simulation to await.
        // BUT, `posts.js` written previously did NOT use await. It treated response as immediate.
        // This suggests the user's "StreamBox" environment provides a synchronous axios or I made a mistake in the code writing.
        // Let's check `posts.js` again.

        // ... Checked memory. I wrote `var response = axios.get(...)`.
        // If the real environment is standard Node/JS, this fails.
        // I will Mock axios to be synchronous or just rewrite the test to handle it if I can't.
        // Actually, I can't easily make axios sync in Node. 
        // I will MOCK axios to return a fake object with .data for the TEST, preventing network calls?
        // No, we want REAL network calls.
        // I'll make the test script redefine `getPosts` slightly to be async for testing, 
        // OR I'll mock `axios.get` to return a Promise, and `getPosts` to be async.
        // But if `getPosts` is not async in the file, `await` won't work.

        // WORKAROUND: I will regexp-replace the file content in memory to add 'async' and 'await' for the test execution.

    } catch (e) {
        console.error("Setup Error:", e);
    }
}

// Rewriting loop for async handling
(async () => {
    try {
        console.log("=== STARTING SIMULATION ===");

        // 1. Read and Patch posts.js to generic async/await for Node execution
        let postsCode = fs.readFileSync(path.join(__dirname, 'posts.js'), 'utf8');
        // Replace "function getPosts" with "async function getPosts"
        postsCode = postsCode.replace('function getPosts', 'async function getPosts');
        // Replace "axios.get" with "await axios.get"
        postsCode = postsCode.replace(/axios\.get/g, 'await axios.get');

        // Add HTML logging
        postsCode = postsCode.replace(
            'var html = response.data;',
            'var html = response.data; fs.writeFileSync("debug_html.txt", html); console.log("Saved HTML to debug_html.txt");'
        );

        // Add Link count logging
        postsCode = postsCode.replace(
            'var $ = cheerio.load(html);',
            'var $ = cheerio.load(html); console.log("Total <a> tags found:", $("a").length);'
        );

        // Add verbose link logging
        // Note: posts.js has "function ()", so we must match that space
        postsCode = postsCode.replace(
            '$("a").each(function () {',
            '$("a").each(function () { console.log("| Link:", $(this).text().trim().replace(/\\n/g, ""), "Href:", $(this).attr("href"));'
        );

        eval(postsCode);

        // 2. Read and Patch meta.js (usually sync, but good to be safe)
        let metaCode = fs.readFileSync(path.join(__dirname, 'meta.js'), 'utf8');
        eval(metaCode);

        // 3. Read and Patch stream.js
        let streamCode = fs.readFileSync(path.join(__dirname, 'stream.js'), 'utf8');
        streamCode = streamCode.replace('function getStreams', 'async function getStreams');
        streamCode = streamCode.replace(/axios\.get/g, 'await axios.get');
        eval(streamCode);

        console.log("\n--- STEP 1: Fetching Posts ---");
        const posts = await getPosts("live", 1);
        console.log(`Result: Found ${posts.length} posts.`);

        if (posts.length > 0) {
            const firstPost = posts[0];
            console.log("Selected Post:", firstPost.title);
            console.log("Link Data:", firstPost.link);

            console.log("\n--- STEP 2: Getting Meta Data (Info Page) ---");
            const meta = getMetaData(firstPost.link);
            console.log("Meta Title:", meta.title);
            console.log("Link List Size:", meta.linkList.length);

            if (meta.linkList.length > 0 && meta.linkList[0].directLinks.length > 0) {
                const streamOption = meta.linkList[0].directLinks[0]; // High Quality
                console.log("Selected Stream Option:", streamOption.title);

                console.log("\n--- STEP 3: Fetching Stream ---");
                const streams = await getStreams(streamOption.link);
                console.log("Stream Result:", JSON.stringify(streams, null, 2));

                if (streams.length > 0 && streams[0].link.indexOf('m3u8') !== -1) {
                    console.log("\n✅ SUCCESS: Valid m3u8 link generated!");
                } else {
                    console.log("\n❌ FAILURE: No valid stream link.");
                }

            } else {
                console.warn("No direct links found in meta.");
            }
        } else {
            console.error("No posts found. Simulation stopped.");
        }

    } catch (err) {
        console.error("Simulation Runtime Error:", err);
    }
})();
