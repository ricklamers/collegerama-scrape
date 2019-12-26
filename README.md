## Scrape Collegerama videos

Use get-from-web.js (run from browser console) on the index page of Collegerama index listing and paste the printed value in scrape.js to download the video files to the data directory.

```

var lectures = [ <output of get-from-web.js> ];

```

To run scrape.js install node.js and run npm install to install dependencies in package.json.

Collegerama URL: https://collegerama.tudelft.nl/Mediasite/Catalog/catalogs/eemcs-lectures