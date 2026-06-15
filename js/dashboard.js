/**
 * Life OS - Dashboard Module v2.3
 * Ana panel istatistikleri ve özet görünümü - Canlı geri sayım güncellemesi
 */

const Dashboard = {
    timerInterval: null,
    quickSitesEditMode: false,
    selectedHabitChainId: null,

    // Site Icons moved to dynamic favicon fetching
    siteIcons: [],

    init() {
        this.loadQuickSites();
        this.loadHabitSettings();
        this.render();
        this.renderQuickSites();
    },

    render() {
        this.updateStats();
        this.updateTodayTasks();
        this.updateHabitChain();
        this.updateActiveMedia();
        this.updateUpcoming();
    },

    // ... (quotes array skipped)


    // Quick Sites - Moved to bottom




    loadHabitSettings() {
        this.selectedHabitChainId = Storage.load('lifeos_dashboard_selected_chain', null);
    },

    saveHabitSettings() {
        Storage.save('lifeos_dashboard_selected_chain', this.selectedHabitChainId);
    },

    updateHabitChain() {
        const container = document.getElementById('dashboardHabitChain');
        const selectorContainer = document.getElementById('dashboardHabitSelector');
        if (!container) return;

        // Hide selector since we show top 3
        if (selectorContainer) selectorContainer.innerHTML = '';

        if (typeof HabitTracker !== 'undefined' && HabitTracker.chains?.length > 0) {
            // Sort by streak (descending)
            const topChains = [...HabitTracker.chains]
                .sort((a, b) => HabitTracker.calculateStreak(b) - HabitTracker.calculateStreak(a))
                .slice(0, 3);

            // Show 7 days on mobile, 14 on desktop
            const isMobile = window.innerWidth <= 991;
            const daysToShow = isMobile ? 7 : 14;
            const last14Days = [];
            for (let i = daysToShow - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                last14Days.push({
                    dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                    dayNum: d.getDate()
                });
            }

            container.innerHTML = `
                <div class="habit-top-list">
                    ${topChains.map(chain => {
                const streak = HabitTracker.calculateStreak(chain);
                const last30 = (HabitTracker.getLast30Days ? HabitTracker.getLast30Days() : HabitTracker.getLastNDays(30));
                const completedInLast30 = last30.filter(d => chain.completedDays.includes(d.dateStr)).length;
                const rate = Math.round((completedInLast30 / 30) * 100);

                return `
                        <div class="habit-dashboard-item">
                            <div class="habit-icon" style="background: ${chain.color}20; color: ${chain.color}; box-shadow: 0 4px 12px ${chain.color}30;">
                                ${chain.emoji.startsWith('<') ? chain.emoji : `<span>${chain.emoji}</span>`}
                            </div>
                            <div class="habit-details" style="flex: 1; min-width: 0; padding-right: 16px;">
                                <div class="habit-title ellipsis-text">${chain.name}</div>
                                <div class="habit-streak">
                                    <span style="color: ${chain.color};">🔥 ${streak} Gün</span>
                                </div>
                            </div>
                            <div class="dashboard-habit-mini-grid" style="display: flex; gap: 4px; overflow: hidden; justify-content: flex-end;">
                                ${last14Days.map(d => {
                    const isCompleted = chain.completedDays.includes(d.dateStr);
                    return `
                                    <div title="${d.dateStr}"
                                         onclick="HabitTracker.toggleDay('${chain.id}', '${d.dateStr}'); Dashboard.updateHabitChain();"
                                         class="habit-day-box ${isCompleted ? 'completed' : ''}"
                                         style="--day-color: ${chain.color}; width: 22px; height: 22px; font-size: 10px !important; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); color: ${isCompleted ? '#fff' : 'rgba(255,255,255,0.4)'}; background: ${isCompleted ? 'var(--day-color)' : 'rgba(0,0,0,0.2)'};">
                                         ${d.dayNum}
                                    </div>
                                    `;
                }).join('')}
                            </div>
                        </div>
                        `;
            }).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Henüz alışkanlık zinciri yok</p>
                    <button class="btn btn-primary" style="margin-top: 12px;" onclick="App.navigateTo('habits')">Zincir Oluştur</button>
                </div>
            `;
        }
    },

    changeHabitChain(chainId) {
        this.selectedHabitChainId = chainId;
        this.saveHabitSettings();
        this.updateHabitChain();
    },

    calculateStreak() {
        // Obsolete login streak calculation removed as per user request
        return 0;
    },

    selectedTaskIds: new Set(),

    toggleDropdown(menuId, btnId) {
        const menu = document.getElementById(menuId);
        const btn = document.getElementById(btnId);

        // Close other dropdowns
        document.querySelectorAll('.task-dropdown-menu.active').forEach(el => {
            if (el.id !== menuId) {
                el.classList.remove('active');

                // Find corresponding button to deactivate
                // We need to match the button that controls this specific menu
                // Since we can't easily reference back, we'll brute force clear active buttons
                // except the one we are about to toggle (if it's the same)
            }
        });

        // Remove active class from all dropdown buttons to be safe, except current one
        document.querySelectorAll('.task-dropdown-btn.active').forEach(b => {
            if (b.id !== btnId) b.classList.remove('active');
        });

        if (menu) {
            menu.classList.toggle('active');
            btn?.classList.toggle('active');
        }
    },

    toggleTaskSelection(taskId) {
        // Ensure ID is string for consistency
        const idStr = String(taskId);
        if (this.selectedTaskIds.has(idStr)) {
            this.selectedTaskIds.delete(idStr);
        } else {
            this.selectedTaskIds.add(idStr);
        }
        this.updateTodayTasks();
    },

    async completeSelectedTasks() {
        if (this.selectedTaskIds.size === 0) return;

        const tasks = Planning.tasks || [];
        Planning.tasks = tasks.map(t => {
            if (this.selectedTaskIds.has(String(t.id))) {
                return { ...t, status: 'done', completedDate: new Date().toISOString() };
            }
            return t;
        });

        Planning.saveTasks();
        this.selectedTaskIds.clear();
        Dashboard.updateTodayTasks();
    },

    deleteSelectedTasks() {
        if (this.selectedTaskIds.size === 0) return;

        Notifications.confirm('Seçili Görevleri Sil', 'Seçilen görevleri silmek istediğinize emin misiniz?', () => {
            Planning.tasks = Planning.tasks.filter(t => !this.selectedTaskIds.has(String(t.id)));
            Planning.saveTasks();
            this.selectedTaskIds.clear();
            Dashboard.updateTodayTasks();
        }, 'Evet, Sil');
    },

    async postponeSelectedTasks() {
        if (this.selectedTaskIds.size === 0) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

        Planning.tasks = Planning.tasks.map(t => {
            if (this.selectedTaskIds.has(String(t.id))) {
                return { ...t, dueDate: tomorrowStr };
            }
            return t;
        });

        Planning.saveTasks();
        this.selectedTaskIds.clear();
        Dashboard.updateTodayTasks();
    },

    updateTodayTasks() {
        const container = document.getElementById('todayTasks');
        if (!container) return;

        const todayStr = App.getLocalDateString();
        const priorityWeight = { high: 3, medium: 2, low: 1 };

        // Toplam ve tamamlanan hesaplaması (grafik için)
        const allTodayTasks = (Planning?.tasks || []).filter(t => t.dueDate === todayStr);
        const completedCount = allTodayTasks.filter(t => t.status === 'done').length;
        const totalCount = allTodayTasks.length;
        const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        
        // SVG Ring özellikleri
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        let chartHtml = `
            <div class="ring-chart-wrapper">
                <div class="ring-chart">
                    <svg viewBox="0 0 120 120">
                        <defs>
                            <linearGradient id="gradientPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#8b5cf6" />
                                <stop offset="100%" stop-color="#ec4899" />
                            </linearGradient>
                        </defs>
                        <circle class="ring-bg" cx="60" cy="60" r="${radius}"></circle>
                        <circle class="ring-progress" cx="60" cy="60" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"></circle>
                    </svg>
                    <div class="ring-center">
                        <span class="ring-percentage counter-anim">${percentage}%</span>
                        <span class="ring-label">Tamamlanan</span>
                    </div>
                </div>
                <div class="chart-stats-side">
                    <div class="stat-side-item">
                        <div class="stat-side-color" style="background: var(--accent-purple);"></div>
                        <div class="stat-side-text">Biten: <strong>${completedCount}</strong></div>
                    </div>
                    <div class="stat-side-item">
                        <div class="stat-side-color" style="background: rgba(255,255,255,0.1);"></div>
                        <div class="stat-side-text">Kalan: <strong>${totalCount - completedCount}</strong></div>
                    </div>
                </div>
            </div>
        `;

        const tasks = allTodayTasks.filter(t => t.status !== 'done').sort((a, b) => {
            if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        });

        if (tasks.length === 0) {
            container.innerHTML = chartHtml + '<p class="empty-state">Bugün için görev yok 🎉</p>';
            return;
        }

        const tasksHtml = tasks.slice(0, 8).map(task => {
            const priorityData = Planning.getPriorityData(task.priority);

            return `
                <div class="task-mini-item">
                    <label class="task-checkbox-container" style="margin:0;">
                        <input type="checkbox" 
                               onchange="Planning.changeStatus('${task.id}', 'done')">
                         <span class="task-checkmark"></span>
                    </label>
                    <span class="task-text ellipsis-text">${task.title}</span>
                    <div class="task-priority-indicator" style="color: ${priorityData.color}; flex-shrink: 0; display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 5px; background: ${priorityData.color}15; margin-left: auto; margin-right: 8px; font-size: 8px; font-weight: 800;" title="${priorityData.text} Öncelik">
                        ${priorityData.icon}
                        <span>${priorityData.text}</span>
                    </div>
                    <button class="task-dropdown-btn" onclick="event.stopPropagation(); Planning.showTaskDetails('${task.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = chartHtml + '<div style="margin-top: 16px;">' + tasksHtml + '</div>';
    },

    getStatusLabel(status) {
        const labels = { todo: 'Aktif', inProgress: 'Devam', done: 'Tamamlandı' };
        return labels[status] || status;
    },



    updateUpcoming() {
        const container = document.getElementById('upcomingItems');
        if (!container) return;

        // Clear existing interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Get upcoming tasks (next 7 days)
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingTasks = (Planning?.tasks || [])
            .filter(t => {
                if (!t.dueDate) return false;
                // Only include tasks that have a specific time set
                // Include today's tasks
                return t.dueDate >= todayStr && t.dueDate <= nextWeek.toISOString().split('T')[0] && t.status !== 'done';
            })
            .map(t => {
                let date;
                if (t.dueTime) {
                    date = new Date(`${t.dueDate}T${t.dueTime}`);
                } else {
                    // Task due date is end of that day if no time specified
                    date = new Date(t.dueDate);
                    date.setHours(23, 59, 59, 999);
                }

                return {
                    type: 'task',
                    icon: '📋',
                    title: t.title,
                    date: date,
                    priority: t.priority
                };
            })
            .filter(t => t.date >= now);

        // Get upcoming exams (next 14 days)
        const twoWeeks = new Date(now);
        twoWeeks.setDate(twoWeeks.getDate() + 14);

        const upcomingExams = (Exams?.exams || [])
            .map(e => {
                // Exam has specific date and time
                const date = new Date(`${e.date}T${e.time}`);
                // Build title from exam name and lesson name
                const examTitle = e.lessonName
                    ? `${e.lessonName} - ${e.name}`
                    : e.name;
                return {
                    type: 'exam',
                    icon: '📝',
                    title: examTitle,
                    date: date,
                    lessonId: e.lessonId,
                    rawDate: e.date // Keep raw date for filtering
                };
            })
            .filter(e => {
                const examDate = new Date(e.rawDate);
                const endDate = new Date(twoWeeks);
                // Basic date range check works better with raw date for day comparison or just timestamp
                return e.date >= now && e.date <= endDate;
            });

        // Combine and sort
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const allUpcoming = [...upcomingTasks, ...upcomingExams]
            .sort((a, b) => {
                // Önce tarihe göre
                if (a.date.getTime() !== b.date.getTime()) {
                    return a.date - b.date;
                }
                // Aynı zaman dilimindeyse (veya saat yoksa) önceliğe göre
                const weightA = a.type === 'task' ? (priorityWeight[a.priority] || 0) : 4; // Exam > Task same time
                const weightB = b.type === 'task' ? (priorityWeight[b.priority] || 0) : 4;
                return weightB - weightA;
            })
            .slice(0, window.innerWidth <= 991 ? 2 : 4); // 2 on mobile, 4 on desktop

        if (allUpcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">Yaklaşan etkinlik yok</p>';
            return;
        }

        // Render initial HTML - Horizontal Cards Match
        // Determine if there are active elements to draw progress line
        let activeCount = 0;
        const timelineHTML = allUpcoming.map((item, index) => {
            const positionClass = index % 2 === 0 ? 'top' : 'bottom';
            const dateStr = item.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // Assume items within next 24 hours are 'active' or if it's the very next one
            const diff = item.date - now;
            const isNear = diff < (1000 * 60 * 60 * 24 * 3); // within 3 days
            if (isNear) activeCount++;
            
            const activeClass = isNear ? 'active' : '';

            return `
                <div class="timeline-node-container ${positionClass} ${activeClass}">
                    <div class="timeline-content">
                        <div class="timeline-title">${item.title}</div>
                        <div class="timeline-date">${dateStr}</div>
                        <div id="dashboard-countdown-${index}" class="timeline-countdown"></div>
                    </div>
                    <div class="timeline-node"></div>
                </div>
            `;
        }).join('');

        const progressWidth = allUpcoming.length > 1 ? (activeCount / (allUpcoming.length - 1)) * 100 : 100;

        container.innerHTML = `
            <div class="upcoming-timeline">
                <div class="timeline-line"></div>
                <div class="timeline-progress" style="width: ${progressWidth > 100 ? 100 : progressWidth}%;"></div>
                ${timelineHTML}
            </div>
        `;

        // Update function
        const updateCountdowns = () => {
            allUpcoming.forEach((item, index) => {
                const time = this.getCountdown(item.date, item.type);
                const countEl = document.getElementById(`dashboard-countdown-${index}`);

                if (countEl) {
                    countEl.textContent = time.display;
                    // Urgent if less than 24h
                    countEl.style.color = time.urgent ? 'var(--danger)' : 'var(--primary)';
                }
            });
        };

        // Run immediately and then interval
        updateCountdowns();
        this.timerInterval = setInterval(updateCountdowns, 1000);
    },

    getCountdown(targetDate, type) {
        const now = new Date();
        const diff = targetDate - now;

        // If passed
        if (diff < 0) {
            return { display: 'Geçti', label: '', urgent: false };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days === 0) {
            // Less than 24h: Urgent and show HH:MM:SS
            return {
                display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                label: 'kaldı',
                urgent: true
            };
        } else {
            // More than 24h: Not urgent
            return {
                display: `${days}g ${hours}sa ${minutes}dk`,
                label: 'kaldı',
                urgent: false
            };
        }
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('tr-TR', options);
    },

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;
        return date.toLocaleDateString('tr-TR');
    },



    // Record a completion for today
    recordCompletion() {
        const weeklyProgress = Storage.load('lifeos_weekly_progress', {});
        const dateStr = App.getLocalDateString();

        if (!weeklyProgress[dateStr]) {
            weeklyProgress[dateStr] = { completed: 0 };
        }
        weeklyProgress[dateStr].completed++;

        Storage.save('lifeos_weekly_progress', weeklyProgress);
    },

    // Quick Sites Management
    quickSites: [],

    loadQuickSites() {
        this.quickSites = Storage.load('lifeos_quick_sites', [
            { id: 1, name: 'Google', url: 'https://google.com', icon: '' },
            { id: 2, name: 'YouTube', url: 'https://youtube.com', icon: '' },
            { id: 3, name: 'GitHub', url: 'https://github.com', icon: '' },
            { id: 4, name: 'ChatGPT', url: 'https://chat.openai.com', icon: '' }
        ]);

        // Clean up any old "Site Ekle" placeholders if they exist in storage
        this.quickSites = this.quickSites.filter(s => s.name !== 'Site Ekle');
    },

    saveQuickSites() {
        Storage.save('lifeos_quick_sites', this.quickSites);
    },

    renderQuickSites() {
        const grid = document.getElementById('quickSitesGrid');
        const container = document.querySelector('.dashboard-quick-sites');
        if (!grid) return;

        // Toggle edit mode class on container
        if (container) {
            if (this.quickSitesEditMode) {
                container.classList.add('edit-mode');
            } else {
                container.classList.remove('edit-mode');
            }
        }

        let html = '';

        if (this.quickSites.length === 0 && !this.quickSitesEditMode) {
            html = '<p class="empty-state" style="width: 100%; text-align: center; font-size: 13px;">Henüz uygulama eklenmedi</p>';
        } else {
            // Render sites
            html = this.quickSites.map((site, index) => {
                const actionOnClick = this.quickSitesEditMode
                    ? `event.preventDefault(); Dashboard.showQuickSiteModal(${index})`
                    : '';
                const href = this.quickSitesEditMode ? '#' : site.url;

                let domain = '';
                try {
                    domain = new URL(site.url).hostname;
                } catch {
                    domain = '';
                }

                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                const effectiveIcon = site.icon || faviconUrl;

                // Fallback SVG if image fails
                const fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

                return `
                    <a href="${href}" target="_blank" class="quick-site-btn" title="${site.name}" onclick="${actionOnClick}">
                        <div class="quick-site-icon">
                            <img src="${effectiveIcon}" alt="${site.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; color:var(--text-muted);">${fallbackSvg}</div>
                        </div>
                        <span class="quick-site-name">${site.name}</span>
                        ${this.quickSitesEditMode ? `
                            <button class="quick-site-delete-badge" onclick="event.stopPropagation(); event.preventDefault(); Dashboard.deleteQuickSite(${index})">×</button>
                        ` : ''
                    }
                    </a>
                `;
            }).join('');
        }

        // Add "Add New" button if in edit mode and limit not reached
        if (this.quickSitesEditMode && this.quickSites.length < 9) {
            html += `
                <button class="quick-site-btn add-new" onclick="Dashboard.showQuickSiteModal(-1)" title="Yeni Ekle">
                    <span class="quick-site-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
                        </svg>
                    </span>
                    <span class="quick-site-name">Ekle</span>
                </button>
            `;
        }

        grid.innerHTML = html;
    },

    toggleQuickSitesEdit() {
        this.quickSitesEditMode = !this.quickSitesEditMode;
        this.renderQuickSites();

        // Update manage button State
        // Update manage button State
        const btn = document.getElementById('quickSitesBtn');
        if (btn) {
            if (this.quickSitesEditMode) {
                // Show Checkmark (Done)
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success);"><polyline points="20 6 9 17 4 12"/></svg>`;
                btn.title = 'Tamamla';
            } else {
                // Show 3-dots (Edit)
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>`;
                btn.title = 'Düzenle';
            }
            btn.classList.toggle('active', this.quickSitesEditMode);
        }
    },

    showQuickSiteModal(index) {
        const isNew = index === -1;
        const site = isNew
            ? { id: Date.now(), name: '', url: '', icon: '' }
            : this.quickSites[index];

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = isNew ? 'Yeni Uygulama Ekle' : 'Uygulamayı Düzenle';
        modalBody.innerHTML = `
            <form id="quickSiteForm">
                <div class="form-group">
                    <label class="form-label">🏷️ Uygulama Adı</label>
                    <input type="text" class="form-input" name="name" required
                           placeholder="Google, YouTube, vb."
                           value="${isNew ? '' : site.name}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔗 URL / Bağlantı</label>
                    <input type="url" class="form-input" name="url" required
                           placeholder="https://..."
                           value="${isNew ? '' : site.url}">
                </div>

                <div class="form-group">
                    <label class="form-label">🎨 İkon URL (Opsiyonel)</label>
                    <input type="url" class="form-input" name="icon" 
                           placeholder="https://example.com/icon.png"
                           value="${site.icon}">
                    <small style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">Boş bırakırsanız favicon otomatik çekilir.</small>
                </div>

                <div class="modal-footer" style="padding: 0; border: none; margin-top: 24px;">
                    ${!isNew ? `<button type="button" class="btn btn-danger" onclick="Dashboard.deleteQuickSite(${index})">Sil</button>` : ''}
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('quickSiteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const newSiteData = {
                id: site.id || Date.now(),
                name: formData.get('name'),
                url: formData.get('url'),
                icon: formData.get('icon') || ''
            };

            if (isNew) {
                if (this.quickSites.length >= 9) {
                    Notifications.add('Limit Ulaşıldı', 'En fazla 9 site ekleyebilirsiniz.', 'warning');
                    App.closeModal();
                    return;
                }
                this.quickSites.push(newSiteData);
            } else {
                this.quickSites[index] = newSiteData;
            }

            this.saveQuickSites();
            this.renderQuickSites();
            App.closeModal();
            Notifications.add('Uygulama Kaydedildi', `"${formData.get('name')}" ${isNew ? 'eklendi' : 'güncellendi'}.`, 'success', true);
        });
    },

    updateStats() {
        // 1. Tasks Stat
        if (typeof Planning !== 'undefined' && Planning.tasks) {
            const todayStr = App.getLocalDateString();
            const activeTasks = Planning.tasks.filter(t => t.status !== 'done' && t.dueDate >= todayStr);
            this.setEl('activeTaskCount', activeTasks.length);
        }

        // 2. Books Stat
        if (typeof Books !== 'undefined' && Books.books) {
            this.setEl('totalBooks', Books.books.length);
        }

        // 3. Series & Movies Stat (From Shows Module) combined into totalMovies
        if (typeof Shows !== 'undefined' && Shows.shows) {
            const seriesCount = Shows.shows.filter(s => s.type === 'dizi').length;
            const moviesCount = Shows.shows.filter(s => s.type === 'film').length;
            this.setEl('totalMovies', seriesCount + moviesCount);
        }

        // 4. Games Stat
        let gameCount = 0;
        if (typeof Games !== 'undefined' && Games.games) {
            gameCount = Games.games.length;
        }
        this.setEl('totalGames', gameCount);
    },

    animateValue(id, start, end, duration) {
        if (start === end) return;
        const el = document.getElementById(id);
        if (!el) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing function: easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeProgress * (end - start) + start);
            el.textContent = current;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = end;
                el.style.animation = 'none';
                void el.offsetWidth; // trigger reflow
                el.style.animation = 'countUpGlow 0.8s ease-out';
            }
        };
        window.requestAnimationFrame(step);
    },

    setEl(id, val) {
        const el = document.getElementById(id);
        if (!el) return;
        
        const currentVal = parseInt(el.textContent) || 0;
        if (currentVal !== val) {
            this.animateValue(id, currentVal, val, 1500); // 1.5s animation
        } else {
            el.textContent = val;
        }
    },

    selectSiteIcon(icon, btn) {
        // Obsolete
    },
    deleteQuickSite(index) {
        Notifications.confirm('Uygulamayı Sil', 'Bu uygulamayı silmek istiyor musunuz?', () => {
            this.quickSites.splice(index, 1);
            this.saveQuickSites();
            this.renderQuickSites();
            Notifications.add('Uygulama Silindi', 'Uygulama kaldırıldı.', 'info', true);
        }, 'Evet, Sil');
    },

    updateActiveMedia() {
        const container = document.getElementById('dashboardActiveMedia');
        if (!container) return;

        let html = '';
        
        // 1. Okunan Kitap
        let activeBook = null;
        if (typeof Books !== 'undefined' && Books.books) {
            activeBook = Books.books.find(b => b.status === 'reading');
        }

        if (activeBook) {
            const progress = activeBook.totalPages > 0 ? Math.round((activeBook.currentPage / activeBook.totalPages) * 100) : 0;
            html += `
                <div class="modern-stat-card" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0,0,0,0)); border-color: rgba(168, 85, 247, 0.2); cursor: pointer;" onclick="App.navigateTo('books'); setTimeout(() => Books.showInfoModal('${activeBook.id}'), 100)">
                    <div class="stat-icon" style="background: rgba(168, 85, 247, 0.2); color: #a855f7;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Okunuyor</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 4px;">${activeBook.title}</span>
                        <div style="font-size: 11px; color: #a855f7; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                            <span style="white-space: nowrap;">${activeBook.currentPage || 0} / ${activeBook.totalPages || 0} Sayfa</span>
                            <div style="flex: 1; height: 4px; background: rgba(168, 85, 247, 0.2); border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; width: ${progress}%; background: #a855f7; border-radius: 2px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="modern-stat-card" style="opacity: 0.5; cursor: pointer; border: 1px dashed var(--border-color);" onclick="App.navigateTo('books')">
                    <div class="stat-icon" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Kitap</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 2px; color: var(--text-muted);">Okunmuyor</span>
                    </div>
                </div>
            `;
        }

        // 2. İzlenen Dizi & 3. İzlenen Film
        let activeSeries = null;
        let activeMovie = null;
        if (typeof Shows !== 'undefined' && Shows.shows) {
            activeSeries = Shows.shows.find(s => s.status === 'izleniyor' && s.type !== 'film');
            activeMovie = Shows.shows.find(s => s.status === 'izleniyor' && s.type === 'film');
        }

        if (activeSeries) {
            html += `
                <div class="modern-stat-card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0,0,0,0)); border-color: rgba(59, 130, 246, 0.2); cursor: pointer;" onclick="App.navigateTo('shows'); setTimeout(() => Shows.showInfoModal('${activeSeries.id}'), 100)">
                    <div class="stat-icon" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Dizi</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 4px;">${activeSeries.title}</span>
                        <div style="font-size: 11px; color: #3b82f6; font-weight: 700;">Sezon ${activeSeries.currentSeason || 1} • ${activeSeries.currentEpisode}. Bölüm</div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="modern-stat-card" style="opacity: 0.5; cursor: pointer; border: 1px dashed var(--border-color);" onclick="App.navigateTo('shows')">
                    <div class="stat-icon" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Dizi</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 2px; color: var(--text-muted);">İÄİzlenmiyor</span>
                    </div>
                </div>
            `;
        }

        if (activeMovie) {
            const progress = activeMovie.totalMinutes > 0 ? Math.round((activeMovie.watchedMinutes / activeMovie.totalMinutes) * 100) : 0;
            html += `
                <div class="modern-stat-card" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(0,0,0,0)); border-color: rgba(236, 72, 153, 0.2); cursor: pointer;" onclick="App.navigateTo('shows'); setTimeout(() => Shows.showInfoModal('${activeMovie.id}'), 100)">
                    <div class="stat-icon" style="background: rgba(236, 72, 153, 0.2); color: #ec4899;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Film</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 4px;">${activeMovie.title}</span>
                        <div style="font-size: 11px; color: #ec4899; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                            <span style="white-space: nowrap;">${activeMovie.watchedMinutes || 0} / ${activeMovie.totalMinutes || 0} dk</span>
                            <div style="flex: 1; height: 4px; background: rgba(236, 72, 153, 0.2); border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; width: ${progress}%; background: #ec4899; border-radius: 2px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="modern-stat-card" style="opacity: 0.5; cursor: pointer; border: 1px dashed var(--border-color);" onclick="App.navigateTo('shows')">
                    <div class="stat-icon" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Film</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 2px; color: var(--text-muted);">İÄİzlenmiyor</span>
                    </div>
                </div>
            `;
        }

        // 4. Oynanan Oyun
        let activeGame = null;
        if (typeof Games !== 'undefined' && Games.games) {
            activeGame = Games.games.find(g => g.status === 'playing');
        }

        if (activeGame) {
            html += `
                <div class="modern-stat-card" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(0,0,0,0)); border-color: rgba(34, 197, 94, 0.2); cursor: pointer;" onclick="App.navigateTo('games'); setTimeout(() => Games.showInfoModal('${activeGame.id}'), 100)">
                    <div class="stat-icon" style="background: rgba(34, 197, 94, 0.2); color: #22c55e;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Oyun</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 4px;">${activeGame.title}</span>
                        <div style="font-size: 11px; color: #22c55e; font-weight: 700;">${activeGame.hoursPlayed || 0} Saat Oynandı±ı</div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="modern-stat-card" style="opacity: 0.5; cursor: pointer; border: 1px dashed var(--border-color);" onclick="App.navigateTo('games')">
                    <div class="stat-icon" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
                    </div>
                    <div class="stat-info" style="width: 100%; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Oyun</div>
                        <span class="stat-number ellipsis-text" style="font-size: 1.1rem; line-height: 1.2; margin-bottom: 2px; color: var(--text-muted);">Oynanmıyor</span>
                    </div>
                </div>
            `;
        }

        // Wrapper to separate from top stats
        const wrapperHtml = `
            <div style="margin-bottom: 24px; padding-top: 20px; border-top: 1px dashed var(--border-color);">
                <div onclick="Dashboard.showOngoingDetails()" style="font-size: 13px; font-weight: 800; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Devam Edenler
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; color: var(--text-primary); font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 20px;">
                        Detaylar
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                </div>
                <div class="modern-stats-container">
                    ${html}
                </div>
            </div>
        `;

        container.innerHTML = wrapperHtml;
        container.style.display = 'block';
    },

    showOngoingDetails() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Aktif İçerikler Detayı';
        
        let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';

        // 1. Book
        let activeBook = null;
        if (typeof Books !== 'undefined' && Books.books) {
            activeBook = Books.books.find(b => b.status === 'reading');
        }
        if (activeBook) {
            const progress = activeBook.totalPages > 0 ? Math.round((activeBook.currentPage / activeBook.totalPages) * 100) : 0;
            html += `
                <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(0,0,0,0)); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(168, 85, 247, 0.1); color: #a855f7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Okunuyor</div>
                        <div style="font-size: 1.1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;">${activeBook.title}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${progress}%; background: #a855f7; transition: width 0.3s;"></div>
                            </div>
                            <span style="font-size: 12px; color: #a855f7; font-weight: 800; min-width: 60px; text-align: right;">${activeBook.currentPage} / ${activeBook.totalPages}</span>
                        </div>
                    </div>
                    <button onclick="Dashboard.incrementOngoing('book', '${activeBook.id}')" style="width: 40px; height: 40px; border-radius: 20px; border: none; background: #a855f7; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);" title="+1 Sayfa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                </div>
            `;
        }

        // 2. Series
        let activeSeries = null;
        if (typeof Shows !== 'undefined' && Shows.shows) {
            activeSeries = Shows.shows.find(s => s.status === 'izleniyor' && s.type !== 'film');
        }
        if (activeSeries) {
            const progress = activeSeries.totalEpisodes > 0 ? Math.round((activeSeries.currentEpisode / activeSeries.totalEpisodes) * 100) : 0;
            html += `
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(0,0,0,0)); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Dizi</div>
                        <div style="font-size: 1.1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;">${activeSeries.title}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${progress}%; background: #3b82f6; transition: width 0.3s;"></div>
                            </div>
                            <span style="font-size: 12px; color: #3b82f6; font-weight: 800; min-width: 60px; text-align: right;">${activeSeries.currentEpisode}. Bölüm</span>
                        </div>
                    </div>
                    <button onclick="Dashboard.incrementOngoing('series', '${activeSeries.id}')" style="width: 40px; height: 40px; border-radius: 20px; border: none; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);" title="+1 Bölüm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                </div>
            `;
        }

        // 3. Movie
        let activeMovie = null;
        if (typeof Shows !== 'undefined' && Shows.shows) {
            activeMovie = Shows.shows.find(s => s.status === 'izleniyor' && s.type === 'film');
        }
        if (activeMovie) {
            html += `
                <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(0,0,0,0)); border: 1px solid rgba(236, 72, 153, 0.2); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(236, 72, 153, 0.1); color: #ec4899; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Film</div>
                        <div style="font-size: 1.1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;">${activeMovie.title}</div>
                        <div style="font-size: 12px; color: #ec4899; font-weight: 800;">${activeMovie.watchedMinutes || 0} / ${activeMovie.totalMinutes || 0} Dakika İÄİzlendi</div>
                    </div>
                </div>
            `;
        }

        // 4. Game
        let activeGame = null;
        if (typeof Games !== 'undefined' && Games.games) {
            activeGame = Games.games.find(g => g.status === 'playing');
        }
        if (activeGame) {
            html += `
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(0,0,0,0)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.1); color: #22c55e; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Oyun</div>
                        <div style="font-size: 1.1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;">${activeGame.title}</div>
                        <div style="font-size: 12px; color: #22c55e; font-weight: 800;">${activeGame.hoursPlayed || 0} Saat Oynandı±ı</div>
                    </div>
                    <button onclick="Dashboard.incrementOngoing('game', '${activeGame.id}')" style="width: 40px; height: 40px; border-radius: 20px; border: none; background: #22c55e; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);" title="+1 Saat">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                </div>
            `;
        }

        if (!activeBook && !activeSeries && !activeMovie && !activeGame) {
            html += `
                <div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 14px;">
                    <div style="margin-bottom: 12px; opacity: 0.5;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    Şu an aktif olarak tükettiğiniz bir içerik bulunmuyor.
                </div>
            `;
        }

        html += '</div>';
        modalBody.innerHTML = html;
        App.openModal();
    },

    incrementOngoing(type, id) {
        if (type === 'book') {
            const book = Books.books.find(b => b.id === id);
            if (book) {
                const newPage = parseInt(book.currentPage || 0) + 1;
                Books.update(id, { currentPage: newPage });
                this.showOngoingDetails(); // refresh modal
                this.updateActiveMedia();  // refresh dashboard
            }
        } else if (type === 'series') {
            const show = Shows.shows.find(s => s.id === id);
            if (show) {
                const newEp = parseInt(show.currentEpisode || 0) + 1;
                Shows.update(id, { currentEpisode: newEp });
                this.showOngoingDetails();
                this.updateActiveMedia();
            }
        } else if (type === 'game') {
            const game = Games.games.find(g => g.id === id);
            if (game) {
                const newHours = parseInt(game.hoursPlayed || 0) + 1;
                Games.update(id, { hoursPlayed: newHours });
                this.showOngoingDetails();
                this.updateActiveMedia();
            }
        }
    }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;




