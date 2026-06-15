/**
 * Life OS - Sites Module v2
 * Faydalı site yönetimi - Liste görünümü ve kategori filtreleme
 */

const Sites = {
    sites: [],
    container: null,
    viewMode: 'grid',
    filterCategory: 'all',
    searchQuery: '',

    getDomain(url) {
        try {
            if (!url.startsWith('http')) url = 'https://' + url;
            return new URL(url).hostname;
        } catch {
            return '';
        }
    },

    categories: [
        { name: 'Eğitim', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' },
        { name: 'Araç', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V7.86c0-.55-.45-1-1-1H14.14c-.83 0-1.64.32-2.25.92L9.64 10"/></svg>' },
        { name: 'Haber', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>' },
        { name: 'Sosyal', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>' },
        { name: 'Eğlence', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>' },
        { name: 'İş', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
        { name: 'Genel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }
    ],

    init() {
        this.container = document.getElementById('sitesGrid');
        this.loadSites();
        this.bindEvents();
        this.renderToolbarUI();
        this.render();
    },

    renderToolbarUI() {
        const toolbar = document.getElementById('sitesToolbar');
        if (toolbar) {
            toolbar.innerHTML = this.renderToolbar();
        }
    },

    bindEvents() {
        document.getElementById('addSiteBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });

        document.getElementById('siteSearch')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        this.bindToolbarEvents();
    },

    loadSites() {
        this.sites = Storage.load('lifeos_sites', []);
    },

    saveSites() {
        Storage.save('lifeos_sites', this.sites);
    },

    add(siteData) {
        const site = {
            id: Storage.generateId(),
            title: siteData.title,
            url: siteData.url,
            category: siteData.category || 'Genel',
            iconUrl: siteData.iconUrl || '',
            description: siteData.description || '',
            visitCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.sites.push(site);
        this.saveSites();
        this.render();

        Notifications.add('Yeni Site Eklendi', `"${site.title}" eklendi.`, 'success', true);
        return site;
    },

    update(id, updates) {
        const site = this.sites.find(s => s.id === id);
        if (site) {
            Object.assign(site, updates, { updatedAt: new Date().toISOString() });
            this.saveSites();
            this.render();
        }
    },

    remove(id) {
        this.sites = this.sites.filter(s => s.id !== id);
        this.saveSites();
        this.render();
    },

    visit(id) {
        const site = this.sites.find(s => s.id === id);
        if (site) {
            site.visitCount++;
            this.saveSites();
            this.render(); // Update stats live
            window.open(site.url, '_blank');
        }
    },

    getStats() {
        const uniqueCategories = new Set(this.sites.map(s => s.category));
        const totalVisits = this.sites.reduce((sum, s) => sum + (s.visitCount || 0), 0);

        return {
            total: this.sites.length,
            categories: uniqueCategories.size,
            visits: totalVisits
        };
    },

    getFilteredSites() {
        let filtered = this.sites;

        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(s => s.category === this.filterCategory);
        }

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.title.toLowerCase().includes(q) ||
                (s.description && s.description.toLowerCase().includes(q)) ||
                s.url.toLowerCase().includes(q)
            );
        }

        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    render() {
        this.container = document.getElementById('sitesGrid');
        if (!this.container) return; // Guard

        const stats = this.getStats();

        const totalEl = document.getElementById('siteStatTotal');
        const categoriesEl = document.getElementById('siteStatCategories');
        const visitsEl = document.getElementById('siteStatVisits');

        // Helper to update with animation
        const updateVal = (el, val) => {
            if (el && el.textContent !== String(val)) {
                el.textContent = val;
                el.classList.add('stat-bump');
                setTimeout(() => el.classList.remove('stat-bump'), 400);
            }
        };

        updateVal(totalEl, stats.total);
        updateVal(categoriesEl, stats.categories);
        updateVal(visitsEl, stats.visits);

        const filteredSites = this.getFilteredSites();

        if (this.sites.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state-large">
                    <span class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    </span>
                    <h3>Henüz site eklenmedi</h3>
                    <p>Sık kullandığınız siteleri ekleyerek hızlıca erişin</p>
                </div>`;
        } else if (filteredSites.length === 0) {
            this.container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">Bu filtreyle eşleşen site yok</div>`;
        } else {
            this.container.innerHTML = this.renderListView(filteredSites);
        }

        const countEl = document.querySelector('#sitesToolbar .toolbar-result-count');
        if (countEl) countEl.textContent = `${filteredSites.length} Site listeleniyor`;
    },

    renderListView(sites) {
        const validSites = Array.isArray(sites) ? sites : [];
        const sortedSites = [...validSites].sort((a, b) => (a.title || '').localeCompare(b.title || '', 'tr'));

        const categoryIcons = {};
        this.categories.forEach(c => categoryIcons[c.name] = c.icon);

        const renderSiteCard = (site) => {
            const categoryIcon = categoryIcons[site.category] || '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

            // Icon Logic: User URL -> Favicon Service -> Category SVG Fallback
            let iconHtml;
            const domain = this.getDomain(site.url);
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

            const effectiveIconUrl = site.iconUrl || faviconUrl;

            iconHtml = `
                <div class="site-icon-wrapper" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--bg-secondary); overflow: hidden;">
                    <img src="${effectiveIconUrl}" alt="${site.title}" style="width: 100%; height: 100%; object-fit: cover;" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="site-fallback-icon" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; color: var(--text-muted);">
                        ${categoryIcon}
                    </div>
                </div>
            `;

            return `
                <div class="site-card-modern" onclick="Sites.visit('${site.id}')">
                    <div class="site-card-icon-area">${iconHtml}</div>
                    <div class="site-card-content">
                        <h4 class="site-card-title">${site.title}</h4>
                        <p class="site-card-desc">${site.description || domain}</p>
                    </div>
                    <div class="site-card-actions">
                        <button class="modern-action-btn" onclick="event.stopPropagation(); Sites.showEditModal('${site.id}')" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                        <button class="modern-action-btn delete" onclick="event.stopPropagation(); Notifications.confirm('Sil', 'Silinsin mi?', () => Sites.remove('${site.id}'))" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                    </div>
                </div>
            `;
        };

        if (this.filterCategory === 'all') {
            return `
                <div class="site-rows-container">
                    ${sites.map(site => renderSiteCard(site)).join('')}
                </div>
            `;
        }

        const currentIcon = categoryIcons[this.filterCategory] || '📁';
        return `
            <div class="site-category-section" style="width: 100%;">
                <h3 class="site-category-title">
                    <span class="site-category-icon-box">${currentIcon}</span>
                    ${this.filterCategory}
                    <span class="site-category-count">(${sites.length})</span>
                </h3>
                <div class="site-rows-container">
                    ${sites.map(site => renderSiteCard(site)).join('')}
                </div>
            </div>
        `;
    },

    renderToolbar() {
        const globeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
        const catChips = [
            { name: 'all', label: 'Tümü', icon: globeIcon },
            ...this.categories.map(c => ({ name: c.name, label: c.name, icon: c.icon }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterCategory === cat.name ? 'active' : ''}" 
                 onclick="Sites.setCategory('${cat.name}'); event.stopPropagation();">
                <span class="chip-icon">${cat.icon}</span>
                <span class="chip-label">${cat.label}</span>
            </div>
        `).join('');

        const currentCategory = [
            { name: 'all', label: 'Tümü', icon: globeIcon },
            ...this.categories.map(c => ({ name: c.name, label: c.name, icon: c.icon }))
        ].find(c => c.name === this.filterCategory) || { label: 'Tümü', icon: globeIcon };

        return `
            <div class="lesson-filter-container-modern">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" id="siteSearch" class="filter-search-input-modern modern-focus-purple" placeholder="🔍 Site ara..." 
                               value="${this.searchQuery}"
                               oninput="Sites.setSearchQuery(this.value)">
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon">${currentCategory.icon}</span> 
                            <span class="chip-label">${currentCategory.label}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${catChips}
                        </div>
                    </div>
                </div>
                <div class="lesson-toolbar-actions">
                    <span class="toolbar-result-count">${this.getFilteredSites().length} Site listeleniyor</span>
                    <button class="btn btn-primary btn-sm" id="addSiteBtn" onclick="Sites.showAddModal()" style="height: 40px; padding: 0 20px;">
                        <span>+</span> Yeni Site
                    </button>
                </div>
            </div>
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

    bindToolbarEvents() {
        // Events bound via onclick for simplicity in chips
    },

    showAddModal() {
        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Yeni Site Ekle';
        const catOptions = this.categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');

        modalBody.innerHTML = `
            <form id="siteForm">
                <div class="form-group">
                    <label class="form-label">Site Adı *</label>
                    <input type="text" class="form-input modern-focus-purple" name="title" required>
                </div>
                <div class="form-group">
                    <label class="form-label">URL *</label>
                    <input type="url" class="form-input modern-focus-purple" name="url" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-select modern-focus-purple" name="category">${catOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Özel İkon URL (Opsiyonel)</label>
                    <input type="url" class="form-input modern-focus-purple" name="iconUrl" placeholder="https://example.com/icon.png">
                    <small style="font-size: 11px; color: var(--text-muted);">Boş bırakırsanız sitenin faviconu otomatik çekilir.</small>
                </div>
                <div class="form-group">
                    <label class="form-label">Açıklama</label>
                    <textarea class="form-textarea modern-focus-purple" name="description"></textarea>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary modern-focus-purple" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Ekle</button>
                </div>
            </form>
        `;
        App.openModal();
        document.getElementById('siteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.add({
                title: formData.get('title'),
                url: formData.get('url'),
                category: formData.get('category'),
                iconUrl: formData.get('iconUrl'),
                description: formData.get('description')
            });
            App.closeModal();
        });
    },

    showEditModal(id) {
        const site = this.sites.find(s => s.id === id);
        if (!site) return;
        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Site Düzenle';

        modalBody.innerHTML = `
            <form id="siteEditForm">
                <div class="form-group">
                    <label class="form-label">Site Adı *</label>
                    <input type="text" class="form-input modern-focus-purple" name="title" required value="${site.title}">
                </div>
                <div class="form-group">
                    <label class="form-label">URL *</label>
                    <input type="url" class="form-input modern-focus-purple" name="url" required value="${site.url}">
                </div>
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-select modern-focus-purple" name="category">
                        ${this.categories.map(c => `<option value="${c.name}" ${site.category === c.name ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Özel İkon URL (Opsiyonel)</label>
                    <input type="url" class="form-input modern-focus-purple" name="iconUrl" value="${site.iconUrl || ''}" placeholder="https://example.com/icon.png">
                </div>
                <div class="form-group">
                    <label class="form-label">Açıklama</label>
                    <textarea class="form-textarea modern-focus-purple" name="description">${site.description || ''}</textarea>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary modern-focus-purple" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;
        App.openModal();
        document.getElementById('siteEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.update(id, {
                title: formData.get('title'),
                url: formData.get('url'),
                category: formData.get('category'),
                iconUrl: formData.get('iconUrl'),
                description: formData.get('description')
            });
            App.closeModal();
        });
    }
};
