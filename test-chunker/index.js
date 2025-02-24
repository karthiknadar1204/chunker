const { chunk } = require("vectors-chunkers");
const fs = require("fs");

const text = "This is a long text that needs to be chunked into smaller pieces. It will be processed and stored in chunks.";

const result = chunk(text, {
  format: "text",
  chunkSize: 5
});

fs.writeFileSync("result.json", JSON.stringify(result, null, 2));
