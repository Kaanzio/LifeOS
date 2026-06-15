/**
 * Life OS - Weekly Planner Module
 * Genel haftalık program ve rutin yönetimi
 */

const WeeklyPlanner = {
    events: [],
    days: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],

    // Saat seçenekleri (00:00'dan 23:30'a kadar)
    hours: [],

    init() {
        this.generateHours();
        this.loadEvents();
        this.render();
        this.bindGlobalEvents();
    },

    generateHours() {
        this.hours = [];
        // Start from 06:00 to 00:00 (next day midnight)
        for (let i = 6; i <= 24; i++) {
            const hour = (i === 24 ? 0 : i).toString().padStart(2, '0');
            this.hours.push(`${hour}:00`);
            this.hours.push(`${hour}:30`);
        }
    },

    loadEvents() {
        this.events = Storage.load(Storage.KEYS.WEEKLY_PLANNER, []);
    },

    saveEvents() {
        Storage.save(Storage.KEYS.WEEKLY_PLANNER, this.events);
    },

    /**
     * Etkinlik ekle veya güncelle
     */
    add(data) {
        if (data.id) {
            // Update existing
            const index = this.events.findIndex(e => e.id === data.id);
            if (index !== -1) {
                this.events[index] = { ...this.events[index], ...data };
                Notifications.add('Plan Güncellendi', `${data.title} güncellendi.`, 'success', true);
            }
        } else {
            // Add new
            const entry = {
                id: Storage.generateId(),
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                title: data.title,
                color: data.color || 'var(--accent-purple)'
            };
            this.events.push(entry);
            Notifications.add('Plan Eklendi', `${entry.title} haftalık programınıza eklendi.`, 'success', true);
        }
        this.saveEvents();
        this.render();
    },

    /**
     * Etkinlik sil
     */
    remove(id) {
        const event = this.events.find(e => e.id === id);
        if (!event) return;

        Notifications.confirm(
            'Planı Sil',
            `"${event.title}" planını silmek istediğinize emin misiniz?`,
            () => {
                this.events = this.events.filter(e => e.id !== id);
                this.saveEvents();
                this.render();
                Notifications.showToast('Silindi', 'Plan programdan kaldırıldı.', 'info');
            }
        );
    },

    /**
     * Etkinlik ekleme modalı
     */
    showAddModal(preFill = {}) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width: 32px; height: 32px; background: var(--accent-purple)15; color: var(--accent-purple); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h4"/><path d="M8 18h2"/><path d="M16 14h.01"/><path d="M16 18h.01"/></svg>
                </div>
                <span>Haftalık Programa Ekle</span>
            </div>
        `;

        modalBody.innerHTML = `
            <form id="weeklyPlannerForm">
                <input type="hidden" name="id" value="${preFill.id || ''}">
                <div class="form-group">
                    <label class="form-label">Etkinlik Adı *</label>
                    <input type="text" class="form-input" name="title" value="${preFill.title || ''}" placeholder="Örn: Sabah Rutini, Spor, Kitap Okuma" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Gün *</label>
                    <select class="form-select" name="day" required>
                        ${this.days.map(d => `<option value="${d}" ${preFill.day === d ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label class="form-label">Başlangıç *</label>
                        <select class="form-select" name="startTime" required>
                            ${this.hours.map(h => `<option value="${h}" ${preFill.startTime === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bitiş *</label>
                        <select class="form-select" name="endTime" required>
                            ${this.hours.map(h => `<option value="${h}" ${preFill.endTime === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Renk Seç</label>
                    <div class="color-grid" style="display: flex; gap: 10px; flex-wrap: wrap; padding: 5px; align-items: center; box-sizing: border-box;">
                        <input type="hidden" id="modalColorInput" name="color" value="${preFill.color || '#7c3aed'}">
                        ${['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'].map(c => `
                            <div class="planner-color-option ${(preFill.color || '#7c3aed') === c ? 'selected' : ''}" 
                                 data-color="${c}"
                                 onclick="document.getElementById('modalColorInput').value = '${c}'; document.querySelectorAll('#weeklyPlannerForm .planner-color-option').forEach(el => el.classList.remove('selected')); this.classList.add('selected'); document.getElementById('plannerCustomPickerWrap').classList.remove('selected');"
                                 style="width: 28px; height: 28px; border-radius: 50%; background-color: ${c}; cursor: pointer; border: 2px solid transparent; box-sizing: border-box; transition: all 0.2s;">
                            </div>
                        `).join('')}
                        
                        <!-- Özel Renk Seçimi -->
                        <label id="plannerCustomPickerWrap" class="planner-color-option"
                               style="width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border: 2px solid var(--border-color); box-sizing: border-box; transition: all 0.2s; position: relative; margin: 0; background: ${(!['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'].includes(preFill.color) && preFill.color) ? preFill.color : 'var(--bg-tertiary)'};" 
                               class="${(!['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'].includes(preFill.color) && preFill.color) ? 'selected' : ''}"
                               title="Özel Renk">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); pointer-events: none;"><path d="M12 5v14M5 12h14"/></svg>
                            <input type="color" id="plannerCustomColor" 
                                   style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
                                   oninput="
                                       const val = this.value;
                                       const label = this.parentElement;
                                       document.getElementById('modalColorInput').value = val;
                                       label.style.background = val;
                                       label.classList.add('selected');
                                       document.querySelectorAll('#weeklyPlannerForm .planner-color-option:not(#plannerCustomPickerWrap)').forEach(el => el.classList.remove('selected'));
                                       label.style.borderColor = 'var(--text-primary)';
                                   ">
                        </label>
                    </div>
                    <style>
                        #weeklyPlannerForm .planner-color-option.selected {
                            border-color: var(--text-primary) !important;
                            transform: scale(1.2);
                            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
                        }
                    </style>
                </div>
                <div class="modal-footer-modern" style="margin-top: 25px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">${preFill.id ? 'Güncelle' : 'Programa Ekle'}</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('weeklyPlannerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            this.add({
                id: formData.get('id'),
                title: formData.get('title'),
                day: formData.get('day'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                color: formData.get('color')
            });
            App.closeModal();
        });
    },

    bindGlobalEvents() {
        document.addEventListener('click', (e) => {
            const slot = e.target.closest('.weekly-hour-slot');
            const card = e.target.closest('.schedule-entry-card');

            if (card) {
                // Edit existing
                const eventId = card.dataset.id;
                const event = this.events.find(ev => ev.id === eventId);
                if (event) {
                    this.showAddModal(event);
                }
                return;
            }

            if (slot) {
                const day = slot.dataset.day;
                const time = slot.dataset.time;

                // Set end time to 1 hour later if possible
                let endTime = time;
                const timeIndex = this.hours.indexOf(time);
                if (timeIndex !== -1 && timeIndex + 2 < this.hours.length) {
                    endTime = this.hours[timeIndex + 2];
                }

                this.showAddModal({ day, startTime: time, endTime });
            }
        });
    },

    /**
     * Render
     */
    render() {
        const container = document.getElementById('weeklyPlannerGrid');
        if (!container) return;

        const grouped = {};
        this.days.forEach(d => grouped[d] = []);
        this.events.forEach(event => {
            if (grouped[event.day]) grouped[event.day].push(event);
        });

        this.days.forEach(d => {
            grouped[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        let html = '<div class="schedule-grid-modern">';

        this.days.forEach(day => {
            const dayEvents = grouped[day];
            html += `
                <div class="schedule-col-modern">
                    <div class="schedule-col-header">
                        <span class="day-dot" style="background: var(--accent-purple);"></span>
                        <span class="day-name">${day}</span>
                        <span class="item-count">${dayEvents.length}</span>
                    </div>
                    <div class="schedule-col-content" style="gap: 0; padding: 0; position: relative; height: ${19 * 60}px;">
                        <!-- Time slots (Background) -->
                        ${Array.from({ length: 19 }).map((_, i) => {
                const hourNum = (i + 6);
                const displayHour = (hourNum === 24 ? 0 : hourNum).toString().padStart(2, '0');
                const h = displayHour + ':00';
                return `
                                <div class="weekly-hour-slot" data-day="${day}" data-time="${h}" 
                                     style="height: 60px; border-bottom: 1px solid rgba(255,255,255,0.03); padding: 6px; box-sizing: border-box; cursor: pointer; transition: background 0.2s;">
                                    <div style="font-size: 9px; opacity: 0.2; font-weight: 700;">${h}</div>
                                </div>
                            `;
            }).join('')}

                        <!-- Events (Foreground) -->
                        ${dayEvents.map(e => {
                const startIdx = this.hours.indexOf(e.startTime);
                const endIdx = this.hours.indexOf(e.endTime);
                if (startIdx === -1 || endIdx === -1) return '';

                // Adjust indices based on 06:00 start (6:00 is index 0 in our filtered loop but index 0 in this.hours is also 6:00 now)
                const top = (startIdx / 2) * 60;
                const height = ((endIdx - startIdx) / 2) * 60;

                // Minimum height for visibility
                const minHeight = 30;
                const actualHeight = Math.max(height, minHeight);
                const eventColor = e.color || 'var(--accent-purple)';

                return `
                                <div class="schedule-entry-card weekly-event-card" data-id="${e.id}"
                                     style="position: absolute; top: ${top}px; height: ${actualHeight}px; left: 4px; right: 4px; margin: 0; 
                                            border-left: 3px solid ${eventColor}; z-index: 2; overflow: hidden; 
                                            display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 4px; 
                                            background: color-mix(in srgb, ${eventColor} 10%, var(--bg-secondary));
                                            --this-event-color: ${eventColor};">
                                    <div class="entry-time-wrap" style="font-size: 10px; font-weight: 800; margin-bottom: 4px; opacity: 0.8; width: 100%; color: var(--text-primary); display: flex; justify-content: center;">
                                        <span>${e.startTime} - ${e.endTime}</span>
                                    </div>
                                    <div class="entry-title" style="font-size: 11px; font-weight: 700; line-height: 1.1; width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; padding: 0 4px;">${e.title}</div>
                                    <button class="entry-delete-btn" onclick="event.stopPropagation(); WeeklyPlanner.remove('${e.id}')" 
                                            style="top: 2px; right: 2px; width: 18px; height: 18px; opacity: 0.3;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                                    </button>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Update stats subtitle
        const statsSubtitle = document.getElementById('weekly-planner-subtitle');
        if (statsSubtitle) {
            statsSubtitle.innerHTML = `Toplam <span style="color: var(--accent-purple); font-weight: 800;">${this.events.length}</span> kayıtlı planınız bulunuyor.`;
        }
    }
};
