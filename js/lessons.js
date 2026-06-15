/**
 * Life OS - Lessons Module v5.0
 * Dönem dersleri yönetimi - Sınıf/Dönem bazlı, dosya ekleme desteği
 */

window.Lessons = {
    lessons: [],
    container: null,
    filterSemester: 'all',
    filterGrade: 'all',
    filterType: 'all',
    searchQuery: '',
    expandedLessonId: null,

    // Akademik yıl ve dönem
    academicYear: '2024-2025',
    currentSemester: 'Güz',

    // Dönemler
    semesters: [
        { id: 'guz', name: 'Güz Dönemi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>' },
        { id: 'bahar', name: 'Bahar Dönemi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>' },
        { id: 'yaz', name: 'Yaz Okulu', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' }
    ],

    // Sınıflar
    grades: [
        { id: '1', name: '1. Sınıf', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' },
        { id: '2', name: '2. Sınıf', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' },
        { id: '3', name: '3. Sınıf', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>' },
        { id: '4', name: '4. Sınıf', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
        { id: 'yuksek', name: 'Yüksek Lisans', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' },
        { id: 'doktora', name: 'Doktora', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>' }
    ],

    // Ders türleri
    types: [
        { id: 'zorunlu', name: 'Zorunlu', color: '#ef4444' },
        { id: 'secmeli', name: 'Seçmeli', color: '#10b981' },
        { id: 'bolum', name: 'Bölüm Seçmeli', color: '#06b6d4' },
        { id: 'ust', name: 'Üst Yarıyıl', color: '#f59e0b' },
        { id: 'alt', name: 'Alt Yarıyıl', color: '#818cf8' }
    ],

    async init() {
        this.container = document.getElementById('lessonsGrid');
        this.toolbarContainer = document.getElementById('lessonsToolbar');
        this.loadLessons();
        await this.migrateFiles();
        this.bindEvents();
        this.renderToolbar();
        this.render();
    },

    /**
     * Move old base64 files from LocalStorage to IndexedDB
     */
    async migrateFiles() {
        let migrated = false;
        for (const lesson of this.lessons) {
            if (!lesson.files) continue;
            for (const file of lesson.files) {
                if (file.data) {
                    try {
                        // Move to IndexedDB
                        await Storage.saveLarge(file.id, file.data);
                        // Remove from LocalStorage object
                        delete file.data;
                        migrated = true;
                    } catch (err) {
                        console.error(`Migration error for file ${file.id}:`, err);
                    }
                }
            }
        }
        if (migrated) {
            try {
                // To be safe when LocalStorage is at its absolute limit, 
                // remove the key first to free up the full quota before saving the clean version
                localStorage.removeItem(Storage.userPrefix + Storage.KEYS.LESSONS);

                this.saveLessons();
                console.log('✅ Dosya verileri IndexedDB\'ye taşındı ve LocalStorage temizlendi.');
            } catch (err) {
                console.error('Lessons save error during migration:', err);
            }
        }
    },

    bindEvents() {
        document.getElementById('addLessonBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });
    },

    loadLessons() {
        this.lessons = Storage.load(Storage.KEYS.LESSONS, []);
    },

    saveLessons() {
        // ULTIMATE SAFETY: Strip all Base64 'data' properties before saving to LocalStorage
        // This ensures LocalStorage ONLY contains metadata (IDs, names, sizes)
        const sanitizedData = this.lessons.map(lesson => ({
            ...lesson,
            files: (lesson.files || []).map(file => {
                const { data, ...metadata } = file;
                return metadata;
            })
        }));

        return Storage.save(Storage.KEYS.LESSONS, sanitizedData);
    },

    /**
     * Yeni ders ekle
     */
    add(lessonData) {
        const lesson = {
            id: Storage.generateId(),
            name: lessonData.name,
            code: lessonData.code || '',
            semester: lessonData.semester || 'guz',
            grade: lessonData.grade || '1',
            type: lessonData.type || 'zorunlu',
            credits: parseInt(lessonData.credits) || 3,
            ects: parseInt(lessonData.ects) || 5,
            instructor: lessonData.instructor || '',
            location: lessonData.location || '',
            notes: lessonData.notes || '',
            letterGrade: lessonData.letterGrade || '-',
            files: [],
            createdAt: new Date().toISOString()
        };

        this.lessons.push(lesson);
        this.saveLessons();

        // Reset filters to show the new lesson
        this.filterGrade = 'all';
        this.filterSemester = 'all';

        this.render();

        Notifications.add('Ders Eklendi', `"${lesson.name}" eklendi.`, 'success', true);
        return lesson;
    },

    /**
     * Ders güncelle
     */
    update(id, updates) {
        const lesson = this.lessons.find(l => l.id === id);
        if (lesson) {
            Object.assign(lesson, updates);
            this.saveLessons();
            this.render();
        }
    },

    /**
     * Ders sil
     */
    remove(id) {
        const lesson = this.lessons.find(l => l.id === id);
        if (lesson) {
            this.lessons = this.lessons.filter(l => l.id !== id);
            this.saveLessons();
            this.render();
            Notifications.add('Ders Silindi', `"${lesson.name}" silindi.`, 'info', true);
        }
    },

    /**
     * Dosya ekle (Base64 olarak kaydet)
     */
    addFile(lessonId, file) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        // Ensure files array exists
        if (!lesson.files) lesson.files = [];

        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileData = {
                id: Storage.generateId(),
                name: file.name,
                type: file.type,
                size: file.size,
                addedAt: new Date().toISOString()
            };

            // OPTIMISTIC UPDATE: Add to memory and refresh UI immediately
            lesson.files.push(fileData);

            // Refresh list in modal if open
            if (document.getElementById('notesFileList')) {
                this.renderNotesList(lessonId);
            }
            // Refresh counts on the dashboard/grid
            this.render();

            // Background Save: Large content to IndexedDB
            try {
                await Storage.saveLarge(fileData.id, e.target.result);

                // Background Save: Update lesson metadata in LocalStorage
                const saved = this.saveLessons();
                if (!saved) throw new Error('MetaData (LocalStorage) kayıt hatası');

                Notifications.showToast('Dosya Eklendi', file.name, 'success');
            } catch (err) {
                console.error('File upload fatal error:', err);

                // Rollback if background save fails
                lesson.files = lesson.files.filter(f => f.id !== fileData.id);
                try { await Storage.removeLarge(fileData.id); } catch (e) { }

                this.render();
                if (document.getElementById('notesFileList')) {
                    this.renderNotesList(lessonId);
                }

                let errorMsg = 'Dosya kaydedilemedi';
                if (err.name === 'QuotaExceededError') errorMsg = 'Depolama alanı dolu (Tarayıcı limiti)';
                else if (err.message) errorMsg = err.message;
                else if (err.name) errorMsg = `Sistem Hatası: ${err.name}`;

                Notifications.showToast('Hata', errorMsg, 'error');

                if (errorMsg.includes('Veritabanı') || errorMsg.includes('bağlanılamıyor')) {
                    Notifications.add('İpucu', 'Tarayıcı veritabanı meşgul olabilir. Lütfen sayfayı yenileyip tekrar deneyin.', 'info', true);
                }
            }
        };
        reader.readAsDataURL(file);
    },

    /**
     * Sadece not listesini yenile
     */
    renderNotesList(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const listContainer = document.getElementById('notesFileList');
        const countEl = document.getElementById('notesCountDisplay');

        if (countEl) countEl.innerHTML = `Toplam <b>${lesson.files?.length || 0}</b> kaynak yüklü`;

        if (listContainer) {
            if (lesson.files && lesson.files.length > 0) {
                // Her zaman A-Z ye sırala
                const sortedFiles = [...lesson.files].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

                listContainer.innerHTML = sortedFiles.map(f => `
                    <div class="note-file-card">
                        <div class="file-icon-wrap">
                            ${this.getFileIcon(f.type || '')}
                        </div>
                        <div class="file-info">
                            <span class="file-name" title="${f.name}">${f.name}</span>
                            <span class="file-meta">${this.formatFileSize(f.size || 0)} • ${new Date(f.addedAt || lesson.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div class="file-actions">
                            <button class="file-btn" onclick="Lessons.renameFile('${lesson.id}', '${f.id}')" title="Yeniden Adlandır">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="file-btn" onclick="Lessons.downloadFile('${lesson.id}', '${f.id}')" title="İndir">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </button>
                            <button class="file-btn delete" onclick="Notifications.confirm('Dosyayı Sil', 'Emin misiniz?', () => Lessons.removeFile('${lesson.id}', '${f.id}'))" title="Sil">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = `
                    <div class="empty-notes">
                        <div class="empty-icon-wrap">📁</div>
                        <p>Bu ders için henüz bir dosya veya not yüklenmemiş.</p>
                        <button class="btn btn-secondary btn-sm" onclick="Lessons.triggerFileUpload('${lesson.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                            Hemen Yükle
                        </button>
                    </div>
                `;
            }
        }
    },

    setSemester(sem) {
        this.filterSemester = sem;
        this.renderToolbar();
        this.render();
    },

    setGrade(grade) {
        this.filterGrade = grade;
        this.renderToolbar();
        this.render();
    },

    setSearchQuery(query) {
        this.searchQuery = query;
        this.render();
    },

    setType(type) {
        this.filterType = type;
        this.renderToolbar();
        this.render();
    },

    /**
     * Dosya sil
     */
    async removeFile(lessonId, fileId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            lesson.files = lesson.files.filter(f => f.id !== fileId);
            this.saveLessons();

            // Remove from IndexedDB
            await Storage.removeLarge(fileId);

            // Refresh UI
            this.render();
            if (document.getElementById('notesFileList')) {
                this.renderNotesList(lessonId);
            }
        }
    },

    /**
     * Dosya adını değiştir
     */
    renameFile(lessonId, fileId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const file = lesson.files.find(f => f.id === fileId);
        if (!file) return;

        Notifications.prompt('Dosyayı Yeniden Adlandır', 'Yeni dosya adını girin:', file.name, (newName) => {
            if (newName && newName.trim() !== '') {
                file.name = newName.trim();
                this.saveLessons();
                this.render();
                if (document.getElementById('notesFileList')) {
                    this.renderNotesList(lessonId);
                }
                Notifications.add('Başarılı', 'Dosya adı güncellendi.', 'success', true);
            }
        });
    },

    /**
     * Dosya indir
     */
    async downloadFile(lessonId, fileId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const file = lesson.files.find(f => f.id === fileId);
        if (!file) return;

        // Load data from IndexedDB
        let fileData = file.data; // Legacy fallback (base64 string)
        if (!fileData) {
            fileData = await Storage.loadLarge(fileId);
        }

        if (!fileData) {
            Notifications.showToast('Hata', 'Dosya içeriği bulunamadı', 'error');
            return;
        }

        const link = document.createElement('a');
        let url;

        if (fileData instanceof Blob) {
            url = URL.createObjectURL(fileData);
        } else {
            // Assume string/base64
            url = fileData;
        }

        link.href = url;
        link.download = file.name;
        link.click();

        // Cleanup if it was a blob URL
        if (fileData instanceof Blob) {
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    },

    /**
     * Dosya boyutunu formatla
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    /**
     * Dosya için icon al
     */
    getFileIcon(type) {
        if (type.includes('pdf')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
        if (type.includes('word') || type.includes('document')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>';
        if (type.includes('excel') || type.includes('spreadsheet')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" x2="16" y1="13" y2="17"/><line x1="16" x2="8" y1="13" y2="17"/></svg>';
        if (type.includes('powerpoint') || type.includes('presentation')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="13" width="8" height="4"/></svg>';
        if (type.includes('image')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
        if (type.includes('video')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>';
        if (type.includes('audio')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
        if (type.includes('zip') || type.includes('rar')) return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
    },

    /**
     * Filtrelenmiş dersleri al
     */
    getFilteredLessons() {
        return this.lessons.filter(l => {
            const semesterMatch = this.filterSemester === 'all' || l.semester === this.filterSemester;
            const gradeMatch = this.filterGrade === 'all' || l.grade === this.filterGrade;
            const typeMatch = this.filterType === 'all' || l.type === this.filterType;

            const searchLower = this.searchQuery.toLowerCase();
            const searchMatch = !this.searchQuery ||
                l.name.toLowerCase().includes(searchLower) ||
                (l.code && l.code.toLowerCase().includes(searchLower)) ||
                (l.instructor && l.instructor.toLowerCase().includes(searchLower));

            return semesterMatch && gradeMatch && typeMatch && searchMatch;
        });
    },

    /**
     * Sınıfa göre grupla
     */
    getLessonsByGrade() {
        const grouped = {};
        const filtered = this.getFilteredLessons();

        filtered.forEach(lesson => {
            if (!grouped[lesson.grade]) {
                grouped[lesson.grade] = [];
            }
            grouped[lesson.grade].push(lesson);
        });

        return grouped;
    },

    /**
     * İstatistikler
     */
    getStats() {
        const filtered = this.getFilteredLessons();
        const totalCredits = filtered.reduce((sum, l) => sum + Number(l.credits || 0), 0);
        const totalEcts = filtered.reduce((sum, l) => sum + Number(l.ects || 0), 0);

        return {
            total: filtered.length,
            credits: totalCredits,
            ects: totalEcts,
            files: filtered.reduce((sum, l) => sum + (l.files?.length || 0), 0)
        };
    },

    /**
     * Ders ekleme/düzenleme modalı
     */
    showAddModal(editLesson = null) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const isEdit = editLesson !== null;

        modalTitle.textContent = isEdit ? 'Ders Düzenle' : 'Yeni Ders Ekle';
        modalBody.innerHTML = `
            <form id="lessonForm">
                <div class="form-group">
                    <label class="form-label">Ders Adı *</label>
                    <input type="text" class="form-input" name="name" required 
                           placeholder="Örn: Malzeme Bilimi" value="${isEdit ? editLesson.name : ''}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Sınıf *</label>
                        <select class="form-select" name="grade" required>
                            ${this.grades.map(g => `
                                <option value="${g.id}" ${isEdit && editLesson.grade === g.id ? 'selected' : ''}>
                                    ${g.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dönem *</label>
                        <select class="form-select" name="semester" required>
                            ${this.semesters.map(s => `
                                <option value="${s.id}" ${isEdit && editLesson.semester === s.id ? 'selected' : ''}>
                                    ${s.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Ders Türü</label>
                        <select class="form-select" name="type">
                            ${this.types.map(t => `
                                <option value="${t.id}" ${isEdit && editLesson.type === t.id ? 'selected' : ''}>
                                    ${t.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kredi</label>
                        <input type="number" class="form-input" name="credits" min="1" max="10" 
                               value="${isEdit ? editLesson.credits || 3 : 3}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">AKTS</label>
                    <input type="number" class="form-input" name="ects" min="1" max="30" 
                           value="${isEdit ? editLesson.ects || 5 : 5}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Harf Notu</label>
                        <select class="form-select" name="letterGrade">
                            <option value="-" ${isEdit && editLesson.letterGrade === '-' ? 'selected' : ''}>-</option>
                            <option value="AA" ${isEdit && editLesson.letterGrade === 'AA' ? 'selected' : ''}>AA</option>
                            <option value="BA" ${isEdit && editLesson.letterGrade === 'BA' ? 'selected' : ''}>BA</option>
                            <option value="BB" ${isEdit && editLesson.letterGrade === 'BB' ? 'selected' : ''}>BB</option>
                            <option value="CB" ${isEdit && editLesson.letterGrade === 'CB' ? 'selected' : ''}>CB</option>
                            <option value="CC" ${isEdit && editLesson.letterGrade === 'CC' ? 'selected' : ''}>CC</option>
                            <option value="DC" ${isEdit && editLesson.letterGrade === 'DC' ? 'selected' : ''}>DC</option>
                            <option value="DD" ${isEdit && editLesson.letterGrade === 'DD' ? 'selected' : ''}>DD</option>
                            <option value="FD" ${isEdit && editLesson.letterGrade === 'FD' ? 'selected' : ''}>FD</option>
                            <option value="FF" ${isEdit && editLesson.letterGrade === 'FF' ? 'selected' : ''}>FF</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Akademisyen Adı</label>
                        <input type="text" class="form-input" name="instructor" 
                               placeholder="Örn: Prof. Dr. Ahmet Yılmaz" value="${isEdit ? editLesson.instructor || '' : ''}">
                    </div>
                </div>

                <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 20px;">İptal</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        ${isEdit ? 'Güncelle' : 'Ders Ekle'}
                    </button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('lessonForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const data = {
                name: formData.get('name'),
                grade: formData.get('grade'),
                semester: formData.get('semester'),
                type: formData.get('type'),
                credits: Number(formData.get('credits')),
                ects: Number(formData.get('ects')),
                instructor: formData.get('instructor'),
                letterGrade: formData.get('letterGrade')
            };

            if (isEdit) {
                this.update(editLesson.id, data);
            } else {
                this.add(data);
            }
            App.closeModal();
        });
    },

    /**
     * Dosya ekleme modalı
     */
    showFileModal(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = `📁 ${lesson.name} - Dosyalar`;
        modalBody.innerHTML = `
            <div class="file-manager">
                <div class="file-upload-area">
                    <input type="file" id="fileInput" multiple hidden 
                           accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar">
                    <div class="file-upload-btn" onclick="document.getElementById('fileInput').click()">
                        <span style="font-size: 24px;">📤</span>
                        <span>Dosya Ekle (PDF, Word, Excel, vb.)</span>
                    </div>
                </div>

                <div class="file-list" id="fileList">
                    ${lesson.files.length === 0 ? `
                        <div class="empty-state" style="padding: 24px; text-align: center; color: var(--text-muted);">
                            Henüz dosya eklenmedi
                        </div>
                    ` : lesson.files.map(file => `
                        <div class="lesson-file">
                            <span class="lesson-file-icon">${this.getFileIcon(file.type)}</span>
                            <span class="lesson-file-name">${file.name}</span>
                            <span style="color: var(--text-muted); font-size: 12px;">${this.formatFileSize(file.size)}</span>
                            <button class="btn btn-secondary" style="padding: 4px 8px;" 
                                    onclick="Lessons.downloadFile('${lessonId}', '${file.id}')">⬇️</button>
                            <button class="lesson-file-delete" 
                                    onclick="if(confirm('Dosyayı silmek istiyor musunuz?')) Lessons.removeFile('${lessonId}', '${file.id}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 24px;">Kapat</button>
            </div>
        `;

        App.openModal();

        document.getElementById('fileInput').addEventListener('change', (e) => {
            const files = e.target.files;
            for (let file of files) {
                // Max 10MB
                if (file.size > 10 * 1024 * 1024) {
                    Notifications.showToast('Hata', 'Dosya 10MB\'dan büyük olamaz', 'error');
                    continue;
                }
                this.addFile(lessonId, file);
            }
            // Modal'ı yenile
            setTimeout(() => this.showFileModal(lessonId), 500);
        });
    },

    /**
     * Render Toolbar
     */
    renderToolbar() {
        const toolbar = this.toolbarContainer || document.getElementById('lessonsToolbar');
        if (!toolbar) return;

        const selectedGrade = this.grades.find(g => g.id === this.filterGrade);
        const selectedSemester = this.semesters.find(s => s.id === this.filterSemester);
        const selectedType = this.types.find(t => t.id === this.filterType);

        const gradeLabel = this.filterGrade === 'all' ? 'Sınıf' : selectedGrade.name;
        const gradeIcon = this.filterGrade === 'all' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' : selectedGrade.icon;

        const semesterLabel = this.filterSemester === 'all' ? 'Dönem' : selectedSemester.name;
        const semesterIcon = this.filterSemester === 'all' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>' : selectedSemester.icon;

        const typeLabel = this.filterType === 'all' ? 'Ders Türü' : selectedType.name;
        const typeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>';

        toolbar.innerHTML = `
            <div class="lesson-filter-container-modern" style="margin-bottom: 24px;">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" id="lessonSearchInput" class="filter-search-input-modern" placeholder="🔍 Ders ara..." 
                               value="${this.searchQuery}"
                               oninput="window.Lessons.setSearchQuery(this.value)">
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger"><span class="chip-icon">${gradeIcon}</span> ${gradeLabel}</div>
                        <div class="filter-drop-inline">
                            <div class="site-category-chip ${this.filterGrade === 'all' ? 'active' : ''}" onclick="window.Lessons.setGrade('all'); event.stopPropagation();">
                                <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
                                <span class="chip-label">Tümü</span>
                            </div>
                            ${this.grades.map(g => `
                                <div class="site-category-chip ${this.filterGrade === g.id ? 'active' : ''}" onclick="window.Lessons.setGrade('${g.id}'); event.stopPropagation();">
                                    <span class="chip-icon">${g.icon}</span>
                                    <span class="chip-label">${g.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger"><span class="chip-icon">${semesterIcon}</span> ${semesterLabel}</div>
                        <div class="filter-drop-inline">
                            <div class="site-category-chip ${this.filterSemester === 'all' ? 'active' : ''}" onclick="window.Lessons.setSemester('all'); event.stopPropagation();">
                                <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
                                <span class="chip-label">Tümü</span>
                            </div>
                            ${this.semesters.map(s => `
                                <div class="site-category-chip ${this.filterSemester === s.id ? 'active' : ''}" onclick="window.Lessons.setSemester('${s.id}'); event.stopPropagation();">
                                    <span class="chip-icon">${s.icon}</span>
                                    <span class="chip-label">${s.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger"><span class="chip-icon">${typeIcon}</span> ${typeLabel}</div>
                        <div class="filter-drop-inline">
                            <div class="site-category-chip ${this.filterType === 'all' ? 'active' : ''}" onclick="window.Lessons.setType('all'); event.stopPropagation();">
                                <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
                                <span class="chip-label">Tümü</span>
                            </div>
                            ${this.types.map(t => `
                                <div class="site-category-chip ${this.filterType === t.id ? 'active' : ''}" onclick="window.Lessons.setType('${t.id}'); event.stopPropagation();">
                                    <span class="chip-icon">${typeIcon}</span>
                                    <span class="chip-label">${t.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="lesson-toolbar-actions" style="display: flex; align-items: center; gap: 20px;">
                    <span class="toolbar-result-count">${this.getFilteredLessons().length} Ders listeleniyor</span>
                    <button class="btn btn-primary" onclick="window.Lessons.showAddModal()" style="height: 40px; padding: 0 20px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                        Yeni Ders
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render
     */
    render() {
        const stats = this.getStats();

        // Header subtitle logic removed as per user request

        const statTotal = document.getElementById('lessonStatTotal');
        const statProgress = document.getElementById('lessonStatProgress');
        const statCompleted = document.getElementById('lessonStatCompleted');

        if (statTotal) statTotal.textContent = stats.total;
        if (statProgress) statProgress.textContent = stats.credits;
        if (statCompleted) statCompleted.textContent = stats.files;

        if (!this.container) return;

        let html = ``;
        const lessonsByGrade = this.getLessonsByGrade();
        const filteredLessons = this.getFilteredLessons(); // Assuming this method exists and returns the filtered lessons

        if (this.lessons.length === 0) {
            html += `
                <div class="empty-state-large" style="grid-column: 1 / -1;">
                    <span class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </span>
                    <h3>Henüz ders eklenmedi</h3>
                    <p>Dönem derslerinizi ekleyerek başlayın</p>
                </div>
            `;
        } else if (filteredLessons.length === 0) {
            html += `<div class="empty-state-large" style="grid-column: 1 / -1;"><p>Eşleşen ders bulunamadı</p></div>`;
        } else {
            let allLessonsHtml = '';
            // Sort grades numerically if possible, otherwise alphabetically
            const sortedGradeIds = Object.keys(lessonsByGrade).sort((a, b) => {
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.localeCompare(b);
            });

            for (const gradeId of sortedGradeIds) {
                const gradeLessons = lessonsByGrade[gradeId];
                allLessonsHtml += gradeLessons.map(lesson => this.renderLessonCard(lesson)).join('');
            }
            html += allLessonsHtml;
        }

        this.container.innerHTML = html;

        // Sync result count in toolbar
        const countEl = document.querySelector('#lessonsToolbar .toolbar-result-count');
        if (countEl) {
            countEl.textContent = `${filteredLessons.length} Ders listeleniyor`;
        }
    },

    /**
     * Ders kartı render - Premium & Compact
     */
    renderLessonCard(lesson) {
        const typeInfo = this.types.find(t => t.id === lesson.type) || { name: 'Genel', color: '#6b7280' };
        const fileCount = lesson.files ? lesson.files.length : 0;
        const gradeObj = this.grades.find(g => g.id === lesson.grade);
        const gradeName = gradeObj ? gradeObj.name : (lesson.grade ? `${lesson.grade}. Sınıf` : '');
        const semObj = this.semesters.find(s => s.id === lesson.semester);
        const semesterName = semObj ? semObj.name.replace(' Dönemi', '') : 'Bahar';

        return `
            <div class="modern-card lesson-premium-box" 
                 onclick="window.Lessons.showInfoModal('${lesson.id}')"
                 style="position: relative; padding: 20px; border-radius: 24px; cursor: pointer; height: 145px; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-color); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                
                <div style="position: absolute; top: 0; right: 0; padding: 8px 12px; background: ${typeInfo.color}15; color: ${typeInfo.color}; font-size: 10px; font-weight: 800; border-bottom-left-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${typeInfo.name}
                </div>
                <!-- Right Action Column: Grade, Notes -->
                <div style="position: absolute; top: 35px; bottom: 20px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; gap: 8px; z-index: 10;">
                    
                    <!-- Top: Grade Badge (Swapped here) -->
                    ${(() => {
                if (!lesson.letterGrade || lesson.letterGrade === '-') return '';
                let gradeBg = 'var(--success)'; // Default green for high grades (AA, BA, BB, CB)
                const lg = lesson.letterGrade.toUpperCase();
                if (['FF', 'FD'].includes(lg)) gradeBg = 'var(--danger)'; // Red (Fail)
                else if (['DD', 'DC', 'CC'].includes(lg)) gradeBg = 'var(--warning)'; // Orange (Conditional)
                return `
                        <div class="grade-badge" style="background: ${gradeBg}; color: #ffffff !important; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;">
                            ${lesson.letterGrade}
                        </div>`;
            })()}

                    <!-- Bottom: Notes -->
                    <div onclick="event.stopPropagation(); Lessons.showNotesModal('${lesson.id}')" 
                         style="background: var(--bg-card-hover); color: var(--text-main); padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; border: 1px solid var(--border-color);">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                         Notlar
                    </div>
                </div>

                <!-- Left Content Area (Utilizing more horizontal space) -->
                <div style="padding-right: 100px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <!-- Zone 1: Lesson Name (Top) -->
                    <div>
                        <div style="font-weight: 800; font-size: 19px; color: var(--text-main); line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.5px;">
                            ${lesson.name}
                        </div>
                    </div>

                    <!-- Zone 2: Instructor (Vertically Centered in Available Space) -->
                    <div style="margin: 4px 0;">
                        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 6px; opacity: 0.9;">
                            <span style="font-size: 14px; opacity: 0.8;">👤</span> 
                            <span style="display: inline-block; max-width: 175px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${lesson.instructor || 'Akademisyen Belirtilmedi'}</span>
                        </div>
                    </div>

                    <!-- Zone 3: Footer Stats (Sınıf + Dönem + Kredi) -->
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-secondary); font-weight: 700; opacity: 0.9; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.04); overflow: hidden; white-space: nowrap;">
                        <span style="background: rgba(124, 58, 237, 0.1); color: #a78bfa; padding: 3px 10px; border-radius: 8px; border: 1px solid rgba(124, 58, 237, 0.15); max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${gradeName}
                        </span>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 3px 10px; border-radius: 8px; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(16, 185, 129, 0.15); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <span>${semObj?.icon || '🌓'}</span> ${semesterName}
                        </span>
                        <span style="background: var(--accent-cyan)15; color: var(--accent-cyan); padding: 3px 10px; border-radius: 8px; border: 1px solid var(--accent-cyan)25; flex-shrink: 0; font-weight: 800;">
                             ${lesson.credits} KREDİ
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    showInfoModal(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const typeInfo = this.types.find(t => t.id === lesson.type) || { name: 'Genel', color: '#6b7280' };
        const gradeObj = this.grades.find(g => g.id === lesson.grade);
        const gradeName = gradeObj ? gradeObj.name : (lesson.grade ? `${lesson.grade}. Sınıf` : 'Belirtilmemiş');
        const semObj = this.semesters.find(s => s.id === lesson.semester);
        const semesterName = semObj ? semObj.name : 'Belirtilmemiş';

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'Ders Detayı';
        modalBody.innerHTML = `
            <div class="lesson-info-modal-modern">
                <div class="info-header-bento">
                    <div class="info-icon-box" style="background: ${typeInfo.color}15; color: ${typeInfo.color}">
                        ${(gradeObj?.icon || '🎓').replace('width="16"', 'width="32"').replace('height="16"', 'height="32"')}
                    </div>
                    <div class="info-title-box">
                        <h2 class="info-lesson-name">${lesson.name}</h2>
                        <div style="display: flex; gap: 8px; margin-top: 6px;">
                            <span class="badge-modern" style="background: ${typeInfo.color}20; color: ${typeInfo.color}">${typeInfo.name}</span>
                        </div>
                    </div>
                </div>

                <div class="info-grid-bento">
                    <div class="bento-item main-stat">
                        <span class="bento-label">AKADEMİK DURUM</span>
                        <div class="bento-value-wrap">
                            <span class="grade-giant">${lesson.letterGrade && lesson.letterGrade !== '-' ? lesson.letterGrade : '--'}</span>
                            <div class="stat-meta">
                                <span class="meta-val">${lesson.credits} KREDİ</span>
                                <span class="meta-label">Ders Yükü</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bento-item">
                        <span class="bento-label">AKADEMİSYEN</span>
                        <span class="bento-value">${lesson.instructor || 'Belirtilmemiş'}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">AKTS/ECTS</span>
                        <span class="bento-value">${lesson.ects || 0} PUAN</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">SINIF BİLGİSİ</span>
                        <span class="bento-value">${gradeName}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">DÖNEM</span>
                        <span class="bento-value">${semesterName}</span>
                    </div>
                </div>

                <div class="modal-actions-modern">
                    <button class="btn-modern secondary" onclick="Lessons.showAddModal(Lessons.lessons.find(l => l.id === '${lesson.id}'))">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Düzenle
                    </button>
                    <button class="btn-modern danger" onclick="Notifications.confirm('Dersi Sil', 'Bu ders silinecek. Emin misiniz?', () => { Lessons.remove('${lesson.id}'); App.closeModal(); })">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        Dersi Sil
                    </button>
                </div>
            </div>
    `;
        App.openModal();
    },

    showNotesModal(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modal = document.getElementById('modal');

        // Make modal wider for notes
        modal.classList.add('modal-wide');

        modalTitle.textContent = lesson.name + ' - Çalışma Alanı';
        modalBody.innerHTML = `
            <div class="notes-modal-premium">
                <div class="notes-workspace-header">
                    <div class="workspace-info">
                        <div class="workspace-icon" style="background: ${this.types.find(t => t.id === lesson.type)?.color || 'var(--accent-purple)'}20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </div>
                        <div class="workspace-text">
                            <h3>Ders Kaynakları</h3>
                            <p id="notesCountDisplay">Toplam <b>${lesson.files?.length || 0}</b> kaynak yüklü</p>
                        </div>
                    </div>
                    
                    <div class="workspace-actions">
                        <button class="btn btn-primary" onclick="Lessons.triggerFileUpload('${lesson.id}')" style="padding: 10px 20px; font-weight: 700;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                            Yeni Kaynak Ekle
                        </button>
                    </div>
                    <input type="file" id="upload-${lesson.id}" style="display: none" onchange="Lessons.handleFileSelect('${lesson.id}', this)" multiple>
                </div>

                <div class="notes-files-grid" id="notesFileList">
                    <!-- İçerik renderNotesList tarafından doldurulacak -->
                </div>
            </div>
        `;

        this.renderNotesList(lessonId);
        App.openModal();
    },

    toggleExpand(lessonId) {
        if (this.expandedLessonId === lessonId) {
            this.expandedLessonId = null;
        } else {
            this.expandedLessonId = lessonId;
        }
        // Force re-render to apply 'active' class to rows
        this.render();
    },

    triggerFileUpload(lessonId) {
        document.getElementById(`upload-${lessonId}`).click();
    },

    handleFileSelect(lessonId, input) {
        if (!input.files || input.files.length === 0) return;
        const files = Array.from(input.files);

        files.forEach(file => {
            if (file.size > 15 * 1024 * 1024) {
                Notifications.showToast('Hata', `${file.name} 15MB'dan büyük olamaz`, 'error');
                return;
            }
            this.addFile(lessonId, file);
        });

        // Reset input for same file choosing
        input.value = '';
    },
};
