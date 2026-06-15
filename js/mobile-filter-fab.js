/**
 * Mobile Filter FAB — Floating search & filter panel for mobile
 * Adds a floating action button at bottom-left that opens a slide-up panel
 * with search input and category filter chips for the active module.
 */

const MobileFilterFab = {
    isOpen: false,

    // Escape string for safe use in HTML attributes (onclick handlers)
    escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    init() {
        if (window.innerWidth > 991) return;

        // Create FAB button
        if (!document.getElementById('mobileFilterFab')) {
            const fab = document.createElement('button');
            fab.id = 'mobileFilterFab';
            fab.className = 'mobile-filter-fab';
            fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>`;
            // Hidden by default via CSS; shown by adding .fab-visible class
            fab.addEventListener('click', () => this.toggle());
            document.body.appendChild(fab);
        }

        // Create backdrop
        if (!document.getElementById('mobileFilterBackdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'mobileFilterBackdrop';
            backdrop.className = 'mobile-filter-backdrop';
            backdrop.addEventListener('click', () => this.close());
            document.body.appendChild(backdrop);
        }

        // Create panel
        if (!document.getElementById('mobileFilterPanel')) {
            const panel = document.createElement('div');
            panel.id = 'mobileFilterPanel';
            panel.className = 'mobile-filter-panel';
            document.body.appendChild(panel);
        }
    },

    /**
     * Show/hide FAB based on current page
     */
    updateVisibility() {
        if (window.innerWidth > 991) return;

        const fab = document.getElementById('mobileFilterFab');
        if (!fab) return;

        // Pages that have search & filter toolbars
        const currentPage = App.currentPage;
        const filterablePages = ['lessons', 'exams', 'books', 'games', 'shows', 'sites', 'youtube'];

        if (filterablePages.includes(currentPage)) {
            fab.classList.add('fab-visible');

            // Special color for YouTube
            if (currentPage === 'youtube') {
                fab.classList.add('youtube-mode');
            } else {
                fab.classList.remove('youtube-mode');
            }
        } else {
            fab.classList.remove('fab-visible');
            fab.classList.remove('youtube-mode');
            this.close();
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.isOpen = true;
        const backdrop = document.getElementById('mobileFilterBackdrop');
        const panel = document.getElementById('mobileFilterPanel');
        const fab = document.getElementById('mobileFilterFab');

        if (!panel || !backdrop) return;

        // Build panel content based on current page
        panel.innerHTML = this.buildPanelContent();

        // Show backdrop and panel
        backdrop.classList.add('active');
        panel.classList.add('active');
        if (fab) fab.style.display = 'none';

        // Focus search input after animation
        setTimeout(() => {
            const searchInput = panel.querySelector('.mobile-filter-search');
            if (searchInput) searchInput.focus();
        }, 400);
    },

    close() {
        this.isOpen = false;
        const backdrop = document.getElementById('mobileFilterBackdrop');
        const panel = document.getElementById('mobileFilterPanel');
        const fab = document.getElementById('mobileFilterFab');

        if (backdrop) backdrop.classList.remove('active');
        if (panel) panel.classList.remove('active');
        if (fab) {
            // Re-check visibility after close
            setTimeout(() => this.updateVisibility(), 100);
        }
    },

    buildPanelContent() {
        const page = App.currentPage;
        let html = '';

        html += `<div class="mobile-filter-panel-handle"></div>`;
        html += `<div class="mobile-filter-panel-title">
            <h3>Ara & Filtrele</h3>
            <button class="mobile-filter-panel-close" onclick="MobileFilterFab.close()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
        </div>`;

        // Build based on module
        switch (page) {
            case 'books':
                html += this.buildSearchInput('Kitap veya yazar ara...', 'Books', 'searchQuery');
                html += this.buildFilterGroup('Tür', this.getBooksCategories());
                html += this.buildFilterGroup('Durum', this.getBooksStatuses());
                break;

            case 'games':
                html += this.buildSearchInput('Oyun ara...', 'Games', 'searchQuery');
                html += this.buildFilterGroup('Mağaza', this.getGamesStores());
                html += this.buildFilterGroup('Tür', this.getGamesGenres());
                html += this.buildFilterGroup('Durum', this.getGamesStatuses());
                break;

            case 'shows':
                html += this.buildSearchInput('Dizi veya film ara...', 'Shows', 'searchQuery');
                html += this.buildFilterGroup('Tür', this.getShowsTypes());
                html += this.buildFilterGroup('Durum', this.getShowsStatuses());
                html += this.buildFilterGroup('Kategori', this.getShowsGenres());
                html += this.buildFilterGroup('Platform', this.getShowsPlatforms());
                break;

            case 'sites':
                html += this.buildSearchInput('Site ara...', 'Sites', 'searchQuery');
                html += this.buildFilterGroup('Kategori', this.getSitesCategories());
                break;

            case 'youtube':
                html += this.buildSearchInput('Kanal ara...', 'YouTube', 'searchQuery');
                html += this.buildFilterGroup('Kategori', this.getYouTubeCategories());
                break;

            case 'lessons':
                html += this.buildSearchInput('Ders ara...', 'Lessons', 'searchQuery');
                html += this.buildFilterGroup('Dönem', this.getLessonsSemesters());
                html += this.buildFilterGroup('Sınıf', this.getLessonsGrades());
                html += this.buildFilterGroup('Tür', this.getLessonsTypes());
                break;

            case 'exams':
                html += this.buildSearchInput('Sınav ara...', 'Exams', 'searchQuery');
                html += this.buildFilterGroup('Tür', this.getExamsCategories());
                html += this.buildFilterGroup('Sınıf', this.getExamsGrades());
                html += this.buildFilterGroup('Dönem', this.getExamsSemesters());
                break;
        }

        return html;
    },

    buildSearchInput(placeholder, moduleName, queryProp) {
        const currentVal = window[moduleName]?.[queryProp] || '';
        return `<input type="text" class="mobile-filter-search" 
            placeholder="${placeholder}" 
            value="${currentVal}"
            oninput="MobileFilterFab.onSearch('${moduleName}', this.value)">`;
    },

    onSearch(moduleName, value) {
        const mod = window[moduleName];
        if (!mod) return;

        if (typeof mod.setSearchQuery === 'function') {
            mod.setSearchQuery(value);
        } else {
            mod.searchQuery = value;
            if (typeof mod.render === 'function') mod.render();
        }
    },

    buildFilterGroup(label, chips) {
        if (!chips || chips.length === 0) return '';
        return `
            <div class="mobile-filter-group">
                <div class="mobile-filter-group-label">${label}</div>
                <div class="mobile-filter-chips">
                    ${chips.join('')}
                </div>
            </div>`;
    },

    onFilter(moduleName, method, value) {
        const mod = window[moduleName];
        if (!mod || typeof mod[method] !== 'function') return;
        mod[method](value);

        // Rebuild panel to reflect new active states
        const panel = document.getElementById('mobileFilterPanel');
        if (panel) {
            panel.innerHTML = this.buildPanelContent();
            // Re-focus search
            const searchInput = panel.querySelector('.mobile-filter-search');
            if (searchInput && document.activeElement !== searchInput) {
                const val = searchInput.value;
                searchInput.focus();
                searchInput.value = val;
            }
        }
    },

    // ──── Module-specific chip builders ────

    getBooksCategories() {
        if (!window.Books) return [];
        const cats = Books.categories || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...cats.map(c => {
            const name = (typeof c === 'string') ? c : (c.name || c.id || c);
            return { id: name, label: name };
        })];
        return items.map(c => `<div class="site-category-chip ${Books.filterCategory === c.id ? 'active' : ''}" 
                onclick="MobileFilterFab.onFilter('Books','setCategory','${this.escapeAttr(c.id)}')">${c.label}</div>`);
    },

    getBooksStatuses() {
        if (!window.Books) return [];
        const items = [
            { id: 'all', label: 'Tümü' },
            { id: 'toRead', label: 'Okunacak' },
            { id: 'reading', label: 'Okunuyor' },
            { id: 'completed', label: 'Okundu' }
        ];
        return items.map(s => `<div class="site-category-chip ${Books.filterStatus === s.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Books','setStatus','${this.escapeAttr(s.id)}')">${s.label}</div>`);
    },

    getGamesStores() {
        if (!window.Games) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...Games.stores.map(s => ({ id: s.id, label: s.name }))];
        return items.map(s => `<div class="site-category-chip ${Games.filterStore === s.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Games','setStore','${this.escapeAttr(s.id)}')">${s.label}</div>`);
    },

    getGamesGenres() {
        if (!window.Games) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...Games.genres.map(g => ({ id: g.id, label: g.id }))];
        return items.map(g => `<div class="site-category-chip ${Games.filterGenre === g.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Games','setGenre','${this.escapeAttr(g.id)}')">${g.label}</div>`);
    },

    getGamesStatuses() {
        if (!window.Games) return [];
        const items = [
            { id: 'all', label: 'Tümü' },
            { id: 'toPlay', label: 'Oynanacak' },
            { id: 'playing', label: 'Oynanıyor' },
            { id: 'completed', label: 'Bitirildi' },
            { id: 'dropped', label: 'Bırakıldı' }
        ];
        return items.map(s => `<div class="site-category-chip ${Games.filterStatus === s.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Games','setStatus','${this.escapeAttr(s.id)}')">${s.label}</div>`);
    },

    getShowsTypes() {
        if (!window.Shows) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...Shows.types.map(t => ({ id: t.id, label: t.name }))];
        return items.map(t => `<div class="site-category-chip ${Shows.filterType === t.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Shows','setCategory','${this.escapeAttr(t.id)}')">${t.label}</div>`);
    },

    getShowsStatuses() {
        if (!window.Shows) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...Shows.statuses.map(s => ({ id: s.id, label: s.name }))];
        return items.map(s => `<div class="site-category-chip ${Shows.filterStatus === s.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Shows','setStatus','${this.escapeAttr(s.id)}')">${s.label}</div>`);
    },

    getShowsGenres() {
        if (!window.Shows) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...Shows.genres.map(g => ({ id: g.id, label: g.id }))];
        return items.map(g => `<div class="site-category-chip ${Shows.filterGenre === g.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Shows','setGenre','${this.escapeAttr(g.id)}')">${g.label}</div>`);
    },

    getShowsPlatforms() {
        if (!window.Shows) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...Shows.platforms.map(p => ({ id: p.id, label: p.name }))];
        return items.map(p => `<div class="site-category-chip ${Shows.filterPlatform === p.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Shows','setPlatform','${this.escapeAttr(p.id)}')">${p.label}</div>`);
    },

    getSitesCategories() {
        if (!window.Sites) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...(Sites.categories || []).map(c => ({ id: c.name || c.id || c, label: c.name || c }))];
        return items.map(c => `<div class="site-category-chip ${Sites.filterCategory === c.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Sites','setCategory','${this.escapeAttr(c.id)}')">${c.label}</div>`);
    },

    getYouTubeCategories() {
        if (!window.YouTube) return [];
        const items = [{ id: 'all', label: 'Tümü' }, ...(YouTube.categories || []).map(c => ({ id: c.id || c.name || c, label: c.id || c.name || c }))];
        return items.map(c => `<div class="site-category-chip ${YouTube.filterCategory === c.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('YouTube','setCategory','${this.escapeAttr(c.id)}')">${c.label}</div>`);
    },

    getLessonsSemesters() {
        if (!window.Lessons) return [];
        const sems = Lessons.semesters || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...sems.map(s => ({ id: s.id || s, label: s.name || s }))];
        return items.map(s => `<div class="site-category-chip ${(Lessons.filterSemester || 'all') === s.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Lessons','setSemester','${this.escapeAttr(s.id)}')">${s.label}</div>`);
    },

    getLessonsGrades() {
        if (!window.Lessons) return [];
        const grades = Lessons.grades || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...grades.map(g => ({ id: g.id || g, label: g.name || g }))];
        return items.map(g => `<div class="site-category-chip ${(Lessons.filterGrade || 'all') === g.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Lessons','setGrade','${this.escapeAttr(g.id)}')">${g.label}</div>`);
    },

    getLessonsTypes() {
        if (!window.Lessons) return [];
        const types = Lessons.types || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...types.map(t => ({ id: t.id || t, label: t.name || t }))];
        return items.map(t => `<div class="site-category-chip ${(Lessons.filterType || 'all') === t.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Lessons','setType','${this.escapeAttr(t.id)}')">${t.label}</div>`);
    },

    getExamsCategories() {
        if (!window.Exams) return [];
        const cats = Exams.categories || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...cats.map(c => ({ id: c.id || c, label: c.id || c }))];
        return items.map(c => `<div class="site-category-chip ${(Exams.filterType || 'all') === c.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Exams','setCategory','${this.escapeAttr(c.id)}')">${c.label}</div>`);
    },

    getExamsGrades() {
        if (!window.Exams || !window.Lessons) return [];
        const grades = Lessons.grades || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...grades.map(g => ({ id: g.id || g, label: g.name || g }))];
        return items.map(g => `<div class="site-category-chip ${(Exams.filterGrade || 'all') === g.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Exams','setGrade','${this.escapeAttr(g.id)}')">${g.label}</div>`);
    },

    getExamsSemesters() {
        if (!window.Exams || !window.Lessons) return [];
        const sems = Lessons.semesters || [];
        const items = [{ id: 'all', label: 'Tümü' }, ...sems.map(s => ({ id: s.id || s, label: s.name || s }))];
        return items.map(s => `<div class="site-category-chip ${(Exams.filterSemester || 'all') === s.id ? 'active' : ''}" 
            onclick="MobileFilterFab.onFilter('Exams','setSemester','${this.escapeAttr(s.id)}')">${s.label}</div>`);
    }
};

window.MobileFilterFab = MobileFilterFab;

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    MobileFilterFab.init();
});
