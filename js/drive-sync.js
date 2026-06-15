/**
 * Life OS - Google Drive Sync Module
 * Handles authentication and file operations with Google Drive API
 */

const DriveSync = {
    // Configuration
    CLIENT_ID: '', // User will provide this
    API_KEY: '',   // Optional, not strictly needed for Drive file scope with token
    DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    SCOPES: "https://www.googleapis.com/auth/drive.file",

    // State
    tokenClient: null,
    gapiInited: false,
    gisInited: false,
    isAuthenticated: false,
    backupFileId: null,
    APP_DATA_FILENAME: 'lifeos_backup.json',

    /**
     * Initialize the module
     */
    init() {
        // Check if user has provided Client ID in settings
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        if (settings.googleClientId) {
            this.CLIENT_ID = settings.googleClientId;
            this.loadScripts();
        }
    },

    setClientId(id) {
        this.CLIENT_ID = id;
        if (!this.gapiInited) {
            this.loadScripts();
        } else {
            // Re-init GIS if needed
            this.initializeGisClient();
        }
    },

    /**
     * Load Google API Scripts dynamically
     */
    loadScripts() {
        if (this.gapiInited) return;

        // Load GAPI
        const script1 = document.createElement('script');
        script1.src = "https://apis.google.com/js/api.js";
        script1.onload = () => {
            gapi.load('client', this.initializeGapiClient.bind(this));
        };
        document.body.appendChild(script1);

        // Load GIS
        const script2 = document.createElement('script');
        script2.src = "https://accounts.google.com/gsi/client";
        script2.onload = () => {
            this.initializeGisClient();
        };
        document.body.appendChild(script2);
    },

    /**
     * Initialize GAPI Client
     */
    async initializeGapiClient() {
        try {
            await gapi.client.init({
                discoveryDocs: this.DISCOVERY_DOCS,
            });
            this.gapiInited = true;
            this.checkAuth();
        } catch (err) {
            console.error('GAPI Init Error:', err);
        }
    },

    /**
     * Initialize GIS Client
     */
    initializeGisClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: '', // defined at request time
        });
        this.gisInited = true;
        this.checkAuth();
    },

    /**
     * Check if ready
     */
    checkAuth() {
        if (this.gapiInited && this.gisInited) {
            // Check if we have a valid token (simple check)
            const token = gapi.client.getToken();
            if (token) {
                this.isAuthenticated = true;
                this.updateUI();
            }
        }
    },

    /**
     * Connect / Login
     */
    connect() {
        if (!this.tokenClient) return;

        this.tokenClient.callback = async (resp) => {
            if (resp.error) {
                throw resp;
            }
            this.isAuthenticated = true;
            this.updateUI();
            Notifications.showToast('Drive Bağlandı', 'Google Drive başarıyla bağlandı', 'success');
            await this.findBackupFile();
        };

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            this.tokenClient.requestAccessToken({ prompt: '' });
        }
    },

    /**
     * Sign Out
     */
    disconnect() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            this.isAuthenticated = false;
            this.updateUI();
            Notifications.showToast('Bağlantı Kesildi', 'Google Drive bağlantısı kesildi', 'info');
        }
    },

    /**
     * Update UI based on state
     */
    updateUI() {
        const btn = document.getElementById('driveConnectBtn');
        const status = document.getElementById('driveStatus');

        if (btn && status) {
            if (this.isAuthenticated) {
                btn.textContent = 'Bağlantıyı Kes';
                btn.onclick = () => this.disconnect();
                btn.classList.replace('btn-primary', 'btn-secondary');
                status.innerHTML = '<span style="display:flex; align-items:center; gap:6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Bağlı</span>';
                status.style.color = 'var(--success)';
            } else {
                btn.textContent = 'Google Drive Bağla';
                btn.onclick = () => this.connect();
                btn.classList.replace('btn-secondary', 'btn-primary');
                status.innerHTML = '<span style="display:flex; align-items:center; gap:6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg> Bağlı Değil</span>';
                status.style.color = 'var(--text-muted)';
            }
        }
    },

    /**
     * Find existing backup file
     */
    async findBackupFile() {
        try {
            const response = await gapi.client.drive.files.list({
                'q': `name = '${this.APP_DATA_FILENAME}' and trashed = false`,
                'fields': 'files(id, name, modifiedTime)',
                'spaces': 'drive'
            });
            const files = response.result.files;
            if (files && files.length > 0) {
                this.backupFileId = files[0].id;
                return files[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error finding file:', err);
            return null;
        }
    },

    /**
     * Upload Data (Sync to Cloud)
     */
    async upload() {
        if (!this.isAuthenticated) {
            Notifications.showToast('Hata', 'Önce Google Drive\'a bağlanın', 'error');
            return;
        }

        try {
            const data = await Storage.exportData();
            const file = new Blob([data], { type: 'application/json' });
            const metadata = {
                'name': this.APP_DATA_FILENAME,
                'mimeType': 'application/json'
            };

            const accessToken = gapi.client.getToken().access_token;
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            let method = 'POST';

            // If updating existing file
            if (this.backupFileId) {
                url = `https://www.googleapis.com/upload/drive/v3/files/${this.backupFileId}?uploadType=multipart`;
                method = 'PATCH';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                },
                body: form
            });

            const result = await response.json();
            if (result.id) {
                this.backupFileId = result.id;
                Notifications.showToast('Yedeklendi', 'Veriler Google Drive\'a yüklendi', 'success');
                return true;
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            Notifications.showToast('Hata', 'Yükleme başarısız oldu', 'error');
            return false;
        }
    },

    /**
     * Download Data (Sync from Cloud)
     */
    async download() {
        if (!this.isAuthenticated) return;

        try {
            const fileInfo = await this.findBackupFile();
            if (!fileInfo) {
                Notifications.showToast('Dosya Yok', 'Drive\'da yedek dosyası bulunamadı', 'warning');
                return;
            }

            const response = await gapi.client.drive.files.get({
                fileId: this.backupFileId,
                alt: 'media'
            });

            const data = response.result; // gapi automatic parses JSON
            // gapi.client.drive.files.get returns the body in result for alt=media
            // But sometimes it returns string, we need to be careful.

            const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

            if (Storage.importData(jsonString)) {
                Notifications.showToast('Eşitlendi', 'Veriler Drive\'dan geri yüklendi', 'success');
                setTimeout(() => location.reload(), 1500);
            }

        } catch (err) {
            console.error('Download Error:', err);
            Notifications.showToast('Hata', 'İndirme başarısız oldu', 'error');
        }
    },

    /**
     * Alias for upload to maintain compatibility
     */
    async syncToDrive() {
        return await this.upload();
    }
};

// Expose to window
window.DriveSync = DriveSync;
