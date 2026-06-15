/**
 * Life OS - Books Module v2
 * Kitap takibi yönetimi - Liste görünümü ve kategori filtreleme
 */

const Books = {
    books: [],
    container: null,
    viewMode: 'grid',
    filterCategory: 'all',
    filterStatus: 'all',
    searchQuery: '',

    categories: [
        { id: 'Roman', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', color: '#e11d48' },
        { id: 'Bilim', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>', color: '#06b6d4' },
        { id: 'Bilim-Kurgu', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>', color: '#14b8a6' },
        { id: 'Kişisel Gelişim', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>', color: '#10b981' },
        { id: 'Tarih', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>', color: '#f59e0b' },
        { id: 'Felsefe', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>', color: '#7c3aed' },
        { id: 'Teknik', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', color: '#3b82f6' },
        { id: 'Polisiye', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>', color: '#ef4444' },
        { id: 'Klasikler', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/></svg>', color: '#6366f1' },
        { id: 'Şiir', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>', color: '#7c3aed' },
        { id: 'Genel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>', color: '#94a3b8' }
    ],

    statuses: [
        { id: 'toRead', name: 'Okunacak', color: '#7c3aed' },
        { id: 'reading', name: 'Okunuyor', color: '#f59e0b' },
        { id: 'completed', name: 'Okundu', color: '#10b981' }
    ],

    init() {
        this.container = document.getElementById('booksGrid');
        this.loadBooks();
        this.bindEvents();
        this.renderToolbarUI();
        this.render();
    },

    renderToolbarUI() {
        const booksToolbar = document.getElementById('booksToolbar');
        if (booksToolbar) {
            booksToolbar.innerHTML = this.renderToolbar();
        }
    },

    bindEvents() {
        document.getElementById('addBookBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });
    },

    loadBooks() {
        this.books = Storage.load('lifeos_books', []);
    },

    saveBooks() {
        Storage.save('lifeos_books', this.books);
    },

    add(bookData) {
        const book = {
            id: Storage.generateId(),
            title: bookData.title,
            author: bookData.author || '',
            category: bookData.category || 'Genel',
            icon: bookData.icon || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
            totalPages: parseInt(bookData.totalPages) || 300,
            currentPage: 0,
            status: bookData.status || 'toRead',
            startDate: bookData.startDate || '',
            endDate: bookData.endDate || '',
            notes: bookData.notes || '',
            rating: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (book.status === 'completed') {
            book.currentPage = book.totalPages;
            if (!book.endDate) book.endDate = new Date().toISOString().split('T')[0];
        }

        this.books.push(book);
        this.saveBooks();
        this.render();
        Dashboard.render();

        Notifications.add('Yeni Kitap Eklendi', `"${book.title}" kitap listenize eklendi.`, 'success', true);
        return book;
    },

    update(id, updates) {
        const book = this.books.find(b => b.id === id);
        if (book) {
            const oldStatus = book.status;
            Object.assign(book, updates, { updatedAt: new Date().toISOString() });

            // User requirement: When changing FROM completed TO reading/toRead, reset page
            if (oldStatus === 'completed' && (book.status === 'reading' || book.status === 'toRead')) {
                book.currentPage = 0;
            }

            if (book.status === 'completed') {
                if (book.currentPage < book.totalPages) {
                    book.currentPage = book.totalPages;
                }
                if (!book.endDate) {
                    book.endDate = new Date().toISOString().split('T')[0];
                }
            } else {
                // Eğer durum okundu değilse ama sayfa ful saptanmışsa, 1 sayfa eksiye çek ki 'completed' tetiklenmesin
                if (book.currentPage >= book.totalPages) {
                    book.currentPage = book.totalPages - 1;
                }
            }

            this.saveBooks();
            this.render();
            Dashboard.render();
        }
    },

    nextStatus(id) {
        // Obsolete, replaced by showStatusSelection
    },

    showStatusSelection(id) {
        const book = this.books.find(b => b.id === id);
        const statusArea = document.getElementById('status-selection-area');
        if (!book || !statusArea) return;

        statusArea.innerHTML = `
            <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
                Durum Seçin
                <span onclick="event.stopPropagation(); Books.showInfoModal('${id}')" style="cursor: pointer; text-transform: none; color: var(--accent-purple); border-bottom: 1px solid;">Vazgeç</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${this.statuses.map(s => `
                    <div onclick="event.stopPropagation(); Books.update('${id}', {status: '${s.id}'}); Books.showInfoModal('${id}')" 
                         style="padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid ${book.status === s.id ? s.color : 'var(--border-color)'}; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;"
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'"
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></div>
                        <span style="font-weight: 600; color: ${book.status === s.id ? s.color : 'var(--text-primary)'}; font-size: 14px;">${s.name}</span>
                        ${book.status === s.id ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; color: ' + s.color + '"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    remove(id) {
        this.books = this.books.filter(b => b.id !== id);
        this.saveBooks();
        this.render();
        Dashboard.render();
    },

    getStats() {
        const totalPagesRead = this.books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
        return {
            total: this.books.length,
            reading: this.books.filter(b => b.status === 'reading').length,
            completed: this.books.filter(b => b.status === 'completed').length,
            pagesRead: totalPagesRead
        };
    },

    getFilteredBooks() {
        return this.books.filter(b => {
            const catMatch = this.filterCategory === 'all' || b.category === this.filterCategory;
            const statusMatch = this.filterStatus === 'all' || b.status === this.filterStatus;
            const searchMatch = !this.searchQuery ||
                b.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (b.author && b.author.toLowerCase().includes(this.searchQuery.toLowerCase()));
            return catMatch && statusMatch && searchMatch;
        });
    },

    render() {
        const stats = this.getStats();

        // Update stat labels if they exist
        const statLabels = document.querySelectorAll('#page-books .stats-card-label, #page-books .stat-label');
        statLabels.forEach(label => {
            if (label && (label.textContent === 'Tamamlandı' || label.textContent === 'Tamamlanan')) {
                label.textContent = 'Okundu';
            }
            if (label && (label.textContent === 'Toplam')) {
                label.textContent = 'Toplam Kitap';
            }
        });

        if (document.getElementById('bookStatTotal')) document.getElementById('bookStatTotal').textContent = stats.total;
        if (document.getElementById('bookStatReading')) document.getElementById('bookStatReading').textContent = stats.reading;
        if (document.getElementById('bookStatCompleted')) document.getElementById('bookStatCompleted').textContent = stats.completed;
        if (document.getElementById('bookStatPages')) document.getElementById('bookStatPages').textContent = stats.pagesRead;

        const filtered = this.getFilteredBooks();
        if (!this.container) return;

        if (this.books.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state-large">
                    <span class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
                    <h3>Henüz kitap eklenmedi</h3>
                    <p>Okumak istediğiniz kitapları ekleyerek takip edin</p>
                </div>
            `;
        } else if (filtered.length === 0) {
            this.container.innerHTML = `<div class="empty-state">Bu filtreyle eşleşen kitap yok</div>`;
        } else {
            let htmlContent = '';
            if (this.viewMode === 'list') {
                htmlContent = this.renderListView(filtered);
            } else {
                htmlContent = this.renderGridView(filtered);
            }
            this.container.innerHTML = htmlContent;
        }
        this.bindCardEvents();
        // Removed this.bindToolbarEvents() as new toolbar uses inline onclicks or different logic

        // Live update of result count
        const countEl = document.querySelector('#booksToolbar .toolbar-result-count');
        if (countEl) countEl.textContent = `${filtered.length} Kitap listeleniyor`;
    },

    renderToolbar() {
        const activeCategory = this.categories.find(c => c.id === this.filterCategory) || { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', label: 'Tüm Türler' };

        const catChips = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
            ...this.categories.map(cat => ({ id: cat.id, label: cat.id, icon: cat.icon, color: cat.color }))
        ].map(cat => {
            const isActive = this.filterCategory === cat.id;
            return `
                <div class="site-category-chip ${isActive ? 'active' : ''}" 
                     onclick="window.Books.setCategory('${cat.id}'); event.stopPropagation();">
                    <span class="chip-icon">${cat.icon}</span>
                    <span class="chip-label">${cat.label}</span>
                </div>
            `;
        }).join('');

        const statusLabel = {
            all: 'Tüm Durumlar',
            toRead: 'Okunacak',
            reading: 'Okunuyor',
            completed: 'Okundu'
        }[this.filterStatus] || 'Durum';

        const categoryLabel = this.filterCategory === 'all' ? 'Tüm Türler' : this.filterCategory;

        return `
            <div class="lesson-filter-container-modern">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" class="filter-search-input-modern" placeholder="🔍 Kitap veya yazar ara..." 
                               value="${this.searchQuery}"
                               oninput="window.Books.setSearchQuery(this.value)">
                    </div>

                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span> 
                            <span class="chip-label">${categoryLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            ${catChips}
                        </div>
                    </div>
                    
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger">
                            <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> 
                            <span class="chip-label">${statusLabel}</span>
                        </div>
                        <div class="filter-drop-inline">
                            <div class="site-category-chip ${this.filterStatus === 'all' ? 'active' : ''}" onclick="window.Books.setStatus('all'); event.stopPropagation();">
                                <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
                                <span class="chip-label">Tümü</span>
                            </div>
                            <div class="site-category-chip ${this.filterStatus === 'toRead' ? 'active' : ''}" onclick="window.Books.setStatus('toRead'); event.stopPropagation();">
                                <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></span>
                                 <span class="chip-label">Okunacak</span>
                             </div>
                             <div class="site-category-chip ${this.filterStatus === 'reading' ? 'active' : ''}" onclick="window.Books.setStatus('reading'); event.stopPropagation();">
                                 <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span>
                                 <span class="chip-label">Okunuyor</span>
                             </div>
                             <div class="site-category-chip ${this.filterStatus === 'completed' ? 'active' : ''}" onclick="window.Books.setStatus('completed'); event.stopPropagation();">
                                 <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
                                 <span class="chip-label">Okundu</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div class="lesson-toolbar-actions">
                    <span class="toolbar-result-count">${this.getFilteredBooks().length} Kitap listeleniyor</span>
                    <button class="btn btn-primary btn-sm" onclick="Books.showAddModal()" style="height: 40px; padding: 0 20px;">
                        <span>+</span> Yeni Kitap
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

    setStatus(status) {
        this.filterStatus = status;
        this.renderToolbarUI();
        this.render();
    },

    renderGridView(books) {
        if (!books || books.length === 0) return '';

        const statusLabels = { toRead: 'Okunacak', reading: 'Okunuyor', completed: 'Okundu' };
        const statusColors = { toRead: '#7c3aed', reading: '#f59e0b', completed: '#10b981' };

        return books.map(book => {
            let progress = Math.round((book.currentPage / book.totalPages) * 100);
            if (book.status === 'completed') progress = 100;

            const statusLabel = statusLabels[book.status] || 'Okunacak';
            const statusColor = statusColors[book.status] || '#f59e0b';
            const categoryObj = this.categories.find(c => c.id === book.category) || { color: 'var(--text-muted)' };

            // Calculate duration
            let durationText = '-';
            if (book.status === 'completed') {
                durationText = '1 Gün';
                if (book.startDate && book.endDate) {
                    const start = new Date(book.startDate);
                    const end = new Date(book.endDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

                    if (diffDays >= 30) {
                        const months = Math.floor(diffDays / 30);
                        durationText = `${months} Ay`;
                    } else {
                        durationText = `${diffDays} Gün`;
                    }
                }
            }

            return `
                <div class="modern-card exam-premium-box" 
                     onclick="Books.showInfoModal('${book.id}')"
                     style="cursor: pointer; min-height: 180px; position: relative; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background: linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%); border: 1px solid var(--border-color); border-radius: 24px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);">
                    
                    <!-- Glass Reflection Effect -->
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 50%); pointer-events: none; z-index: 0;"></div>

                    <div style="position: absolute; top: 0; right: 0; padding: 6px 12px; background: ${statusColor}15; color: ${statusColor}; font-size: 10px; font-weight: 800; border-bottom-left-radius: 16px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2;">
                        ${statusLabel}
                    </div>

                    <div style="position: relative; z-index: 1;">
                        <div style="margin-bottom: 12px;">
                            <div style="font-weight: 800; font-size: 18px; color: var(--text-primary); line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; letter-spacing: -0.5px;">${book.title}</div>
                            <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">${book.author || 'Yazar Belirtilmedi'}</div>
                        </div>

                        <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: ${categoryObj.color}; padding: 4px 8px; border-radius: 6px; background: ${categoryObj.color}15;">
                                ${book.category}
                            </div>
                        </div>
                    </div>

                    <div class="exam-countdown-wrapper" style="position: relative; z-index: 1; background: transparent; border: none; padding: 0; margin: 0; margin-top: auto;">
                        <div class="progress-header" style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 8px; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                            <span>${book.currentPage} / ${book.totalPages} SAYFA</span>
                            <span>%${progress}</span>
                        </div>
                        <div class="progress-bar" style="height: 6px; background: rgba(0,0,0,0.3); border-radius: 12px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);">
                            <div class="progress-fill" style="width: ${progress}%; height: 100%; background: ${statusColor}; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${statusColor}66;"></div>
                        </div>
                        <div style="margin-top: 10px; display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 10px; color: var(--text-muted); font-weight: 600;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${durationText || '-'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderListView(books) {
        if (!books || books.length === 0) return '';

        const statusLabels = { toRead: 'Okunacak', reading: 'Okunuyor', completed: 'Okundu' };
        const statusColors = { toRead: '#7c3aed', reading: '#f59e0b', completed: '#10b981' };

        // Group by Category
        const grouped = {};
        books.forEach(book => {
            const cat = book.category || 'Genel';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(book);
        });

        let html = '<div style="grid-column: 1/-1; display: flex; flex-direction: column; gap: 24px;">';

        for (const category of Object.keys(grouped)) {
            const catBooks = grouped[category];
            html += `
                <div class="list-group">
                    <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
                        <span style="width: 4px; height: 16px; background: var(--accent-purple); border-radius: 2px;"></span>
                        ${category} <span style="opacity: 0.5;">(${catBooks.length})</span>
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${catBooks.map(book => {
                const progress = Math.round((book.currentPage / book.totalPages) * 100);
                const statusColor = statusColors[book.status] || '#f59e0b';

                return `
                                <div class="list-item" 
                                     data-id="${book.id}" 
                                     onclick="Books.showInfoModal('${book.id}')"
                                     style="cursor: pointer; display: flex; align-items: center; gap: 20px; padding: 16px 24px; background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); border-radius: 16px; border: 1px solid var(--border-color); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;">
                                    
                                    <!-- Glass Reflection (Subtle) -->
                                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(255,255,255,0.02) 0%, transparent 50%); pointer-events: none; z-index: 0;"></div>

                                    <div style="flex: 1; min-width: 0; z-index: 1;">
                                        <div style="font-weight: 800; font-size: 16px; margin-bottom: 4px; color: var(--text-primary); letter-spacing: -0.3px;">${book.title}</div>
                                        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">${book.author || 'Yazar belirtilmedi'}</div>
                                    </div>
                                    
                                    <div style="width: 140px; z-index: 1;">
                                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 700; text-transform: uppercase;">
                                            <span>%${progress}</span>
                                            <span>${book.currentPage}/${book.totalPages}</span>
                                        </div>
                                        <div style="height: 6px; background: rgba(0,0,0,0.3); border-radius: 12px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">
                                            <div style="height: 100%; width: ${progress}%; background: ${statusColor}; border-radius: 12px; box-shadow: 0 0 8px ${statusColor}66;"></div>
                                        </div>
                                    </div>
                                    
                                    <div style="z-index: 1;">
                                        <span style="padding: 6px 12px; background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}20; border-radius: 10px; font-size: 11px; font-weight: 700;">
                                            ${statusLabels[book.status]}
                                        </span>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    bindToolbarEvents() {
        document.getElementById('bookCategoryFilter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.render();
        });

        document.getElementById('bookStatusFilter')?.addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.render();
        });

        document.getElementById('bookGridView')?.addEventListener('click', () => {
            this.viewMode = 'grid';
            this.render();
        });

        document.getElementById('bookListView')?.addEventListener('click', () => {
            this.viewMode = 'list';
            this.render();
        });
    },

    bindCardEvents() {
        // Since we moved all actions to the updateProgress modal and use inline onclicks
        // We only need to ensure the container interactions are consistent if needed.
        // For now, the inline onclick="Books.updateProgress('${book.id}')" handles it.
    },

    showInfoModal(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = 'Kitap Detayı';

        let progress = Math.round((book.currentPage / book.totalPages) * 100);
        if (book.status === 'completed') progress = 100;

        const statusLabels = { toRead: 'Okunacak', reading: 'Okunuyor', completed: 'Okundu' };
        const statusColors = { toRead: '#7c3aed', reading: '#f59e0b', completed: '#10b981' };
        const statusLabel = statusLabels[book.status] || 'Okunacak';
        const statusColor = statusColors[book.status] || '#7c3aed';

        // Calculate duration for modal
        let durationText = '-';
        if (book.status === 'completed') {
            durationText = '1 Gün';
            if (book.startDate && book.endDate) {
                const start = new Date(book.startDate);
                const end = new Date(book.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                durationText = diffDays >= 30 ? `${Math.floor(diffDays / 30)} Ay` : `${diffDays} Gün`;
            }
        }

        modalBody.innerHTML = `
            <div class="lesson-info-modal-modern">
                <div class="info-header-bento">
                    <div class="info-icon-box" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    </div>
                    <div class="info-title-box">
                        <h2 class="info-lesson-name">${book.title}</h2>
                    </div>
                </div>

                <div class="info-grid-bento">
                    <div class="bento-item main-stat">
                        <span class="bento-label">İLERLEME DURUMU</span>
                        <div class="bento-value-wrap">
                            <span class="grade-giant">%${progress}</span>
                            <div class="stat-meta">
                                <span class="meta-val">${book.currentPage}/${book.totalPages} SAYFA</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bento-item">
                        <span class="bento-label">YAZAR</span>
                        <span class="bento-value">${book.author || 'Belirtilmemiş'}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">KATEGORİ</span>
                        <span class="bento-value">${book.category || 'Genel'}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">SÜRE</span>
                        <span class="bento-value">${durationText}</span>
                    </div>

                    <div id="status-selection-area" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s;" 
                         onclick="Books.showStatusSelection('${book.id}');"
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.06)'"
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'"
                         title="Durumu değiştirmek için tıkla">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Durum</div>
                        <div style="font-weight: 700; font-size: 15px; color: ${statusColor}; display: flex; align-items: center; justify-content: space-between;">
                            ${statusLabel}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px;">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Başlangıç</div>
                        <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${book.startDate ? new Date(book.startDate).toLocaleDateString('tr-TR') : '-'}</div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 20px;">
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Bitiş</div>
                        <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${book.endDate ? new Date(book.endDate).toLocaleDateString('tr-TR') : '-'}</div>
                    </div>
                </div>

                ${book.notes ? `
                <div style="margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase;">Notlar</h3>
                    <div style="font-size: 14px; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap;">${book.notes}</div>
                </div>
                ` : ''}

                <div class="modal-actions-modern" style="margin-top: 24px;">
                    <button class="btn-modern secondary" onclick="App.closeModal(); Books.showManageModal('${book.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Düzenle
                    </button>
                    <button class="btn-modern danger" onclick="Notifications.confirm('Kitabı Sil', '<b>${book.title.replace(/'/g, "\\'")}</b> silinecektir. Onaylıyor musunuz?', () => { Books.remove('${book.id}'); App.closeModal(); }, 'Evet, Sil')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        Sil
                    </button>
                </div>
            </div>
        `;
        App.openModal();
    },

    showManageModal(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Kitap Yönetimi';

        const catOptions = this.categories.map(c => `
            <option value="${c.id}" ${book.category === c.id ? 'selected' : ''}>${c.id}</option>
        `).join('');

        modalBody.innerHTML = `
            <form id="manageBookForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group" style="grid-column: span 2;">
                        <label class="form-label">Kitap Adı *</label>
                        <input type="text" class="form-input" name="title" required value="${book.title}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Yazar</label>
                        <input type="text" class="form-input" name="author" value="${book.author || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kategori</label>
                        <select class="form-select" name="category">
                            ${catOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Şu anki Sayfa</label>
                        <input type="number" class="form-input" name="currentPage" min="0" max="${book.totalPages}" value="${book.currentPage}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Toplam Sayfa</label>
                        <input type="number" class="form-input" name="totalPages" min="1" value="${book.totalPages}">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label class="form-label">Durum</label>
                        <select class="form-select" name="status">
                            <option value="toRead" ${book.status === 'toRead' ? 'selected' : ''}>Okunacak</option>
                            <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>Okunuyor</option>
                            <option value="completed" ${book.status === 'completed' ? 'selected' : ''}>Okundu</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Başlangıç Tarihi</label>
                        <input type="date" class="form-input" name="startDate" value="${book.startDate || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bitiş Tarihi</label>
                        <input type="date" class="form-input" name="endDate" value="${book.endDate || ''}">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label class="form-label">Notlar</label>
                        <textarea class="form-textarea" name="notes" rows="3">${book.notes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button type="button" class="btn btn-danger-soft" onclick="Notifications.confirm('Kitabı Sil', '${book.title} kitabını kütüphanenizden kaldırmak istediğinizden emin misiniz?', () => { Books.remove('${book.id}'); App.closeModal(); }, 'Evet, Kaldır')" style="margin-right: auto; padding: 10px 16px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        Kaldır
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 20px;">İptal</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Güncelle
                    </button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('manageBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.update(id, {
                title: formData.get('title'),
                author: formData.get('author'),
                category: formData.get('category'),
                currentPage: parseInt(formData.get('currentPage')),
                totalPages: parseInt(formData.get('totalPages')),
                status: formData.get('status'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                notes: formData.get('notes')
            });
            App.closeModal();
        });
    },


    showAddModal() {
        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Yeni Kitap Ekle';

        const catOptions = this.categories.map(c => `<option value="${c.id}">${c.id}</option>`).join('');

        modalBody.innerHTML = `
            <form id="bookForm">
                <div class="form-group">
                    <label class="form-label">Kitap Adı *</label>
                    <input type="text" class="form-input" name="title" required placeholder="Örn: Sefiller">
                </div>
                <div class="form-group">
                    <label class="form-label">Yazar</label>
                    <input type="text" class="form-input" name="author" placeholder="Örn: Victor Hugo">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Kategori</label>
                    <select class="form-select" name="category">
                        ${catOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Durum</label>
                    <select class="form-select" name="status">
                        <option value="toRead">Okunacak</option>
                        <option value="reading">Okunuyor</option>
                        <option value="completed">Okundu</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label class="form-label">Başlangıç Tarihi</label>
                        <input type="date" class="form-input" name="startDate">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bitiş Tarihi</label>
                        <input type="date" class="form-input" name="endDate">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Toplam Sayfa</label>
                    <input type="number" class="form-input" name="totalPages" min="1" value="300">
                </div>
                <div class="form-group">
                    <label class="form-label">Notlar</label>
                    <textarea class="form-textarea" name="notes" placeholder="Kitap hakkında notlar..."></textarea>
                </div>
                <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 20px;">İptal</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Ekle
                    </button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('bookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.add({
                title: formData.get('title'),
                author: formData.get('author'),
                category: formData.get('category'),
                status: formData.get('status'),
                icon: '📖',
                totalPages: parseInt(formData.get('totalPages')),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                notes: formData.get('notes'),
                currentPage: 0
            });
            App.closeModal();
        });
    },

};

window.Books = Books;
