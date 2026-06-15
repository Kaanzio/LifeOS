const Shows = {
    shows: [],
    container: null,
    filterType: 'all',
    filterStatus: 'all',
    filterGenre: 'all',
    filterPlatform: 'all',
    searchQuery: '',

    formatDuration(minutes) {
        if (!minutes || minutes <= 0) return '0 dk';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h} sa ${m > 0 ? `${m} dk` : ''}`;
        return `${m} dk`;
    },

    // Türler
    types: [
        { id: 'dizi', name: 'Dizi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>' },
        { id: 'film', name: 'Film', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg>' },
        { id: 'anime', name: 'Anime', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' },
        { id: 'belgesel', name: 'Belgesel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>' }
    ],

    // Durum
    statuses: [
        { id: 'izleniyor', name: 'İzleniyor', color: '#3b82f6' },
        { id: 'tamamlandi', name: 'İzlendi', color: '#10b981' },
        { id: 'beklemede', name: 'Beklemede', color: '#f59e0b' },
        { id: 'birakildi', name: 'Bırakıldı', color: '#6b7280' }
    ],

    // Kategoriler
    genres: [
        { id: 'Aksiyon', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', color: '#ef4444' },
        { id: 'Komedi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>', color: '#f59e0b' },
        { id: 'Dram', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M3 13h18"/><path d="M12 7V3"/><path d="m8 7-2-4"/><path d="m16 7 2-4"/></svg>', color: '#3b82f6' },
        { id: 'Korku', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 22H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4"/><path d="M16 22h-3"/><path d="M18 10h-6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3"/><path d="M14 2h4a2 2 0 0 1 2 2v2"/><path d="M22 17v3a2 2 0 0 1-2 2h-1"/></svg>', color: '#7c3aed' },
        { id: 'Romantik', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>', color: '#7c3aed' },
        { id: 'Bilim Kurgu', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>', color: '#06b6d4' },
        { id: 'Fantastik', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M2 5h8"/></svg>', color: '#7c3aed' },
        { id: 'Gerilim', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', color: '#3b82f6' },
        { id: 'Animasyon', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>', color: '#f97316' },
        { id: 'Suç', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></svg>', color: '#6b7280' }
    ],

    // Streaming Platformları
    platforms: [
        { id: 'netflix', name: 'Netflix', icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#e50914" width="16" height="16"><path d="M5.398 0v24h4.729v-9.054l4.75 9.054h3.725V0h-4.729v9.066L9.123 0H5.398z"/></svg>', color: '#e50914' },
        { id: 'disney', name: 'Disney+', icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#113ccf" width="16" height="16"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm-.213 18.286c-2.88 0-4.97-1.89-4.97-4.5 0-2.61 2.09-4.5 4.97-4.5 2.88 0 4.97 1.89 4.97 4.5 0 2.61-2.09 4.5-4.97 4.5Zm0-7.875c-1.92 0-3.375 1.395-3.375 3.375S9.867 17.16 11.787 17.16s3.375-1.395 3.375-3.375-1.455-3.375-3.375-3.375ZM15.75 8.625h2.25v2.25h-2.25V8.625Z"/></svg>', color: '#113ccf' },
        { id: 'amazon', name: 'Prime Video', icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#00a8e1" width="16" height="16"><path d="M13.527 16.48c.168.083.376.074.522-.05.14-.124.095-.369-.158-.419-1.636-.31-4.225-1.424-5.51-2.826-.26-.285-.626-.146-.696.134-.12.446.547 1.373 1.68 2.191 1.132.818 2.871 1.05 4.162.97zM2.81 21.033c.068.512.454.92.936 1.051 4.5 1.217 9.4 1.205 13.9.011l.03-.008.318-.088c.45-.124.786-.531.815-.996a1.127 1.127 0 0 0-1.332-1.166 19.38 19.38 0 0 1-13.313 0 1.127 1.127 0 0 0-1.354 1.196zm17.584-6.076a5.552 5.552 0 0 0 1.944-1.157c.504-.447.456-1.026-.062-1.357-.492-.314-1.22-.164-1.748.16-.549.336-1.147.925-1.587 1.487-.247-.197-.502-.387-.775-.561 1.076-1.62 1.34-3.57 1.34-4.832 0-3.32-2.529-5.176-5.46-5.176-1.425 0-3.267.42-4.5 1.5.023-.746.035-1.268.035-1.47 0-.584-.23-1.031-.875-1.031-.594 0-1.22.375-1.22 1.277 0 .167.042 1.956.12 3.822-1.636.568-2.607 1.83-2.607 3.238 0 1.92 1.621 3.511 4.298 3.511.905 0 2.22-.178 3.018-.558l.199 1.41c.071.503.486.683.847.683.626 0 1.056-.47 1.056-1.131 0-.916-.539-2.396-1.472-3.793 1.228.67 2.76 1.056 4.248 1.056 1.045 0 2.05-.224 2.822-.683l.03-.018zM9.896 5.378c.844-.925 2.11-1.32 3.14-1.32 2.373 0 3.737 1.468 3.737 3.792 0 1.258-.423 2.978-1.492 4.414-.647.868-1.517 1.622-2.585 2.152-.08-1.85-.16-3.864-.176-4.665-.018-.86.299-1.383 1.096-1.383.568 0 .86.342.86.85 0 .284-.11.758-.293 1.332-.246.772-.518 1.42-.518 2.025 0 .736.378 1.22 1.08 1.22.695 0 1.488-.387 1.95-1.086.626-.946.88-2.072.88-3.07 0-2.365-1.62-4.37-4.22-4.37-2.338 0-4.35 1.631-4.35 4.35 0 .848.196 1.896.792 2.719z"/></svg>', color: '#00a8e1' },
        { id: 'blutv', name: 'HBO Max', icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#7401ff" width="16" height="16"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm3.75 18h-1.5v-2.25h-3V18h-1.5v-6h1.5v2.25h3V12h1.5v6Zm-6.75 0H7.5v-6h3c1.243 0 2.25 1.007 2.25 2.25v1.5c0 1.243-1.007 2.25-2.25 2.25Zm4.5-3.75h-1.5v-1.5h1.5a.75.75 0 0 1 0 1.5Zm3.75 3.75h-1.5v-6h1.5v6Zm3 0h-1.5v-6H21v6Z"/></svg>', color: '#7401ff' },
        { id: 'exxen', name: 'Exxen', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f7b500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6"/><path d="m21 13-9 5-9-5"/></svg>', color: '#f7b500' },
        { id: 'gain', name: 'Gain', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>', color: '#00b341' },
        { id: 'mubi', name: 'MUBI', icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#38bdf8" width="16" height="16"><path d="M0 7.377h4.92v9.245h-4.92V7.377Zm19.08 0h4.92v9.245h-4.92V7.377ZM6.36 7.377h4.92v9.245h-4.92V7.377Zm6.36 0h4.92v9.245h-4.92V7.377Z"/></svg>', color: '#38bdf8' },
        { id: 'youtube', name: 'YouTube', icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ff0000" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>', color: '#ff0000' },
        { id: 'other', name: 'Diğer', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg>', color: '#6b7280' }
    ],

    init() {
        this.container = document.getElementById('showsGrid');
        this.loadShows();
        this.bindEvents();
        this.renderToolbarUI();
        this.render();
    },

    renderToolbarUI() {
        const toolbar = document.getElementById('showsToolbar');
        if (toolbar) {
            toolbar.innerHTML = this.renderToolbar();
        }
    },

    bindEvents() {
        document.getElementById('addShowBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });
    },

    loadShows() {
        this.shows = Storage.load('lifeos_shows', []);
    },

    saveShows() {
        Storage.save('lifeos_shows', this.shows);
    },

    /**
     * Yeni dizi/film ekle
     */
    add(showData) {
        const show = {
            id: Storage.generateId(),
            title: showData.title,
            type: showData.type || 'dizi',
            genre: showData.genre || 'Dram',
            status: showData.status || 'beklemede',
            rating: parseFloat(showData.rating) || 0,
            year: parseInt(showData.year) || new Date().getFullYear(),
            currentEpisode: parseInt(showData.currentEpisode) || 0,
            totalEpisodes: parseInt(showData.totalEpisodes) || 1,
            currentSeason: parseInt(showData.currentSeason) || 1,
            totalSeasons: parseInt(showData.totalSeasons) || 1,
            platform: showData.platform || '',
            notes: showData.notes || '',
            poster: showData.poster || '',
            watchedMinutes: parseInt(showData.watchedMinutes) || 0,
            totalMinutes: parseInt(showData.totalMinutes) || 120,
            seasonEpisodes: showData.seasonEpisodes || [parseInt(showData.totalEpisodes) || 1],
            createdAt: new Date().toISOString()
        };

        this.shows.push(show);
        this.saveShows();
        this.render();

        return show;
    },

    /**
     * Güncelle
     */
    update(id, updates) {
        const show = this.shows.find(s => s.id === id);
        if (show) {
            Object.assign(show, updates);
            this.saveShows();
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
        }
    },

    nextStatus(id) {
        // Obsolete, replaced by showStatusSelection
    },

    showStatusSelection(id) {
        const show = this.shows.find(s => s.id === id);
        const statusArea = document.getElementById('status-selection-area');
        if (!show || !statusArea) return;

        statusArea.innerHTML = `
            <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
                Durum Seçin
                <span onclick="event.stopPropagation(); Shows.showInfoModal('${id}')" style="cursor: pointer; text-transform: none; color: var(--accent-purple); border-bottom: 1px solid;">Vazgeç</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${this.statuses.map(s => `
                    <div onclick="event.stopPropagation(); Shows.update('${id}', {status: '${s.id}'}); Shows.showInfoModal('${id}')" 
                         style="padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid ${show.status === s.id ? s.color : 'var(--border-color)'}; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;"
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'"
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></div>
                        <span style="font-weight: 600; color: ${show.status === s.id ? s.color : 'var(--text-primary)'}; font-size: 14px;">${s.name}</span>
                        ${show.status === s.id ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; color: ' + s.color + '"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Sil
     */
    remove(id) {
        this.shows = this.shows.filter(s => s.id !== id);
        this.saveShows();
        this.render();
        if (typeof Dashboard !== 'undefined') Dashboard.render();
        Notifications.add('Silindi', 'İçerik başarıyla kaldırıldı.', 'info', true);
    },

    /**
     * Bölüm ilerlet
     */
    nextEpisode(id) {
        const show = this.shows.find(s => s.id === id);
        if (!show) return;

        const currentTotal = show.seasonEpisodes ? show.seasonEpisodes[show.currentSeason - 1] : show.totalEpisodes;

        if (show.currentEpisode < currentTotal) {
            show.currentEpisode++;
            this.saveShows();
            this.render();
        } else if (show.currentSeason < show.totalSeasons) {
            // Next season
            show.currentSeason++;
            show.currentEpisode = 1;
            show.totalEpisodes = show.seasonEpisodes ? show.seasonEpisodes[show.currentSeason - 1] : show.totalEpisodes;
            this.saveShows();
            this.render();
            Notifications.add('Yeni Sezon!', `"${show.title}" Sezon ${show.currentSeason} başladı.`, 'success', true);
        } else {
            // Completed
            show.status = 'tamamlandi';
            Notifications.add('Tebrikler! 🎉', `"${show.title}" izlendi!`, 'success', true);
            this.saveShows();
            this.render();
        }
    },

    /**
     * Filtrelenmiş liste
     */
    getFiltered() {
        return this.shows.filter(s => {
            const typeMatch = this.filterType === 'all' || s.type === this.filterType;
            const statusMatch = this.filterStatus === 'all' || s.status === this.filterStatus;
            const genreMatch = this.filterGenre === 'all' || s.genre === this.filterGenre;
            const platformMatch = this.filterPlatform === 'all' || s.platform === this.filterPlatform;
            const searchMatch = !this.searchQuery ||
                s.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (s.genre && s.genre.toLowerCase().includes(this.searchQuery.toLowerCase()));
            return typeMatch && statusMatch && genreMatch && platformMatch && searchMatch;
        });
    },

    formatStatGroup(shows) {
        if (shows.length === 0) return '0';
        const counts = {};
        shows.forEach(s => {
            const name = this.types.find(t => t.id === s.type)?.name || 'Diğer';
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => `${count} ${name}`)
            .join(', ');
    },

    /**
     * İstatistikler
     */
    getStats() {
        const watching = this.shows.filter(s => s.status === 'izleniyor');
        const completed = this.shows.filter(s => s.status === 'tamamlandi');

        return {
            total: this.formatStatGroup(this.shows),
            watching: this.formatStatGroup(watching),
            completed: this.formatStatGroup(completed)
        };
    },

    /**
     * Modal ekle/düzenle
     */
    showAddModal(editShow = null) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const isEdit = editShow !== null;

        modalTitle.textContent = isEdit ? 'Düzenle' : 'Dizi / Film Ekle';
        modalBody.innerHTML = `
            <form id="showForm">
                <div class="form-group">
                    <label class="form-label">Başlık *</label>
                    <input type="text" class="form-input" name="title" required 
                           placeholder="Örn: Breaking Bad" value="${isEdit ? editShow.title : ''}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tür</label>
                        <select class="form-select" name="type">
                            ${this.types.map(t => `
                                <option value="${t.id}" ${isEdit && editShow.type === t.id ? 'selected' : ''}>
                                    ${t.icon} ${t.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kategori</label>
                        <select class="form-select" name="genre">
                            ${this.genres.map(g => `
                                <option value="${g.id}" ${isEdit && editShow.genre === g.id ? 'selected' : ''}>${g.id}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Durum</label>
                        <select class="form-select" name="status">
                            ${this.statuses.map(s => `
                                <option value="${s.id}" ${isEdit && editShow.status === s.id ? 'selected' : ''}>
                                    ${s.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Yıl</label>
                        <input type="number" class="form-input" name="year" 
                               value="${isEdit ? editShow.year : new Date().getFullYear()}" min="1900" max="2100">
                    </div>
                </div>

                    <div id="movieProgressContainer" style="display: none; margin-bottom: 15px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">İzlenen Süre</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="number" class="form-input" name="watchedH" placeholder="Saat" 
                                           value="${isEdit ? Math.floor(editShow.watchedMinutes / 60) : 0}" style="width: 80px;">
                                    <span>sa</span>
                                    <input type="number" class="form-input" name="watchedM" placeholder="Dakika" 
                                           value="${isEdit ? editShow.watchedMinutes % 60 : 0}" style="width: 80px;">
                                    <span>dk</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Toplam Süre</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="number" class="form-input" name="totalH" placeholder="Saat" 
                                           value="${isEdit ? Math.floor(editShow.totalMinutes / 60) : 2}" style="width: 80px;">
                                    <span>sa</span>
                                    <input type="number" class="form-input" name="totalM" placeholder="Dakika" 
                                           value="${isEdit ? editShow.totalMinutes % 60 : 0}" style="width: 80px;">
                                    <span>dk</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="seasonProgressContainer">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Sezon Sayısı</label>
                                <input type="number" class="form-input" name="totalSeasons" id="totalSeasonsInput" min="1" 
                                       value="${isEdit ? editShow.totalSeasons : 1}">
                            </div>
                        </div>

                        <div id="seasonEpisodesContainer" style="margin-bottom: 15px; border-left: 3px solid var(--accent-color); padding-left: 12px;">
                            <!-- Sezon bölüm sayıları buraya gelecek -->
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Şu Anki Sezon / Bölüm</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="number" class="form-input" name="currentSeason" min="1" 
                                           value="${isEdit ? editShow.currentSeason : 1}" style="width: 70px;">
                                    <span>/</span>
                                    <input type="number" class="form-input" name="currentEpisode" min="0" 
                                           value="${isEdit ? editShow.currentEpisode : 0}" style="width: 70px;">
                                </div>
                            </div>
                        </div>
                    </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">IMDb Puanı (0-10)</label>
                        <input type="number" class="form-input" name="rating" min="0" max="10" step="0.1"
                               value="${isEdit ? editShow.rating : 0}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Platform</label>
                        <select class="form-select" name="platform">
                            ${this.platforms.map(p => `
                                <option value="${p.id}" ${isEdit && editShow.platform === p.id ? 'selected' : ''}>
                                    ${p.icon} ${p.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Notlar</label>
                    <textarea class="form-textarea" name="notes" 
                              placeholder="Notlarınız...">${isEdit ? editShow.notes || '' : ''}</textarea>
                </div>

                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Güncelle' : 'Ekle'}</button>
                </div>
            </form>
        `;

        App.openModal();

        const seasonContainer = document.getElementById('seasonEpisodesContainer');
        const seasonsInput = document.getElementById('totalSeasonsInput');
        const typeSelect = document.querySelector('select[name="type"]');

        const updateSeasonInputs = () => {
            const count = parseInt(seasonsInput.value) || 1;
            const isMovie = typeSelect.value === 'film';
            const movieContainer = document.getElementById('movieProgressContainer');
            const seasonProgContainer = document.getElementById('seasonProgressContainer');

            if (isMovie) {
                movieContainer.style.display = 'block';
                seasonProgContainer.style.display = 'none';
                seasonContainer.innerHTML = '';
                return;
            }

            movieContainer.style.display = 'none';
            seasonProgContainer.style.display = 'block';
            seasonContainer.style.display = 'block';
            let html = '<label class="form-label" style="font-size: 11px; margin-bottom: 8px; color: var(--text-secondary);">Sezonluk Bölüm Sayıları:</label>';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px;">';

            for (let i = 1; i <= count; i++) {
                const val = (isEdit && editShow.seasonEpisodes && editShow.seasonEpisodes[i - 1]) ? editShow.seasonEpisodes[i - 1] : 10;
                html += `
                    <div class="form-group" style="margin-bottom: 0;">
                        <span style="font-size: 10px; display: block; text-align: center; margin-bottom: 2px;">S${i}</span>
                        <input type="number" class="form-input season-ep-count" data-season="${i}" value="${val}" min="1" style="padding: 4px; text-align: center;">
                    </div>
                `;
            }
            html += '</div>';
            seasonContainer.innerHTML = html;
        };

        seasonsInput.addEventListener('input', updateSeasonInputs);
        typeSelect.addEventListener('change', updateSeasonInputs);
        updateSeasonInputs();

        document.getElementById('showForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const seasonEpisodes = Array.from(document.querySelectorAll('.season-ep-count')).map(input => parseInt(input.value) || 1);
            const currentSeason = parseInt(formData.get('currentSeason')) || 1;

            const watchedH = parseInt(formData.get('watchedH')) || 0;
            const watchedM = parseInt(formData.get('watchedM')) || 0;
            const totalH = parseInt(formData.get('totalH')) || 0;
            const totalM = parseInt(formData.get('totalM')) || 0;

            const data = {
                title: formData.get('title'),
                type: formData.get('type'),
                genre: formData.get('genre'),
                status: formData.get('status'),
                year: formData.get('year'),
                currentSeason: currentSeason,
                totalSeasons: parseInt(formData.get('totalSeasons')) || 1,
                currentEpisode: parseInt(formData.get('currentEpisode')) || 0,
                totalEpisodes: (formData.get('type') === 'film') ? 1 : (seasonEpisodes[currentSeason - 1] || 1),
                watchedMinutes: (watchedH * 60) + watchedM,
                totalMinutes: (totalH * 60) + totalM,
                seasonEpisodes: seasonEpisodes,
                rating: formData.get('rating'),
                platform: formData.get('platform'),
                notes: formData.get('notes')
            };

            if (isEdit) {
                this.update(editShow.id, data);
            } else {
                this.add(data);
            }
            App.closeModal();
        });
    },

    /**
     * Render
     */
    render() {
        this.container = document.getElementById('showsGrid');
        const stats = this.getStats();

        const statTotal = document.getElementById('showStatTotal');
        const statWatching = document.getElementById('showStatWatching');
        const statCompleted = document.getElementById('showStatCompleted');

        // Update stat labels if they exist
        const statLabels = document.querySelectorAll('#page-shows .stats-card-label, #page-shows .stat-label');
        statLabels.forEach(label => {
            if (label && (label.textContent === 'Tamamlandı' || label.textContent === 'Tamamlanan')) {
                label.textContent = 'İzlendi';
            }
            if (label && (label.textContent === 'Toplam' || label.textContent === 'Dizi & Film')) {
                label.textContent = 'Toplam İçerik';
            }
        });

        if (statTotal) statTotal.textContent = stats.total;
        if (statWatching) statWatching.textContent = stats.watching;
        if (statCompleted) statCompleted.textContent = stats.completed;

        if (!this.container) return;

        const filtered = this.getFiltered();

        if (this.shows.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state-large">
                    <span class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg></span>
                    <h3>Henüz dizi veya film eklenmedi</h3>
                    <p>İzlediğiniz veya izlemek istediğiniz yapımları ekleyin</p>
                </div>
            `;
        } else if (filtered.length === 0) {
            this.container.innerHTML = `<div class="empty-state" style="text-align: center; padding: 48px;">Bu filtreyle eşleşen içerik yok</div>`;
        } else {
            this.container.innerHTML = this.renderGridView(filtered);
        }

        // Live update of result count
        const countEl = document.querySelector('#showsToolbar .toolbar-result-count');
        if (countEl) countEl.textContent = `${filtered.length} Dizi / Film listeleniyor`;
    },


    renderToolbar() {
        const typeChips = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>' },
            ...this.types.map(t => ({ id: t.id, label: t.name, icon: t.icon }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterType === cat.id ? 'active' : ''}" 
                 onclick="Shows.setCategory('${cat.id}')">
                <span class="chip-icon">${cat.icon}</span>
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const statusChips = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>' },
            ...this.statuses.map(s => ({ id: s.id, label: s.name, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>' }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterStatus === cat.id ? 'active' : ''}" 
                 onclick="Shows.setStatus('${cat.id}')">
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const genreChips = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
            ...this.genres.map(g => ({ id: g.id, label: g.id, icon: g.icon, color: g.color }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterGenre === cat.id ? 'active' : ''}" 
                 onclick="Shows.setGenre('${cat.id}')">
                ${this.filterGenre === cat.id ? `<span class="chip-icon">${cat.icon}</span>` : ''}
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const genericPlatformIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';

        const platformChips = [
            { id: 'all', label: 'Tümü' },
            ...this.platforms.map(p => ({ id: p.id, label: p.name }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterPlatform === cat.id ? 'active' : ''}" 
                 onclick="Shows.setPlatform('${cat.id}')">
                ${this.filterPlatform === cat.id ? `<span class="chip-icon">${genericPlatformIcon}</span>` : ''}
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const activeType = this.types.find(t => t.id === this.filterType) || { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>', name: 'Tümü' };

        const typeLabel = this.filterType === 'all' ? 'Tümü' : activeType.name;
        const statusLabel = this.filterStatus === 'all' ? 'Tüm Durumlar' : (this.statuses.find(s => s.id === this.filterStatus)?.name || 'Durum');
        const genreLabel = this.filterGenre === 'all' ? 'Tüm Türler' : this.filterGenre;
        const platformLabel = this.filterPlatform === 'all' ? 'Tüm Platformlar' : (this.platforms.find(p => p.id === this.filterPlatform)?.name || 'Platform');

        return `
            <div class="lesson-filter-container-modern">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" class="filter-search-input-modern" placeholder="🔍 Dizi veya film ara..." 
                               value="${this.searchQuery}"
                               oninput="Shows.setSearchQuery(this.value)">
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon">${activeType.icon}</span> 
                            <span class="chip-label">${typeLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${typeChips}
                        </div>
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg></span> 
                            <span class="chip-label">${statusLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${statusChips}
                        </div>
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" x2="7.01" y1="7" y2="7"/></svg></span> 
                            <span class="chip-label">${genreLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${genreChips}
                        </div>
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon">${genericPlatformIcon}</span>
                            <span class="chip-label">${platformLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${platformChips}
                        </div>
                    </div>
                </div>

                <div class="lesson-toolbar-actions">
                    <span class="toolbar-result-count">${this.getFiltered().length} İçerik listeleniyor</span>
                    <button class="btn btn-primary btn-sm" onclick="Shows.showAddModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> Yeni Ekle
                    </button>
                </div>
            </div>
        `;
    },

    setSearchQuery(query) {
        this.searchQuery = query;
        this.render();
    },

    setCategory(type) {
        this.filterType = type;
        this.renderToolbarUI();
        this.render();
    },

    setStatus(status) {
        this.filterStatus = status;
        this.renderToolbarUI();
        this.render();
    },

    setGenre(genre) {
        this.filterGenre = genre;
        this.renderToolbarUI();
        this.render();
    },

    setPlatform(platform) {
        this.filterPlatform = platform;
        this.renderToolbarUI();
        this.render();
    },

    /**
     * Grid View Render
     */
    renderGridView(shows) {
        let html = '';
        shows.forEach(show => {
            html += this.renderCard(show);
        });
        return html;
    },

    /**
     * Kart render
     */
    renderCard(show) {
        const typeInfo = this.types.find(t => t.id === show.type) || { icon: '📺', name: 'Dizi' };
        const statusInfo = this.statuses.find(s => s.id === show.status) || { color: '#6b7280', name: 'Beklemede' };
        const platformInfo = this.platforms.find(p => p.id === show.platform) || this.platforms.find(p => p.id === 'other');
        let progress = show.type === 'film'
            ? (show.totalMinutes > 0 ? Math.round((show.watchedMinutes / show.totalMinutes) * 100) : 0)
            : (show.totalEpisodes > 0 ? Math.round((show.currentEpisode / show.totalEpisodes) * 100) : 0);

        if (show.status === 'tamamlandi') progress = 100;

        return `
            <div class="show-card modern-card" onclick="Shows.showInfoModal('${show.id}')" 
                 style="background: transparent; 
                        border-radius: 24px; 
                        padding: 24px; 
                        border: 1px solid var(--border-color); 
                        display: flex; 
                        flex-direction: column; 
                        cursor: pointer; 
                        position: relative; 
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);">
                
                <!-- Background Layer (Clipped) -->
                <div style="position: absolute; inset: 0; border-radius: 24px; overflow: hidden; z-index: 0; background: linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);">
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 50%); pointer-events: none;"></div>
                </div>

                <div style="position: relative; z-index: 1;">
                    <!-- Rating Badge (Hanging - No Background) -->
                    <div style="position: absolute; top: -10px; right: -10px; display: flex; align-items: center; gap: 6px; padding: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 5px rgba(245,158,11,0.6));">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span style="font-weight: 800; font-size: 13px; color: var(--warning); filter: drop-shadow(0 0 3px rgba(245,158,11,0.4));">${show.rating > 0 ? show.rating : '-'}</span>
                    </div>
                    
                    <!-- 2. Title at the top (Heading) -->
                    <h4 style="margin-bottom: 8px; font-size: 18px; font-weight: 800; padding-right: 60px; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1.3;">${show.title}</h4>

                    <!-- 3. Platform below the title (Replacing the old icon/status row) -->
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
                        ${platformInfo ? `<span style="font-size: 10px; padding: 4px 10px; background: ${platformInfo.color}15; color: ${platformInfo.color}; border-radius: 8px; font-weight: 700; border: 1px solid ${platformInfo.color}20; text-transform: uppercase; letter-spacing: 0.5px;">${platformInfo.name}</span>` : ''}
                    </div>
                    
                    <!-- Meta row with Status Badge on the far right of year -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                            <span style="background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 8px; font-size: 11px; color: var(--text-secondary); font-weight: 600;">
                                ${show.type === 'film' ? this.formatDuration(show.totalMinutes) : `${show.totalSeasons} Sezon • ${show.type !== 'film' && show.seasonEpisodes ? show.seasonEpisodes.reduce((a, b) => a + b, 0) : show.totalEpisodes} Bölüm`}
                            </span>
                            <span style="background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 8px; font-size: 11px; color: var(--text-secondary); font-weight: 600;">${show.genre}</span>
                            <span style="color: var(--text-muted); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 5px; margin-left: 4px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                ${show.year}
                            </span>
                        </div>
                    </div>

                    <div style="margin-bottom: 4px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                            <span style="color: ${statusInfo.color};">${statusInfo.name}</span>
                            <span style="font-weight: 800; color: ${statusInfo.color};">${progress}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">
                            <div style="height: 100%; width: ${progress}%; background: ${statusInfo.color}; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${statusInfo.color}66;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    showInfoModal(id) {
        const show = this.shows.find(s => s.id === id);
        if (!show) return;

        const typeInfo = this.types.find(t => t.id === show.type) || { icon: '📺', name: 'Dizi' };
        const statusInfo = this.statuses.find(s => s.id === show.status) || { color: '#6b7280', name: 'Beklemede' };
        const platformInfo = this.platforms.find(p => p.id === show.platform) || this.platforms.find(p => p.id === 'other');
        let progress = show.type === 'film'
            ? (show.totalMinutes > 0 ? Math.round((show.watchedMinutes / show.totalMinutes) * 100) : 0)
            : (show.totalEpisodes > 0 ? Math.round((show.currentEpisode / show.totalEpisodes) * 100) : 0);

        if (show.status === 'tamamlandi') progress = 100;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'İçerik Detayları';

        const totalEpisodesSum = show.type !== 'film' && show.seasonEpisodes ? show.seasonEpisodes.reduce((a, b) => a + b, 0) : show.totalEpisodes;
        const subtitleText = show.type === 'film'
            ? `${this.formatDuration(show.totalMinutes)}`
            : `${show.totalSeasons} Sezon • ${totalEpisodesSum} Bölüm`;

        modalBody.innerHTML = `
            <div class="lesson-info-modal-modern">
                
                <!-- Header with Icon & Title (Bento Style like Books) -->
                <div class="info-header-bento" style="margin-bottom: 30px;">
                    <div class="info-icon-box" style="background: ${statusInfo.color}15; color: ${statusInfo.color}">
                        ${typeInfo.icon.replace(/width="16"/g, 'width="32"').replace(/height="16"/g, 'height="32"')}
                    </div>
                    <div class="info-title-box" style="padding-top: 4px;">
                        <h2 class="info-lesson-name" style="font-size: 28px; margin-bottom: 8px;">${show.title}</h2>
                        <div style="color: var(--text-secondary); font-size: 15px; font-weight: 500;">${subtitleText}</div>
                    </div>
                    <div style="text-align: right; margin-left: auto;">
                        <div style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 8px 16px; border-radius: 16px; font-weight: 800; font-size: 16px; border: 1px solid rgba(245, 158, 11, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; gap: 6px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${show.rating}/10
                        </div>
                    </div>
                </div>

                <!-- Bento Grid Info -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px;">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Platform</div>
                        <div style="font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                             <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${platformInfo.color};"></span>
                             ${platformInfo.name}
                        </div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px;">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Çıkış Yılı</div>
                        <div style="font-weight: 700; font-size: 15px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${show.year}
                        </div>
                    </div>
                    <div id="status-selection-area" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s;" 
                         onclick="Shows.showStatusSelection('${show.id}');"
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.06)'"
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'"
                         title="Durumu değiştirmek için tıkla">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Durum</div>
                        <div style="font-weight: 700; font-size: 15px; color: ${statusInfo.color}; display: flex; align-items: center; justify-content: space-between;">
                            ${statusInfo.name}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px;">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Kategori</div>
                        <div style="font-weight: 700; font-size: 15px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                            ${show.genre}
                        </div>
                    </div>
                </div>

                ${show.type !== 'film' ? `
                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; padding: 0 4px;">
                            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">İlerleme Durumu</h3>
                            <span style="font-size: 14px; font-weight: 800; color: ${statusInfo.color};">%${progress}</span>
                        </div>
                        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); padding: 24px; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 15px;">
                                <span style="font-weight: 700; color: var(--text-primary);">Sezon ${show.currentSeason} <span style="color: var(--text-muted); font-weight: 500;">/ ${show.totalSeasons}</span></span>
                                <span style="font-weight: 700; color: var(--text-primary);">Bölüm ${show.currentEpisode} <span style="color: var(--text-muted); font-weight: 500;">/ ${show.totalEpisodes}</span></span>
                            </div>
                            <div style="height: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow: hidden; margin-bottom: 20px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);">
                                <div style="height: 100%; width: ${progress}%; background: ${statusInfo.color}; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${statusInfo.color}66;"></div>
                            </div>
                            ${show.status === 'izleniyor' ? `
                                <button class="btn btn-primary" style="width: 100%; height: 48px; font-size: 15px; font-weight: 700; border-radius: 14px;" onclick="App.closeModal(); Shows.nextEpisode('${show.id}'); setTimeout(() => Shows.showInfoModal('${show.id}'), 100);">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M8 5v14l11-7z"/></svg> Sonraki Bölümü Tamamla
                                </button>
                            ` : ''}
                        </div>
                    </div>
                ` : `
                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; padding: 0 4px;">
                            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">İlerleme Durumu</h3>
                            <span style="font-size: 14px; font-weight: 800; color: ${statusInfo.color};">%${progress}</span>
                        </div>
                        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); padding: 24px; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                            <div style="height: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);">
                                <div style="height: 100%; width: ${progress}%; background: ${statusInfo.color}; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${statusInfo.color}66;"></div>
                            </div>
                        </div>
                    </div>
                `}

                ${show.notes ? `
                    <div style="margin-bottom: 30px;">
                        <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 12px; padding: 0 4px;">Notlar</h3>
                        <div style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 20px; font-size: 15px; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap; border: 1px solid var(--border-color);">${show.notes}</div>
                    </div>
                ` : ''}

                <div class="modal-footer-modern" style="padding-top: 24px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button class="btn btn-danger-soft" onclick="Notifications.confirm('İçeriği Sil', '<b>${show.title.replace(/'/g, "\\'")}</b> silinecektir. Onaylıyor musunuz?', () => { Shows.remove('${show.id}'); App.closeModal(); }, 'Evet, Sil')" style="margin-right: auto; border-radius: 12px; padding: 0 20px; height: 44px; font-weight: 700;">Kaldır</button>
                    <button class="btn btn-secondary" onclick="App.closeModal(); Shows.showAddModal(Shows.shows.find(s => s.id === '${show.id}'));" style="border-radius: 12px; padding: 0 20px; height: 44px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Düzenle
                    </button>
                    <button class="btn btn-primary" onclick="App.closeModal()" style="border-radius: 12px; padding: 0 24px; height: 44px; font-weight: 700;">Kapat</button>
                </div>
            </div>
        `;

        App.openModal();
    }
};

window.Shows = Shows;
