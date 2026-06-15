/**
 * Life OS - Habit Tracker Module v2
 * Çoklu zincir desteği ile alışkanlık takibi
 */

const HabitTracker = {
    chains: [],
    container: null,

    // Genişletilmiş zincir ikonları (SVG)
    chainIcons: [
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', // Target
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>', // Dumbbell
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', // Book
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.5 17.5 12 12 6.5 6.5 12z"/><path d="m15 14.5 2.5 2.5"/><path d="m9 9.5-2.5-2.5"/><path d="m15 9.5 2.5-2.5"/><path d="m9 14.5-2.5-2.5"/></svg>', // Activity
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>', // Droplet
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>', // Pen
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', // Edit
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>', // Check
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>', // CheckCircle
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z"/><path d="M12.5 8.5h4.75"/><path d="M4.5 3.5h15"/><path d="M17.25 10.5h-4.75"/><path d="M8.5 3.5v12"/></svg>', // Music
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>', // Coffee
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>', // Moon
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', // Users
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>', // Monitor/Coding
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>', // Heart
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', // Money
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M6 14c.22 0 .39-.17.39-.34V14c0-.34-.17-.66-.39-.66H4.39C4.17 13.34 4 13.66 4 14v-.34c0 .17.17.34.39.34"/><path d="M17 14c.22 0 .39-.17.39-.34V14c0-.34-.17-.66-.39-.66h-1.61c-.22 0-.39.32-.39.66v-.34c0 .17.17.34.39.34"/><rect width="12" height="12" x="6" y="8" rx="2"/></svg>', // Gamepad
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.5 2 7a7 7 0 0 1-7 7h-3Z"/><path d="M9 21s0-5.6 1.4-9"/><path d="M15 10c0 1.5.5 3 2 3"/></svg>', // Leaf/Nature
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>', // Smile
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/></svg>', // Meditation
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 2.67-2 3.5a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1c0-.83-.5-2.24-2-3.5"/><path d="M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M12 10v6"/><path d="m9 13 3 3 3-3"/></svg>', // Trophy
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 21a1.5 1.5 0 0 1-1.5-1.5V17H11v2.5a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 7 19.5V17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3v2.5a1.5 1.5 0 0 1-1.5 1.5h-1Z"/></svg>', // Message/Social
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-8 0 4 4 0 0 0-8 0 1 1 0 0 0 1 1h14a1 1 0 0 0 1-1 10 10 0 1 0-10 10Z"/></svg>', // Brain
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v6"/><path d="M10 12v6"/></svg>' // Building
    ],

    chainColors: [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#06b6d4', '#3b82f6', '#6366f1', '#7c3aed', '#9333ea', '#7c3aed'
    ],

    init() {
        this.container = document.getElementById('habitTracker');
        this.loadChains();
        this.render();
        this.checkDailyReminders();
    },

    /**
     * Günlük hatırlatıcı kontrolü
     */
    checkDailyReminders() {
        // Son hatırlatma kontrolü (Günde 1 kez)
        const lastReminded = localStorage.getItem('lifeos_habit_reminder_date');
        const today = (typeof App !== 'undefined' && App.getLocalDateString)
            ? App.getLocalDateString()
            : new Date().toISOString().split('T')[0];

        if (lastReminded === today) return;

        // Tamamlanmamış zincirleri bul
        const incompleteChains = this.chains.filter(chain => !chain.completedDays.includes(today));

        if (incompleteChains.length > 0) {
            Notifications.add(
                'Zinciri Kırma!',
                `Bugün tamamlaman gereken ${incompleteChains.length} alışkanlığın var. Serini bozma!`,
                'warning'
            );
            localStorage.setItem('lifeos_habit_reminder_date', today);
        }
    },

    loadChains() {
        this.chains = Storage.load('lifeos_habit_chains', [
            // Varsayılan bir zincir oluştur
            {
                id: 'default',
                name: 'Günlük Hedef',
                emoji: this.chainIcons[0],
                color: '#7c3aed',
                completedDays: [],
                createdAt: new Date().toISOString()
            }
        ]);

        // Migrate old emojis to SVGs and add colors
        this.chains = this.chains.map((c, index) => {
            if (c.emoji && typeof c.emoji === 'string') c.emoji = c.emoji.trim();
            // Assign random icon if old emoji
            if (!c.emoji || !c.emoji.startsWith('<')) {
                // Use index to pick different icons if multiple habits exist, or random
                const randomIconIndex = (index + Math.floor(Math.random() * 5)) % this.chainIcons.length;
                c.emoji = this.chainIcons[randomIconIndex];
            }
            // Assign random color if missing
            if (!c.color) {
                const randomColorIndex = (index + Math.floor(Math.random() * 5)) % this.chainColors.length;
                c.color = this.chainColors[randomColorIndex];
            }
            return c;
        });
        this.saveChains();
    },

    saveChains() {
        Storage.save('lifeos_habit_chains', this.chains);
    },

    /**
     * Yeni zincir ekle
     */
    addChain(name, emoji, color) {
        const chain = {
            id: Storage.generateId(),
            name: name,
            emoji: emoji || this.chainIcons[0],
            color: color || this.chainColors[0],
            completedDays: [],
            createdAt: new Date().toISOString()
        };

        this.chains.push(chain);
        this.saveChains();
        this.render();

        Notifications.add('Yeni Zincir Eklendi', `"${name}" zinciri oluşturuldu.`, 'success', true);
        return chain;
    },

    /**
     * Zincir sil
     */
    removeChain(chainId) {
        if (this.chains.length <= 1) {
            Notifications.showToast('Uyarı', 'En az bir zincir olmalı!', 'warning');
            return;
        }
        this.chains = this.chains.filter(c => c.id !== chainId);
        this.saveChains();
        this.render();
    },

    /**
     * Belirli bir zincirde bugünü toggle et
     */
    toggleDay(chainId, dateStr) {
        const chain = this.chains.find(c => c.id === chainId);
        if (!chain) return;

        const now = new Date();
        const today = App.getLocalDateString();

        // Gelecek günleri işaretleme
        if (dateStr > today) return;

        const index = chain.completedDays.indexOf(dateStr);

        if (index === -1) {
            chain.completedDays.push(dateStr);
            if (dateStr === today) {
                Notifications.showToast('Tebrikler!', 'Bugünü tamamladın!', 'success');
            }

            // Milestone Check (15, 30, 45...)
            const currentStreak = this.calculateStreak(chain);
            if (currentStreak > 0 && currentStreak % 15 === 0) {
                Notifications.add(
                    'Zincir Kırılmadı!',
                    `Harika! "${chain.name}" alışkanlığında ${currentStreak}. güne ulaştın. İstikrarın takdire şayan!`,
                    'success'
                );
            }
        } else {
            chain.completedDays.splice(index, 1);
        }

        this.saveChains();
        this.render();

        // Dashboard senkronizasyonu
        if (typeof Dashboard !== 'undefined' && Dashboard.updateHabitChain) {
            Dashboard.updateHabitChain();
            // Make HabitTracker globally available
            window.HabitTracker = HabitTracker;
            // Şimdilik sadece Dashboard tarafını güncelliyoruz.
        }
    },

    /**
     * Zincir için seri hesapla
     */
    calculateStreak(chain) {
        if (!chain || !chain.completedDays || chain.completedDays.length === 0) return 0;

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        let streak = 0;
        let checkDate = new Date(now);
        checkDate.setHours(0, 0, 0, 0);

        // Bugün tamamlanmamışsa dünden başla (fail-safe)
        if (!chain.completedDays.includes(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            if (chain.completedDays.includes(dStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    },

    /**
     * Son 28 günü al (Eskisi)
     */
    getLast28Days() {
        return this.getLastNDays(28);
    },

    /**
     * Son 30 günü al (Yeni 6x5 düzeni için)
     */
    getLast30Days() {
        return this.getLastNDays(30);
    },

    /**
     * Zincir için 28 günlük düzgün hizalanmış (Pzt-Paz) veri al
     */
    getHabitGridDays() {
        const days = [];
        const now = new Date();
        const todayStr = App.getLocalDateString();

        // Bugünün haftadaki gününü al (Pzt=1, ..., Paz=0 -> 7)
        let dayOfWeek = now.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7;

        // Bu haftanın Pazar gününü bul (Izgaranın son günü)
        const endGridDate = new Date(now);
        endGridDate.setDate(now.getDate() + (7 - dayOfWeek));

        // 27 gün geriye git (Toplam 28 gün = 4 tam hafta)
        for (let i = 27; i >= 0; i--) {
            const date = new Date(endGridDate);
            date.setDate(endGridDate.getDate() - i);
            const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            days.push({
                date: date,
                dateStr: dStr,
                day: date.getDate(),
                isToday: dStr === todayStr
            });
        }
        return days;
    },

    /**
     * Belirtilen gün sayısı kadar geri git
     */
    getLastNDays(n) {
        const days = [];
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            days.push({
                date: date,
                dateStr: dStr,
                day: date.getDate(),
                isToday: dStr === todayStr
            });
        }

        return days;
    },

    /**
     * Zincir ekleme modalı
     */
    showAddChainModal() {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'Yeni Zincir Oluştur';
        modalBody.innerHTML = `
            <form id="chainForm">
                <div class="form-group">
                    <label class="form-label">Zincir Adı *</label>
                    <input type="text" class="form-input" name="name" required placeholder="Örn: Günlük Egzersiz, Kitap Okuma">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Renk Seç</label>
                    <div class="color-grid" style="display: flex; gap: 10px; flex-wrap: wrap; padding: 5px; align-items: center; box-sizing: border-box;">
                        ${this.chainColors.map((c, i) => `
                            <div class="color-option-wrap preset-color ${c === '#7c3aed' ? 'selected' : ''}" 
                                 data-color="${c}"
                                 onclick="HabitTracker.selectColor(this, '${c}')"
                                 style="width: 28px; height: 28px; border-radius: 50%; background-color: ${c}; cursor: pointer; border: 2px solid transparent; box-sizing: border-box; transition: all 0.2s;">
                            </div>
                        `).join('')}
                        <!-- Özel Renk Seçimi -->
                        <label id="customColorPicker" class="color-option-wrap"
                               style="width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border: 2px solid var(--border-color); box-sizing: border-box; transition: all 0.2s; position: relative; margin: 0;" 
                               title="Özel Renk">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); pointer-events: none;"><path d="M12 5v14M5 12h14"/></svg>
                            <input type="color" id="chainCustomColor" 
                                   style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
                                   oninput="HabitTracker.selectCustomColor(this)">
                        </label>
                    </div>
                    <style>
                        #chainForm .color-option-wrap.selected {
                            border-color: var(--text-primary) !important;
                            transform: scale(1.2);
                            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
                        }
                    </style>
                </div>

                <div class="form-group">
                    <label class="form-label">Simge Seç</label>
                    <div class="emoji-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                        ${this.chainIcons.map((e, i) => `
                            <div class="emoji-option ${i === 0 ? 'selected' : ''}" 
                                 onclick="document.querySelectorAll('#chainForm .emoji-option').forEach(el => el.classList.remove('selected')); this.classList.add('selected');">
                                 ${e}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Oluştur</button>
                </div>
            </form>
        `;

        App.openModal();

        // Emoji seçimi için olay dinleyici (Dinamik güncelleme için)
        const emojiOptions = document.querySelectorAll('#chainForm .emoji-option');
        emojiOptions.forEach(opt => {
            opt.addEventListener('click', function () {
                emojiOptions.forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        document.getElementById('chainForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const selectedEmoji = document.querySelector('#chainForm .emoji-option.selected');
            const customColorPicker = document.getElementById('customColorPicker');
            const color = customColorPicker.classList.contains('active-picker') && customColorPicker.classList.contains('selected')
                ? document.getElementById('chainCustomColor').value
                : (document.querySelector('#chainForm .color-option-wrap.selected')?.dataset.color || this.chainColors[0]);

            this.addChain(
                formData.get('name'),
                selectedEmoji?.innerHTML.trim() || this.chainIcons[0],
                color
            );
            App.closeModal();
        });
    },

    render() {
        if (!this.container) return;

        const days = this.getHabitGridDays(); // Correctly aligned 28 days (7x4)
        const weekdayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

        let html = '<div class="habit-chains-list">';

        // Her zincir için kart oluştur
        this.chains.forEach(chain => {
            const streak = this.calculateStreak(chain);
            const totalDays = chain.completedDays.length;
            const completionRate = Math.round((totalDays / days.length) * 100);

            html += `
                <div class="habit-chain-card-modern">
                    <div class="habit-chain-header-modern">
                        <div class="habit-chain-info">
                            <div class="habit-chain-icon-wrap" style="background: ${chain.color}15; color: ${chain.color};">
                                ${chain.emoji.startsWith('<svg') ? chain.emoji : `<span>${chain.emoji}</span>`}
                            </div>
                            <div class="habit-chain-details">
                                <h3 class="habit-chain-title">${chain.name}</h3>
                                <div class="habit-chain-meta">
                                    <span class="streak-badge"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1.2 0 2.4 1 2.4 3.2 0 1.2-.5 2.1-1.2 3.2-1.2 1.8-1.2 3.8-1.2 5.6 0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.8 0-3.8-1.2-5.6-.7-1.1-1.2-2.1-1.2-3.2 0-2.2 1.2-3.2 2.4-3.2.6 0 1.1.2 1.5.6 1.4 1.4 2.1 3.4 2.1 5.4 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2 0.7-4 2.1-5.4.4-.4.9-.6 1.5-.6z"/></svg> ${streak} Gün Seri</span>
                                    <span class="rate-badge">%${completionRate} Verim</span>
                                </div>
                            </div>
                        </div>
                        <div class="habit-chain-actions-modern">
                            ${this.chains.length > 1 ? `
                                <button class="action-btn-mini delete" onclick="Notifications.confirm('Zinciri Sil', 'Bu zinciri silmek istiyor musunuz?', () => HabitTracker.removeChain('${chain.id}'))" title="Zinciri Sil">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div class="habit-calendar-modern">
                        <!-- Weekday Labels -->
                        ${weekdayLabels.map(label => `<div class="habit-day-label-modern">${label}</div>`).join('')}
                        
                        <!-- Calendar Days -->
                        ${days.map(d => {
                const isCompleted = chain.completedDays.includes(d.dateStr);
                const isToday = d.isToday;
                return `
                                <div class="habit-day-modern ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                                     style="${isCompleted ? `--accent: ${chain.color};` : ''}"
                                     onclick="HabitTracker.toggleDay('${chain.id}', '${d.dateStr}')"
                                     title="${d.dateStr}">
                                    <span class="day-num">${d.day}</span>
                                </div>
                            `;
            }).join('')}
                    </div>

                    <div class="habit-footer-stats">
                        <div class="footer-stat">
                            <span class="stat-label">Toplam</span>
                            <span class="stat-value">${totalDays} Gün</span>
                        </div>
                        <div class="footer-divider"></div>
                        <div class="footer-stat">
                            <span class="stat-label">Oluşturma</span>
                            <span class="stat-value">${new Date(chain.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        // Yeni zincir ekleme kartı (Opsiyonel, header'da da var ama burada da kalsın)
        html += `
            <div class="habit-chain-card-modern add-new-habit" onclick="HabitTracker.showAddChainModal()">
                <div class="add-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                </div>
                <div class="add-text">Yeni Alışkanlık Ekle</div>
            </div>
        `;

        html += '</div>';

        this.container.innerHTML = html;
    },

    selectColor(el, color) {
        document.querySelectorAll('#chainForm .color-option-wrap').forEach(opt => {
            opt.classList.remove('selected');
            opt.classList.remove('active-picker');
        });
        el.classList.add('selected');
        // Reset custom picker appearance
        const picker = document.getElementById('customColorPicker');
        if (picker) {
            picker.style.background = 'var(--bg-tertiary)';
            picker.style.borderColor = 'var(--border-color)';
        }
    },

    selectCustomColor(input) {
        const label = input.parentElement;
        label.style.background = input.value;
        document.querySelectorAll('#chainForm .color-option-wrap').forEach(opt => {
            opt.classList.remove('selected');
        });
        label.classList.add('selected', 'active-picker');
        label.style.borderColor = 'var(--text-primary)';
    }
};

// Make HabitTracker globally available
window.HabitTracker = HabitTracker;
