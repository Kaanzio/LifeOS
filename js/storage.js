/**
 * Life OS - Storage Module
 * LocalStorage yönetimi ve veri persistence
 */

const Storage = {
    // Storage Keys
    KEYS: {
        LESSONS: 'lifeos_lessons_v5',
        TASKS: 'lifeos_tasks',
        NOTIFICATIONS: 'lifeos_notifications',
        SETTINGS: 'lifeos_settings',
        STATS: 'lifeos_stats',
        EXAMS: 'lifeos_exams',
        BOOKS: 'lifeos_books',
        GAMES: 'lifeos_games',
        HABITS: 'lifeos_habit_chains',
        NOTES: 'lifeos_notes',
        SCHEDULE: 'lifeos_schedule',
        POMODORO: 'lifeos_pomodoro',
        PROFILE: 'lifeos_profile',
        SITES: 'lifeos_sites',
        SHOWS: 'lifeos_shows',
        YOUTUBE: 'lifeos_youtube',
        WEEKLY_PLANNER: 'lifeos_weekly_planner',
        QUICK_SITES: 'lifeos_quick_sites',
        WEEKLY_PROGRESS: 'lifeos_weekly_progress',
        DASHBOARD_CHAIN: 'lifeos_dashboard_selected_chain'
    },

    // Current User Prefix
    userPrefix: '',
    db: null,
    dbInitPromise: null,
    dbName: 'LifeOS_LargeStorage',
    storeName: 'assets',

    async initDB() {
        if (this.db) return this.db;
        if (this.dbInitPromise) return this.dbInitPromise;

        this.dbInitPromise = new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(this.dbName, 1);

                request.onerror = (event) => {
                    console.error("IndexedDB error:", event.target.error);
                    this.dbInitPromise = null;
                    reject(event.target.error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.dbInitPromise = null;
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
            } catch (err) {
                console.error("Critical IndexedDB error:", err);
                this.dbInitPromise = null;
                reject(err);
            }
        });

        return this.dbInitPromise;
    },

    async saveLarge(key, data) {
        try {
            if (!this.db) {
                await this.initDB();
            }
            if (!this.db) {
                throw new Error("Veritabanına bağlanılamıyor. Lütfen sayfayı yenileyin.");
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const store = transaction.objectStore(this.storeName);
                const prefixedKey = this.userPrefix + key;

                transaction.oncomplete = () => resolve(true);
                transaction.onerror = (event) => {
                    console.error("Storage Transaction Error:", event.target.error);
                    reject(event.target.error || new Error("İşlem hatası"));
                };

                // Convert data (likely base64) to Blob if it's a large string for better storage
                let finalData = data;
                if (typeof data === 'string' && data.startsWith('data:')) {
                    try {
                        const parts = data.split(',');
                        const mime = parts[0].match(/:(.*?);/)[1];
                        const bstr = atob(parts[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        finalData = new Blob([u8arr], { type: mime });
                    } catch (e) {
                        console.warn("Blob conversion failed, saving as string instead:", e);
                        finalData = data;
                    }
                }

                try {
                    store.put(finalData, prefixedKey);
                } catch (err) {
                    console.error("Storage Put Error:", err);
                    reject(err);
                }
            });
        } catch (err) {
            console.error("saveLarge Final Catch:", err);
            throw err;
        }
    },

    /**
     * Load large data from IndexedDB
     */
    async loadLarge(key) {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const prefixedKey = this.userPrefix + key;
            const request = store.get(prefixedKey);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Remove large data from IndexedDB
     */
    async removeLarge(key) {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const prefixedKey = this.userPrefix + key;
            const request = store.delete(prefixedKey);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Clear all large data for current user
     */
    async clearLarge() {
        if (!this.db) await this.initDB();
        const keys = await this.getAllLargeKeys();
        for (const key of keys) {
            await this.removeLarge(key.replace(this.userPrefix, ''));
        }
        return true;
    },

    /**
     * Get all keys from IndexedDB (for export)
     */
    async getAllLargeKeys() {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();

            request.onsuccess = () => {
                // Filter by current user prefix
                const keys = request.result.filter(k => k.startsWith(this.userPrefix));
                resolve(keys);
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Aktif kullanıcıyı ayarla
     */
    setUser(username) {
        this.userPrefix = username ? `user_${username}_` : '';
    },

    /**
     * Veri kaydet
     */
    save(key, data) {
        const storageKey = this.userPrefix + key;
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(storageKey, jsonData);
            return true;
        } catch (error) {
            console.error('Storage save error:', error);

            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                // EMERGENCY CLEANUP: Try to remove known legacy keys to make room
                console.warn('LocalStorage full. Attempting emergency cleanup of legacy keys...');

                const legacyKeys = [
                    'lifeos_lessons', 'lifeos_lessons_v5_fallback',
                    'lifeos_tasks_backup', 'lifeos_notes_temp'
                ];

                let freed = false;
                legacyKeys.forEach(lk => {
                    if (localStorage.getItem(lk)) {
                        localStorage.removeItem(lk);
                        freed = true;
                    }
                    if (this.userPrefix && localStorage.getItem(this.userPrefix + lk)) {
                        localStorage.removeItem(this.userPrefix + lk);
                        freed = true;
                    }
                });

                if (freed) {
                    console.log('Emergency cleanup freed some space. Retrying save...');
                    try {
                        localStorage.setItem(storageKey, JSON.stringify(data));
                        return true;
                    } catch (retryError) {
                        console.error('Retry save also failed:', retryError);
                    }
                }

                Notifications.showToast('Depolama Dolu', 'Tarayıcı limiti doldu. Lütfen eski verileri temizleyin veya çerezleri silin.', 'error');
            }
            return false;
        }
    },

    /**
     * Veri yükle
     */
    load(key, defaultValue = null) {
        try {
            const storageKey = this.userPrefix + key;
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    },

    /**
     * Veri sil
     */
    remove(key) {
        try {
            const storageKey = this.userPrefix + key;
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    /**
     * Tüm verileri temizle (Sadece aktif kullanıcı için)
     */
    async clearAll() {
        try {
            // 1. Clear IndexedDB for this user (large assets)
            await this.clearLarge();

            // 2. Clear all registered keys in Storage.KEYS
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(this.userPrefix + key);
            });

            // 3. Thorough sweep: Clear ALL keys in localStorage starting with this user's prefix
            if (this.userPrefix) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.userPrefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }

            // 4. Clear potential legacy keys (both prefixed and unprefixed)
            const legacyKeys = [
                'lifeos_lessons', 'lifeos_lessons_v5', 'lifeos_habit_chains',
                'lifeos_planning_tasks', 'lifeos_profile', 'lifeos_settings',
                'lifeos_youtube', 'lifeos_pomodoro', 'lifeos_schedule'
            ];

            legacyKeys.forEach(key => {
                localStorage.removeItem(this.userPrefix + key);
                if (!this.userPrefix) localStorage.removeItem(key);
            });

            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },

    /**
     * Benzersiz ID oluştur
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    async exportData() {
        const data = {};

        // 1. Export based on official KEYS (for structure)
        Object.entries(this.KEYS).forEach(([name, key]) => {
            const val = this.load(key, []);
            data[name.toLowerCase()] = val;
            data[key] = val;
        });

        // 2. Comprehensive Sweep: Export ALL keys in localStorage starting with this user's prefix
        // This ensures extra settings, legacy keys, or module-specific data is also backed up.
        if (this.userPrefix) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.userPrefix)) {
                    // Avoid double-saving under long key names if already added by structured loop
                    // but it's safer to just save everything to be sure.
                    try {
                        const rawVal = localStorage.getItem(key);
                        data[key] = JSON.parse(rawVal);
                    } catch (e) {
                        data[key] = localStorage.getItem(key);
                    }
                }
            }
        }


        // Add Large Objects (IndexedDB)
        const largeKeys = await this.getAllLargeKeys();
        const largeData = {};

        for (const fullKey of largeKeys) {
            const relativeKey = fullKey.replace(this.userPrefix, '');
            let val = await this.loadLarge(relativeKey);

            // CONVERSION: Must convert Blob back to string for JSON export
            if (val instanceof Blob) {
                val = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(val);
                });
            }

            largeData[relativeKey] = val;
        }
        data._large_assets = largeData;

        // Add a version/metadata tag
        data._backup_info = {
            version: '2.8 (Blob handling)',
            date: new Date().toISOString(),
            user: this.userPrefix.replace('user_', '').replace('_', ''),
            app: 'LifeOS'
        };

        return JSON.stringify(data, null, 2);
    },

    /**
     * Dosyaya Dışa Aktar (İndir)
     */
    async exportToFile() {
        const data = await this.exportData();
        const date = App.getLocalDateString ? App.getLocalDateString() : new Date().toISOString().split('T')[0];
        const filename = `lifeos_backup_${date}.json`;

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
        Notifications.showToast('Yedek İndirildi', 'Dosyayı diğer cihaza gönderip yükleyebilirsiniz.', 'success');
    },

    /**
     * Dosyadan İçe Aktar
     */
    async importFromFile(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            if (await this.importData(content)) {
                Notifications.showToast('Başarılı', 'Veriler geri yüklendi. Uygulama yenileniyor...', 'success');
                setTimeout(() => location.reload(), 2000);
            } else {
                Notifications.showToast('Hata', 'Dosya formatı geçersiz.', 'error');
            }
        };
        reader.readAsText(file);
    },

    async importData(jsonString) {
        try {
            if (!jsonString) return false;
            const data = (typeof jsonString === 'string') ? JSON.parse(jsonString) : jsonString;

            // Create a normalized map of the imported data for easier lookup
            const normalizedData = {};
            Object.keys(data).forEach(k => {
                normalizedData[k.toLowerCase()] = data[k];
            });

            // Handle Large Assets first (so metadata references are valid)
            if (data._large_assets) {
                for (const [key, value] of Object.entries(data._large_assets)) {
                    await this.saveLarge(key, value);
                }
            }

            Object.entries(this.KEYS).forEach(([name, key]) => {
                const dataKey = name.toLowerCase();
                const literalKey = key.toLowerCase();

                let importedValue = null;

                if (normalizedData[dataKey] !== undefined) {
                    importedValue = normalizedData[dataKey];
                }
                else if (normalizedData[literalKey] !== undefined) {
                    importedValue = normalizedData[literalKey];
                }
                else if (normalizedData[dataKey.replace('lifeos_', '')] !== undefined) {
                    importedValue = normalizedData[dataKey.replace('lifeos_', '')];
                }
                else if (name === 'LESSONS' && (normalizedData['lifeos_lessons'] || data['lessons_v5'])) {
                    importedValue = normalizedData['lifeos_lessons'] || data['lessons_v5'];
                }

                if (importedValue !== null && importedValue !== undefined) {
                    this.save(key, importedValue);
                }
            });

            // Special handling for non-array items if they weren't caught
            const specialKeys = ['PROFILE', 'SETTINGS', 'STATS'];
            specialKeys.forEach(sKey => {
                const storageKey = this.KEYS[sKey];
                const lowerKey = sKey.toLowerCase();
                if (normalizedData[lowerKey]) {
                    this.save(storageKey, normalizedData[lowerKey]);
                } else if (normalizedData['lifeos_' + lowerKey]) {
                    this.save(storageKey, normalizedData['lifeos_' + lowerKey]);
                }
            });

            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    },

    /**
     * İlk kullanım için varsayılan veri oluştur
     */
    initializeDefaults() {
        // Varsayılan ayarlar
        if (!this.load(this.KEYS.SETTINGS)) {
            this.save(this.KEYS.SETTINGS, {
                theme: 'dark',
                notifications: true,
                lastVisit: new Date().toISOString(),
                layout: {
                    accentColor: '#7c3aed',
                    blur: 20,
                    borderRadius: 20
                }
            });
        }

        // Boş listeler
        if (!this.load(this.KEYS.LESSONS)) {
            this.save(this.KEYS.LESSONS, []);
        }

        if (!this.load(this.KEYS.TASKS)) {
            this.save(this.KEYS.TASKS, []);
        }

        if (!this.load(this.KEYS.NOTIFICATIONS)) {
            this.save(this.KEYS.NOTIFICATIONS, []);
        }

        // İstatistikler
        if (!this.load(this.KEYS.STATS)) {
            this.save(this.KEYS.STATS, {
                dailyProgress: {},
                weeklyGoals: {},
                totalCompleted: 0
            });
        }
    }
};

// Sayfa yüklendiğinde varsayılanları başlat
document.addEventListener('DOMContentLoaded', () => {
    Storage.initializeDefaults();
});
