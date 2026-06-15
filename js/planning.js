/**
 * Life OS - Planning Module
 * Görev ve planlama yönetimi - Enhanced with Multiple Views
 */

const Planning = {
    tasks: [],
    currentWeekOffset: 0,
    currentMonthOffset: 0,
    currentView: 'weekly', // 'weekly', 'monthly', 'all'
    statusFilter: 'active', // 'active', 'overdue', 'done', 'all'
    priorityFilter: 'all',
    selectedTaskIds: new Set(),
    selectionMode: false,

    /**
     * Modülü başlat
     */
    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
        this.updateCalendarTitle();
        this.updateStats();
    },

    /**
     * Görevin görüntüleneceği tarihi belirle
     * (Eğer gecikmeli tamamlanmışsa tamamlanma tarihini, yoksa vade tarihini döndürür)
     */
    getTaskDisplayDate(task) {
        if (task.status === 'done' && task.completedDate) {
            const compDateStr = task.completedDate.split('T')[0];
            if (compDateStr > task.dueDate) {
                return compDateStr;
            }
        }
        return task.dueDate;
    },

    /**
     * Event listener'ları bağla
     */
    bindEvents() {
        // Yeni görev ekle butonu
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddModal();
        });

        // Tasarruf: Birleşik Navigasyon
        document.getElementById('prevTaskNav')?.addEventListener('click', () => {
            if (this.currentView === 'weekly') {
                this.currentWeekOffset--;
                this.updateCalendarTitle();
                this.render();
            } else if (this.currentView === 'monthly') {
                this.currentMonthOffset--;
                this.updateMonthTitle();
                this.renderMonthView();
            }
        });

        document.getElementById('nextTaskNav')?.addEventListener('click', () => {
            if (this.currentView === 'weekly') {
                this.currentWeekOffset++;
                this.updateCalendarTitle();
                this.render();
            } else if (this.currentView === 'monthly') {
                this.currentMonthOffset++;
                this.updateMonthTitle();
                this.renderMonthView();
            }
        });

        // Görünüm seçici
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Status filter is now handled by custom dropdown selectStatus() method

        // Click outside to close custom dropdowns
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                document.querySelectorAll('.custom-dropdown-menu').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    },

    /**
     * Görünüm değiştir
     */
    switchView(view) {
        this.currentView = view;

        // Aktif buton güncelle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Görünümleri göster/gizle
        document.getElementById('weeklyView').style.display = view === 'weekly' ? 'block' : 'none';
        document.getElementById('monthlyView').style.display = view === 'monthly' ? 'block' : 'none';
        document.getElementById('allTasksView').style.display = view === 'all' ? 'block' : 'none';

        // Navigasyon barını 'Tümü' sayfasında gizle
        const navBar = document.getElementById('planningNav');
        if (navBar) {
            navBar.style.visibility = view === 'all' ? 'hidden' : 'visible';
        }

        // İlgili görünümü render et
        if (view === 'weekly') {
            this.render();
        } else if (view === 'monthly') {
            this.updateMonthTitle();
            this.renderMonthView();
        } else if (view === 'all') {
            this.renderAllTasksView();
        }
    },

    /**
     * Görevleri yükle
     */
    loadTasks() {
        this.tasks = Storage.load(Storage.KEYS.TASKS, []);
    },

    /**
     * Görevleri kaydet
     */
    saveTasks() {
        Storage.save(Storage.KEYS.TASKS, this.tasks);
    },

    add(taskData) {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const task = {
            id: Storage.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'medium', // high, medium, low
            status: 'todo', // todo, inProgress, done
            dueDate: taskData.dueDate || todayStr,
            endDate: taskData.endDate || taskData.dueDate || todayStr,
            dueTime: taskData.dueTime || '',
            repeat: taskData.repeat || 'none',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderCurrentView();
        this.updateStats();

        // Refresh dashboard if visible
        if (typeof App !== 'undefined' && App.currentPage === 'dashboard' && typeof Dashboard !== 'undefined') {
            Dashboard.render();
        }

        Notifications.add(
            'Yeni Görev Eklendi',
            `"${task.title}" görev listenize eklendi.`,
            'success',
            true
        );

        return task;
    },

    update(id, updates) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const oldStatus = task.status;
            const now = new Date();
            const updatesWithMetadata = { ...updates, updatedAt: now.toISOString() };

            // Tamamlandığında bildirim ve tarih
            if (updates.status === 'done' && oldStatus !== 'done') {
                updatesWithMetadata.completedDate = now.toISOString();
                Notifications.add(
                    'Görev Tamamlandı! ✅',
                    `"${task.title}" tamamlandı.`,
                    'success',
                    true
                );
                
                if (task.repeat && task.repeat !== 'none') {
                    this.createNextRepeatingTask(task);
                }
            }

            Object.assign(task, updatesWithMetadata);

            this.saveTasks();
            this.renderCurrentView();
            this.updateStats();

            // Refresh dashboard if visible
            if (typeof App !== 'undefined' && App.currentPage === 'dashboard' && typeof Dashboard !== 'undefined') {
                Dashboard.render();
            }
        }
    },

    createNextRepeatingTask(task) {
        const date = new Date(task.dueDate);
        if (task.repeat === 'daily') {
            date.setDate(date.getDate() + 1);
        } else if (task.repeat === 'weekly') {
            date.setDate(date.getDate() + 7);
        } else if (task.repeat === 'monthly') {
            date.setMonth(date.getMonth() + 1);
        }
        
        const nextDateStr = date.toISOString().split('T')[0];
        if (task.endDate && nextDateStr > task.endDate) return;

        const newTask = {
            id: Storage.generateId(),
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: 'todo',
            dueDate: nextDateStr,
            endDate: task.endDate,
            dueTime: task.dueTime,
            repeat: task.repeat,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.tasks.push(newTask);
    },

    getRepeatingInstances(task, endDateStr, maxInstances = 50) {
        const instances = [];
        if (!task.repeat || task.repeat === 'none' || task.status === 'done') return instances;

        let currentDate = new Date(task.dueDate);
        const taskEndDateObj = new Date(task.endDate || endDateStr);
        const viewEndDateObj = new Date(endDateStr);
        const endDate = taskEndDateObj < viewEndDateObj ? taskEndDateObj : viewEndDateObj;

        const advanceDate = () => {
            if (task.repeat === 'daily') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (task.repeat === 'weekly') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (task.repeat === 'monthly') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        };

        advanceDate();

        while (currentDate <= endDate && maxInstances > 0) {
            const yearStr = currentDate.getFullYear();
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            instances.push({
                ...task,
                id: task.id + '_virtual_' + dateStr,
                dueDate: dateStr,
                isVirtual: true
            });
            advanceDate();
            maxInstances--;
        }
        return instances;
    },

    getAllDisplayTasks(endDateStr, maxVirtual = 50) {
        let displayTasks = [...this.tasks];
        this.tasks.forEach(t => {
            displayTasks = displayTasks.concat(this.getRepeatingInstances(t, endDateStr, maxVirtual));
        });
        return displayTasks;
    },

    /**
     * Mevcut görünümü render et
     */
    renderCurrentView() {
        if (this.currentView === 'weekly') {
            this.render();
        } else if (this.currentView === 'monthly') {
            this.renderMonthView();
        } else if (this.currentView === 'all') {
            this.renderAllTasksView();
        }
    },

    /**
     * Görev durumunu değiştir
     */
    changeStatus(id, newStatus) {
        this.update(id, { status: newStatus });
    },

    /**
     * Görev sil
     */
    remove(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.selectedTaskIds.delete(String(id));
            this.saveTasks();
            this.renderCurrentView();
            this.updateStats();

            // Refresh dashboard if visible
            if (typeof App !== 'undefined' && App.currentPage === 'dashboard' && typeof Dashboard !== 'undefined') {
                Dashboard.render();
            }
        }
    },

    /**
     * İstatistikleri güncelle (Üst göstergeler)
     */
    updateStats() {
        const stats = this.getStats();

        const setEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setEl('planningStatTotal', stats.total);
        setEl('planningStatTodo', stats.todo);
        setEl('planningStatInProgress', stats.overdue);
        setEl('planningStatDone', stats.done);
    },

    /**
     * Bu haftanın tarih aralığını al
     */
    getWeekRange() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (this.currentWeekOffset * 7));

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return { start: monday, end: sunday };
    },

    /**
     * Takvim başlığını güncelle (Haftalık)
     */
    updateCalendarTitle() {
        const titleEl = document.getElementById('calendarTitle');
        if (!titleEl) return;

        const { start, end } = this.getWeekRange();
        const options = { day: 'numeric', month: 'short' };
        titleEl.textContent = `${start.toLocaleDateString('tr-TR', options)} - ${end.toLocaleDateString('tr-TR', options)}`;
    },

    /**
     * Aylık görünüm başlığını güncelle
     */
    updateMonthTitle() {
        const titleEl = document.getElementById('calendarTitle'); // Use unified title element
        if (!titleEl) return;

        const date = new Date();
        date.setMonth(date.getMonth() + this.currentMonthOffset);

        const options = { month: 'long', year: 'numeric' };
        titleEl.textContent = date.toLocaleDateString('tr-TR', options);
    },

    /**
     * Bu haftanın görevlerini filtrele
     */
    getWeekTasks() {
        const { start, end } = this.getWeekRange();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return this.tasks.filter(task => {
            const displayDateStr = this.getTaskDisplayDate(task);
            const taskDate = new Date(displayDateStr);
            return taskDate >= start && taskDate <= end;
        });
    },

    /**
     * İstatistikleri getir - Tamamen güncel filtreleme mantığı
     */
    getStats(targetTasks = null) {
        const tasksToCalculate = targetTasks || this.tasks;
        const todayStr = App.getLocalDateString(); // YYYY-MM-DD

        // 1. Süresi Geçen: Tamamlanmamış ve tarihi bugünden küçük
        const overdue = tasksToCalculate.filter(t => t.status !== 'done' && t.dueDate < todayStr);

        // 2. Aktif Görevler (Yapılacak): Tamamlanmamış ve süresi dolmamış
        const active = tasksToCalculate.filter(t => t.status !== 'done' && t.dueDate >= todayStr);

        // 3. Tamamlanan
        const done = tasksToCalculate.filter(t => t.status === 'done');

        return {
            total: tasksToCalculate.length,
            todo: active.length,
            overdue: overdue.length,
            done: done.length
        };
    },

    /**
     * Bugünün görevlerini getir
     */
    getTodayTasks() {
        const today = App.getLocalDateString();
        return this.tasks.filter(t => {
            return this.getTaskDisplayDate(t) === today;
        });
    },

    /**
     * Haftalık Render (Kanban)
     */
    render() {
        const weekTasks = this.getWeekTasks();
        const todayStr = App.getLocalDateString(); // YYYY-MM-DD

        // 1. Görevler Kısmında: Tamamlanmamış ve süresi dolmamış (Bu haftaki)
        const todoList = weekTasks.filter(t => t.status !== 'done' && t.dueDate >= todayStr);

        // 2. Süresi Dolmuş Kısmında: Tüm süresi dolanlar (Global)
        const overdueList = this.tasks.filter(t => t.status !== 'done' && t.dueDate < todayStr);

        // 3. Tamamlanmış Kısmında: Bu hafta tamamlananlar
        const doneList = weekTasks.filter(t => t.status === 'done');

        // Counts güncelle (Tam olarak aşağıda görünen sayıları yansıtsın)
        const todoCountEl = document.getElementById('todoCount');
        if (todoCountEl) todoCountEl.textContent = todoList.length;

        const overdueCountEl = document.getElementById('inProgressCount'); // Süresi Geçen ID'si
        if (overdueCountEl) overdueCountEl.textContent = overdueList.length;

        const doneCountEl = document.getElementById('doneCount');
        if (doneCountEl) doneCountEl.textContent = doneList.length;

        // Kolonları render et
        this.renderColumn('todoList', todoList, false, 'active');
        this.renderColumn('inProgressList', overdueList, true, 'overdue'); // true = overdue style
        this.renderColumn('doneList', doneList, false, 'done');
    },

    /**
     * Görevi yarına ertele
     */
    deferTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const date = new Date(task.dueDate);
            date.setDate(date.getDate() + 1);
            const newDateStr = date.toISOString().split('T')[0];

            this.update(id, { dueDate: newDateStr });

            Notifications.add(
                'Görev Ertelendi',
                `"${task.title}" yarına ertelendi.`,
                'info'
            );
        }
    },

    /**
     * Kolon render et
     */
    renderColumn(containerId, tasks, isOverdue = false, status = 'active') {
        const container = document.getElementById(containerId);

        if (tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">Görev yok</p>';
            return;
        }

        const todayStr = App.getLocalDateString(); // YYYY-MM-DD
        const displayedTasks = tasks.slice(0, 6);
        const hiddenCount = tasks.length - 6;

        let html = displayedTasks.map(task => {
            const priorityData = this.getPriorityData(task.priority);

            // Gecikti rozeti mantığı:
            // 1. Eğer tamamlanmamışsa ve tarihi geçmişse
            // 2. Eğer tamamlanmışsa ve tamamlanma tarihi due date'ten sonraysa (veya tamamlanma tarihi yoksa ama due date geçmişse)
            const finishDate = task.completedDate ? new Date(task.completedDate.split('T')[0]) : new Date(todayStr);
            const dueDate = new Date(task.dueDate);
            const isLate = task.status === 'done'
                ? (task.completedDate ? task.completedDate.split('T')[0] > task.dueDate : todayStr > task.dueDate)
                : todayStr > task.dueDate;

            const showLateBadge = isLate;

            return `
            <div class="kanban-card ${isOverdue ? 'overdue' : ''} ${task.status === 'done' ? 'completed' : ''}" data-id="${task.id}">
                <div class="kanban-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                        <span class="kanban-card-title">${task.title}</span>
                        ${showLateBadge ? `<span class="late-badge" style="font-size: 9px; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px; width: fit-content; text-transform: uppercase; letter-spacing: 0.5px;">Gecikti</span>` : ''}
                    </div>
                <div style="color: ${priorityData.color}; flex-shrink: 0; display: flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: ${priorityData.color}15; font-size: 9px; font-weight: 800;">
                    ${priorityData.icon}
                    <span>${priorityData.text}</span>
                </div>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${task.description || '&nbsp;'}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-color);">
                <div class="kanban-card-meta" style="margin: 0;">
                    <span style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                        ${this.formatDate(task.dueDate)}
                    </span>
                    ${task.dueTime ? `
                    <span style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${task.dueTime}
                    </span>` : ''}
                </div>
                <div class="kanban-card-actions" style="margin: 0; padding: 0; border: none;">
                    ${task.status !== 'done' ? `<button class="btn-icon check" onclick="Planning.changeStatus('${task.id}', 'done')" title="Tamamla"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>` : ''}
                    ${task.status !== 'done' ? `<button class="btn-icon defer" onclick="Planning.deferTask('${task.id}')" title="Yarına Ertele"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>` : ''}
                    <button class="btn-icon edit" onclick="Planning.showEditModal('${task.id}')" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                    <button class="btn-icon delete" onclick="Notifications.confirm('Görevi Sil', 'Silmek istediğinizden emin misiniz?', () => Planning.remove('${task.id}'))" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                </div>
            </div>
            </div>
            `;
        }).join('');

        if (hiddenCount > 0) {
            html += `
                <div class="calendar-more" style="margin-top: 10px; text-align: center; background: rgba(124, 58, 237, 0.1); color: var(--accent-purple); padding: 8px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;" onclick="Planning.showStatus('${status}')">
                    +${hiddenCount} tane daha
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Aylık Takvim Render
     */
    renderMonthView() {
        const container = document.getElementById('monthlyCalendar');
        if (!container) return;

        const now = new Date();
        const targetDate = new Date(now.getFullYear(), now.getMonth() + this.currentMonthOffset, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Pazartesi başlangıçlı hafta için ayarlama
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextMonthLastDay = new Date(year, month + 1, 0);
        const endDateStr = `${nextMonthLastDay.getFullYear()}-${String(nextMonthLastDay.getMonth() + 1).padStart(2, '0')}-${String(nextMonthLastDay.getDate()).padStart(2, '0')}`;
        const displayTasks = this.getAllDisplayTasks(endDateStr, 40);

        // Gün başlıkları
        const dayHeaders = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        let html = dayHeaders.map(d => `<div class="calendar-header">${d}</div>`).join('');

        // Önceki ayın günleri
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            html += `<div class="calendar-day other-month"><span class="calendar-day-number">${dayNum}</span></div>`;
        }

        // Bu ayın günleri
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            // FIX: Use manual string construction to avoid timezone shifts from toISOString()
            // which converts 00:00 local time to previous day UTC
            const yearStr = date.getFullYear();
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
            const isToday = date.getTime() === today.getTime();

            // Bu güne ait görevler (Görüntüleme tarihine göre)
            const dayTasks = displayTasks.filter(t => this.getTaskDisplayDate(t) === dateStr)
                .sort((a, b) => {
                    const priorityWeight = { high: 3, medium: 2, low: 1 };
                    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                });

            html += `
                <div class="calendar-day${isToday ? ' today' : ''}${dayTasks.length > 0 ? ' has-tasks' : ''}" data-date="${dateStr}">
                    <span class="calendar-day-number">${day}</span>
                    <div class="calendar-tasks">
                        ${dayTasks.slice(0, 3).map(t => {
                const pData = this.getPriorityData(t.priority);
                return `
                            <div class="calendar-task ${t.status}" title="${t.title}">
                                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${pData.color}; margin-right: 4px; box-shadow: 0 0 4px ${pData.color}80;"></span>
                                ${t.title}
                            </div>`;
            }).join('')}
                        ${dayTasks.length > 3 ? `<div class="calendar-more">+${dayTasks.length - 3} tane daha</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Sonraki ayın günleri
        const totalCells = startDay + lastDay.getDate();
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= remainingCells; i++) {
            html += `<div class="calendar-day other-month"><span class="calendar-day-number">${i}</span></div>`;
        }

        container.innerHTML = html;

        // Gün tıklama olayları
        container.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                const date = day.dataset.date;
                if (date) {
                    this.showDayTasks(date);
                }
            });
        });
    },

    /**
     * Belirli bir günün görevlerini göster
     */
    showDayTasks(dateStr) {
        const displayTasks = this.getAllDisplayTasks(dateStr, 40);
        const dayTasks = displayTasks.filter(t => this.getTaskDisplayDate(t) === dateStr);
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = formattedDate;

        if (dayTasks.length === 0) {
            modalBody.innerHTML = `
                <div class="empty-state-large">
                    <div class="empty-icon">📅</div>
                    <h3>Görev Yok</h3>
                    <p>Bu güne ait görev bulunmuyor.</p>
                    <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.closeModal(); Planning.showAddModalWithDate('${dateStr}')">+ Görev Ekle</button>
                </div>
            `;
        } else {
            const todayStr = App.getLocalDateString(); // YYYY-MM-DD
            modalBody.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${dayTasks.map(task => {
                const priorityData = this.getPriorityData(task.priority);
                const isLate = task.status === 'done'
                    ? (task.completedDate ? task.completedDate.split('T')[0] > task.dueDate : todayStr > task.dueDate)
                    : todayStr > task.dueDate;

                return `
                        <div class="task-list-item ${task.status}" style="display: grid; grid-template-columns: 1fr 60px 80px 52px; column-gap: 12px; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; padding-right: 24px;">
                                <div style="display: flex; flex-direction: column; min-width: 0;">
                                    <div class="task-list-title" style="margin-bottom: 0; white-space: nowrap; flex-shrink: 0; display: flex; align-items: center; gap: 6px;">
                                        ${task.title}
                                        ${isLate ? `<span class="late-badge" style="font-size: 8px; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 1px 4px; border-radius: 3px; text-transform: uppercase;">Gecikti</span>` : ''}
                                    </div>
                                    <span style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${task.description || ''}</span>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: flex-end; color: var(--text-muted); font-size: 12px; font-weight: 500;">
                                ${task.dueTime ? `<span>⏰ ${task.dueTime}</span>` : ''}
                            </div>
                            <div style="display: flex; justify-content: center;">
                                <span class="task-list-status ${task.status}" style="padding: 4px 10px;">${task.isVirtual ? 'Tekrar' : this.getStatusLabel(task.status)}</span>
                            </div>
                            <span style="font-size: 9px; font-weight: 800; padding: 2px 0; border-radius: 4px; background: ${priorityData.color}20; color: ${priorityData.color}; letter-spacing: 0.5px; width: 52px; display: inline-flex; justify-content: center; flex-shrink: 0;">${priorityData.text}</span>
                        </div>
                    `;
            }).join('')}
            </div>
            <button class="btn btn-primary" style="margin-top: 20px; width: 100%;" onclick="App.closeModal(); Planning.showAddModalWithDate('${dateStr}')">+ Yeni Görev Ekle</button>
        `;
        }
        App.openModal();
    },

    /**
     * Belirli bir tarihle görev ekleme modalı
     */
    showAddModalWithDate(dateStr) {
        this.showAddModal(dateStr);
    },

    /**
     * Tüm Görevler Listesi Render
     */
    renderAllTasksView() {
        const container = document.getElementById('allTasksList');
        if (!container) return;

        const todayObj = new Date();
        todayObj.setMonth(todayObj.getMonth() + 3);
        const yearStr = todayObj.getFullYear();
        const monthStr = String(todayObj.getMonth() + 1).padStart(2, '0');
        const dayStr = String(todayObj.getDate()).padStart(2, '0');
        const endDateStrAll = `${yearStr}-${monthStr}-${dayStr}`;

        const displayTasks = this.getAllDisplayTasks(endDateStrAll, 30);
        let filteredTasks = [...displayTasks];

        const todayStr = App.getLocalDateString(); // YYYY-MM-DD

        // Gelişmiş Filtreleme Mantığı
        if (this.statusFilter === 'active') {
            // Aktif: Tamamlanmamış ve süresi geçmemiş (bugün dahil)
            filteredTasks = filteredTasks.filter(t => t.status !== 'done' && t.dueDate >= todayStr);
        } else if (this.statusFilter === 'overdue') {
            // Süresi Geçen: Tamamlanmamış ve tarihi bugünden küçük
            filteredTasks = filteredTasks.filter(t => t.status !== 'done' && t.dueDate < todayStr);
        } else if (this.statusFilter === 'done') {
            // Tamamlanan: Sadece tamamlanmışlar
            filteredTasks = filteredTasks.filter(t => t.status === 'done');
        } else {
            // Tümü: Kayıtlı her şey
            // Filtre yok
        }

        // Öncelik filtresi
        if (this.priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.priority === this.priorityFilter);
        }

        // Öncelik ve Tarihe göre sırala
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        filteredTasks.sort((a, b) => {
            // Önce tarihe göre
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            // Aynı gün ise önceliğe göre
            return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        });

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state-large">
                    <div class="empty-icon">📋</div>
                    <h3>Görev Bulunamadı</h3>
                    <p>Seçili filtrelere uygun görev yok.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTasks.map(task => {
            const priorityData = this.getPriorityData(task.priority);
            const isSelected = this.selectedTaskIds.has(String(task.id));

            const isLate = task.status === 'done'
                ? (task.completedDate ? task.completedDate.split('T')[0] > task.dueDate : todayStr > task.dueDate)
                : todayStr > task.dueDate;

            return `
            <div class="task-list-item ${task.status} ${isSelected ? 'selected' : ''}" data-id="${task.id}">
                ${this.selectionMode && !task.isVirtual ? `
                <label class="task-checkbox-container" style="margin-right: 15px;">
                    <input type="checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="Planning.toggleTaskSelection('${task.id}', this)">
                    <span class="task-checkmark"></span>
                </label>
                ` : (this.selectionMode ? '<div style="width: 24px; margin-right: 15px;"></div>' : '')}

                <div class="task-list-priority-svg ${task.priority}" title="${priorityData.text} Öncelik" style="color: ${priorityData.color}; flex-shrink: 0; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; background: ${priorityData.color}15; font-size: 10px; font-weight: 800;">
                    ${priorityData.icon}
                    <span>${priorityData.text}</span>
                </div>
                
                <div class="task-list-content">
                <div class="task-list-title" style="font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    ${task.title}
                    ${isLate ? `<span class="late-badge" style="font-size: 10px; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 8px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Gecikti</span>` : ''}
                </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">${task.description || '&nbsp;'}</div>
                <div class="task-list-meta" style="margin-top: 8px; display: flex; align-items: center; gap: 15px;">
                    <span style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                        ${this.formatDate(task.dueDate)}
                    </span>
                    ${task.dueTime ? `
                    <span style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${task.dueTime}
                    </span>` : ''}
                </div>
            </div>

                <div class="task-list-status ${task.status}">${task.isVirtual ? '<span style="font-size:10px; opacity:0.8;">Tekrar</span>' : this.getStatusLabel(task.status)}</div>

                <div class="task-list-actions">
                    ${task.isVirtual ? '' : `
                    ${task.status !== 'done' ? `<button class="btn-icon defer" onclick="Planning.deferTask('${task.id}')" title="Yarına Ertele"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>` : ''}
                    <button class="btn-icon edit" onclick="Planning.showEditModal('${task.id}')" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                    <button class="btn-icon delete" onclick="Notifications.confirm('Görevi Sil', 'Silmek istediğinizden emin misiniz?', () => Planning.remove('${task.id}'))" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                    `}
                </div>
            </div>
            `;
        }).join('');

        this.updateBulkActionsUI();
    },

    toggleSelectAll(checkbox) {
        const isChecked = checkbox.checked;
        const listContainer = document.getElementById('allTasksList');
        const checkboxes = listContainer.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            const taskId = cb.closest('.task-list-item').dataset.id;
            cb.checked = isChecked;
            if (isChecked) {
                this.selectedTaskIds.add(String(taskId));
                cb.closest('.task-list-item').classList.add('selected');
            } else {
                this.selectedTaskIds.delete(String(taskId));
                cb.closest('.task-list-item').classList.remove('selected');
            }
        });

        this.updateBulkActionsUI();
    },

    toggleTaskSelection(id, checkbox) {
        if (checkbox.checked) {
            this.selectedTaskIds.add(String(id));
            checkbox.closest('.task-list-item').classList.add('selected');
        } else {
            this.selectedTaskIds.delete(String(id));
            checkbox.closest('.task-list-item').classList.remove('selected');

            // Uncheck select all if one item is unchecked
            const selectAllCb = document.getElementById('selectAllTasks');
            if (selectAllCb) selectAllCb.checked = false;
        }

        this.updateBulkActionsUI();
    },

    updateBulkActionsUI() {
        const bulkActions = document.getElementById('bulkActions');
        const countSpan = document.getElementById('selectedCount');
        const selectAllCb = document.getElementById('selectAllTasks');
        const selectAllContainer = document.getElementById('selectAllContainer');
        const toggleBtn = document.getElementById('toggleSelectModeBtn');

        if (!bulkActions || !countSpan) return;

        const count = this.selectedTaskIds.size;

        if (this.selectionMode) {
            if (toggleBtn) toggleBtn.textContent = 'Vazgeç';
            if (selectAllContainer) selectAllContainer.style.display = 'flex';

            if (count > 0) {
                bulkActions.style.display = 'flex';
                countSpan.textContent = `${count} Seçili`;
            } else {
                bulkActions.style.display = 'none';
            }
        } else {
            if (toggleBtn) toggleBtn.textContent = 'Seç';
            if (selectAllContainer) selectAllContainer.style.display = 'none';
            bulkActions.style.display = 'none';
        }

        // Sync Select All checkbox if all items are selected manually
        const listItems = document.querySelectorAll('#allTasksList .task-list-item');
        if (listItems.length > 0 && selectAllCb) {
            const allChecked = Array.from(listItems).every(item =>
                this.selectedTaskIds.has(String(item.dataset.id))
            );
            selectAllCb.checked = allChecked;
        }
    },

    toggleSelectionMode() {
        this.selectionMode = !this.selectionMode;
        if (!this.selectionMode) {
            this.selectedTaskIds.clear();
            const selectAllCb = document.getElementById('selectAllTasks');
            if (selectAllCb) selectAllCb.checked = false;
        }
        this.renderAllTasksView();
        this.updateBulkActionsUI();
    },

    async deleteSelected() {
        if (this.selectedTaskIds.size === 0) return;

        Notifications.confirm(
            'Seçilenleri Sil',
            `${this.selectedTaskIds.size} görevi silmek istediğinizden emin misiniz?`,
            async () => {
                const idsToDelete = Array.from(this.selectedTaskIds);
                this.tasks = this.tasks.filter(t => !idsToDelete.includes(String(t.id)));
                this.selectedTaskIds.clear();
                this.saveTasks();
                this.renderAllTasksView();
                this.updateStats();
                Notifications.show('Seçilen görevler silindi', 'success');

                const selectAllCb = document.getElementById('selectAllTasks');
                if (selectAllCb) selectAllCb.checked = false;
            }
        );
    },

    togglePriorityMenu() {
        const menu = document.getElementById('priorityMenu');
        if (menu) menu.classList.toggle('active');
    },

    selectPriority(priority) {
        this.priorityFilter = priority;

        // Update label
        const labels = {
            all: 'Tüm Öncelikler',
            high: 'Yüksek',
            medium: 'Orta',
            low: 'Düşük'
        };
        const labelEl = document.getElementById('selectedPriorityLabel');
        if (labelEl) labelEl.textContent = labels[priority];

        // Close menu
        this.togglePriorityMenu();

        // Re-render
        this.renderAllTasksView();
    },

    toggleStatusMenu() {
        const menu = document.getElementById('statusMenu');
        if (menu) menu.classList.toggle('active');
    },

    selectStatus(status) {
        this.statusFilter = status;

        // Update label
        const labels = {
            active: 'Aktif Görevler',
            overdue: 'Süresi Geçenler',
            done: 'Tamamlananlar',
            all: 'Tümü (Arşiv)'
        };
        const labelEl = document.getElementById('selectedStatusLabel');
        if (labelEl) labelEl.textContent = labels[status];

        // Close menu
        this.toggleStatusMenu();

        // Re-render
        this.renderAllTasksView();
    },

    showStatus(status) {
        this.statusFilter = status;

        // Label güncelle
        const labels = {
            active: 'Aktif Görevler',
            overdue: 'Süresi Geçenler',
            done: 'Tamamlananlar',
            all: 'Tümü (Arşiv)'
        };
        const labelEl = document.getElementById('selectedStatusLabel');
        if (labelEl) labelEl.textContent = labels[status];

        this.switchView('all');
    },

    /**
     * Durum etiketi
     */
    getStatusLabel(status) {
        const labels = {
            todo: 'Aktif',
            inProgress: 'Devam Eden',
            done: 'Tamamlandı'
        };
        return labels[status] || status;
    },

    /**
     * Öncelik label'ı
     */
    getPriorityLabel(priority) {
        const labels = {
            high: 'Yüksek Öncelik',
            medium: 'Orta Öncelik',
            low: 'Düşük Öncelik'
        };
        return labels[priority] || 'Bilinmiyor';
    },

    /**
     * Öncelik verilerini getir (Dashboard stili)
     */
    getPriorityData(priority) {
        const data = {
            high: {
                color: '#ef4444',
                text: 'YÜKSEK',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
            },
            medium: {
                color: '#f59e0b',
                text: 'ORTA',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
            },
            low: {
                color: '#10b981',
                text: 'DÜŞÜK',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg>`
            }
        };
        return data[priority] || {
            color: '#64748b',
            text: 'BİLİNMİYOR',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
        };
    },

    /**
     * Tarihi formatla
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Bugün';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Yarın';
        } else {
            return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        }
    },

    /**
     * Görev ekleme modalını göster
     */
    showAddModal(defaultDate) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        const today = defaultDate || App.getLocalDateString();

        modalTitle.textContent = 'Yeni Görev Ekle';
        modalBody.innerHTML = `
            <form id="taskForm">
                <div class="form-group">
                    <label class="form-label">Görev Adı *</label>
                    <input type="text" class="form-input" name="title" required placeholder="Hangi görev yapılacak?">
                </div>
                <div class="form-group">
                    <label class="form-label">Açıklama</label>
                    <textarea class="form-textarea" name="description" placeholder="Detaylar..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Öncelik</label>
                    <div class="priority-radio-group">
                        <label class="priority-radio-item high">
                            <input type="radio" name="priority" value="high">
                            <div class="priority-radio-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                <span>Yüksek</span>
                            </div>
                        </label>
                        <label class="priority-radio-item medium">
                            <input type="radio" name="priority" value="medium" checked>
                            <div class="priority-radio-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                <span>Orta</span>
                            </div>
                        </label>
                        <label class="priority-radio-item low">
                            <input type="radio" name="priority" value="low">
                            <div class="priority-radio-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg>
                                <span>Düşük</span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="datetime-group">
                    <div class="form-group">
                        <label class="form-label">Başlangıç Tarihi</label>
                        <input type="date" class="form-input" name="dueDate" value="${today}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bitiş Tarihi</label>
                        <input type="date" class="form-input" name="endDate" value="${today}" required>
                    </div>
                </div>
                <div class="datetime-group">
                    <div class="form-group">
                        <label class="form-label">Tekrar</label>
                        <select class="form-select" name="repeat">
                            <option value="none">Tekrarlama</option>
                            <option value="daily">Her Gün</option>
                            <option value="weekly">Her Hafta</option>
                            <option value="monthly">Her Ay</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Saat (İsteğe bağlı)</label>
                        <input type="time" class="form-input" name="dueTime">
                    </div>
                </div>
                <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 20px;">İptal</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Ekle
                    </button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.add({
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                dueDate: formData.get('dueDate'),
                endDate: formData.get('endDate'),
                dueTime: formData.get('dueTime'),
                repeat: formData.get('repeat')
            });
            App.closeModal();
        });
    },

    /**
     * Görev düzenleme modalını göster
     */
    showEditModal(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'Görev Düzenle';
        modalBody.innerHTML = `
            <form id="taskEditForm">
                <div class="form-group">
                    <label class="form-label">Görev Adı *</label>
                    <input type="text" class="form-input" name="title" required value="${task.title}">
                </div>
                <div class="form-group">
                    <label class="form-label">Açıklama</label>
                    <textarea class="form-textarea" name="description">${task.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Öncelik</label>
                    <div class="priority-radio-group">
                        <label class="priority-radio-item high">
                            <input type="radio" name="priority" value="high" ${task.priority === 'high' ? 'checked' : ''}>
                            <div class="priority-radio-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                <span>Yüksek</span>
                            </div>
                        </label>
                        <label class="priority-radio-item medium">
                            <input type="radio" name="priority" value="medium" ${task.priority === 'medium' ? 'checked' : ''}>
                            <div class="priority-radio-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                <span>Orta</span>
                            </div>
                        </label>
                        <label class="priority-radio-item low">
                            <input type="radio" name="priority" value="low" ${task.priority === 'low' ? 'checked' : ''}>
                            <div class="priority-radio-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg>
                                <span>Düşük</span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Durum</label>
                    <select class="form-select" name="status">
                        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Görev</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Tamamlanan</option>
                    </select>
                </div>
                <div class="datetime-group">
                    <div class="form-group">
                        <label class="form-label">Başlangıç Tarihi</label>
                        <input type="date" class="form-input" name="dueDate" value="${task.dueDate}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bitiş Tarihi</label>
                        <input type="date" class="form-input" name="endDate" value="${task.endDate || task.dueDate}" required>
                    </div>
                </div>
                <div class="datetime-group">
                    <div class="form-group">
                        <label class="form-label">Tekrar</label>
                        <select class="form-select" name="repeat">
                            <option value="none" ${task.repeat === 'none' || !task.repeat ? 'selected' : ''}>Tekrarlama</option>
                            <option value="daily" ${task.repeat === 'daily' ? 'selected' : ''}>Her Gün</option>
                            <option value="weekly" ${task.repeat === 'weekly' ? 'selected' : ''}>Her Hafta</option>
                            <option value="monthly" ${task.repeat === 'monthly' ? 'selected' : ''}>Her Ay</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Saat</label>
                        <input type="time" class="form-input" name="dueTime" value="${task.dueTime || ''}">
                    </div>
                </div>
                <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 20px;">İptal</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Kaydet
                    </button>
                </div>
            </form>
        `;

        App.openModal();


        document.getElementById('taskEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.update(id, {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                status: formData.get('status'),
                dueDate: formData.get('dueDate'),
                endDate: formData.get('endDate'),
                dueTime: formData.get('dueTime'),
                repeat: formData.get('repeat')
            });
            App.closeModal();
        });
    },

    showTaskDetails(id) {
        this.showEditModal(id);
    }
};
