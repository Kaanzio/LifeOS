/**
 * Life OS - Pomodoro Module
 * Pomodoro tekniği ile zaman yönetimi
 */

const Pomodoro = {
    timerInterval: null,
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60, // seconds
    currentMode: 'work', // work, shortBreak, longBreak
    completedPomodoros: 0,
    totalMinutes: 0,
    dailyStreak: 0,
    workHistory: {}, // { 'YYYY-MM-DD': minutes }
    autoBreakTimer: null,
    autoBreakCountdown: 60,

    settings: {
        workTime: 25,
        shortBreak: 5,
        longBreak: 15
    },

    init() {
        this.loadData();
        this.bindEvents();
        this.updateDisplay();
        this.updateStats();
        this.updateModeDisplays();
    },

    loadData() {
        const data = Storage.load('lifeos_pomodoro', {
            completedPomodoros: 0,
            totalMinutes: 0,
            dailyStreak: 0,
            lastDate: null,
            settings: this.settings
        });

        this.completedPomodoros = data.completedPomodoros || 0;
        this.totalMinutes = data.totalMinutes || 0;
        this.dailyStreak = data.dailyStreak || 0;
        this.workHistory = data.workHistory || {};
        this.settings = data.settings || this.settings;

        // Reset daily streak if new day
        const today = App.getLocalDateString();
        if (data.lastDate !== today) {
            this.dailyStreak = 0;
            this.completedPomodoros = 0;
        }

        // Apply settings to inputs
        const workInput = document.getElementById('pomoWorkTime');
        const shortInput = document.getElementById('pomoShortBreak');
        const longInput = document.getElementById('pomoLongBreak');
        if (workInput) workInput.value = this.settings.workTime;
        if (shortInput) shortInput.value = this.settings.shortBreak;
        if (longInput) longInput.value = this.settings.longBreak;

        this.timeRemaining = this.settings.workTime * 60;
    },

    saveData() {
        Storage.save('lifeos_pomodoro', {
            completedPomodoros: this.completedPomodoros,
            totalMinutes: this.totalMinutes,
            dailyStreak: this.dailyStreak,
            workHistory: this.workHistory,
            lastDate: App.getLocalDateString(),
            settings: this.settings
        });
    },

    bindEvents() {
        document.getElementById('pomodoroStart')?.addEventListener('click', () => {
            this.start();
        });

        document.getElementById('pomodoroPause')?.addEventListener('click', () => {
            this.pause();
        });

        document.getElementById('pomodoroReset')?.addEventListener('click', () => {
            this.reset();
        });

        document.getElementById('pomodoroSkip')?.addEventListener('click', () => {
            this.skipBreak();
        });

        // Settings change
        document.getElementById('pomodoroWorkTime')?.addEventListener('change', (e) => {
            this.settings.workTime = parseInt(e.target.value) || 25;
            if (this.currentMode === 'work' && !this.isRunning) {
                this.timeRemaining = this.settings.workTime * 60;
                this.updateDisplay();
            }
            this.saveData();
        });

        document.getElementById('pomodoroShortBreak')?.addEventListener('change', (e) => {
            this.settings.shortBreak = parseInt(e.target.value) || 5;
            this.saveData();
        });

        document.getElementById('pomodoroLongBreak')?.addEventListener('change', (e) => {
            this.settings.longBreak = parseInt(e.target.value) || 15;
            this.saveData();
        });

    },

    toggleSettings() {
        const panel = document.getElementById('pomoSettingsPanel');
        if (!panel) return;

        panel.classList.toggle('active');
    },

    updateSettings() {
        const workInput = document.getElementById('pomoWorkTime');
        const shortInput = document.getElementById('pomoShortBreak');
        const longInput = document.getElementById('pomoLongBreak');

        if (workInput) this.settings.workTime = Math.max(1, parseInt(workInput.value) || 25);
        if (shortInput) this.settings.shortBreak = Math.max(5, parseInt(shortInput.value) || 5);
        if (longInput) this.settings.longBreak = Math.max(15, parseInt(longInput.value) || 15);

        // Reset timer if not running
        if (!this.isRunning) {
            if (this.currentMode === 'work') this.timeRemaining = this.settings.workTime * 60;
            else if (this.currentMode === 'shortBreak') this.timeRemaining = this.settings.shortBreak * 60;
            else if (this.currentMode === 'longBreak') this.timeRemaining = this.settings.longBreak * 60;
            this.updateDisplay();
        }

        this.saveData();
        this.updateModeDisplays();
    },

    updateModeDisplays() {
        // Update the 3 visual quick cards on the hero screen
        const dw = document.getElementById('dispWorkTime');
        const ds = document.getElementById('dispShortBreak');
        const dl = document.getElementById('dispLongBreak');

        if (dw) dw.textContent = this.settings.workTime + ' dk';
        if (ds) ds.textContent = this.settings.shortBreak + ' dk';
        if (dl) dl.textContent = this.settings.longBreak + ' dk';
    },

    showSettingsModal() {
        const modalBody = document.getElementById('baseModalBody');

        modalBody.innerHTML = `
            <form id="pomodoroSettingsForm">
                <div class="form-group">
                    <label class="form-label">Çalışma Süresi (dk)</label>
                    <input type="number" id="workTimeInput" class="form-input" min="1" max="60" value="${this.settings.workTime}">
                </div>
                <div class="form-group">
                    <label class="form-label">Kısa Mola (dk)</label>
                    <input type="number" id="shortBreakInput" class="form-input" min="1" max="30" value="${this.settings.shortBreak}">
                </div>
                <div class="form-group">
                    <label class="form-label">Uzun Mola (dk)</label>
                    <input type="number" id="longBreakInput" class="form-input" min="1" max="60" value="${this.settings.longBreak}">
                </div>
                <div class="modal-footer-modern" style="margin-top: 20px;">
                    <button type="button" class="btn btn-danger-ghost" onclick="Pomodoro.resetSettings()">Sıfırla</button>
                    <div>
                        <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                        <button type="button" class="btn btn-primary" onclick="Pomodoro.saveSettings()">Kaydet</button>
                    </div>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('pomodoroSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.settings.workTime = parseInt(formData.get('workTime')) || 25;
            this.settings.shortBreak = parseInt(formData.get('shortBreak')) || 5;
            this.settings.longBreak = parseInt(formData.get('longBreak')) || 15;

            if (this.currentMode === 'work' && !this.isRunning) {
                this.timeRemaining = this.settings.workTime * 60;
                this.updateDisplay();
            }

            this.saveData();
            App.closeModal();
            Notifications.add('Ayarlar Güncellendi', 'Pomodoro süreleri güncellendi.', 'success');
        });
    },

    resetAllStats() {
        this.resetAllData();
    },

    toggleFocusMode() {
        document.body.classList.toggle('pomodoro-focus-mode');
        const isFocus = document.body.classList.contains('pomodoro-focus-mode');
        const btn = document.getElementById('pomodoroFocusToggle');
        if (btn) {
            btn.innerHTML = isFocus ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" x2="23" y1="1" y2="23"/></svg> Odaktan Çık' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg> Odak Modu';
            btn.className = isFocus ? 'pomodoro-btn secondary' : 'pomodoro-btn secondary';
        }
    },

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;

        document.getElementById('pomodoroStart').style.display = 'none';
        document.getElementById('pomodoroPause').style.display = 'inline-flex';

        this.manageSilentAudio(true);

        this.timerInterval = setInterval(() => {
            this.tick();
        }, 1000);

        // Ensure immediate update
        this.updateDisplay();
    },

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timerInterval);

        document.getElementById('pomodoroStart').style.display = 'inline-flex';
        document.getElementById('pomodoroStart').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Devam';
        document.getElementById('pomodoroPause').style.display = 'none';

        this.manageSilentAudio(false);
        this.updateDisplay();
    },

    manageSilentAudio(play) {
        if (!this.silentAudio) {
            // Tiny silent MP3 base64 for better cross-browser mobile MediaSession support
            this.silentAudio = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjkxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASAErE8AAAAAAAAAAAAAAAAAAAAA//OUxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//OUxBUAAgAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//OUxDUAAgAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//OUxFkAAgAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            this.silentAudio.loop = true;

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', () => { this.start(); });
                navigator.mediaSession.setActionHandler('pause', () => { this.pause(); });
            }
        }

        if (play) {
            try { this.silentAudio.play().catch(e => console.log('Silent audio blocked', e)); } catch (e) { }
        } else {
            try { this.silentAudio.pause(); } catch (e) { }
        }
    },

    updateMediaSession(timeString, prefix, statusName) {
        if ('mediaSession' in navigator) {
            if (timeString && this.isRunning) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: `${prefix} ${timeString} - ${statusName}`,
                    artist: 'LifeOS Pomodoro',
                    album: 'LifeOS',
                    artwork: [
                        { src: 'assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                        { src: 'assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
                    ]
                });
            } else {
                navigator.mediaSession.metadata = null;
            }
        }
    },
    setMode(mode) {
        if (this.isRunning) {
            Notifications.confirm(
                'Mod Değiştir',
                'Zamanlayıcı çalışıyor. Mod değiştirmek zamanlayıcıyı sıfırlar. Devam edilsin mi?',
                () => {
                    this._applyMode(mode);
                }
            );
        } else {
            this._applyMode(mode);
        }
    },

    _applyMode(mode) {
        this.currentMode = mode;
        this.isRunning = false;
        this.isPaused = false;
        this.manageSilentAudio(false);
        clearInterval(this.timerInterval);

        if (mode === 'work') this.timeRemaining = this.settings.workTime * 60;
        else if (mode === 'shortBreak') this.timeRemaining = this.settings.shortBreak * 60;
        else if (mode === 'longBreak') this.timeRemaining = this.settings.longBreak * 60;

        document.getElementById('pomodoroControls').style.display = 'flex';
        const choiceEl = document.getElementById('pomodoroChoice');
        if (choiceEl) choiceEl.style.display = 'none';

        document.getElementById('pomodoroStart').style.display = 'inline-flex';
        document.getElementById('pomodoroStart').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Başlat';
        document.getElementById('pomodoroPause').style.display = 'none';

        // Update tabs active state
        ['pomoTabWork', 'pomoTabShort', 'pomoTabLong'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        });

        if (mode === 'work' && document.getElementById('pomoTabWork')) document.getElementById('pomoTabWork').classList.add('active');
        if (mode === 'shortBreak' && document.getElementById('pomoTabShort')) document.getElementById('pomoTabShort').classList.add('active');
        if (mode === 'longBreak' && document.getElementById('pomoTabLong')) document.getElementById('pomoTabLong').classList.add('active');

        this.updateDisplay();
        this.stopAutoBreakCountdown();
    },

    reset() {
        // Only warn if they are in the middle of a work session
        if (this.isRunning && this.currentMode === 'work') {
            Notifications.confirm(
                'Oturumu Sıfırla',
                'Devam eden çalışma oturumunu sıfırlamak istiyor musunuz? (Bu oturum seriye dahil edilmez)',
                () => {
                    this._performReset();
                }
            );
        } else {
            this._performReset();
        }
    },

    _performReset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);

        if (this.currentMode === 'work') {
            this.timeRemaining = this.settings.workTime * 60;
        } else if (this.currentMode === 'shortBreak') {
            this.timeRemaining = this.settings.shortBreak * 60;
        } else {
            this.timeRemaining = this.settings.longBreak * 60;
        }

        document.getElementById('pomodoroStart').style.display = 'inline-flex';
        document.getElementById('pomodoroStart').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Başlat';
        document.getElementById('pomodoroPause').style.display = 'none';

        this.manageSilentAudio(false);
        this.updateDisplay();
    },

    tick() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;

            // 1 minute reminder
            if (this.timeRemaining === 60) {
                Notifications.add(
                    'Pomodoro Hatırlatıcı',
                    'Son 1 dakikanız kaldı!',
                    'info',
                    true
                );
                this.playAudio('tink');
            }

            this.updateDisplay();
        } else {
            this.complete();
        }
    },

    complete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.manageSilentAudio(false);

        // Play notification sound (browser beep)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBSyb1+zTdzUMLobL8NyLNwYnkcny15IpAi6e2/PekS0GM5bT8d6PLAQxnt3035AsBC+a1PHfjy0EL5jR8d+NLAAumtXy4Y8qAC+U0fHdkSoALpbV8uOQKwAvlM/x3I8rADGW0fPekCsAMJXR896QLAAyl9Hz3o8qADGU0fLdkCsAMZfP8tyOKgAxl8/z3Y8qADCVz/LcjyoAMJfR892PKgAwlc/y3I8qADCVz/LcjioAMJXP8tyOKgAwlc/y3I4qADCVz/LcjykAMJXP8tyOKQAvlc/y248pAC+Vz/LbjikAL5XP8tuOKQAvlc/y248pAC+Vz/LbjikA');
            audio.play().catch(() => { });
        } catch (e) { }

        if (this.currentMode === 'work') {
            this.playAudio('success');
            this.completedPomodoros++;
            const workTime = this.settings.workTime;
            this.totalMinutes += workTime;
            this.dailyStreak++;

            // Update history
            const today = App.getLocalDateString();
            this.workHistory[today] = (this.workHistory[today] || 0) + workTime;

            this.saveData();
            this.updateStats();

            Notifications.add(
                'Pomodoro Tamamlandı!',
                'Harika iş! Şimdi mola zamanı.',
                'success',
                true
            );

            // Show Break Choice with Auto-Timer
            document.getElementById('pomodoroControls').style.display = 'none';
            document.getElementById('pomodoroChoice').style.display = 'flex';
            this.startAutoBreakCountdown();
        } else {
            this.playAudio('chime');
            Notifications.add(
                'Mola Bitti!',
                'Çalışmaya devam etme zamanı.',
                'info',
                true
            );

            this.currentMode = 'work';
            this.timeRemaining = this.settings.workTime * 60;
            this.updateDisplay();

            document.getElementById('pomodoroStart').style.display = 'inline-flex';
            document.getElementById('pomodoroStart').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Başlat';
            document.getElementById('pomodoroPause').style.display = 'none';
        }
    },

    /**
     * Molayı başlat
     */
    startBreak(mode) {
        this.stopAutoBreakCountdown();
        this._applyMode(mode);
        this.start(); // Auto-start the break timer
    },

    /**
     * Molayı atla ve direkt çalışmaya dön
     */
    skipBreak() {
        this.stopAutoBreakCountdown();
        this._applyMode('work');
        Notifications.add('Mola Atlandı', 'Çalışma oturumu hazır.', 'info', true);
    },

    startAutoBreakCountdown() {
        this.autoBreakCountdown = 60;
        this.updateAutoBreakStatus();

        this.autoBreakTimer = setInterval(() => {
            this.autoBreakCountdown--;
            if (this.autoBreakCountdown <= 0) {
                this.startBreak('shortBreak');
                Notifications.add('Otomatik Mola', 'Seçim yapılmadığı için kısa mola başlatıldı.', 'info');
            } else {
                this.updateAutoBreakStatus();
            }
        }, 1000);
    },

    stopAutoBreakCountdown() {
        if (this.autoBreakTimer) {
            clearInterval(this.autoBreakTimer);
            this.autoBreakTimer = null;
        }
    },

    updateAutoBreakStatus() {
        const statusEl = document.getElementById('pomodoroStatus');
        if (statusEl) {
            statusEl.textContent = `Mola Seçiniz (${this.autoBreakCountdown}s)`;
        }
    },

    updateDisplay() {
        const timerEl = document.getElementById('pomodoroTimer');
        const statusEl = document.getElementById('pomodoroStatus');

        if (timerEl) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Update color class
            timerEl.classList.remove('work', 'break');
            timerEl.classList.add(this.currentMode === 'work' ? 'work' : 'break');
        }

        if (statusEl) {
            const statusLabels = {
                work: 'Çalışma Zamanı',
                shortBreak: 'Kısa Mola',
                longBreak: 'Uzun Mola'
            };
            statusEl.textContent = statusLabels[this.currentMode];
        }

        // Timer Title Feature
        if (this.isRunning) {
            const prefix = this.currentMode === 'work' ? '🔥' : '☕';
            const statusNames = {
                work: 'Odak',
                shortBreak: 'Kısa Mola',
                longBreak: 'Uzun Mola'
            };
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.title = `${prefix} ${timeString} - ${statusNames[this.currentMode]}`;
            this.updateMediaSession(timeString, prefix, statusNames[this.currentMode]);
        } else {
            document.title = 'LifeOS - Hayatını Yönet';
            this.updateMediaSession('', '', '');
        }

        // Update skip button visibility
        const skipBtn = document.getElementById('pomodoroSkip');
        if (skipBtn) {
            skipBtn.style.display = this.currentMode !== 'work' ? 'inline-flex' : 'none';
        }
    },

    updateStats() {
        const todayMinutes = this.workHistory[App.getLocalDateString()] || 0;
        const weeklyMinutes = this.getPeriodMinutes(7);
        const monthlyMinutes = this.getPeriodMinutes(30);

        const dailyEl = document.getElementById('pomodoroDailyMinutes');
        const weeklyEl = document.getElementById('pomodoroWeeklyMinutes');
        const monthlyEl = document.getElementById('pomodoroMonthlyMinutes');
        const streakEl = document.getElementById('pomodoroStreak');

        if (dailyEl) dailyEl.textContent = todayMinutes;
        if (weeklyEl) weeklyEl.textContent = weeklyMinutes;
        if (monthlyEl) monthlyEl.textContent = monthlyMinutes;
        if (streakEl) streakEl.textContent = this.completedPomodoros;

        const streakLab = document.querySelector('#pomodoroStreak + .pomo-mini-lab');
        if (streakLab) streakLab.textContent = 'Bugün (Adet)';

        // Update hero flames
        const flamesContainer = document.getElementById('pomoHeroFlames');
        if (flamesContainer) {
            let flamesHtml = '';
            const completed = this.completedPomodoros;

            if (completed <= 5) {
                let activeCount = completed;
                for (let i = 0; i < 5; i++) {
                    flamesHtml += `<span class="pomo-flame ${i < activeCount ? 'active' : ''}">🔥</span>`;
                }
            } else {
                flamesHtml = `<div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size: 22px; font-weight: 800; color: var(--text-primary);">${completed}x</span>
                    <span class="pomo-flame active" style="font-size: 28px;">🔥</span>
                </div>`;
            }
            flamesContainer.innerHTML = flamesHtml;
        }
    },

    getPeriodMinutes(days) {
        const now = new Date();
        let total = 0;
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = App.getLocalDateString(date);
            total += this.workHistory[dateStr] || 0;
        }
        return total;
    },


    /**
     * Tüm verileri sıfırla
     */
    resetAllData() {
        Notifications.confirm(
            'Tüm Verileri Sıfırla',
            'Tüm Pomodoro verilerini sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!',
            () => {
                this.completedPomodoros = 0;
                this.totalMinutes = 0;
                this.dailyStreak = 0;
                this.workHistory = {}; // Clear historical stats
                this.currentMode = 'work';
                this.timeRemaining = this.settings.workTime * 60;
                this.isRunning = false;
                this.isPaused = false;
                clearInterval(this.timerInterval);

                this.saveData();
                this.updateDisplay();
                this.updateStats();

                document.getElementById('pomodoroStart').style.display = 'inline-flex';
                document.getElementById('pomodoroStart').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Başlat';
                document.getElementById('pomodoroPause').style.display = 'none';

                Notifications.add('Veriler Sıfırlandı', 'Pomodoro istatistikleri temizlendi.', 'info', true);
            }
        );
    },

    render() {
        this.updateDisplay();
        this.updateStats();
    },

    /**
     * Ses çalma yardımcı fonksiyonu - Geliştirilmiş ve üst üste binmeyen versiyon
     */
    playAudio(type) {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;

        const playTone = (freq, duration, startOffset = 0, volume = 0.3, type = 'sine') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now + startOffset);
            gain.gain.setValueAtTime(volume, now + startOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + startOffset);
            osc.stop(now + startOffset + duration);
        };

        switch (type) {
            case 'success': // Modern "Success" ding
                playTone(523.25, 0.5, 0, 0.3, 'triangle'); // C5
                playTone(659.25, 0.5, 0.1, 0.25, 'triangle'); // E5
                playTone(783.99, 0.6, 0.2, 0.3, 'sine'); // G5
                break;
            case 'chime': // Soft "Break over" chime
                playTone(440, 0.6, 0, 0.25, 'sine'); // A4
                playTone(349.23, 0.8, 0.2, 0.2, 'sine'); // F4
                break;
            case 'tink': // Minimal "Reminder" tink
                playTone(987.77, 0.1, 0, 0.2, 'sine'); // B5
                break;
        }
    }
};
