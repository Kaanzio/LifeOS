/**
 * Life OS - Notifications Module v2
 * Bildirim sistemi yönetimi - Silme özelliği ile
 */

const Notifications = {
    panel: null,
    list: null,
    badge: null,
    notifications: [],

    /**
     * Modülü başlat
     */
    init() {
        this.panel = document.getElementById('notificationsPanel');
        this.list = document.getElementById('notificationsList');
        this.badge = document.getElementById('notificationBadge');

        this.loadNotifications();
        this.updateBadge();
        this.renderNotifications();
        this.checkScheduledNotifications();
    },

    /**
     * Bildirimleri yükle
     */
    loadNotifications() {
        this.notifications = Storage.load(Storage.KEYS.NOTIFICATIONS, []);
    },

    /**
     * Bildirimleri kaydet
     */
    saveNotifications() {
        Storage.save(Storage.KEYS.NOTIFICATIONS, this.notifications);
    },

    /**
     * Yeni bildirim ekle
     * @param {string} title - Başlık
     * @param {string} message - Mesaj
     * @param {string} type - info, success, warning, error
     * @param {boolean} isSystemic - true ise listeye eklenmez, sadece toast gösterilir
     */
    add(title, message, type = 'info', isSystemic = false) {
        const notification = {
            id: Storage.generateId(),
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };

        if (!isSystemic) {
            this.notifications.unshift(notification);
            this.saveNotifications();
            this.renderNotifications();
            this.updateBadge();
        }

        this.showToast(title, message, type);

        return notification;
    },
    /**
     * Bildirimi okundu olarak işaretle
     */
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.renderNotifications();
            this.updateBadge();
        }
    },

    /**
     * Tüm bildirimleri okundu olarak işaretle
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.renderNotifications();
        this.updateBadge();
    },

    /**
     * Bildirimi sil
     */
    remove(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.renderNotifications();
        this.updateBadge();
    },

    /**
     * Tüm bildirimleri temizle
     */
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.renderNotifications();
        this.updateBadge();
    },

    /**
     * Badge'i güncelle
     */
    updateBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        if (this.badge) {
            this.badge.textContent = unreadCount;
            this.badge.setAttribute('data-count', unreadCount);
        }
    },

    /**
     * Paneli aç/kapat
     */
    togglePanel() {
        if (this.panel) {
            this.panel.classList.toggle('open');
        }
    },

    /**
     * Paneli kapat
     */
    closePanel() {
        if (this.panel) {
            this.panel.classList.remove('open');
        }
    },

    /**
     * Dropdown Bildirimlerini Render Et
     */
    renderDropdown() {
        const list = document.getElementById('notificationListSmall');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `<div class="empty-notifications">Bildirim yok</div>`;
            return;
        }

        list.innerHTML = this.notifications.map(n => `
            <div class="notification-item-small ${n.read ? '' : 'unread'}" onclick="Notifications.markAsRead('${n.id}')">
                <div class="notif-title-sm">${n.title}</div>
                <span class="notif-msg-sm">${n.message || ''}</span>
                <span class="notif-time-sm">${this.formatTime(n.createdAt)}</span>
            </div>
        `).join('');

        // Bind Actions
        document.getElementById('markAllReadBtn').onclick = () => this.markAllAsRead();
        document.getElementById('viewAllNotifications').onclick = () => {
            this.notifications = [];
            this.renderDropdown();
            this.renderNotifications();
            this.updateBadge();
        };
    },

    /**
     * Bildirimleri render et (Legacy Panel)
     */
    renderNotifications() {
        // Also update dropdown if it's open
        if (document.getElementById('notificationDropdown')?.classList.contains('active')) {
            this.renderDropdown();
        }

        if (!this.list) return;

        if (this.notifications.length === 0) {
            this.list.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px 20px;">
                    <div style="margin-bottom: 16px; color: var(--text-muted);"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div>
                    <p>Henüz bildirim yok</p>
                </div>
            `;
            return;
        }

        this.list.innerHTML = `
            <div class="notifications-actions" style="display: flex; gap: 8px; margin-bottom: 16px;">
                <button class="btn btn-secondary" id="markAllRead" style="flex: 1; font-size: 12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tümünü Okundu İşaretle
                </button>
                <button class="btn btn-secondary" id="clearAllNotifications" style="font-size: 12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> Temizle
                </button>
            </div>
            ${this.notifications.map(n => `
                <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                    <button class="notification-delete" onclick="Notifications.remove('${n.id}')" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg></button>
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-message">${n.message || ''}</div>
                    <div class="notification-time">${this.formatTime(n.createdAt)}</div>
                </div>
            `).join('')}
        `;

        // Event bağla
        this.list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Delete butonuna tıklanmadıysa okundu işaretle
                if (!e.target.classList.contains('notification-delete')) {
                    this.markAsRead(item.dataset.id);
                }
            });
        });

        // Mark all read button
        document.getElementById('markAllRead')?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Clear all button
        document.getElementById('clearAllNotifications')?.addEventListener('click', () => {
            this.confirm(
                'Tümünü Temizle',
                'Tüm bildirimler silinecek. Emin misiniz?',
                () => this.clearAll()
            );
        });
    },

    /**
     * Zamanı formatla
     */
    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dakika önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;

        return date.toLocaleDateString('tr-TR');
    },

    /**
     * Toast bildirimi göster
     */
    showToast(title, message, type = 'info') {
        // Toast container yoksa oluştur
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                top: 90px;
                right: 32px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // Toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            padding: 16px 20px;
            background: var(--bg-secondary);
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 40px var(--shadow-color);
            max-width: 350px;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
        `;

        const iconMap = {
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>',
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>'
        };

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 20px;">${iconMap[type]}</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
                    ${message ? `<div style="font-size: 14px; color: var(--text-secondary);">${message}</div>` : ''}
                </div>
            </div>
        `;

        container.appendChild(toast);

        // Animasyon için CSS ekle
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // 4 saniye sonra kaldır
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    /**
     * Zamanlanmış bildirimleri kontrol et
     */
    checkScheduledNotifications() {
        // Günlük kontroller
        setInterval(() => {
            this.checkDailyReminders();
            this.checkUpcomingReminders(); // Add this
        }, 60000); // Her dakika kontrol

        // İlk yüklemede de kontrol et
        this.checkDailyReminders();
        this.checkUpcomingReminders(); // Add this
    },

    /**
     * Yaklaşan etkinlikleri (1 saat ve 30 dk kala) kontrol et
     */
    checkUpcomingReminders() {
        const now = new Date();
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const sentReminders = settings.sentUpcomingReminders || {}; // { itemId_type: [60, 30] }
        let changed = false;

        // 1. Görevleri Kontrol Et
        const tasks = (typeof Planning !== 'undefined' && Planning.tasks) ? Planning.tasks : [];
        tasks.forEach(task => {
            if (task.status === 'done' || !task.dueDate || !task.dueTime) return;

            const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
            const diffMs = dueDateTime - now;
            const diffMin = Math.round(diffMs / 60000);

            const key = `${task.id}_task`;
            if (!sentReminders[key]) sentReminders[key] = [];

            // 60 Dakika Kala
            if (diffMin === 60 && !sentReminders[key].includes(60)) {
                this.add('Yaklaşan Görev (1 Saat)', `"${task.title}" 1 saat içinde başlıyor.`, 'warning');
                sentReminders[key].push(60);
                changed = true;
            }
            // 30 Dakika Kala
            else if (diffMin === 30 && !sentReminders[key].includes(30)) {
                this.add('Yaklaşan Görev (30 Dakika)', `"${task.title}" 30 dakika içinde başlıyor.`, 'error');
                sentReminders[key].push(30);
                changed = true;
            }
        });

        // 2. Sınavları Kontrol Et
        const exams = (typeof Exams !== 'undefined' && Exams.exams) ? Exams.exams : [];
        exams.forEach(exam => {
            if (!exam.date || !exam.time) return;

            const examDateTime = new Date(`${exam.date}T${exam.time}`);
            const diffMs = examDateTime - now;
            const diffMin = Math.round(diffMs / 60000);

            const key = `${exam.id}_exam`;
            if (!sentReminders[key]) sentReminders[key] = [];

            // 60 Dakika Kala
            if (diffMin === 60 && !sentReminders[key].includes(60)) {
                this.add('Yaklaşan Sınav (1 Saat)', `"${exam.name}" sınavı 1 saat içinde başlıyor.`, 'warning');
                sentReminders[key].push(60);
                changed = true;
            }
            // 30 Dakika Kala
            else if (diffMin === 30 && !sentReminders[key].includes(30)) {
                this.add('Yaklaşan Sınav (30 Dakika)', `"${exam.name}" sınavı 30 dakika içinde başlıyor.`, 'error');
                sentReminders[key].push(30);
                changed = true;
            }
        });

        if (changed) {
            settings.sentUpcomingReminders = sentReminders;
            Storage.save(Storage.KEYS.SETTINGS, settings);
        }
    },

    /**
     * Günlük hatırlatmaları kontrol et
     */
    checkDailyReminders() {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const today = new Date().toDateString();

        // Bugün genel özeti zaten gönderdik mi?
        const sentSummaries = settings.sentSummaries || [];
        const hasTodaySummary = sentSummaries.includes(today);

        const now = new Date();
        const hour = now.getHours();

        // Sabah 9'da genel özet hatırlatma
        if (hour >= 9 && hour < 10 && !hasTodaySummary) {
            const tasks = Storage.load(Storage.KEYS.TASKS, []);
            const todayTasks = tasks.filter(t => {
                const taskDate = new Date(t.dueDate).toDateString();
                return taskDate === today && t.status !== 'done';
            });

            if (todayTasks.length > 0) {
                this.add(
                    'Günaydın!',
                    `Bugün ${todayTasks.length} görevin var.`,
                    'info'
                );
            }

            settings.sentSummaries = [...sentSummaries, today].slice(-7); // Keep last 7 days
            Storage.save(Storage.KEYS.SETTINGS, settings);
        }

        // Görev bazlı hatırlatmalar (1 hafta, 3 gün, 1 gün)
        this.checkTaskReminders();
    },

    /**
     * Görev bazlı hatırlatmaları kontrol et
     */
    checkTaskReminders() {
        const tasks = Storage.load(Storage.KEYS.TASKS, []);
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const sentReminders = settings.sentReminders || {}; // { taskId: [7, 3, 1] }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let changed = false;

        tasks.forEach(task => {
            if (task.status === 'done') return;

            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const taskReminders = sentReminders[task.id] || [];

            // 1 Hafta (7 gün)
            if (diffDays === 7 && !taskReminders.includes(7)) {
                this.add('Görev Hatırlatıcı', `"${task.title}" için 1 hafta kaldı.`, 'warning');
                taskReminders.push(7);
                changed = true;
            }
            // 3 Gün
            else if (diffDays === 3 && !taskReminders.includes(3)) {
                this.add('Yaklaşan Görev', `"${task.title}" için 3 gün kaldı.`, 'warning');
                taskReminders.push(3);
                changed = true;
            }
            // 1 Gün
            else if (diffDays === 1 && !taskReminders.includes(1)) {
                this.add('Son Gün!', `"${task.title}" için sadece 1 gün kaldı.`, 'error');
                taskReminders.push(1);
                changed = true;
            }

            if (changed) {
                sentReminders[task.id] = taskReminders;
            }
        });

        if (changed) {
            settings.sentReminders = sentReminders;
            Storage.save(Storage.KEYS.SETTINGS, settings);
        }
    },

    /**
     * Özel Onay Penceresi Göster
     * @param {string} title - Başlık
     * @param {string} message - Açıklama
     * @param {function} onConfirm - Onaylandığında çalışacak fonksiyon
     */
    confirm(title, message, onConfirm, confirmText = 'Evet, sil') {
        const overlay = document.getElementById('customConfirmOverlay');
        const titleEl = document.getElementById('confirmTitle');
        const msgEl = document.getElementById('confirmMessage');
        const updatedOkBtn = document.getElementById('confirmOk');
        const updatedCancelBtn = document.getElementById('confirmCancel');

        if (!overlay) return;

        titleEl.textContent = title;
        msgEl.innerHTML = message;

        // Update button text
        updatedOkBtn.textContent = confirmText;

        // Reset Actions (cloneNode to remove old event listeners)
        const newOkBtn = updatedOkBtn.cloneNode(true);
        const newCancelBtn = updatedCancelBtn.cloneNode(true);
        updatedOkBtn.parentNode.replaceChild(newOkBtn, updatedOkBtn);
        updatedCancelBtn.parentNode.replaceChild(newCancelBtn, updatedCancelBtn);

        // Open
        overlay.classList.add('active');

        // Bind Events
        newOkBtn.onclick = () => {
            overlay.classList.remove('active');
            if (onConfirm) onConfirm();
        };

        newCancelBtn.onclick = () => {
            overlay.classList.remove('active');
        };

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        };
    },

    /**
     * Özel Prompt Penceresi Göster
     * @param {string} title - Başlık
     * @param {string} message - Açıklama
     * @param {string} defaultValue - Varsayılan değer
     * @param {function} onConfirm - Onaylandığında çalışacak fonksiyon (değeri parametre alır)
     */
    prompt(title, message, defaultValue, onConfirm) {
        const overlay = document.getElementById('customPromptOverlay');
        const titleEl = document.getElementById('promptTitle');
        const msgEl = document.getElementById('promptMessage');
        const inputEl = document.getElementById('promptInput');
        const okBtn = document.getElementById('promptOk');
        const cancelBtn = document.getElementById('promptCancel');

        if (!overlay || !inputEl) return;

        titleEl.textContent = title;
        msgEl.textContent = message;
        inputEl.value = defaultValue || '';

        // Open
        overlay.classList.add('active');

        // Focus input
        setTimeout(() => inputEl.focus(), 100);

        // Bind Actions
        const close = () => overlay.classList.remove('active');

        okBtn.onclick = () => {
            const val = inputEl.value.trim();
            if (val !== '') {
                close();
                if (onConfirm) onConfirm(val);
            }
        };

        cancelBtn.onclick = close;

        // Enter key support
        inputEl.onkeyup = (e) => {
            if (e.key === 'Enter') okBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) close();
        };
    }
};
