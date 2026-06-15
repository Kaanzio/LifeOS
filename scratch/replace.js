const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const startStr = '<div class="banner-stats-row">';
// Look backward from Sık Kullanılanlar to find the end of the banner wrapper properly.
// The end we want to replace up to is just before <!-- Sık Kullanılanlar -->
const endStr = '<!-- Sık Kullanılanlar -->';

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const newHtml = `                                    <div class="banner-stat-pills">
                                        <div class="stat-pill">
                                            <div class="stat-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                            </div>
                                            <div class="stat-details">
                                                <span class="stat-value counter-anim" id="activeTaskCount">0</span>
                                                <span class="stat-label">Aktif Görevler</span>
                                            </div>
                                        </div>
                                        <div class="stat-pill">
                                            <div class="stat-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                                            </div>
                                            <div class="stat-details">
                                                <span class="stat-value counter-anim" id="totalBooks">0</span>
                                                <span class="stat-label">Kitap</span>
                                            </div>
                                        </div>
                                        <div class="stat-pill">
                                            <div class="stat-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M3 7h4" /><path d="M3 12h4" /><path d="M3 17h4" /><path d="M17 7h4" /><path d="M17 12h4" /><path d="M17 17h4" /></svg>
                                            </div>
                                            <div class="stat-details">
                                                <span class="stat-value counter-anim" id="totalMovies">0</span>
                                                <span class="stat-label">Film/Dizi</span>
                                            </div>
                                        </div>
                                        <div class="stat-pill">
                                            <div class="stat-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                            </div>
                                            <div class="stat-details">
                                                <span class="stat-value counter-anim" id="totalStatsCombined">0</span>
                                                <span class="stat-label">Site</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sık Kullanılanlar -->`;
    
    code = code.substring(0, startIdx) + newHtml + code.substring(endIdx + endStr.length);
    fs.writeFileSync('index.html', code);
    console.log('Successfully replaced banner stats.');
} else {
    console.log('Failed to find markers', startIdx, endIdx);
}
