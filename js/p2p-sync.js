/**
 * Life OS - P2P Sync Module (6-Digit PIN)
 * WebRTC based cross-device synchronization via PeerJS
 */

const P2PSync = {
    peer: null,
    conn: null,
    pin: null,
    isHost: false,

    init() {
        this.setupPinInputs();
    },

    showHostView() {
        document.getElementById('syncInitialView').style.display = 'none';
        document.getElementById('syncHostView').style.display = 'block';
        document.getElementById('syncClientView').style.display = 'none';
        
        this.isHost = true;
        this.startHost();
    },

    showClientView() {
        document.getElementById('syncInitialView').style.display = 'none';
        document.getElementById('syncHostView').style.display = 'none';
        document.getElementById('syncClientView').style.display = 'block';
        
        this.isHost = false;
        
        // Clear inputs and focus first
        const inputs = document.querySelectorAll('.pin-box');
        inputs.forEach(input => {
            input.value = '';
            input.disabled = false;
        });
        inputs[0].focus();
        
        this.startClient();
    },

    cancel() {
        this.cleanup();
        
        const initView = document.getElementById('syncInitialView');
        const hostView = document.getElementById('syncHostView');
        const clientView = document.getElementById('syncClientView');
        
        if (initView) initView.style.display = 'block';
        if (hostView) hostView.style.display = 'none';
        if (clientView) clientView.style.display = 'none';
    },

    cleanup() {
        if (this.conn) {
            this.conn.close();
            this.conn = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    },

    setupPinInputs() {
        const inputs = document.querySelectorAll('.pin-box');
        if (!inputs.length) return;
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                if (!/^[0-9]$/.test(val)) {
                    e.target.value = '';
                    return;
                }
                if (val && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                this.checkClientPin();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                } else if (e.key === 'e' || e.key === '.' || e.key === '+' || e.key === '-') {
                    e.preventDefault(); // Prevent non-numeric chars in number inputs
                }
            });

            // Prevent paste issues
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
                for (let i = 0; i < pastedData.length; i++) {
                    if (inputs[i]) {
                        inputs[i].value = pastedData[i];
                        if (i < 5) inputs[i + 1].focus();
                    }
                }
                this.checkClientPin();
            });
        });
    },

    checkClientPin() {
        const inputs = document.querySelectorAll('.pin-box');
        let pin = '';
        inputs.forEach(input => pin += input.value);
        
        if (pin.length === 6) {
            // Disable inputs
            inputs.forEach(input => input.disabled = true);
            this.connectToHost(pin);
        }
    },

    async startHost() {
        this.cleanup();
        
        // Generate random 6 digit pin
        this.pin = Math.floor(100000 + Math.random() * 900000).toString();
        
        const pinDisplay = document.getElementById('hostPinDisplay');
        pinDisplay.textContent = this.pin;
        
        const status = document.getElementById('hostSyncStatus');
        status.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(124, 58, 237, 0.3); border-top-color: #7c3aed; border-radius: 50%; animation: spin 1s linear infinite;"></div> Sunucuya bağlanılıyor...';
        
        try {
            this.peer = new Peer(this.pin, {
                // Ensure reliable connection
                config: {'iceServers': [
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'stun:stun1.l.google.com:19302' }
                ]}
            });
            
            this.peer.on('open', (id) => {
                status.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(124, 58, 237, 0.3); border-top-color: #7c3aed; border-radius: 50%; animation: spin 1s linear infinite;"></div> Cihaz bekleniyor...';
            });
            
            this.peer.on('connection', (conn) => {
                this.conn = conn;
                this.setupHostConnection();
            });
            
            this.peer.on('error', (err) => {
                this.handleError(err);
            });
        } catch (e) {
            this.handleError(e);
        }
    },

    setupHostConnection() {
        this.conn.on('open', () => {
            // Ask user for approval
            const accept = confirm("Bir cihaz verilerinizi senkronize etmek için bağlanmak istiyor. İki cihazdaki veriler birleştirilecektir. Kabul ediyor musunuz?");
            
            if (accept) {
                document.getElementById('hostSyncStatus').innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(124, 58, 237, 0.3); border-top-color: #7c3aed; border-radius: 50%; animation: spin 1s linear infinite;"></div> Veriler gönderiliyor...';
                
                // Send ACCEPT and full local state
                this.exportAndSend();
            } else {
                this.conn.send({ type: 'REJECT' });
                this.cancel();
            }
        });
        
        this.conn.on('data', async (data) => {
            if (data.type === 'MERGED_STATE') {
                // Client has done the merging and sent back the final state
                document.getElementById('hostSyncStatus').innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(124, 58, 237, 0.3); border-top-color: #7c3aed; border-radius: 50%; animation: spin 1s linear infinite;"></div> Veriler kaydediliyor...';
                
                const success = await Storage.importData(JSON.stringify(data.payload));
                if (success) {
                    document.getElementById('hostSyncStatus').innerHTML = '<span style="color: var(--success-color)">Senkronizasyon Başarılı! Sayfa yenileniyor...</span>';
                    setTimeout(() => location.reload(), 2000);
                } else {
                    this.handleError(new Error("Veri kaydetme hatası"));
                }
            }
        });
        
        this.conn.on('close', () => {
            const hostView = document.getElementById('syncHostView');
            if (hostView && hostView.style.display === 'block') {
                this.cancel();
            }
        });
    },

    async exportAndSend() {
        try {
            const localDataStr = await Storage.exportData();
            // Export data might return object if not stringified. Let's make sure it's an object.
            const localData = typeof localDataStr === 'string' ? JSON.parse(localDataStr) : localDataStr;
            this.conn.send({ type: 'FULL_STATE', payload: localData });
        } catch (e) {
            this.handleError(e);
        }
    },

    async startClient() {
        this.cleanup();
        
        const status = document.getElementById('clientSyncStatus');
        status.style.display = 'flex';
        document.getElementById('clientStatusText').textContent = 'Sinyal sunucusuna bağlanılıyor...';
        
        try {
            this.peer = new Peer({
                config: {'iceServers': [
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'stun:stun1.l.google.com:19302' }
                ]}
            });
            
            this.peer.on('open', (id) => {
                document.getElementById('clientStatusText').textContent = 'Kod girilmesi bekleniyor...';
            });
            
            this.peer.on('error', (err) => {
                this.handleError(err);
                const inputs = document.querySelectorAll('.pin-box');
                inputs.forEach(input => input.disabled = false);
            });
        } catch (e) {
            this.handleError(e);
        }
    },

    connectToHost(pin) {
        if (!this.peer) return;
        
        document.getElementById('clientStatusText').textContent = 'Karşı cihaz aranıyor...';
        
        this.conn = this.peer.connect(pin);
        
        this.conn.on('open', () => {
            document.getElementById('clientStatusText').textContent = 'Bağlanıldı, host onayı bekleniyor...';
        });
        
        this.conn.on('data', async (data) => {
            if (data.type === 'REJECT') {
                alert("Karşı cihaz bağlantı isteğini reddetti.");
                this.cancel();
            } else if (data.type === 'FULL_STATE') {
                document.getElementById('clientStatusText').textContent = 'Veriler birleştiriliyor...';
                
                try {
                    // 1. Get local data
                    const localDataStr = await Storage.exportData();
                    const localData = typeof localDataStr === 'string' ? JSON.parse(localDataStr) : localDataStr;
                    
                    // 2. Merge local and remote
                    const mergedData = this.mergeData(localData, data.payload);
                    
                    // 3. Save merged data locally
                    document.getElementById('clientStatusText').textContent = 'Veriler kaydediliyor...';
                    await Storage.importData(JSON.stringify(mergedData));
                    
                    // 4. Send merged data back to host
                    document.getElementById('clientStatusText').textContent = 'Karşı cihaza gönderiliyor...';
                    this.conn.send({ type: 'MERGED_STATE', payload: mergedData });
                    
                    document.getElementById('clientSyncStatus').innerHTML = '<span style="color: var(--success-color)">Senkronizasyon Başarılı! Sayfa yenileniyor...</span>';
                    setTimeout(() => location.reload(), 2000);
                    
                } catch (e) {
                    this.handleError(e);
                }
            }
        });
        
        this.conn.on('close', () => {
            const clientView = document.getElementById('syncClientView');
            if (clientView && clientView.style.display === 'block') {
                this.cancel();
            }
        });
    },

    mergeData(local, remote) {
        const merged = { ...local };
        
        // Ensure remote is an object
        if (!remote || typeof remote !== 'object') return merged;

        Object.keys(remote).forEach(key => {
            if (!local[key]) {
                // If local doesn't have it, just take remote
                merged[key] = remote[key];
            } else {
                // Both have the key. Need to merge based on type.
                const localVal = local[key];
                const remoteVal = remote[key];
                
                if (Array.isArray(localVal) && Array.isArray(remoteVal)) {
                    // Arrays: Merge by ID and updated_at
                    merged[key] = this.mergeArrays(localVal, remoteVal);
                } else if (typeof localVal === 'object' && localVal !== null && typeof remoteVal === 'object' && remoteVal !== null) {
                    // Objects (e.g. Stats, Settings): Merge properties. Deeper nested objects might be overridden.
                    // For nested structures like stats, deep merge is safer.
                    merged[key] = this.deepMerge(localVal, remoteVal);
                } else {
                    // Primitives or strings: Arbitrarily take remote (could be simple flag).
                    merged[key] = remoteVal;
                }
            }
        });
        
        return merged;
    },

    mergeArrays(localArr, remoteArr) {
        const map = new Map();
        
        // 1. Add local items to map
        localArr.forEach(item => {
            if (item && item.id) {
                map.set(item.id.toString(), item);
            } else if (item && typeof item === 'string') {
                // Primitive arrays like habits or simple lists
                map.set(item, item);
            }
        });
        
        // 2. Process remote items
        remoteArr.forEach(item => {
            if (item && item.id) {
                const idStr = item.id.toString();
                const existing = map.get(idStr);
                
                if (existing) {
                    // Both have the item. Check updated_at
                    const localTime = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
                    const remoteTime = item.updated_at ? new Date(item.updated_at).getTime() : 0;
                    
                    if (remoteTime > localTime) {
                        map.set(idStr, item); // Remote is newer
                    } else if (localTime === 0 && remoteTime === 0) {
                        // Neither has updated_at. Deduplicate by ID (keep local, which is already in map, so do nothing).
                        // Or if we want to merge their properties deeply:
                        map.set(idStr, { ...existing, ...item });
                    }
                } else {
                    // Local doesn't have it, add it
                    map.set(idStr, item);
                }
            } else if (item && typeof item === 'string') {
                // Primitive string arrays
                map.set(item, item);
            } else {
                // Objects without ID? Just append if not identical. Hard to deduplicate.
                // For safety, generate a temp key or just push to an unmapped list.
            }
        });
        
        // Reconstruct array from map
        const mergedArr = Array.from(map.values());
        
        // Append items without ID from both arrays (if any exist)
        const noIdItems = [...localArr, ...remoteArr].filter(i => i && typeof i === 'object' && !i.id);
        
        // Simple deduplication for noIdItems using JSON stringify (inefficient but safe for small data)
        const uniqueNoId = [];
        const seen = new Set();
        noIdItems.forEach(item => {
            const str = JSON.stringify(item);
            if (!seen.has(str)) {
                seen.add(str);
                uniqueNoId.push(item);
            }
        });
        
        return [...mergedArr, ...uniqueNoId];
    },

    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },

    handleError(err) {
        console.error("P2P Sync Error:", err);
        const msg = err.message || err.toString();
        
        if (msg.includes("Browser does not support WebRTC")) {
            if (window.Notifications) Notifications.showToast('Hata', 'Tarayıcınız WebRTC desteklemiyor (HTTPS gerekli).', 'error');
        } else {
            if (window.Notifications) Notifications.showToast('Bağlantı Hatası', msg, 'error');
        }
        
        this.cancel();
    }
};

window.P2PSync = P2PSync;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => P2PSync.init(), 500);
});
