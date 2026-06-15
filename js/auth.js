/**
 * Life OS - Authentication Module
 * Kullanıcı yönetimi, giriş, kayıt ve güvenlik
 */

const Auth = {
    currentUser: null,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes lockout
    maxAttempts: 3, // 3 strikes

    init() {
        this.checkLockout();
        // Bind Logout Button
        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        }, 500); // Small delay to ensure DOM
    },

    /**
     * Aktif kullanıcıyı getir
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Kullanıcıları Getir
     */
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem('lifeos_users') || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * Kullanıcı Kaydet (veya Güncelle)
     */
    saveUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.username === user.username);

        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }

        localStorage.setItem('lifeos_users', JSON.stringify(users));
    },

    /**
     * Kullanıcı Sil
     */
    deleteUser(username) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
        localStorage.setItem('lifeos_users', JSON.stringify(filtered));
    },

    /**
     * Kullanıcı Var mı?
     */
    userExists(username) {
        const users = this.getUsers();
        return users.some(u => u.username.toLowerCase() === username.toLowerCase());
    },

    /**
     * Kayıt Ol
     */
    register(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Kullanıcı adı ve şifre gereklidir.' };
        }

        if (this.userExists(username)) {
            return { success: false, message: 'Bu kullanıcı adı zaten alınmış.' };
        }

        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        this.saveUser(newUser);
        return { success: true, message: 'Kayıt başarılı! Giriş yapılıyor...' };
    },

    /**
     * Şifre Değiştir
     */
    changePassword(username, oldPassword, newPassword) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);

        if (!user) return { success: false, message: 'Kullanıcı bulunamadı.' };
        if (user.password !== this.hashPassword(oldPassword)) {
            return { success: false, message: 'Mevcut şifre hatalı.' };
        }

        user.password = this.hashPassword(newPassword);
        this.saveUser(user);
        return { success: true, message: 'Şifreniz başarıyla güncellendi.' };
    },

    /**
     * Giriş Yap
     */
    login(username, password, remember = false) {
        if (this.isLockedOut()) {
            const remaining = Math.ceil((this.getLockoutTime() - Date.now()) / 60000);
            return { success: false, message: `⚠️ Hesabınız kilitlendi! Lütfen ${remaining} dakika bekleyin.` };
        }

        const users = this.getUsers();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (user && user.password === this.hashPassword(password)) {
            this.currentUser = user;
            this.resetAttempts();
            Storage.setUser(user.username);
            localStorage.removeItem('lifeos_is_locked'); // Kilit durumunu kaldır

            // Remember Me Logic
            if (remember) {
                localStorage.setItem('lifeos_remember_me', username);
            } else {
                localStorage.removeItem('lifeos_remember_me');
            }

            return { success: true, user: user };
        } else {
            this.recordFailedAttempt();
            const attempts = this.getAttempts();
            const remainingAttempts = this.maxAttempts - attempts;

            if (remainingAttempts <= 0) {
                return { success: false, message: `⚠️ Hesabınız 15 dakika kilitlendi!` };
            }

            return {
                success: false,
                message: `Şifre hatalı! Kalan hakkınız: ${remainingAttempts}`,
                attempts: attempts
            };
        }
    },

    /**
     * Basit Şifre Hashleme (Client-side)
     * Not: Gerçek prodüksiyonda daha güvenli bir yöntem kullanılmalı
     */
    hashPassword(password) {
        return btoa(password + '_lifeos_salt');
    },

    /**
     * Hatalı Deneme Yönetimi
     */
    getAttempts() {
        try {
            const data = JSON.parse(localStorage.getItem('lifeos_auth_lockout') || '{}');
            return data.attempts || 0;
        } catch (e) {
            return 0;
        }
    },

    getLockoutTime() {
        try {
            const data = JSON.parse(localStorage.getItem('lifeos_auth_lockout') || '{}');
            return data.lockUntil || 0;
        } catch (e) {
            return 0;
        }
    },

    recordFailedAttempt() {
        const data = JSON.parse(localStorage.getItem('lifeos_auth_lockout') || '{}');
        data.attempts = (data.attempts || 0) + 1;

        if (data.attempts >= this.maxAttempts) {
            data.lockUntil = Date.now() + this.lockoutDuration;
        }

        localStorage.setItem('lifeos_auth_lockout', JSON.stringify(data));
    },

    resetAttempts() {
        localStorage.removeItem('lifeos_auth_lockout');
    },

    isLockedOut() {
        const lockUntil = this.getLockoutTime();
        return lockUntil > Date.now();
    },

    checkLockout() {
        // Just return status, cleanup is auto handled by expiry check
        return this.isLockedOut();
    },

    /**
     * Eski Verileri Migrate Et
     */
    migrateLegacyData(username) {
        const prefix = `user_${username}_`;

        // Storage.KEYS içindeki tüm keyleri bul ve taşı
        Object.values(Storage.KEYS).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                localStorage.setItem(prefix + key, data);
                // İsteğe bağlı: Eski veriyi silmeyelim, güvenlik yedeği kalsın
                // localStorage.removeItem(key); 
            }
        });

        // Modül bazlı hardcoded keyler varsa onları da taşı
        const specificKeys = [
            'lifeos_pomodoro', 'lifeos_schedule', 'lifeos_shows', 'lifeos_notes',
            'lifeos_lessons', 'lifeos_lessons_v5', 'lifeos_habit_chains',
            'lifeos_planning_tasks', 'lifeos_profile', 'lifeos_settings',
            'lifeos_youtube', 'lifeos_sites', 'lifeos_exams', 'lifeos_books'
        ];
        specificKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                localStorage.setItem(prefix + key, data);
            }
        });
    },

    /**
     * Uygulamayı Kilitle
     */
    logout() {
        Notifications.confirm(
            'Uygulamayı Kilitle',
            'Uygulamayı kilitlemek istediğinize emin misiniz? Tekrar girişte şifre sorulacaktır.',
            () => {
                this.currentUser = null;
                // Kilit durumunu aktif et
                localStorage.setItem('lifeos_is_locked', 'true');

                // Reload page to return to login screen
                window.location.reload();
            },
            'Kilitle'
        );
    }
};
