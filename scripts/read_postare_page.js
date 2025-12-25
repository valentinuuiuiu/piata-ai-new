const fs = require('fs');
const filePath = 'src/app/postare/page.tsx';
try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(content);
} catch (e) {
    console.error("Error reading file:", e);
}
