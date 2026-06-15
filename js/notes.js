/**
 * Life OS - Notes Module
 * Gelişmiş not defteri sistemi
 */

const Notes = {
    notes: [],
    currentNote: null,
    searchQuery: '',
    filterCategory: 'all',
    saveDebounceTimer: null,

    categories: [
        { id: 'genel', name: 'Genel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', color: '#6b7280' },
        { id: 'ders', name: 'Ders Notları', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', color: '#3b82f6' },
        { id: 'is', name: 'İş / Proje', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', color: '#7c3aed' },
        { id: 'kisisel', name: 'Kişisel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', color: '#10b981' },
        { id: 'fikir', name: 'Fikirler', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" x2="15" y1="18" y2="18"/><line x1="10" x2="14" y1="22" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 12 2a4.65 4.65 0 0 0-4.5 9.5c.7.85 1.15 1.63 1.5 2.5"/></svg>', color: '#f59e0b' },
        { id: 'liste', name: 'Listeler', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>', color: '#ef4444' }
    ],

    init() {
        this.loadNotes();
        this.render();
    },

    loadNotes() {
        this.notes = Storage.load('lifeos_notes', []);
    },

    saveNotes() {
        Storage.save('lifeos_notes', this.notes);
    },

    /**
     * Yeni not ekle
     */
    add(noteData) {
        const note = {
            id: Storage.generateId(),
            title: noteData.title || 'Adsız Not',
            content: noteData.content || '',
            category: noteData.category || 'genel',
            color: noteData.color || 'default',
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.saveNotes();
        this.currentNote = note; // Auto-select new note
        this.render();

        // Auto-focus editor
        setTimeout(() => {
            const editor = document.getElementById('noteEditor');
            if (editor) editor.focus();
        }, 100);

        Notifications.add('Not Eklendi', `"${note.title}" oluşturuldu.`, 'success', true);
        return note;
    },

    /**
     * Not güncelle
     */
    update(id, updates) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            Object.assign(note, updates, { updatedAt: new Date().toISOString() });
            this.saveNotes();
            this.render();
        }
    },

    /**
     * Not sil
     */
    remove(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            this.notes = this.notes.filter(n => n.id !== id);
            this.saveNotes();
            this.currentNote = null;
            this.render();
            Notifications.add('Silindi', `"${note.title}" silindi.`, 'info');
        }
    },

    /**
     * Not sabitle/kaldır
     */
    togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.pinned = !note.pinned;
            this.saveNotes();
            this.render();
        }
    },

    /**
     * Filtrelenmiş notlar
     */
    getFiltered() {
        let filtered = [...this.notes];

        // Kategori filtresi
        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(n => n.category === this.filterCategory);
        }

        // Arama filtresi
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.content.toLowerCase().includes(query)
            );
        }

        // Sabitlenmiş notları üste al
        filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        return filtered;
    },

    /**
     * Not ekleme/düzenleme modalı
     */
    showAddModal(editNote = null) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const isEdit = editNote !== null;

        modalTitle.textContent = isEdit ? 'Notu Düzenle' : 'Yeni Not';
        modalBody.innerHTML = `
            <form id="noteForm">
                <div class="form-group">
                    <label class="form-label">Başlık *</label>
                    <input type="text" class="form-input" name="title" required
                           placeholder="Not başlığı giriniz..."
                           value="${isEdit ? editNote.title : ''}">
                </div>

                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-select" name="category">
                        ${this.categories.map(c => `
                            <option value="${c.id}" ${isEdit && editNote.category === c.id ? 'selected' : ''}>
                                ${c.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="modal-footer" style="padding: 0; border: none; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const title = formData.get('title')?.trim();
            const data = {
                title: title,
                category: formData.get('category'),
                content: isEdit ? editNote.content : ''
            };

            if (isEdit) {
                this.update(editNote.id, data);
            } else {
                this.add(data);
            }
            App.closeModal();
        });
    },

    /**
     * Not görüntüleme
     */
    viewNote(id) {
        // "Kirlenmiş" kontrolü (Unsaved changes check)
        const editor = document.getElementById('noteEditor');
        if (editor && this.currentNote) {
            const currentContent = editor.value;
            const savedNote = this.notes.find(n => n.id === this.currentNote.id);
            if (savedNote && currentContent !== savedNote.content) {
                Notifications.confirm(
                    'Kaydedilmemiş Değişiklikler',
                    'Yaptığınız değişiklikler kaydedilmedi. Çıkmak istediğinizden emin misiniz?',
                    () => {
                        this._executeViewNote(id);
                    }
                );
                return;
            }
        }
        this._executeViewNote(id);
    },

    _executeViewNote(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        this.currentNote = note;
        this.render();
    },

    /**
     * Kontrast metin rengini belirle (koyu arka plan için beyaz, açık için siyah)
     */
    getContrastText(hexcolor) {
        if (!hexcolor || hexcolor.startsWith('var')) return 'var(--text-primary)';
        if (hexcolor.startsWith('rgba')) return 'var(--text-primary)';
        if (!hexcolor.startsWith('#')) return 'var(--text-primary)';

        let hex = hexcolor.slice(1);
        if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');

        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#1e293b' : '#ffffff';
    },

    /**
     * Tarih formatlama
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;

        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    /**
     * Render
     */
    render() {
        const container = document.getElementById('notesContainer');
        if (!container) return;

        const filtered = this.getFiltered();
        const stats = {
            total: this.notes.length,
            pinned: this.notes.filter(n => n.pinned).length
        };

        const html = `
            <div class="notes-layout">
                <!-- Sol panel: Not listesi -->
                <div class="notes-sidebar">
                    <div class="notes-toolbar">
                        <button class="btn btn-primary" onclick="Notes.showAddModal()" style="width: 100%; margin-bottom: 12px; height: 44px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> Yeni Not
                        </button>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="position: relative;">
                                <input type="text" class="form-input" placeholder="Notlarda ara..."
                                       value="${this.searchQuery}"
                                       style="padding-left: 36px;"
                                       oninput="Notes.searchQuery = this.value; Notes.renderList();">
                                <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg></span>
                            </div>
                            <select class="form-select" onchange="Notes.filterCategory = this.value; Notes.renderList();">
                                <option value="all">Tüm Kategoriler</option>
                                ${this.categories.map(c => `
                                    <option value="${c.id}" ${this.filterCategory === c.id ? 'selected' : ''}>
                                        ${c.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="notes-list" id="notesListContainer">
                        <!-- List items will be rendered here -->
                    </div>

                    <div class="notes-stats" style="padding: 12px 20px; font-size: 11px; color: var(--text-muted); display: flex; gap: 12px; border-top: 1px solid var(--border-color); background: var(--bg-secondary);">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> ${stats.total} not</span>
                        ${stats.pinned > 0 ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg> ${stats.pinned} sabit</span>` : ''}
                    </div>
                </div>

                <!-- Sağ panel: Not içeriği -->
                <div class="notes-content" id="noteEditorContainer">
                    <!-- Editor will be rendered here -->
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.renderList();
        this.renderEditor();
    },

    /**
     * Sadece listeyi render et
     */
    renderList() {
        const container = document.getElementById('notesListContainer');
        if (!container) return;

        const filtered = this.getFiltered();

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px; text-align: center; opacity: 0.5;">
                    <div style="margin-bottom: 12px; display: flex; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                    <p>Not bulunamadı</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(note => {
            const cat = this.categories.find(c => c.id === note.category) || this.categories[0];
            const isActive = this.currentNote?.id === note.id;
            const preview = note.content ? note.content.substring(0, 60).replace(/[#*`]/g, '') + (note.content.length > 60 ? '...' : '') : 'Henüz içerik yok...';

            return `
                <div class="note-item ${isActive ? 'active' : ''}" onclick="Notes.viewNote('${note.id}')" style="position: relative; overflow: hidden;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 16px;">${cat.icon}</span>
                        <h4 class="note-item-title" style="margin: 0; flex: 1; font-size: 14px; font-weight: 700;">${note.title}</h4>
                        ${note.pinned ? '<span title="Sabitlenmiş"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg></span>' : ''}
                    </div>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.7;">
                        ${preview}
                    </p>
                    <div style="margin-top: 8px; font-size: 10px; color: var(--text-muted); display: flex; justify-content: space-between;">
                         <span>${this.formatDate(note.updatedAt)}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Sadece editörü render et
     */
    renderEditor() {
        const container = document.getElementById('noteEditorContainer');
        if (!container) return;

        if (!this.currentNote) {
            container.innerHTML = `
                <div class="notes-empty-content">
                    <div style="background: var(--bg-secondary); width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 24px; opacity: 0.8;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3 style="color: var(--text-primary); font-weight: 700;">Not Seçilmedi</h3>
                    <p style="color: var(--text-muted); max-width: 200px; margin-top: 8px;">Listeden bir not seçin veya yeni bir tane oluşturun.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.renderNoteContent(this.currentNote);

        // Klavye kısayolları: Ctrl+B, Ctrl+I, Ctrl+S
        const editor = document.getElementById('noteEditor');
        if (editor) {
            editor.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 's') {
                        e.preventDefault();
                        if (this.currentNote) Notes.forceSave(this.currentNote.id);
                        return;
                    }
                } else if (e.key === 'Enter') {
                    this.handleEnterKey(e, editor);
                }
            });
        }
    },

    /**
     * Not içeriği render - tam işlevli not editörü
     */
    renderNoteContent(note) {
        const colors = [
            { id: 'default', name: 'Varsayılan', bg: 'var(--bg-primary)' },
            { id: 'dark', name: 'Siyah', bg: '#000000', text: '#ffffff' },
            { id: 'navy', name: 'Lacivert', bg: '#0f172a', text: '#ffffff' },
            { id: 'gray', name: 'Koyu Gri', bg: '#1e293b', text: '#ffffff' },
            { id: 'red', name: 'Kırmızı', bg: 'rgba(239, 68, 68, 0.15)' },
            { id: 'yellow', name: 'Sarı', bg: 'rgba(250, 204, 21, 0.15)' },
            { id: 'green', name: 'Yeşil', bg: 'rgba(34, 197, 94, 0.15)' },
            { id: 'blue', name: 'Mavi', bg: 'rgba(59, 130, 246, 0.15)' },
            { id: 'purple', name: 'Mor', bg: 'rgba(124, 58, 237, 0.15)' }
        ];

        const selectedPreset = colors.find(c => c.id === note.color);
        let editorBg = selectedPreset ? selectedPreset.bg : (note.color || 'var(--bg-primary)');
        let textColor = selectedPreset ? (selectedPreset.text || 'var(--text-primary)') : this.getContrastText(editorBg);
        const editorBgStyle = editorBg === 'var(--bg-primary)' ? 'var(--bg-secondary)' : editorBg;

        const isMobile = window.innerWidth <= 991;
        const closeBtn = isMobile ? `
            <button class="note-close-btn-mobile" onclick="Notes.currentNote = null; Notes.render();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg> Notu Kapat
            </button>` : '';

        return `
            ${closeBtn}
            <div class="note-view-header">
                <div class="note-header-main">
                    <div class="note-title-container">
                        <input type="text" class="note-title-input" value="${this.escapeHtml(note.title || '')}" 
                               placeholder="Not Başlığı..."
                               onchange="Notes.update('${note.id}', {title: this.value})">
                        <div class="note-badge-group">
                            <div class="category-badge">
                                <select onchange="Notes.update('${note.id}', {category: this.value})">
                                    ${this.categories.map(c => `
                                        <option value="${c.id}" ${note.category === c.id ? 'selected' : ''}>
                                            ${c.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <span class="note-date-badge"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg> ${this.formatDate(note.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                <div class="note-header-actions">
                    <div class="note-color-swatches-compact">
                        ${colors.map(c => `
                            <div class="color-swatch-sm ${note.color === c.id || (!note.color && c.id === 'default') ? 'active' : ''}" 
                                 style="background: ${c.bg === 'var(--bg-primary)' ? 'var(--bg-secondary)' : c.bg};"
                                 onmousedown="event.preventDefault(); Notes.update('${note.id}', {color: '${c.id}'});"
                                 title="${c.name}"></div>
                        `).join('')}
                        <label class="color-picker-label" title="Özel Renk Seç">
                            <input type="color" class="color-picker-hidden" 
                                   value="${editorBg.startsWith('#') ? editorBg : '#ffffff'}"
                                   onchange="Notes.update('${note.id}', {color: this.value})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3-3"/><path d="m17 2 4 4-4 4 2 2 3-3"/><path d="m9 11 3 3"/></svg>
                        </label>
                    </div>
                    <div class="action-divider"></div>
                    <div class="note-action-buttons">
                        <button class="note-btn-pill primary" onclick="Notes.forceSave('${note.id}')" title="Kaydet (Ctrl+S)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> <span>Kaydet</span>
                        </button>
                        <div class="note-btn-group">
                            <button class="note-btn-icon" onclick="Notes.togglePin('${note.id}')" title="${note.pinned ? 'İğneyi Kaldır' : 'Sabitle'}">
                                ${note.pinned ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="2" y2="5"></line><line x1="19" x2="22" y1="19" y2="22"></line><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>'}
                            </button>
                            <button class="note-btn-icon danger" onclick="Notifications.confirm('Notu Sil', 'Emin misiniz?', () => Notes.remove('${note.id}'))" title="Sil">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="note-editor-wrap lined-paper" style="background: ${editorBgStyle}; color: ${textColor};" onmousedown="Notes.handleNoteClick(event)">
                <div class="note-editor-inner">
                    <input type="text" class="note-paper-title" 
                           value="${this.escapeHtml(note.title || '')}" 
                           placeholder="Başlık Giriniz..."
                           style="color: ${textColor};"
                           oninput="Notes.update('${note.id}', {title: this.value})">
                    
                    <div class="note-editor-toolbar" style="justify-content: flex-end; background: transparent; border-bottom: none; padding: 0 0 15px 0;">
                        <div class="toolbar-group">
                            <button class="toolbar-btn" style="color: ${textColor};" onclick="Notes.insertList()" title="Madde İşaretli Liste">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                            </button>
                            <button class="toolbar-btn" style="color: ${textColor};" onclick="Notes.insertOrderedList()" title="Numaralı Liste">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                            </button>
                            <button class="toolbar-btn" style="color: ${textColor};" onclick="Notes.insertChecklist()" title="Kontrol Listesi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            </button>
                        </div>
                    </div>

                    <textarea class="note-content-editor" id="noteEditor"
                              placeholder="Yazmaya başlayın..."
                              style="color: ${textColor}; background-image: linear-gradient(${textColor === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'} 1px, transparent 1px);"
                              oninput="Notes.handleEditorInput('${note.id}', this.value)">${this.escapeHtml(note.content || '')}</textarea>
                </div>
            </div>

            <div class="note-stats-bar" style="background: ${editorBgStyle}; color: ${textColor}; border-top: 1px solid ${textColor}22;">
                <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg> <span id="noteStatChars">${(note.content || '').length}</span> karakter</span>
                <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"></line><line x1="10" x2="21" y1="12" y2="12"></line><line x1="10" x2="21" y1="18" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg> <span id="noteStatWords">${note.content ? note.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0}</span> kelime</span>
                <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M2 12l5 5"></path><path d="M2 12l5-5"></path></svg> <span id="noteStatLines">${(note.content || '').split('\n').length}</span> satır</span>
            </div>
        `;
    },

    /**
     * Not kopyalamayı basitleştirdim, listeye ekle
     */
    duplicateNote(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            this.add({
                title: note.title + ' (Kopya)',
                content: note.content,
                category: note.category,
                color: note.color
            });
        }
    },

    /**
     * Editör input handler - debounced otomatik kayıt + istatistik güncelleme
     */
    handleEditorInput(id, value) {
        this.updateNoteStats();
        // Auto-save disabled as per user request
    },

    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        this.renderEditor();
    },

    renderMarkdown(text) {
        if (!text) return '';

        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold & Italic
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');

        // Checklist
        html = html.replace(/^- \[ \] (.*)/gim, '<div class="preview-checklist"><input type="checkbox" disabled> $1</div>');
        html = html.replace(/^- \[x\] (.*)/gim, '<div class="preview-checklist"><input type="checkbox" checked disabled> $1</div>');

        // Lists
        html = html.replace(/^- (.*)/gim, '<ul><li>$1</li></ul>');
        html = html.replace(/^\d+\. (.*)/gim, '<ol><li>$1</li></ol>');

        // Clean up multi-ul/ol if needed (simple version)
        html = html.replace(/<\/ul>\s?<ul>/gim, '');
        html = html.replace(/<\/ol>\s?<ol>/gim, '');

        // Paragraphs
        return html.split('\n').map(line => {
            if (line.trim().startsWith('<')) return line;
            return line.trim() ? `<p>${line}</p>` : '<br>';
        }).join('\n');
    },

    forceSave(id) {
        const content = document.getElementById('noteEditor')?.value || '';
        this.update(id, { content: content });
        Notifications.add('Not Kaydedildi', 'Tüm değişiklikler kaydedildi.', 'success');
    },

    updateNoteStats() {
        const content = document.getElementById('noteEditor')?.value || '';
        const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = content.length;
        const lineCount = content.split('\n').length;

        const elChars = document.getElementById('noteStatChars');
        const elWords = document.getElementById('noteStatWords');
        const elLines = document.getElementById('noteStatLines');
        if (elChars) elChars.textContent = charCount;
        if (elWords) elWords.textContent = wordCount;
        if (elLines) elLines.textContent = lineCount;
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    handleEnterKey(e, editor) {
        const start = editor.selectionStart;
        const text = editor.value;
        const before = text.substring(0, start);
        const lines = before.split('\n');
        const currentLine = lines[lines.length - 1];

        // Only continue if not just the prefix itself
        const isChecklist = currentLine.startsWith('☐ ') || currentLine.startsWith('☑ ');
        const isBullet = currentLine.startsWith('• ');
        const isOrdered = /^\d+\.\s/.test(currentLine);

        if (isChecklist || isBullet || isOrdered) {
            const content = currentLine.replace(/^(☐ |☑ |• |\d+\.\s)/, '').trim();

            if (content.length === 0) return;

            e.preventDefault();
            if (isChecklist) {
                this.insertFormat('\n☐ ', '');
            } else if (isBullet) {
                this.insertFormat('\n• ', '');
            } else if (isOrdered) {
                const num = parseInt(currentLine.match(/^(\d+)/)[0]);
                this.insertFormat(`\n${num + 1}. `, '');
            }
        }
    },

    insertList() {
        this.insertFormat('\n• ', '');
    },

    insertOrderedList() {
        this.insertFormat('\n1. ', '');
    },

    insertChecklist() {
        this.insertFormat('\n☐ ', '');
    },

    handleNoteClick(e) {
        // Only run if clicking near the start of a line in the textarea
        const editor = e.target;
        if (!editor || editor.tagName !== 'TEXTAREA') return;

        const pos = editor.selectionStart;
        const text = editor.value;
        const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
        const line = text.slice(lineStart).split('\n')[0];

        if (line.startsWith('☐ ') || line.startsWith('☑ ')) {
            // Check if click was within the first 2 characters (the checkbox part)
            if (pos <= lineStart + 2) {
                const isChecked = line.startsWith('☑ ');
                const newChar = isChecked ? '☐ ' : '☑ ';
                const newText = text.slice(0, lineStart) + newChar + line.slice(2) + text.slice(lineStart + line.length);
                editor.value = newText;
                editor.setSelectionRange(pos, pos);
                this.handleEditorInput(this.currentNote.id, newText);
                // No need for a full render, just update the stats or title if needed
            }
        }
    },

    /**
     * Format ekle (toolbar için)
     */
    insertFormat(before, after) {
        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        const selected = text.substring(start, end);

        const newText = text.substring(0, start) + before + selected + after + text.substring(end);
        editor.value = newText;

        const newPos = start + before.length + selected.length + after.length;
        editor.setSelectionRange(newPos, newPos);
        editor.focus();

        if (this.currentNote) {
            // Immediately save state without full render delay for better UX
            const note = this.notes.find(n => n.id === this.currentNote.id);
            if (note) {
                note.content = newText;
                note.updatedAt = new Date().toISOString();
                this.saveNotes();
                this.updateNoteStats();
            }
        }
    }
};

