/**
 * Life OS - Profile Module v2
 * Kullanıcı profili ve ayarları yönetimi - Emoji avatar desteği ile
 */

const Profile = {
    profile: null,
    stagingProfile: null, // Temporary container for uncommitted changes
    showEmojiPicker: false,
    hasUnsavedChanges: false,
    initialValues: null,
    showGradientCreator: false,

    // Avatar için kullanılabilecek emojiler
    avatarEmojis: [
        '😀', '😎', '🤓', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🔬', '👨‍🔬', '👩‍🔬',
        '🦸', '🧙', '🧑‍🚀', '👑', '🐱', '🐶', '🦊', '🦁', '🐼',
        '🐸', '🦉', '🦋', '🌟', '⚡', '🔥', '💎', '🎯', '🎨',
        '🎵', '🎮', '⚗️', '🔬', '🔩', '⚙️', '💻', '📚', '✨'
    ],

    init() {
        this.loadProfile();
        this.bindEvents();
        this.render();
        this.setupUnsavedChangesWarning();
        this.applyUIStyle();

        // Apply styles globally on initialization
        this.applyAvatarStyle(false);
        this.applyCardStyle(false);
    },

    loadProfile() {
        const defaults = {
            name: '',
            title: '',
            university: '',
            department: '',
            year: '',
            avatarColor: '#7c3aed',
            avatarEmoji: '',
            avatarLogo: '',
            logoScale: 1,
            logoOffsetX: 0,
            logoOffsetY: 0,
            profileBgColor: '',
            cardStyle: { borderWidth: 0, shadowOpacity: 30, blur: 10, borderRadius: 24 }
        };

        const loaded = Storage.load('lifeos_profile', null);
        this.profile = { ...defaults, ...loaded };

        // WIPE LEGACY DEFAULT DATA
        if (this.profile.department === 'Metalurji ve Malzeme Mühendisliği') {
            this.profile.department = '';
        }

        // Initialize staging profile as a clone of main profile
        this.stagingProfile = JSON.parse(JSON.stringify(this.profile));
    },

    saveProfile() {
        Storage.save('lifeos_profile', this.profile);
    },

    bindEvents() {
        // Save profile button (Sidebar)
        document.getElementById('saveProfileBtnSidebar')?.addEventListener('click', () => {
            this.saveProfileForm();
        });

        // Theme options
        document.querySelectorAll('.theme-btn-compact').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                App.setTheme(theme);
                this.updateThemeButtons();
            });
        });
    },

    async saveProfileForm() {
        if (!this.stagingProfile) return;

        // Collect data into staging first
        const nameInput = document.getElementById('profileNameInput');
        if (nameInput) this.stagingProfile.name = nameInput.value;

        const titleInput = document.getElementById('profileTitleInput');
        if (titleInput) this.stagingProfile.title = titleInput.value;

        const uniInput = document.getElementById('profileUniversity');
        if (uniInput) this.stagingProfile.university = uniInput.value;

        const deptInput = document.getElementById('profileDepartment');
        if (deptInput) this.stagingProfile.department = deptInput.value;

        const yearInput = document.getElementById('profileYear');
        if (yearInput) this.stagingProfile.year = yearInput.value;

        // COMMIT: Merge staging changes into main profile
        this.profile = JSON.parse(JSON.stringify(this.stagingProfile));

        // Save
        await this.saveData(true);

        // Update Global UI immediately
        if (window.App) {
            window.App.updateUserInfo();
        }

        // Render
        this.render();
        this.hasUnsavedChanges = false;
    },

    async saveData(showNotification = true) {
        if (!this.profile) return;

        // Save to LocalStorage
        Storage.save('lifeos_profile', this.profile);

        // Sync staging profile to match newly saved profile
        this.stagingProfile = JSON.parse(JSON.stringify(this.profile));

        // Sync if needed
        if (window.DriveSync && window.DriveSync.isAuthenticated && window.DriveSync.config?.autoSync) {
            await window.DriveSync.syncToDrive();
        }

        if (showNotification) {
            Notifications.add('Başarılı', 'Ayarlar kaydedildi.', 'success', true);
        }

        // Apply styles globally after save
        this.applyAvatarStyle(false); // Global sync
        this.applyCardStyle(false); // Global sync

        // Force update of header/dashboard info including new Title
        if (window.App && window.App.renderDashboard) {
            window.App.renderDashboard();
        }
    },

    setAvatarEmoji(emoji) {
        this.stagingProfile.avatarEmoji = emoji;
        this.applyAvatarStyle(true);
        this.hasUnsavedChanges = true;
        this.toggleEmojiPicker();
    },

    toggleGradientCreator() {
        this.showGradientCreator = !this.showGradientCreator;
        this.renderAvatarCreator();
    },

    clearAvatarEmoji() {
        this.stagingProfile.avatarEmoji = '';
        this.applyAvatarStyle(true);
        this.hasUnsavedChanges = true;
    },


    applyCoverPhoto() {
        const coverEl = document.getElementById('sidebarProfileCover');
        if (!coverEl) return;

        if (this.profile.coverPhoto) {
            coverEl.style.backgroundImage = `url('${this.profile.coverPhoto}')`;
        } else {
            // Default gradient
            coverEl.style.backgroundImage = '';
        }
    },
    toggleEmojiPicker() {
        // Scroll within the modal body if it exists
        const section = document.getElementById('emojiPickerSection');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            section.style.transition = 'background 0.3s';
            const originalBg = section.style.background;
            section.style.background = 'rgba(var(--accent-rgb), 0.1)';
            setTimeout(() => {
                section.style.background = originalBg;
            }, 500);
        }
    },

    openSettings() {
        App.navigateTo('profile');
    },

    closeSettings() {
        App.navigateTo('dashboard');
    },

    // switchTab logic removed as settings are now single-page

    applyAvatarStyle(previewOnly = false) {
        const data = previewOnly ? this.stagingProfile : this.profile;
        const color = data.avatarColor || '#7c3aed';
        const logo = data.avatarLogo || '';
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const name = data.name || settings.userName || 'Kullanıcı';
        const initial = name.charAt(0).toUpperCase();

        const scale = data.logoScale || 1;
        const offX = data.logoOffsetX || 0;
        const offY = data.logoOffsetY || 0;

        // Target selection
        let targetsSelector = '.profile-avatar-xl, .dashboard-avatar';

        if (previewOnly) {
            // Updated targeting for new mirrored structure
            targetsSelector = '#emojiPickerContainer .dashboard-avatar, #settingsBannerAvatar, .dashboard-avatar';
        }

        document.querySelectorAll(targetsSelector).forEach(el => {
            // Handle Transparent
            if (color === 'transparent') {
                el.style.setProperty('background', 'transparent', 'important');
                el.style.setProperty('background-image', 'none', 'important');
                el.style.setProperty('box-shadow', 'none', 'important');
                el.style.setProperty('border', 'none', 'important');
            } else {
                el.style.setProperty('background', color, 'important');
                el.style.backgroundImage = ''; // Reset if gradient was there
                el.style.boxShadow = ''; // Reset to CSS default
                el.style.border = '';
            }

            el.style.color = 'white';

            // Force centering
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';

            const innerEl = el.querySelector('span') || el;

            // Set Text Content (Logo or Initial)
            // Ensure we don't overwrite if it's already set correctly logic-wise, but for preview we force it.
            // Actually, we should just use the passed logo/initial.
            if (innerEl.tagName === 'SPAN') {
                innerEl.textContent = logo || initial;
            }

            // Base Font Size Logic
            let baseSize = 20; // Default for header (smaller)

            if (el.classList.contains('profile-avatar-xl') || el.classList.contains('dashboard-avatar')) {
                // Use proportional sizing: ~45% of avatar container height
                baseSize = Math.round(el.offsetHeight * 0.45) || 60;
            } else if (el.classList.contains('user-avatar') || el.id === 'userAvatar') {
                baseSize = Math.round(el.offsetHeight * 0.45) || 18;
            }
            // Apply Scale & Offset to the INNER element (span)
            if (innerEl.tagName === 'SPAN') {
                innerEl.style.fontSize = `${baseSize * scale}px`;
                innerEl.style.transform = `translate(${offX}px, ${offY}px)`;
                innerEl.style.display = 'inline-block';
            }
        });

        // Update active color buttons (match both hex and special values like 'transparent')
        document.querySelectorAll('.avatar-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
            btn.style.borderColor = btn.dataset.color === color ? 'white' : 'transparent';
            if (btn.dataset.color === color) {
                btn.style.transform = 'scale(1.1)';
            } else {
                btn.style.transform = 'scale(1)';
            }
        });
    },

    setLogoStyle(prop, val) {
        this.stagingProfile[prop] = parseFloat(val);
        this.hasUnsavedChanges = true;
        this.applyAvatarStyle(true); // Preview only
    },

    // updateThemeButtons removed as theme selection uses a toggle now

    showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async event => {
                try {
                    const jsonString = event.target.result;
                    if (await Storage.importData(jsonString)) {
                        Notifications.add('Veri İçe Aktarıldı', 'Sayfa yenileniyor...', 'success');
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        Notifications.add('Hata', 'Yedek dosyası geçersiz.', 'error');
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    Notifications.add('Hata', 'Yedek dosyası geçersiz.', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    confirmClearData() {
        Notifications.confirm(
            'Tüm Verileri Sil',
            'Tüm dersler, kitaplar, sınavlar, oyunlar, dizi/film, youtube, siteler, notlar, takvim, alışkanlıklar ve görevler silinecek. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?',
            async () => {
                // 1. Clear all data thoroughly for current user via Storage
                await Storage.clearAll();

                // 2. Also clear unprefixed legacy profile key explicitly if any
                localStorage.removeItem('lifeos_profile');

                // 3. Reset user name in Auth if active
                const user = Auth.getCurrentUser();
                if (user) {
                    user.name = 'Kullanıcı';
                    Auth.saveUser(user);
                    localStorage.setItem('lifeos_user_session', JSON.stringify(user));
                }

                Notifications.add('Veriler Silindi ✨', 'Tüm verileriniz temizlendi. Sayfa yenileniyor...', 'info');
                setTimeout(() => location.reload(), 1500);
            }

        );
    },

    confirmDeleteAccount() {
        Notifications.confirm(
            'Hesabı Kalıcı Olarak Sil',
            'Sadece verileriniz değil, kullanıcı hesabınız (giriş bilgileriniz) da tamamen silinecek. Bu işlem geri alınamaz!',
            async () => {
                // Get current user robustly
                let user = Auth.getCurrentUser();
                let username = user ? user.username : null;

                // Fallback to Storage prefix if Auth.currentUser is lost
                if (!username && Storage.userPrefix) {
                    username = Storage.userPrefix.replace('user_', '').replace(/_$/, '');
                }

                if (!username) {
                    // One last attempt from session storage directly
                    const session = JSON.parse(localStorage.getItem('lifeos_user_session') || '{}');
                    username = session.username;
                }

                if (!username) {
                    Notifications.add('Hata', 'Kullanıcı oturumu doğrulanamadı. Lütfen tekrar giriş yapın.', 'error');
                    return;
                }

                // 1. Tüm kullanıcı verilerini sil
                await Storage.clearAll();

                // 2. Hesabı Auth sisteminden sil
                Auth.deleteUser(username);

                // 3. Oturum ve 'Beni Hatırla' bilgisini temizle
                localStorage.removeItem('lifeos_remember_me');
                localStorage.removeItem('lifeos_user_session');
                localStorage.removeItem('lifeos_auth_lockout');

                if (window.Auth) window.Auth.currentUser = null;

                Notifications.add('Hesap Silindi ✨', 'Hesabınız ve tüm verileriniz başarıyla silindi.', 'info');

                // 4. Sistemi yeniden yükle (Login ekranına dönecek)
                setTimeout(() => location.reload(), 1200);
            },
            'EVET, HESABI SİL'
        );
    },

    getStats() {
        const lessonStats = Lessons?.getStats?.() || { total: 0 };
        const bookStats = Books?.books?.length || 0;
        const taskStats = Planning?.tasks?.length || 0;
        const gameStats = Games?.games?.length || 0;

        return {
            lessons: lessonStats.total || 0,
            books: bookStats,
            tasks: taskStats,
            games: gameStats
        };
    },

    render() {
        const stats = this.getStats();
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const name = this.profile.name || settings.userName || 'Kullanıcı';
        const emoji = this.profile.avatarEmoji || '';

        // Profile Sidebar & Card Info
        // Priority: Profile Name > Settings Name > 'Kullanıcı'
        const displayName = this.profile.name || settings.userName || 'Kullanıcı';

        // Update all name elements
        const nameElements = [
            'profileNameDisplay',
            'dashboardProfileName',
            'previewProfileName',
            'sidebarProfileName' // Potential sidebar element
        ];

        nameElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = displayName;
        });

        // Sync Avatar Initials
        const initial = displayName.charAt(0).toUpperCase();
        const initialElements = ['bannerInitial', 'settingsBannerInitial', 'userInitial'];
        initialElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = initial;
        });

        // Update preview in modal if it exists (though we removed the old preview, keeping for safety or future use)
        const previewName = document.getElementById('previewProfileName');
        if (previewName) previewName.textContent = displayName;

        // Formatted Banner Title (Title/Fallback + Education)
        const displayTitle = (this.profile.title && this.profile.title.trim() !== '')
            ? this.profile.title
            : 'LifeOS Üyesi';

        const bannerParts = [displayTitle];
        if (this.profile.university) bannerParts.push(this.profile.university);
        if (this.profile.department) bannerParts.push(this.profile.department);
        if (this.profile.year) bannerParts.push(this.profile.year);

        const bannerSubtitle = bannerParts.join('<br>');

        // Update all title elements
        const bannerElements = [
            'sidebarProfileTitle'
        ];

        bannerElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = bannerSubtitle;
        });

        // Header uses Unvan/TitleLogic (Handled by App.updateUserInfo, but we can set it here too for preview context if needed, though header is global)
        // We leave header update to App.updateUserInfo() called after save.

        // Reset staging when rendering the page initially
        this.stagingProfile = JSON.parse(JSON.stringify(this.profile));

        // Form inputs
        const nameInput = document.getElementById('profileNameInput');
        if (nameInput) nameInput.value = this.profile.name || settings.userName || '';

        const titleInput = document.getElementById('profileTitleInput');
        if (titleInput) titleInput.value = this.profile.title || '';

        const uniInput = document.getElementById('profileUniversity');
        if (uniInput) uniInput.value = this.profile.university || '';

        const deptInput = document.getElementById('profileDepartment');
        if (deptInput) deptInput.value = this.profile.department || '';

        const yearInput = document.getElementById('profileYear');
        if (yearInput) yearInput.value = this.profile.year || '';

        // Stats
        const lessonsEl = document.getElementById('profileStatLessons');
        if (lessonsEl) lessonsEl.textContent = stats.lessons;

        const tasksEl = document.getElementById('profileStatTasks');
        if (tasksEl) tasksEl.textContent = stats.tasks;



        // Populate Customization Inputs
        if (document.getElementById('coverPhotoInput')) {
            document.getElementById('coverPhotoInput').value = this.profile.coverPhoto || '';
        }

        // Render sections
        this.renderAvatarCreator();

        const securityContainer = document.getElementById('securitySettingsContainer');
        if (securityContainer) securityContainer.innerHTML = this.renderSecuritySection();

        // Apply styles
        this.applyAvatarStyle(true); // Initial render uses staging for preview
        this.applyCardStyle(true); // Initial render uses staging for preview
        this.renderAppearanceTab();
    },

    setAvatarLogo(text) {
        this.stagingProfile.avatarLogo = text.toUpperCase();
        this.applyAvatarStyle(true); // Preview only
        this.hasUnsavedChanges = true;
    },

    setAvatarColor(color) {
        this.stagingProfile.avatarColor = color;
        this.hasUnsavedChanges = true;
        this.applyAvatarStyle(true); // Preview only
        this.renderAvatarCreator(); // Re-render to update color buttons
        if (color !== 'transparent') {
            const picker = document.querySelector('input[type="color"]');
            if (picker) picker.value = color;
        }
    },

    renderAvatarCreator() {
        const container = document.getElementById('emojiPickerContainer');
        if (!container) return;

        const logoText = this.stagingProfile.avatarLogo || '';
        const color = this.stagingProfile.avatarColor || '#7c3aed';
        const bgColors = this.getBackgroundColors();
        const style = this.stagingProfile.cardStyle || { borderWidth: 0, shadowOpacity: 30, blur: 10, borderRadius: 24 };
        const textColor = this.stagingProfile.profileTextColor || '';

        // Ensure defaults
        if (style.shadowOpacity === undefined) style.shadowOpacity = 30;
        if (style.blur === undefined) style.blur = 10;
        if (style.borderRadius === undefined) style.borderRadius = 24;

        container.innerHTML = `
            <!-- Avatar Color Box -->
            <div class="bento-item" style="padding: 16px 20px; min-height: 110px; height: auto;">
                <div class="bento-header" style="margin-bottom: 12px; display:flex; align-items:center; gap:6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> Avatar Rengi</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; gap: 6px;">
                        ${['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(c => `
                            <button class="avatar-color-btn ${color === c ? 'active' : ''}" 
                                    style="width: 30px; height: 30px; border-radius: 6px; border: 2px solid ${color === c ? 'white' : 'transparent'}; 
                                    background: ${c}; cursor: pointer; transition: transform 0.2s; padding:0;" 
                                    onclick="Profile.setAvatarColor('${c}')">
                            </button>
                        `).join('')}
                    </div>

                    <!-- Transparent Option (🚫) -->
                    <button class="avatar-color-btn ${color === 'transparent' ? 'active' : ''}"
                            style="width: 30px; height: 30px; border-radius: 6px; border: 2px solid ${color === 'transparent' ? 'white' : 'transparent'}; 
                            background: repeating-linear-gradient(45deg, #222, #222 5px, #333 5px, #333 10px); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;" 
                            onclick="Profile.setAvatarColor('transparent')" title="Şeffaf">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                    </button>

                    <!-- Custom Color Picker -->
                    <div style="position: relative; width: 30px; height: 30px; overflow: hidden; border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer; background: var(--bg-tertiary);">
                        <input type="color" onchange="Profile.setAvatarColor(this.value)" value="${color === 'transparent' ? '#7c3aed' : color}" 
                            style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; cursor: pointer; border: none;">
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                        </div>
                    </div>
                </div>
                <p style="font-size: 10px; color: var(--text-muted); margin-top: 8px;">5 ana renk + şeffaf + özel seçim.</p>
            </div>

            <!-- Avatar Metni Box -->
            <div class="bento-item" style="padding: 16px 20px; min-height: 110px; height: auto;">
                <div class="bento-header" style="margin-bottom: 12px; display:flex; align-items:center; gap:6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg> Avatar Metni</div>
                <div style="background: var(--bg-tertiary); padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; width: fit-content;">
                    <input type="text" class="form-input" maxlength="2" placeholder="KN"
                        value="${logoText}"
                        oninput="Profile.setAvatarLogo(this.value)"
                        style="width: 50px; text-align: center; font-size: 18px; font-weight: 800; text-transform: uppercase; background: transparent; border: none; padding: 0; color: var(--text-primary);">
                    <p style="font-size: 10px; color: var(--text-muted); line-height: 1.1;">Maks. 2 <br>karakter</p>
                </div>
            </div>

            <!-- Avatar Text Settings Box -->
            <div class="bento-item medium-width">
                <div class="bento-header" style="display:flex; align-items:center; gap:6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0l12.6 12.6z"/><line x1="5" x2="12" y1="6" y2="13"/><line x1="15" x2="14" y1="16" y2="15"/><line x1="10" x2="9" y1="11" y2="10"/><line x1="13" x2="12" y1="14" y2="13"/><line x1="16" x2="15" y1="17" y2="16"/></svg> Konum ve Boyut</div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; width:50px; color:var(--text-muted);">Boyut</span>
                        <input type="range" min="0.5" max="2.0" step="0.1" value="${this.stagingProfile.logoScale || 1}" 
                            style="flex:1; accent-color: var(--accent-purple);"
                            oninput="Profile.setLogoStyle('logoScale', this.value)">
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; width:50px; color:var(--text-muted);">Yatay</span>
                        <input type="range" min="-20" max="20" step="1" value="${this.stagingProfile.logoOffsetX || 0}" 
                            style="flex:1; accent-color: var(--accent-purple);"
                            oninput="Profile.setLogoStyle('logoOffsetX', this.value)">
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; width:50px; color:var(--text-muted);">Dikey</span>
                        <input type="range" min="-20" max="20" step="1" value="${this.stagingProfile.logoOffsetY || 0}" 
                            style="flex:1; accent-color: var(--accent-purple);"
                            oninput="Profile.setLogoStyle('logoOffsetY', this.value)">
                    </div>
                </div>
            </div>

            <div class="bento-item medium-width">
                <div class="bento-header" style="display:flex; align-items:center; gap:6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> Arkaplan Stilleri
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(36px, 1fr)); gap: 10px; align-items: center; width: 100%; min-height: 44px; padding: 4px 0;">
                    ${bgColors.map(bg => `
                        <button class="profile-bg-color-btn ${this.stagingProfile.profileBgColor === bg.value ? 'active' : ''}" 
                                style="width: 36px; height: 36px; border-radius: 10px; border: 2px solid ${this.stagingProfile.profileBgColor === bg.value ? 'white' : 'rgba(255,255,255,0.1)'} !important; 
                                background: ${bg.value.includes('gradient') ? bg.value : bg.value} !important; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.15); box-sizing: border-box;" 
                                onclick="Profile.setProfileBgColor('${bg.value}')" title="${bg.name}">
                        </button>
                    `).join('')}
                    
                    <!-- Custom Background Color Picker -->
                    <div style="position: relative; width: 36px; height: 36px; overflow: hidden; border-radius: 10px; border: 1px solid var(--border-color); cursor: pointer; background: var(--bg-tertiary); box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                        <input type="color" onchange="Profile.setProfileBgColor(this.value)" value="${this.stagingProfile.profileBgColor && this.stagingProfile.profileBgColor.startsWith('#') ? this.stagingProfile.profileBgColor : '#7c3aed'}" 
                            style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; cursor: pointer; border: none;">
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                        </div>
                    </div>

                    <!-- Toggle Gradient Wizard Button -->
                    <button class="profile-bg-color-btn ${this.showGradientCreator ? 'active' : ''}" 
                            style="width: 36px; height: 36px; border-radius: 10px; border: 2px solid ${this.showGradientCreator ? 'var(--accent-purple)' : 'transparent'}; 
                            background: var(--bg-tertiary); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--accent-purple); box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;" 
                            onclick="Profile.toggleGradientCreator()" title="Özel Gradyan Sihirbazı">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11.5 12.5 4.5 4.5"/><path d="M15.5 13.5 13 11l-3 3 2.5 2.5a1.5 1.5 0 0 0 2.1 0z"/><path d="M17 11 11 5"/><path d="M19 9 13 3"/><path d="M5 21l3-11.5 1.5-1.5 1.5 1.5L5 21z"/><path d="M7 19h2"/></svg>
                    </button>
                </div>
            </div>

            <!-- Advanced Creator (Collapsible) -->
            <div id="gradientCreator" class="bento-item full-width ${this.showGradientCreator ? '' : 'hidden'}" style="margin-top: 0;">
                <div class="bento-header"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> Özel Gradyan Sihirbazı</div>
                <div style="display: flex; flex-direction: column; gap: 20px; max-width: 440px;">
                    <div style="display: flex; gap: 16px;">
                        <div style="flex:1">
                            <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:6px;">Renk 1</span>
                            <input type="color" id="gradColor1" value="#667eea" style="width:100%; height:40px; border-radius:8px; border:1px solid var(--border-color); background:none; padding:4px;"
                                onchange="Profile.setCustomGradient(this.value, document.getElementById('gradColor2').value, document.getElementById('gradAngle').value)">
                        </div>
                        <div style="flex:1">
                            <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:6px;">Renk 2</span>
                            <input type="color" id="gradColor2" value="#764ba2" style="width:100%; height:40px; border-radius:8px; border:1px solid var(--border-color); background:none; padding:4px;"
                                onchange="Profile.setCustomGradient(document.getElementById('gradColor1').value, this.value, document.getElementById('gradAngle').value)">
                        </div>
                    </div>
                    <div>
                        <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:6px;">Gradyan Açısı: <span id="gradAngleDisplay">135</span>°</span>
                        <input type="range" id="gradAngle" min="0" max="360" value="135" style="width:100%; accent-color: var(--accent-purple);"
                            oninput="document.getElementById('gradAngleDisplay').textContent = this.value; Profile.setCustomGradient(document.getElementById('gradColor1').value, document.getElementById('gradColor2').value, this.value)">
                    </div>
                </div>
            </div>
        `;
    },

    renderSecuritySection() {
        return `
            <div class="profile-form">
                <div class="form-group">
                    <label class="form-label">Mevcut Şifre</label>
                    <input type="password" id="currentPassword" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Yeni Şifre</label>
                    <input type="password" id="newPassword" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Yeni Şifre (Tekrar)</label>
                    <input type="password" id="newPasswordConfirm" class="form-input">
                </div>
                <button type="button" class="btn btn-secondary" onclick="Profile.handleChangePassword()" style="margin-top: 8px; display:flex; align-items:center; gap:6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg> Şifreyi Değiştir
                </button>
            </div>
        `;
    },

    handleChangePassword() {
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('newPasswordConfirm').value;

        if (!currentPass || !newPass || !confirmPass) {
            Notifications.add('Hata', 'Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        if (newPass !== confirmPass) {
            Notifications.add('Hata', 'Yeni şifreler eşleşmiyor.', 'error');
            return;
        }

        if (newPass.length < 4) {
            Notifications.add('Hata', 'Şifre en az 4 karakter olmalıdır.', 'warning');
            return;
        }

        // Get current username from Auth system directly
        const user = Auth.getCurrentUser();
        const username = user ? user.username : (Storage.load(Storage.KEYS.SETTINGS, {}).userName);

        if (!username) {
            Notifications.add('Hata', 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.', 'error');
            return;
        }

        const result = Auth.changePassword(username, currentPass, newPass);

        if (result.success) {
            Notifications.add('Başarılı', result.message, 'success');
            // Clear inputs
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('newPasswordConfirm').value = '';
        } else {
            Notifications.add('Hata', result.message, 'error');
        }
    },

    setProfileTextColor(color) {
        this.stagingProfile.profileTextColor = color;
        this.hasUnsavedChanges = true;
        this.applyCardStyle(true); // Preview only
    },

    setCustomGradient(color1, color2, angle) {
        const gradient = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
        // Pass true to skip re-render, preventing input focus loss
        this.setProfileBgColor(gradient, true);
    },

    setCardStyle(property, value) {
        if (!this.stagingProfile.cardStyle) this.stagingProfile.cardStyle = {};
        this.stagingProfile.cardStyle[property] = value;
        this.hasUnsavedChanges = true;
        this.applyCardStyle(true); // Preview only
    },

    getBackgroundColors() {
        return [
            // Classics
            { name: 'Gece', value: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 100%)' },
            { name: 'Koyu Mor', value: 'linear-gradient(135deg, #1a0533 0%, #3a1c71 100%)' },
            { name: 'Deniz', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
            { name: 'Orman', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
            // Vivid / Premium
            { name: 'Sunset', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
            { name: 'Neon Life', value: 'linear-gradient(135deg, #B621FE 0%, #1FD1F9 100%)' },
            { name: 'Royal', value: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
            { name: 'Gold', value: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' },
            { name: 'Fire', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
            { name: 'Mint', value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
            { name: 'Ocean View', value: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)' },
            // Solids
            { name: 'Siyah', value: '#1a1a1a' },
            { name: 'Gri', value: '#2d3748' }
        ];
    },

    setProfileBgColor(color, skipRender = false) {
        this.stagingProfile.profileBgColor = color;
        this.hasUnsavedChanges = true;
        this.applyCardStyle(true); // Preview only
        if (!skipRender) {
            this.renderAvatarCreator();
        }
    },

    applyCardStyle(previewOnly = false) {
        // Target Sidebar Card AND Dashboard Banner AND Settings Preview
        const cards = document.querySelectorAll('.sidebar-profile-card');

        const data = previewOnly ? this.stagingProfile : this.profile;
        const bg = data.profileBgColor;
        const style = data.cardStyle || {};
        const textColor = data.profileTextColor;

        // 1. Sidebar Card Styling
        cards.forEach(card => {
            if (bg) {
                card.style.setProperty('background', bg, 'important');
                card.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
            } else {
                card.style.background = '';
                card.style.textShadow = '';
            }
            // ... (rest of card logic if any specific to card border etc)
            if (style.borderWidth && style.borderColor) {
                card.style.border = `${style.borderWidth}px solid ${style.borderColor} `;
            } else if (bg) {
                card.style.border = '1px solid rgba(255,255,255,0.1)';
            } else {
                card.style.border = '';
            }

            if (style.shadowOpacity !== undefined) {
                const opacity = style.shadowOpacity / 100;
                card.style.boxShadow = `0 10px 30px rgba(0, 0, 0, ${opacity})`;
            } else {
                card.style.boxShadow = '';
            }
            if (style.borderRadius !== undefined) {
                card.style.borderRadius = `${style.borderRadius}px`;
            } else {
                card.style.borderRadius = '';
            }
            if (style.blur !== undefined) {
                card.style.backdropFilter = `blur(${style.blur}px)`;
                card.style.webkitBackdropFilter = `blur(${style.blur}px)`;
            } else {
                card.style.backdropFilter = '';
                card.style.webkitBackdropFilter = '';
            }

            // Text color for sidebar
            if (textColor) {
                card.style.color = textColor;
                card.querySelectorAll('h2, h3, p, span').forEach(el => el.style.color = textColor);
            } else {
                card.style.color = '';
                card.querySelectorAll('h2, h3, p, span').forEach(el => el.style.color = '');
            }
        });
    },

    // Store initial form values for comparison
    storeInitialValues() {
        this.initialValues = {
            name: document.getElementById('profileNameInput')?.value || '',
            university: document.getElementById('profileUniversity')?.value || '',
            department: document.getElementById('profileDepartment')?.value || '',
            year: document.getElementById('profileYear')?.value || ''
        };
        this.hasUnsavedChanges = false;
    },

    // Check if form values have changed
    checkForChanges() {
        if (!this.initialValues) return false;

        const current = {
            name: document.getElementById('profileNameInput')?.value || '',
            university: document.getElementById('profileUniversity')?.value || '',
            department: document.getElementById('profileDepartment')?.value || '',
            year: document.getElementById('profileYear')?.value || ''
        };

        return current.name !== this.initialValues.name ||
            current.university !== this.initialValues.university ||
            current.department !== this.initialValues.department ||
            current.year !== this.initialValues.year;
    },

    // Revert form to initial values
    revertChanges() {
        if (!this.initialValues) return;

        const nameInput = document.getElementById('profileNameInput');
        const uniInput = document.getElementById('profileUniversity');
        const deptInput = document.getElementById('profileDepartment');
        const yearInput = document.getElementById('profileYear');

        if (nameInput) nameInput.value = this.initialValues.name;
        if (uniInput) uniInput.value = this.initialValues.university;
        if (deptInput) deptInput.value = this.initialValues.department;
        if (yearInput) yearInput.value = this.initialValues.year;

        this.hasUnsavedChanges = false;
    },

    // Setup unsaved changes warning
    setupUnsavedChangesWarning() {
        // Store initial values after render
        setTimeout(() => this.storeInitialValues(), 100);

        // Track changes on input fields
        const inputs = ['profileNameInput', 'profileUniversity', 'profileDepartment', 'profileYear'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    this.hasUnsavedChanges = this.checkForChanges();
                });
            }
        });

        // Warn before leaving page with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?';
                return e.returnValue;
            }
        });
    },

    // Check unsaved changes before navigation (called from App.navigateTo)
    confirmLeave(onConfirm) {
        if (this.hasUnsavedChanges) {
            Notifications.confirm(
                '⚠️ Kaydedilmemiş Değişiklikler',
                'Kaydedilmemiş değişiklikleriniz var. Kaydetmeden çıkmak istiyor musunuz?',
                () => {
                    this.revertChanges();
                    this.hasUnsavedChanges = false;
                    if (onConfirm) onConfirm();
                },
                'Kaydetmeden Çık'
            );
            return false; // Navigation is pending
        }
        return true; // OK to navigate
    },

    /**
     * Görünüm Ayarlar Sekmesini Render Et
     */
    renderAppearanceTab() {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const layout = settings.layout || {
            accentColor: '#7c3aed',
            blur: 20,
            borderRadius: 20,
            compactSidebar: false,
            disableAnimations: false
        };

        // Render Accent Color Picker - Compact
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) {
            const accents = [
                { name: 'Mor', color: '#7c3aed' },
                { name: 'Turkuaz', color: '#06b6d4' },
                { name: 'Turuncu', color: '#f97316' },
                { name: 'Kırmızı', color: '#ef4444' },
                { name: 'Yeşil', color: '#10b981' },
                { name: 'Mavi', color: '#3b82f6' }
            ];

            accentPicker.innerHTML = accents.map(a => `
                <button class="accent-btn ${layout.accentColor === a.color ? 'active' : ''}" 
                    style="width: 28px; height: 28px; border-radius: 50%; border: 3px solid ${layout.accentColor === a.color ? 'var(--text-primary)' : 'transparent'}; 
                    background: ${a.color}; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" 
                    onclick="Profile.setAccentColor('${a.color}')" title="${a.name}">
                </button>
            `).join('');
        }

        // Set Dark Theme Toggle
        const themeToggle = document.getElementById('darkThemeToggle');
        if (themeToggle) {
            themeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
        }

        

    },


    setAccentColor(color) {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        if (!settings.layout) settings.layout = {};
        settings.layout.accentColor = color;
        Storage.save(Storage.KEYS.SETTINGS, settings);

        this.applyUIStyle();
        this.renderAppearanceTab();
        Notifications.showToast('Vurgu Rengi Değiştirildi', 'Uygulama genelinde uygulandı.', 'success');
    },

    setUIStyle(key, value) {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        if (!settings.layout) settings.layout = {};
        settings.layout[key] = value;
        Storage.save(Storage.KEYS.SETTINGS, settings);
        this.applyUIStyle();
    },

    applyUIStyle() {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const layout = settings.layout || {};

        // Default Reset (User wants to revert changed settings to old version)
        document.documentElement.style.setProperty('--ui-blur', '20px');
        document.documentElement.style.setProperty('--border-radius', '20px');
        document.documentElement.style.setProperty('--border-radius-lg', '28px');
        document.documentElement.style.setProperty('--ui-font-family', "'Plus Jakarta Sans', sans-serif");
        document.documentElement.style.setProperty('--ui-card-opacity', '0.9');
        document.documentElement.style.setProperty('--ui-border-weight', '1px');

        document.body.classList.remove('density-0', 'density-1', 'density-2');
        document.body.classList.remove('compact-sidebar', 'no-animations', 'hide-glow', 'neon-borders');

        // Apply saved accent
        if (layout.accentColor) {
            const hex = layout.accentColor;
            document.documentElement.style.setProperty('--accent-purple', hex);
            document.documentElement.style.setProperty('--accent-pink', hex);
            document.documentElement.style.setProperty('--text-accent', hex);

            // Gradients based on accent
            document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${hex} 0%, ${hex}aa 100%)`);
            document.documentElement.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${hex}aa 0%, ${hex} 100%)`);

            // Fix glow effect (Hex to RGBA)
            if (hex.startsWith('#') && hex.length === 7) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
                document.documentElement.style.setProperty('--border-glow', `rgba(${r}, ${g}, ${b}, 0.15)`);
            }
        }
    }
};

window.Profile = Profile;
