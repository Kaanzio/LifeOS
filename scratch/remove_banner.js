const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const lines = code.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('<!-- Banner Section -->'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('<!-- Sık Kullanılanlar -->'));

if (startIdx !== -1 && endIdx !== -1) {
    // Remove lines from startIdx to endIdx - 1
    lines.splice(startIdx, endIdx - startIdx);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log('Removed banner from index.html');
} else {
    console.log('Could not find banner bounds in index.html', startIdx, endIdx);
}
