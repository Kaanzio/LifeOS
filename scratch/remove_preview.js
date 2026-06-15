const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const lines = code.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('<!-- Banner Preview Box (Visual Priority) -->'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('<!-- Core Customization Container (JS handles the rest of bento items) -->'));

if (startIdx !== -1 && endIdx !== -1) {
    // Remove lines from startIdx to endIdx - 1
    lines.splice(startIdx, endIdx - startIdx);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log('Removed banner preview from index.html');
} else {
    console.log('Could not find banner preview bounds in index.html', startIdx, endIdx);
}
