const fs = require('fs');
const filePath = process.argv[2];
if (!filePath) {
    console.error("Please provide a file path");
    process.exit(1);
}
try {
    const content = fs.readFileSync(filePath, 'utf8');
    const chunkSize = 3000;
    for (let i = 0; i < content.length; i += chunkSize) {
        console.log(`<<<CHUNK_${Math.floor(i/chunkSize)}>>>`);
        console.log(content.slice(i, i + chunkSize));
        console.log(`<<<END_CHUNK_${Math.floor(i/chunkSize)}>>>`);
    }
} catch (e) {
    console.error("Error reading file:", e);
}
