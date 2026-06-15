/**
 * Life OS - YouTube Module
 * YouTube kanalları yönetimi
 */

const YouTube = {
    channels: [],
    container: null,
    viewMode: 'grid',
    filterCategory: 'all',
    searchQuery: '',

    categories: [
        { id: 'Eğitim', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>', color: '#3b82f6' },
        { id: 'Oyun', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>', color: '#7c3aed' },
        { id: 'Teknoloji', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="4" rx="2" ry="2"/><line x1="2" x2="22" y1="20" y2="20"/></svg>', color: '#06b6d4' },
        { id: 'Müzik', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', color: '#7c3aed' },
        { id: 'Film & Dizi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>', color: '#f97316' },
        { id: 'Eğlence', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>', color: '#f59e0b' },
        { id: 'Bilim', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v5.69l-5.66 9.8A2 2 0 0 0 5.07 20h13.86a2 2 0 0 0 1.73-2.51L15 7.69V2"/><path d="M9 2h6"/><path d="M14 2v5.69L19.66 17.5A2 2 0 0 1 17.93 20H6.07a2 2 0 0 1-1.73-2.5L10 7.69V2"/><line x1="6" y1="14" x2="18" y2="14"/></svg>', color: '#10b981' },
        { id: 'Genel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>', color: '#9ca3af' }
    ],

    init() {
        this.container = document.getElementById('youtubeGrid');
        this.loadChannels();
        this.bindEvents();
        this.renderToolbarUI();
        this.render();
    },

    renderToolbarUI() {
        const toolbarRegion = document.getElementById('youtubeToolbar');
        if (toolbarRegion) {
            toolbarRegion.innerHTML = this.renderToolbar();
        }
    },

    bindEvents() {
        document.getElementById('addYoutubeBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });
    },

    loadChannels() {
        this.channels = Storage.load('lifeos_youtube', []);
    },

    saveChannels() {
        Storage.save('lifeos_youtube', this.channels);
    },

    add(channelData) {
        const channel = {
            id: Storage.generateId(),
            name: channelData.name,
            url: channelData.url,
            category: channelData.category || 'Genel',
            icon: channelData.icon || '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            description: channelData.description || '',
            isFavorite: false,
            visitCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.channels.push(channel);
        this.saveChannels();
        this.render();

        Notifications.add('Yeni Kanal Eklendi', `"${channel.name}" YouTube listenize eklendi.`, 'success', true);
        return channel;
    },

    update(id, updates) {
        const channel = this.channels.find(c => c.id === id);
        if (channel) {
            Object.assign(channel, updates, { updatedAt: new Date().toISOString() });
            this.saveChannels();
            this.render();
        }
    },

    remove(id) {
        this.channels = this.channels.filter(c => c.id !== id);
        this.saveChannels();
        this.render();
    },

    toggleFavorite(id) {
        const channel = this.channels.find(c => c.id === id);
        if (channel) {
            channel.isFavorite = !channel.isFavorite;
            this.saveChannels();
            this.render();
        }
    },

    visit(id) {
        const channel = this.channels.find(c => c.id === id);
        if (channel) {
            channel.visitCount = (channel.visitCount || 0) + 1;
            this.saveChannels();
            this.render(); // Re-render to update stats if visible
            window.open(channel.url, '_blank');
        }
    },

    getStats() {
        return {
            total: this.channels.length,
            favorites: this.channels.filter(c => c.isFavorite).length,
            totalVisits: this.channels.reduce((sum, c) => sum + (c.visitCount || 0), 0)
        };
    },

    getFilteredChannels() {
        let filtered = this.channels;
        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(c => c.category === this.filterCategory);
        }

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.description && c.description.toLowerCase().includes(q))
            );
        }

        return filtered.sort((a, b) => b.isFavorite - a.isFavorite);
    },

    render() {
        const stats = this.getStats();

        if (document.getElementById('ytStatTotal')) document.getElementById('ytStatTotal').textContent = stats.total;
        if (document.getElementById('ytStatFavorite')) document.getElementById('ytStatFavorite').textContent = stats.favorites;
        if (document.getElementById('ytStatVisits')) document.getElementById('ytStatVisits').textContent = stats.totalVisits;

        const filteredChannels = this.getFilteredChannels();
        if (!this.container) return;

        if (this.channels.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state-large">
                    <span class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                    </span>
                    <h3>Henüz kanal eklenmedi</h3>
                    <p>Takip ettiğiniz YouTube kanallarını organize edin</p>
                </div>
            `;
        } else if (filteredChannels.length === 0) {
            this.container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">Bu filtreyle eşleşen kanal yok</div>`;
        } else {
            let html = '';
            if (this.viewMode === 'list') {
                html = this.renderListView(filteredChannels);
            } else {
                html = this.renderGridView(filteredChannels);
            }
            this.container.innerHTML = html;
        }

        // Sync result count in toolbar
        const countEl = document.querySelector('#youtubeToolbar .toolbar-result-count');
        if (countEl) {
            countEl.textContent = `${filteredChannels.length} Kanal listeleniyor`;
        }

        this.bindCardEvents();
    },

    renderToolbar() {
        const catChips = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' },
            ...this.categories.map(cat => ({ id: cat.id, label: cat.id, icon: cat.icon, color: cat.color }))
        ].map(cat => {
            const isActive = this.filterCategory === cat.id;
            return `
                <div class="site-category-chip yt-category-chip ${isActive ? 'active' : ''}" 
                     onclick="YouTube.setCategory('${cat.id}')">
                    <span class="chip-icon">${cat.icon}</span>
                    <span class="chip-label">${cat.label}</span>
                </div>
            `;
        }).join('');

        const categoryLabel = this.filterCategory === 'all' ? 'Tüm Kategoriler' : this.filterCategory;

        return `
    <div class="lesson-filter-container-modern">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" class="filter-search-input-modern yt-red-focus" placeholder="🔍 Kanal ara..." 
                               value="${this.searchQuery}"
                               oninput="YouTube.setSearchQuery(this.value)">
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger yt-red-focus" tabindex="0">
                            <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></span> 
                            <span class="chip-label">${categoryLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${catChips}
                        </div>
                    </div>
                </div>

                <div class="lesson-toolbar-actions">
                    <span class="toolbar-result-count">${this.getFilteredChannels().length} Kanal listeleniyor</span>
                    <button class="btn yt-red-btn btn-sm" onclick="YouTube.showAddModal()">
                        <span>+</span> Yeni Kanal
                    </button>
                </div>
            </div >
    `;
    },

    setSearchQuery(query) {
        this.searchQuery = query;
        this.render();
    },

    setCategory(cat) {
        this.filterCategory = cat;
        this.renderToolbarUI();
        this.render();
    },

    renderGridView(channels) {
        return channels.map(channel => {
            return `
                <div class="modern-card exam-premium-box channel-card" 
                     onclick="YouTube.showInfoModal('${channel.id}')"
                     style="cursor: pointer; min-height: 145px; position: relative; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; border-radius: 24px;">
                    
                    <div style="position: absolute; top: 18px; right: 18px; display: flex; align-items: center;">
                        <div onclick="event.stopPropagation(); YouTube.toggleFavorite('${channel.id}')" 
                                style="padding: 4px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;"
                                onmouseover="this.style.transform='scale(1.2)'"
                                onmouseout="this.style.transform='scale(1)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
                                 fill="${channel.isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.1)'}" 
                                 stroke="${channel.isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.2)'}" 
                                 stroke-width="1" stroke-linecap="round" stroke-linejoin="round" 
                                 style="${channel.isFavorite ? 'filter: drop-shadow(0 0 8px rgba(251,191,36,0.5))' : ''};">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: 800; font-size: 22px; color: var(--text-main); line-height: 1.1; margin-bottom: 6px; padding-right: 45px; letter-spacing: -0.5px;">
                            ${channel.name}
                        </div>
                        <div style="font-size: 14px; color: var(--text-muted); font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.8;">
                            ${channel.description || 'Açıklama belirtilmedi'}
                        </div>
                    </div>

                    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;">
                        <span style="font-size: 11px; color: #ef4444; font-weight: 700; background: rgba(239, 68, 68, 0.12); padding: 6px 14px; border-radius: 20px;">${channel.category}</span>
                        <button onclick="event.stopPropagation(); YouTube.visit('${channel.id}')" class="btn yt-red-btn" 
                                style="width: 65px; height: 38px; border-radius: 14px; padding: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                            Aç
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderListView(channels) {
        const grouped = {};
        channels.forEach(channel => {
            const cat = channel.category || 'Genel';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(channel);
        });

        let html = '<div style="grid-column: 1/-1; display: flex; flex-direction: column; gap: 24px;">';

        for (const category of Object.keys(grouped)) {
            const catChannels = grouped[category];
            html += `
    < div class="list-group" >
                    <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-left: 4px; border-left: 3px solid var(--accent-red);">
                        🔴 ${category} <span style="font-weight: 400; color: var(--text-muted);">(${catChannels.length})</span>
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${catChannels.map(channel => `
                            <div class="list-item"
                                 onclick="YouTube.showInfoModal('${channel.id}')"
                                 style="cursor: pointer; display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--bg-card); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); border-left: none;">
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 700; font-size: 15px; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
                                        ${channel.name} 
                                        ${channel.isFavorite ? `
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 4px rgba(245,158,11,0.4));">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>` : ''}
                                    </div>
                                    <div style="font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${channel.description || ''}
                                    </div>
                                </div>
                                <button onclick="event.stopPropagation(); YouTube.visit('${channel.id}')" class="btn yt-red-btn btn-sm" style="width: 65px; height: 30px; padding: 0; font-size: 13px; display: flex; align-items: center; justify-content: center;">Aç</button>
                            </div>
                        `).join('')}
                    </div>
                </div >
    `;
        }

        html += '</div>';
        return html;
    },

    bindToolbarEvents() {
        document.getElementById('ytCategoryFilter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.render();
        });

        document.getElementById('ytGridView')?.addEventListener('click', () => {
            this.viewMode = 'grid';
            this.render();
        });

        document.getElementById('ytListView')?.addEventListener('click', () => {
            this.viewMode = 'list';
            this.render();
        });
    },

    bindCardEvents() {
        // Events are now handled by onclick in render
    },

    showInfoModal(id) {
        const channel = this.channels.find(c => c.id === id);
        if (!channel) return;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'Kanal Detayı';
        modalBody.innerHTML = `
            <div class="lesson-info-modal-modern">
                <div class="info-header-bento" style="margin-bottom: 30px; position: relative;">
                    <div class="info-icon-box" style="background: rgba(239, 68, 68, 0.1); color: #ef4444">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </div>
                    <div class="info-title-box" style="padding-top: 4px;">
                        <h2 class="info-lesson-name" style="font-size: 26px; margin-bottom: 4px;">${channel.name}</h2>
                        <span style="font-size: 13px; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 8px; font-weight: 600;">${channel.category}</span>
                    </div>
                    
                    <!-- Favorite Star in Header (Themed SVG) -->
                    <div style="position: absolute; top: 0; right: 0;">
                        <button onclick="event.stopPropagation(); YouTube.toggleFavorite('${channel.id}'); YouTube.showInfoModal('${channel.id}');" 
                                style="background: none; border: none; padding: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; border-radius: 12px;"
                                onmouseover="this.style.background='rgba(255,158,11,0.1)'; this.style.transform='scale(1.1)'"
                                onmouseout="this.style.background='none'; this.style.transform='scale(1)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                                 fill="${channel.isFavorite ? 'var(--warning)' : 'none'}" 
                                 stroke="${channel.isFavorite ? 'var(--warning)' : 'var(--text-muted)'}" 
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                                 style="filter: ${channel.isFavorite ? 'drop-shadow(0 0 8px rgba(245,158,11,0.4))' : 'none'}; opacity: ${channel.isFavorite ? '1' : '0.4'};">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 20px; border-radius: 20px; text-align: left !important;">
                    <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; text-align: left !important;">Kanal Hakkında</div>
                    <div style="font-size: 15px; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap; text-align: left !important;">
                        ${channel.description || 'Bu kanal için açıklama eklenmemiş.'}
                    </div>
                </div>

                <div class="modal-footer-modern" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color); display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button class="btn btn-danger-soft" onclick="Notifications.confirm('Kanalı Sil', '<b>${channel.name.replace(/'/g, "\\'")}</b> listeden kaldırılacak. Onaylıyor musunuz?', () => { YouTube.remove('${channel.id}'); App.closeModal(); }, 'Evet, Sil')" style="margin-right: auto; padding: 10px 20px;">Sil</button>
                    <button class="btn btn-secondary yt-red-focus" onclick="App.closeModal(); YouTube.showEditModal('${channel.id}');" style="padding: 10px 20px;">Düzenle</button>
                    <a href="${channel.url}" target="_blank" class="btn yt-red-btn" style="padding: 10px 25px;">Kanala Git</a>
                </div>
            </div>
        `;
        App.openModal();
    },

    showAddModal() {
        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Yeni YouTube Kanalı';

        const catOptions = this.categories.map(c => `<option value="${c.id}">${c.id}</option>`).join('');

        modalBody.innerHTML = `
            <form id="ytForm">
                <div class="form-group">
                    <label class="form-label">Kanal Adı *</label>
                    <input type="text" class="form-input yt-red-focus" name="name" required placeholder="Kanal ismi...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Kategori *</label>
                        <select class="form-select yt-red-focus" name="category" required>
                            ${catOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Favori</label>
                        <select class="form-select yt-red-focus" name="isFavorite">
                            <option value="false">Hayır</option>
                            <option value="true">Evet</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">YouTube URL *</label>
                    <input type="url" class="form-input yt-red-focus" name="url" required placeholder="https://youtube.com/@kanal">
                </div>
                <div class="form-group">
                    <label class="form-label">Açıklama</label>
                    <textarea class="form-textarea yt-red-focus" name="description" placeholder="Kanal hakkında kısa not..."></textarea>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary yt-red-focus" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn yt-red-btn">Ekle</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('ytForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.add({
                name: formData.get('name'),
                category: formData.get('category'),
                url: formData.get('url'),
                description: formData.get('description'),
                isFavorite: formData.get('isFavorite') === 'true'
            });
            App.closeModal();
        });
    },

    showEditModal(id) {
        const channel = this.channels.find(c => c.id === id);
        if (!channel) return;

        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Kanalı Düzenle';

        const catOptions = this.categories.map(c => `<option value="${c.id}" ${channel.category === c.id ? 'selected' : ''}>${c.id}</option>`).join('');

        modalBody.innerHTML = `
            <form id="ytEditForm">
                <div class="form-group">
                    <label class="form-label">Kanal Adı *</label>
                    <input type="text" class="form-input yt-red-focus" name="name" required value="${channel.name}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Kategori *</label>
                        <select class="form-select yt-red-focus" name="category" required>
                            ${catOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Favori</label>
                        <select class="form-select yt-red-focus" name="isFavorite">
                            <option value="false" ${!channel.isFavorite ? 'selected' : ''}>Hayır</option>
                            <option value="true" ${channel.isFavorite ? 'selected' : ''}>Evet</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">YouTube URL *</label>
                    <input type="url" class="form-input yt-red-focus" name="url" required value="${channel.url}">
                </div>
                <div class="form-group">
                    <label class="form-label">Açıklama</label>
                    <textarea class="form-textarea yt-red-focus" name="description">${channel.description || ''}</textarea>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-danger-soft" onclick="Notifications.confirm('Kanalı Sil', 'Silmek istediğinize emin misiniz?', () => { YouTube.remove('${channel.id}'); App.closeModal(); })">Sil</button>
                    <button type="button" class="btn btn-secondary yt-red-focus" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn yt-red-btn">Güncelle</button>
                </div>
            </form >
    `;

        App.openModal();

        document.getElementById('ytEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.update(id, {
                name: formData.get('name'),
                category: formData.get('category'),
                url: formData.get('url'),
                description: formData.get('description'),
                isFavorite: formData.get('isFavorite') === 'true'
            });
            App.closeModal();
        });
    }
};
