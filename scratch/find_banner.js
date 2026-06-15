const fs = require('fs'); 
const code = fs.readFileSync('index.html', 'utf8'); 
const lines = code.split(/\r?\n/); 
const start = lines.findIndex(l => l.includes('<div class="dashboard-banner-container"')); 
const end = lines.findIndex((l, i) => i > start && l.includes('<!-- Sık Kullanılanlar -->')); 
console.log(start, end);
