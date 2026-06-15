/**
 * Life OS - QR Code P2P Sync Module
 * Uses PeerJS for WebRTC connection and QRCode.js for pairing.
 */

const QRSync = {
    peer: null,
    conn: null,
    modalNode: null,

    init() {
        // Auto-check URL for ?syncId
        const urlParams = new URLSearchParams(window.location.search);
        const syncId = urlParams.get('syncId');
        if (syncId) {
            // Strip the URL so it doesn't trigger again on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Wait slightly for App to load
            setTimeout(() => this.connectToHost(syncId), 500);
        }
    },

    initPeer() {
        return new Promise((resolve, reject) => {
            if (this.peer && !this.peer.destroyed) {
                resolve(this.peer.id);
                return;
            }

            // Using free PeerJS cloud
            this.peer = new Peer();
            
            this.peer.on('open', (id) => {
                resolve(id);
            });

            this.peer.on('connection', (connection) => {
                this.handleConnection(connection);
            });

            this.peer.on('error', (err) => {
                console.error("PeerJS error:", err);
                if (window.Notifications) Notifications.showToast('Bağlantı Hatası', err.message, 'error');
                reject(err);
            });
        });
    },

    async openPairingModal() {
        console.log("openPairingModal called!");
        this.createModal();
        this.renderLoading("Bağlantı hazırlanıyor, sunucuya bağlanılıyor...");
        
        try {
            const id = await this.initPeer();
            
            // Generate QR code pointing to current URL + ?syncId=ID
            const baseUrl = window.location.origin + window.location.pathname;
            const syncUrl = `${baseUrl}?syncId=${id}`;
            
            this.renderHostModal(syncUrl);
            
        } catch (error) {
            this.closeModal();
            const errMsg = error.message || error.toString();
            Notifications.showToast('Hata', `Sinyal sunucusuna ulaşılamadı. Hata: ${errMsg}`, 'error');
        }
    },

    async connectToHost(syncId) {
        this.createModal();
        this.renderLoading("Karşı cihaza bağlanılıyor...");
        
        try {
            await this.initPeer();
            
            const connection = this.peer.connect(syncId, { reliable: true });
            this.handleConnection(connection);
            
        } catch (error) {
            this.closeModal();
            Notifications.showToast('Hata', 'Cihaza bağlanılamadı.', 'error');
        }
    },

    handleConnection(connection) {
        this.conn = connection;
        
        this.conn.on('open', () => {
            Notifications.showToast('Bağlandı!', 'Cihazlar eşleşti.', 'success');
            this.renderConnectedModal();
        });

        this.conn.on('data', async (data) => {
            if (data.type === 'REQUEST_DATA') {
                // Other side wants our data
                const payload = await Storage.exportData();
                this.conn.send({ type: 'SYNC_PAYLOAD', payload: payload });
            } else if (data.type === 'SYNC_PAYLOAD') {
                // We received data from other side
                const success = await Storage.importData(data.payload);
                if (success) {
                    this.renderLoading("Aktarım başarılı! Yeniden başlatılıyor...");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    Notifications.showToast('Hata', 'Veri aktarımı başarısız oldu.', 'error');
                    this.closeModal();
                }
            }
        });

        this.conn.on('close', () => {
            Notifications.showToast('Bağlantı Koptu', 'Cihaz ile bağlantı kesildi.', 'warning');
            this.closeModal();
        });
    },

    sendData() {
        if (!this.conn) return;
        this.renderLoading("Verileriniz karşı cihaza gönderiliyor...");
        Storage.exportData().then(payload => {
            this.conn.send({ type: 'SYNC_PAYLOAD', payload: payload });
            setTimeout(() => {
                Notifications.showToast('Gönderildi', 'Veriler başarıyla iletildi!', 'success');
                this.closeModal();
            }, 1000);
        });
    },

    requestData() {
        if (!this.conn) return;
        this.renderLoading("Karşı cihazdan veriler bekleniyor...");
        this.conn.send({ type: 'REQUEST_DATA' });
    },

    disconnect() {
        if (this.conn) {
            this.conn.close();
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.closeModal();
    },

    // UI METHODS -------------------------------------------------------------
    
    createModal() {
        if (this.modalNode) return;

        this.modalNode = document.createElement('div');
        this.modalNode.className = 'modal glass-modal active';
        this.modalNode.id = 'qrSyncModal';
        this.modalNode.style.display = 'flex';
        this.modalNode.style.zIndex = '9999';

        this.modalNode.innerHTML = `
            <div class="modal-content glass-panel" style="max-width: 400px; text-align: center; padding: 30px 20px;">
                <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
                    <h2 class="modal-title">Cihaz Senkronizasyonu</h2>
                    <button class="modal-close" style="position: absolute; right: 20px;" onclick="QRSync.disconnect()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body" id="qrSyncModalBody" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding-top: 20px;">
                    <!-- Dynamic Content -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modalNode);
    },

    closeModal() {
        if (this.modalNode) {
            this.modalNode.remove();
            this.modalNode = null;
        }
    },

    renderLoading(message) {
        const body = document.getElementById('qrSyncModalBody');
        if (!body) return;
        body.innerHTML = `
            <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid rgba(168, 85, 247, 0.2); border-left-color: var(--accent-purple); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: var(--text-muted); font-size: 14px; margin-top: 10px;">${message}</p>
        `;
    },

    renderHostModal(syncUrl) {
        const body = document.getElementById('qrSyncModalBody');
        if (!body) return;
        
        body.innerHTML = `
            <p style="color: var(--text-muted); font-size: 14px; margin-top: -10px;">Bu karekodu, aktarım yapmak istediğiniz cihazın (örneğin telefonunuzun) normal kamerasıyla okutun.</p>
            <div id="qrCodeContainer" style="background: white; padding: 15px; border-radius: 16px; display: inline-block;">
                <canvas id="qrCodeCanvas"></canvas>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">Tarayıcı açıldığında iki cihaz otomatik eşleşecektir.</p>
        `;

        // Render QR Code
        const canvas = document.getElementById('qrCodeCanvas');
        if (window.QRCode && canvas) {
            QRCode.toCanvas(canvas, syncUrl, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function (error) {
                if (error) console.error(error);
            });
        }
    },

    renderConnectedModal() {
        const body = document.getElementById('qrSyncModalBody');
        if (!body) return;

        body.innerHTML = `
            <div style="background: rgba(34, 197, 94, 0.1); color: #22c55e; width: 60px; height: 60px; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 style="margin: 0;">Bağlantı Kuruldu!</h3>
            <p style="color: var(--text-muted); font-size: 14px; margin-top: -5px;">İki cihaz şu an güvenli bir şekilde birbirine bağlı. Aktarım yönünü seçin:</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 10px;">
                <button class="btn btn-primary" onclick="QRSync.sendData()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Bu Cihazdaki Veriyi Diğerine Gönder
                </button>
                <button class="btn btn-outline" onclick="QRSync.requestData()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Karşı Cihazdaki Veriyi Buraya Al
                </button>
            </div>
            <p style="font-size: 11px; color: var(--danger); margin-top: 10px;">Uyarı: Veri aktarımı işlemi alıcı cihazdaki mevcut verilerin üzerine yazar.</p>
        `;
    }
};

// Expose
window.QRSync = QRSync;

// Initialize if script is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Timeout to ensure other scripts have initialized
    setTimeout(() => {
        QRSync.init();
    }, 1000);
});
