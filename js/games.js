/**
 * Life OS - Games Module v2
 * Oyun takibi yönetimi - Mağaza kategorileri ve liste görünümü
 */

const Games = {
    games: [],
    container: null,
    viewMode: 'grid', // grid veya list
    filterStore: 'all',
    filterStatus: 'all',
    filterGenre: 'all',
    searchQuery: '',

    statuses: [
        { id: 'toPlay', name: 'Oynanacak', color: '#7c3aed' },
        { id: 'playing', name: 'Oynanıyor', color: '#3b82f6' },
        { id: 'completed', name: 'Bitirildi', color: '#10b981' },
        { id: 'dropped', name: 'Bırakıldı', color: '#ef4444' }
    ],

    stores: [
        { id: 'steam', name: 'Steam', color: '#66c0f4' },
        { id: 'epic', name: 'Epic Games', color: '#ffffff' },
        { id: 'ubisoft', name: 'Ubisoft', color: '#bf94ff' },
        { id: 'xbox', name: 'Xbox', color: '#107c10' },
        { id: 'amazon', name: 'Amazon', color: '#ff9900' },
        { id: 'gog', name: 'GOG', color: '#bf3efc' },
        { id: 'ps', name: 'PlayStation', color: '#003087' },
        { id: 'nintendo', name: 'Nintendo', color: '#e60012' },
        { id: 'other', name: 'Diğer', color: '#fbcfe8' }
    ],


    genres: [
        { id: 'RPG', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/></svg>' },
        { id: 'Aksiyon', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>' },
        { id: 'Macera', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>' },
        { id: 'Strateji', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-6-7-6 7-2-7z"/></svg>' },
        { id: 'Spor', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' },
        { id: 'FPS', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
        { id: 'Simülasyon', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>' },
        { id: 'Indie', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1"/><line x1="10" x2="10" y1="1"/><line x1="14" x2="14" y1="1"/></svg>' },
        { id: 'Genel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/></svg>' }
    ],

    init() {
        this.container = document.getElementById('gamesGrid');
        this.loadGames();
        this.bindEvents();
        this.renderToolbarUI();
        this.render();
    },

    renderToolbarUI() {
        const toolbarRegion = document.getElementById('gamesToolbar');
        if (toolbarRegion) {
            toolbarRegion.innerHTML = this.renderToolbar();
        }
    },

    bindEvents() {
        document.getElementById('addGameBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });
    },

    loadGames() {
        this.games = Storage.load('lifeos_games', []);
        let migrated = false;
        this.games.forEach(g => {
            if (g.store === 'origin') {
                g.store = 'amazon';
                migrated = true;
            }
        });
        if (migrated) this.saveGames();
    },

    saveGames() {
        Storage.save('lifeos_games', this.games);
    },

    add(gameData) {
        const game = {
            id: Storage.generateId(),
            title: gameData.title,
            store: gameData.store || 'steam',
            platform: gameData.platform || 'PC',
            genre: gameData.genre || 'Genel',
            icon: gameData.icon || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>',
            status: gameData.status || 'toPlay',
            rating: parseInt(gameData.rating) || 0,
            hoursPlayed: 0,
            notes: gameData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.games.push(game);
        this.saveGames();
        this.render();
        Dashboard.render();

        Notifications.add('Yeni Oyun Eklendi', `"${game.title}" oyun listenize eklendi.`, 'success', true);
        return game;
    },

    update(id, updates) {
        const game = this.games.find(g => g.id === id);
        if (game) {
            const wasNotCompleted = game.status !== 'completed';
            Object.assign(game, updates, { updatedAt: new Date().toISOString() });

            if (game.status === 'completed' && wasNotCompleted) {
                Notifications.add('Tebrikler! 🎮', `"${game.title}" oyununu bitirdiniz!`, 'success', true);
            }

            this.saveGames();
            this.render();
            Dashboard.render();
        }
    },

    nextStatus(id) {
        // Obsolete, replaced by showStatusSelection
    },

    showStatusSelection(id) {
        const game = this.games.find(g => g.id === id);
        const statusArea = document.getElementById('status-selection-area');
        if (!game || !statusArea) return;

        statusArea.innerHTML = `
            <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
                Durum Seçin
                <span onclick="event.stopPropagation(); Games.showInfoModal('${id}')" style="cursor: pointer; text-transform: none; color: var(--accent-purple); border-bottom: 1px solid;">Vazgeç</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${this.statuses.map(s => `
                    <div onclick="event.stopPropagation(); Games.update('${id}', {status: '${s.id}'}); Games.showInfoModal('${id}')" 
                         style="padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid ${game.status === s.id ? s.color : 'var(--border-color)'}; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;"
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'"
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></div>
                        <span style="font-weight: 600; color: ${game.status === s.id ? s.color : 'var(--text-primary)'}; font-size: 14px;">${s.name}</span>
                        ${game.status === s.id ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; color: ' + s.color + '"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    remove(id) {
        this.games = this.games.filter(g => g.id !== id);
        this.saveGames();
        this.render();
        Dashboard.render();
    },

    getStats() {
        return {
            total: this.games.length,
            playing: this.games.filter(g => g.status === 'playing').length,
            completed: this.games.filter(g => g.status === 'completed').length
        };
    },

    getFilteredGames() {
        return this.games.filter(g => {
            const storeMatch = this.filterStore === 'all' || g.store === this.filterStore;
            const statusMatch = this.filterStatus === 'all' || g.status === this.filterStatus;
            const genreMatch = this.filterGenre === 'all' || g.genre === this.filterGenre;
            const searchMatch = !this.searchQuery || g.title.toLowerCase().includes(this.searchQuery.toLowerCase());
            return storeMatch && statusMatch && genreMatch && searchMatch;
        }).sort((a, b) => a.title.localeCompare(b.title, 'tr-TR'));
    },

    render() {
        const stats = this.getStats();

        // Update stat labels if they exist
        const statLabels = document.querySelectorAll('#page-games .stats-card-label, #page-games .stat-label');
        statLabels.forEach(label => {
            if (label && (label.textContent === 'Tamamlandı' || label.textContent === 'Tamamlanan')) {
                label.textContent = 'Bitirildi';
            }
        });

        if (document.getElementById('gameStatTotal')) document.getElementById('gameStatTotal').textContent = stats.total;
        if (document.getElementById('gameStatPlaying')) document.getElementById('gameStatPlaying').textContent = stats.playing;
        if (document.getElementById('gameStatCompleted')) document.getElementById('gameStatCompleted').textContent = stats.completed;

        const filteredGames = this.getFilteredGames();
        this.container = document.getElementById('gamesGrid');
        if (!this.container) return;

        if (this.games.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state-large">
                    <span class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><circle cx="15" cy="13" r="1"></circle><circle cx="18" cy="11" r="1"></circle><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
                    </span>
                    <h3>Henüz oyun eklenmedi</h3>
                    <p>Oynadığınız veya oynamak istediğiniz oyunları ekleyin</p>
                </div>
            `;
        } else if (filteredGames.length === 0) {
            this.container.innerHTML = `<p class="empty-state" style="grid-column: 1/-1;">Bu filtreyle eşleşen oyun yok</p>`;
        } else {
            let htmlContent = '';
            if (this.viewMode === 'list') {
                htmlContent = this.renderListView(filteredGames);
            } else {
                htmlContent = this.renderGridView(filteredGames);
            }
            this.container.innerHTML = htmlContent;
        }

        this.bindCardEvents();

        const countEl = document.querySelector('#gamesToolbar .toolbar-result-count');
        if (countEl) countEl.textContent = `${filteredGames.length} Oyun listeleniyor`;
    },

    renderToolbar() {
        const storeChips = [
            { id: 'all', label: 'Tümü', icon: '🏪' },
            ...this.stores.map(s => ({ id: s.id, label: s.name, color: s.color }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterStore === cat.id ? 'active' : ''}" 
                 onclick="Games.setStore('${cat.id}')">
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const statusChips = [
            { id: 'all', label: 'Tümü', icon: '📊' },
            { id: 'toPlay', label: 'Oynanacak', icon: '📋' },
            { id: 'playing', label: 'Oynanıyor', icon: '🎮' },
            { id: 'completed', label: 'Bitirildi', icon: '✅' },
            { id: 'dropped', label: 'Bırakıldı', icon: '⏸️' }
        ].map(cat => `
            <div class="site-category-chip ${this.filterStatus === cat.id ? 'active' : ''}" 
                 onclick="Games.setStatus('${cat.id}')">
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const genreChips = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
            ...this.genres.map(g => ({ id: g.id, label: g.id, icon: g.icon }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterGenre === cat.id ? 'active' : ''}" 
                 onclick="Games.setGenre('${cat.id}')">
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const storeInfo = this.stores.find(s => s.id === this.filterStore);
        const storeIcon = storeInfo?.icon || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
        const storeLabel = this.filterStore === 'all' ? 'Tüm Mağazalar' : (storeInfo?.name || 'Mağaza');
        const genreLabel = this.filterGenre === 'all' ? 'Tüm Türler' : this.filterGenre;

        const currentStatus = [
            { id: 'all', label: 'Tüm Durumlar', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
            { id: 'toPlay', label: 'Oynanacak', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' },
            { id: 'playing', label: 'Oynanıyor', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' },
            { id: 'completed', label: 'Bitirildi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' },
            { id: 'dropped', label: 'Bırakıldı', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' }
        ].find(s => s.id === this.filterStatus) || { label: 'Durum', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' };

        return `
            <div class="lesson-filter-container-modern">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" class="filter-search-input-modern" placeholder="🔍 Oyun ara..." 
                               value="${this.searchQuery}"
                               oninput="Games.setSearchQuery(this.value)">
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon">${storeIcon}</span> 
                            <span class="chip-label">${storeLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${storeChips}
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
                            <span class="chip-icon">${currentStatus.icon}</span> 
                            <span class="chip-label">${currentStatus.label}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${statusChips}
                        </div>
                    </div>
                </div>

                <div class="lesson-toolbar-actions">
                    <span class="toolbar-result-count">${this.getFilteredGames().length} Oyun listeleniyor</span>
                    <button class="btn btn-primary btn-sm" onclick="Games.showAddModal()">
                        <span>+</span> Yeni Oyun
                    </button>
                </div>
            </div>
        `;
    },

    setSearchQuery(query) {
        this.searchQuery = query;
        this.render();
    },

    setStore(store) {
        this.filterStore = store;
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

    renderGridView(games) {
        return games.map(game => {
            const storeInfo = this.stores.find(s => s.id === game.store) || this.stores.find(s => s.id === 'other');
            const statusInfo = this.statuses.find(s => s.id === game.status) || this.statuses[0];
            const genreObj = this.genres.find(g => g.id === game.genre) || this.genres[this.genres.length - 1];

            return `
                <div class="modern-card exam-premium-box game-card-simple-v2" onclick="Games.showInfoModal('${game.id}')">
                    <!-- Top Right Store Badge -->
                    <div class="store-badge-simple ${game.store}">
                        ${storeInfo.name}
                    </div>

                    <!-- Center Section: Title -->
                    <div class="card-body-simple">
                        <h4 class="game-title-v2">${game.title}</h4>
                    </div>

                    <!-- Bottom Section: Footer -->
                    <div class="card-footer-simple">
                        <div class="genre-tag-v2">
                            ${game.genre}
                        </div>
                        <div class="status-label-v2" style="color: ${statusInfo.color}">
                            ${statusInfo.name}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderListView(games) {
        const statusLabels = {
            toPlay: '📋 Oynanacak',
            playing: '🎮 Oynanıyor',
            completed: '✅ Tamamlandı',
            dropped: '⏸️ Bırakıldı'
        };

        const grouped = {};
        const sortedGames = [...games].sort((a, b) => a.title.localeCompare(b.title, 'tr-TR'));
        
        sortedGames.forEach(game => {
            let letter = game.title ? game.title.charAt(0).toLocaleUpperCase('tr-TR') : '#';
            if (!/^[A-ZÇĞİÖŞÜ]/.test(letter)) {
                letter = '#';
            }
            if (!grouped[letter]) grouped[letter] = [];
            grouped[letter].push(game);
        });

        let html = '<div style="grid-column: 1/-1; display: flex; flex-direction: column; gap: 24px;">';

        const sortedLetters = Object.keys(grouped).sort((a, b) => {
            if (a === '#') return 1;
            if (b === '#') return -1;
            return a.localeCompare(b, 'tr-TR');
        });

        for (const letter of sortedLetters) {
            const letterGames = grouped[letter];

            html += `
                <div class="list-group">
                    <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span>🔤</span> ${letter} <span style="font-weight: 400; color: var(--text-muted);">(${letterGames.length})</span>
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${letterGames.map(game => `
                            <div class="list-item" data-id="${game.id}" style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);">
                                <span style="font-size: 24px;">${game.icon || '🎮'}</span>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; margin-bottom: 4px;">${game.title}</div>
                                    <div style="font-size: 13px; color: var(--text-muted);">${game.genre} • ${game.platform}</div>
                                </div>
                                <span style="padding: 4px 12px; background: var(--bg-tertiary); border-radius: 20px; font-size: 12px;">${statusLabels[game.status]}</span>
                                <div style="display: flex; gap: 4px; align-items: center;">
                                    ${game.hoursPlayed > 0 ? `<span style="font-size: 13px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 8px; font-weight: 600;">⏱️ ${game.hoursPlayed}s</span>` : ''}
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button class="btn btn-secondary btn-icon" onclick="Games.showEditModal('${game.id}')" style="width: 36px; height: 36px;">✏️</button>
                                    <button class="btn btn-secondary btn-icon" onclick="Games.remove('${game.id}')" style="width: 36px; height: 36px;">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    bindCardEvents() {
        // Events handled by onclick in render
    },

    showAddModal() {
        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Yeni Oyun Ekle';

        const storeOptions = this.stores.map(s =>
            `<option value="${s.id}">${s.name}</option>`
        ).join('');

        const statusOptions = this.statuses.map(s =>
            `<option value="${s.id}">${s.name}</option>`
        ).join('');

        modalBody.innerHTML = `
            <form id="gameForm">
                <div class="form-group">
                    <label class="form-label">Oyun Adı *</label>
                    <input type="text" class="form-input" name="title" required placeholder="Örn: The Witcher 3">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Mağaza / Platform</label>
                        <select class="form-select" name="store">
                            ${storeOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Durum</label>
                        <select class="form-select" name="status">
                            ${statusOptions}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Tür</label>
                    <select class="form-select" name="genre">
                        ${this.genres.map(g => `<option value="${g.id}">${g.id}</option>`).join('')}
                    </select>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Ekle</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('gameForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.add({
                title: formData.get('title'),
                store: formData.get('store'),
                status: formData.get('status'),
                genre: formData.get('genre')
            });
            App.closeModal();
        });
    },

    showEditModal(id) {
        const game = this.games.find(g => g.id === id);
        if (!game) return;

        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Oyun Düzenle';

        const storeOptions = this.stores.map(s =>
            `<option value="${s.id}" ${game.store === s.id ? 'selected' : ''}>${s.name}</option>`
        ).join('');

        const statusOptions = this.statuses.map(s =>
            `<option value="${s.id}" ${game.status === s.id ? 'selected' : ''}>${s.name}</option>`
        ).join('');

        modalBody.innerHTML = `
            <form id="gameEditForm">
                <div class="form-group">
                    <label class="form-label">Oyun Adı *</label>
                    <input type="text" class="form-input" name="title" required value="${game.title}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Mağaza / Platform</label>
                        <select class="form-select" name="store">
                            ${storeOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Durum</label>
                        <select class="form-select" name="status">
                            ${statusOptions}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Tür</label>
                    <select class="form-select" name="genre">
                        ${this.genres.map(g => `<option value="${g.id}" ${game.genre === g.id ? 'selected' : ''}>${g.id}</option>`).join('')}
                    </select>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
    `;

        App.openModal();

        document.getElementById('gameEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.update(id, {
                title: formData.get('title'),
                store: formData.get('store'),
                status: formData.get('status'),
                genre: formData.get('genre')
            });
            App.closeModal();
        });
    },

    showInfoModal(id) {
        const game = this.games.find(g => g.id === id);
        if (!game) return;

        const storeInfo = this.stores.find(s => s.id === game.store) || this.stores.find(s => s.id === 'other');
        const statusInfo = this.statuses.find(s => s.id === game.status) || this.statuses[0];

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'Oyun Detayı';

        modalBody.innerHTML = `
            <div class="lesson-info-modal-modern">
                <div class="info-header-bento" style="margin-bottom: 30px;">
                    <div class="info-icon-box" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
                    </div>
                    <div class="info-title-box" style="padding-top: 4px;">
                        <h2 class="info-lesson-name" style="font-size: 28px; margin-bottom: 8px;">${game.title}</h2>
                        <div style="color: var(--text-secondary); font-size: 15px; font-weight: 500;">${game.genre}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px;">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Mağaza</div>
                        <div style="font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                             <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${storeInfo.color};"></span>
                             ${storeInfo.name}
                        </div>
                    </div>

                    <div id="status-selection-area" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s;" 
                         onclick="Games.showStatusSelection('${game.id}');"
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.06)'"
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'"
                         title="Durumu değiştirmek için tıkla">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Durum</div>
                        <div style="font-weight: 700; font-size: 15px; color: ${statusInfo.color}; display: flex; align-items: center; justify-content: space-between;">
                            ${statusInfo.name}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                ${game.notes ? `
                <div style="margin-bottom: 30px;">
                    <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 12px; padding: 0 4px;">Notlar</h3>
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 20px; font-size: 15px; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap; border: 1px solid var(--border-color);">${game.notes}</div>
                </div>
                ` : ''}

                <div class="modal-footer-modern" style="margin-top: 30px; padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-danger-soft" onclick="Notifications.confirm('Oyunu Sil', '<b>${game.title.replace(/'/g, "\\'")}</b> listeden kaldırılacaktır.', () => { Games.remove('${game.id}'); App.closeModal(); }, 'Evet, Kaldır')" style="margin-right: auto; padding: 10px 20px;">
                        Sil
                    </button>
                    <button class="btn btn-secondary" onclick="App.closeModal(); Games.showEditModal('${game.id}');" style="padding: 10px 20px;">
                        Düzenle
                    </button>
                    <button class="btn btn-primary" onclick="App.closeModal()" style="padding: 10px 25px;">
                        Kapat
                    </button>
                </div>
            </div>
    `;

        App.openModal();
    }
};

window.Games = Games;
