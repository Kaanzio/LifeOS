/**
 * Life OS - Schedule Module
 * Haftalık ders programı yönetimi
 */

const Schedule = {
    schedule: [],
    days: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],

    // Saat seçenekleri (00 ve 30'lu)
    hours: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00'
    ],

    init() {
        this.loadSchedule();
        this.render();
    },

    loadSchedule() {
        this.schedule = Storage.load('lifeos_schedule', []);
    },

    saveSchedule() {
        Storage.save('lifeos_schedule', this.schedule);
    },

    /**
     * Ders ekle
     */
    add(data) {
        const entry = {
            id: Storage.generateId(),
            day: data.day,
            startTime: data.startTime,
            endTime: data.endTime,
            lessonId: data.lessonId,
            lessonName: data.lessonName
        };
        this.schedule.push(entry);
        this.saveSchedule();
        this.render();
        Notifications.add('Ders Eklendi', `${entry.lessonName} programınıza eklendi.`, 'success', true);
    },

    /**
     * Ders sil
     */
    remove(id) {
        const entry = this.schedule.find(s => s.id === id);
        if (!entry) return;

        Notifications.confirm(
            'Dersi Sil',
            `"${entry.lessonName}" dersini programdan silmek istediğinize emin misiniz?`,
            () => {
                this.schedule = this.schedule.filter(s => s.id !== id);
                this.saveSchedule();
                this.render();
                Notifications.showToast('Silindi', 'Ders programdan kaldırıldı.', 'info');
            }
        );
    },

    /**
     * Ders ekleme modalı
     */
    showAddModal() {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const lessons = Lessons?.lessons || [];

        modalTitle.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width: 32px; height: 32px; background: var(--accent-purple)15; color: var(--accent-purple); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><line x1="12" x2="12" y1="14" y2="18"/><line x1="10" x2="14" y1="16" y2="16"/></svg>
                </div>
                <span>Ders Programına Ekle</span>
            </div>
        `;

        modalBody.innerHTML = `
            <form id="scheduleForm">
                <div class="form-group">
                    <label class="form-label">Gün *</label>
                    <select class="form-select" name="day" required>
                        ${this.days.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Başlangıç *</label>
                        <select class="form-select" name="startTime" required>
                            ${this.hours.map(h => `<option value="${h}">${h}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bitiş *</label>
                        <select class="form-select" name="endTime" required>
                            ${this.hours.map(h => `<option value="${h}">${h}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Ders *</label>
                    <select class="form-select" name="lessonId" id="scheduleLessonSelect" required>
                        <option value="">-- Ders Seçin --</option>
                        ${lessons.map(l => `
                            <option value="${l.id}" data-name="${l.name}">${l.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-footer-modern">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Programa Ekle</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const select = document.getElementById('scheduleLessonSelect');
            const lessonName = select.options[select.selectedIndex]?.dataset.name || '';

            this.add({
                day: formData.get('day'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                lessonId: formData.get('lessonId'),
                lessonName: lessonName
            });
            App.closeModal();
        });
    },

    /**
     * Render - Modern & Compact Redesign
     */
    render() {
        const container = document.getElementById('scheduleGrid');
        if (!container) return;

        const grouped = {};
        this.days.forEach(d => grouped[d] = []);
        this.schedule.forEach(entry => {
            if (grouped[entry.day]) grouped[entry.day].push(entry);
        });

        this.days.forEach(d => {
            grouped[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        let html = '<div class="schedule-grid-modern">';

        this.days.forEach(day => {
            const entries = grouped[day];
            html += `
                <div class="schedule-col-modern">
                    <div class="schedule-col-header">
                        <span class="day-dot"></span>
                        <span class="day-name">${day}</span>
                        <span class="item-count">${entries.length}</span>
                    </div>
                    <div class="schedule-col-content">
                        ${entries.length === 0 ?
                    `<div class="schedule-empty-slot">Program Boş</div>` :
                    entries.map(e => `
                                <div class="schedule-entry-card">
                                    <div class="entry-time-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        <span>${e.startTime} - ${e.endTime}</span>
                                    </div>
                                    <div class="entry-title">${e.lessonName}</div>
                                    <button class="entry-delete-btn" onclick="Schedule.remove('${e.id}')" title="Sil">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                                    </button>
                                </div>
                            `).join('')
                }
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Update stats subtitle
        const statsSubtitle = document.getElementById('schedule-stats-subtitle');
        if (statsSubtitle) {
            statsSubtitle.innerHTML = `Toplam <span style="color: var(--accent-purple); font-weight: 800;">${this.schedule.length}</span> dersiniz bulunuyor.`;
        }
    }
};
