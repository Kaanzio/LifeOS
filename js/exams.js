/**
 * Life OS - Exams Module
 * Sınav takibi ve canlı geri sayım
 */

const Exams = {
    exams: [],
    countdownIntervals: {},
    filterType: 'all',
    filterGrade: 'all',
    filterSemester: 'all',
    searchQuery: '',

    categories: [
        { id: 'Vize', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>', color: '#3b82f6' },
        { id: 'Final', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>', color: '#ef4444' },
        { id: 'Quiz', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>', color: '#06b6d4' },
        { id: 'Bütünleme', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>', color: '#f59e0b' },
        { id: 'Ödev', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', color: '#10b981' }
    ],

    init() {
        this.loadExams();
        this.bindEvents();
        this.renderToolbar();
        this.render();
        this.startAllCountdowns();
    },

    loadExams() {
        this.exams = Storage.load('lifeos_exams', []);
    },

    saveExams() {
        Storage.save('lifeos_exams', this.exams);
    },

    bindEvents() {
        document.getElementById('addExamBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });
    },

    /**
     * Yeni sınav ekle
     */
    add(examData) {
        const exam = {
            id: Storage.generateId(),
            name: examData.name,
            lessonId: examData.lessonId || null,
            lessonName: examData.lessonName || '',
            date: examData.date,
            time: examData.time || '09:00',
            notes: examData.notes || '',
            grade: examData.grade || '',
            academicGrade: examData.academicGrade || '1',
            semester: examData.semester || 'guz',
            createdAt: new Date().toISOString()
        };

        this.exams.push(exam);
        this.saveExams();
        this.render();
        this.startCountdown(exam.id);

        Notifications.add(
            'Sınav Eklendi 📝',
            `${exam.name} sınavı eklendi.`,
            'success',
            true
        );

        return exam;
    },

    /**
     * Sınavı güncelle
     */
    update(id, updatedData) {
        const index = this.exams.findIndex(e => e.id === id);
        if (index !== -1) {
            this.exams[index] = {
                ...this.exams[index],
                ...updatedData
            };
            this.saveExams();
            this.render();
            Notifications.add('Sınav Güncellendi', 'Bilgiler başarıyla kaydedildi.', 'success', true);
        }
    },

    /**
     * Sınavı sil
     */
    remove(id) {
        // Countdown'ı durdur
        if (this.countdownIntervals[id]) {
            clearInterval(this.countdownIntervals[id]);
            delete this.countdownIntervals[id];
        }

        this.exams = this.exams.filter(e => e.id !== id);
        this.saveExams();
        this.render();
    },

    /**
     * Sınav detayı modalı
     */
    showDetailModal(id) {
        const exam = this.exams.find(e => e.id === id);
        if (!exam) return;

        const gradeObj = Lessons.grades.find(g => g.id === exam.academicGrade);
        const semObj = Lessons.semesters.find(s => s.id === exam.semester);
        const categoryObj = this.categories.find(c => c.id === exam.name) || { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>' };

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        const examDateTime = new Date(`${exam.date}T${exam.time || '00:00'}`);
        const longDate = examDateTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

        modalTitle.textContent = 'Sınav Detayı';
        modalBody.innerHTML = `
            <div class="lesson-info-modal-modern">
                <div class="info-header-bento">
                    <div class="info-icon-box" style="background: color-mix(in srgb, ${categoryObj.color || 'var(--accent-purple)'} 15%, transparent); color: ${categoryObj.color || 'var(--accent-purple)'}">
                        ${categoryObj.icon.replace('width="16"', 'width="32"').replace('height="16"', 'height="32"')}
                    </div>
                    <div class="info-title-box">
                        <h2 class="info-lesson-name">${exam.lessonName || 'Genel Sınav'}</h2>
                        <span class="badge-modern" style="background: color-mix(in srgb, ${categoryObj.color || 'var(--accent-purple)'} 15%, transparent); color: ${categoryObj.color || 'var(--accent-purple)'}">${exam.name} Sınavı</span>
                    </div>
                </div>

                <div class="info-grid-bento">
                    <div class="bento-item main-stat">
                        <span class="bento-label">SINAV SONUCU</span>
                        <div class="bento-value-wrap">
                            <span class="grade-giant">${exam.grade || '--'}</span>
                            <div class="stat-meta">
                                <span class="meta-val">${exam.time}</span>
                                <span class="meta-label">Sınav Saati</span>
                            </div>
                        </div>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">TARİH</span>
                        <span class="bento-value">${longDate}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">KATEGORİ</span>
                        <span class="bento-value" style="color: ${categoryObj.color || 'var(--accent-purple)'}">${exam.name}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">SINIF</span>
                        <span class="bento-value">${gradeObj?.name || '---'}</span>
                    </div>

                    <div class="bento-item">
                        <span class="bento-label">DÖNEM</span>
                        <span class="bento-value">${semObj?.name || '---'}</span>
                    </div>
                </div>

                ${exam.notes ? `
                    <div class="bento-item" style="margin-bottom: 24px;">
                        <span class="bento-label">NOTLAR</span>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 4px 0 0;">${exam.notes}</p>
                    </div>
                ` : ''}

                <div class="modal-actions-modern">
                    <button class="btn-modern secondary" onclick="window.Exams.showEditModal('${exam.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        Düzenle
                    </button>
                    <button class="btn-modern danger" onclick="Notifications.confirm('Sınavı Sil', 'Bu sınavı silmek istediğinize emin misiniz?', () => { window.Exams.remove('${exam.id}'); App.closeModal(); })">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        Sil
                    </button>
                </div>
            </div>
        `;
        App.openModal();
    },

    /**
     * Sınava kalan süreyi hesapla
     */
    getTimeRemaining(examDate, examTime) {
        const examDateTime = new Date(`${examDate}T${examTime || '00:00'}`);
        const now = new Date();
        const diff = examDateTime - now;

        if (diff <= 0) {
            return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { expired: false, days, hours, minutes, seconds };
    },

    /**
     * Tek bir sınav için countdown başlat
     */
    startCountdown(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        // Önceki interval'ı temizle
        if (this.countdownIntervals[examId]) {
            clearInterval(this.countdownIntervals[examId]);
        }

        // Her saniye güncelle
        this.countdownIntervals[examId] = setInterval(() => {
            this.updateCountdownDisplay(examId);
        }, 1000);

        // İlk güncelleme
        this.updateCountdownDisplay(examId);
    },

    /**
     * Tüm sınavlar için countdown başlat
     */
    startAllCountdowns() {
        this.exams.forEach(exam => {
            this.startCountdown(exam.id);
        });
    },

    /**
     * Countdown gösterimini güncelle
     */
    updateCountdownDisplay(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        const countdownEl = document.getElementById(`countdown-${examId}`);
        if (!countdownEl) return;

        const time = this.getTimeRemaining(exam.date, exam.time);

        if (time.expired) {
            countdownEl.innerHTML = `
                <div class="exam-finished-banner" style="height: 75px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span style="font-size: 13px; font-weight: 700; color: var(--text-muted); font-style: italic;">Sınav tamamlandı.</span>
                </div>`;
            clearInterval(this.countdownIntervals[examId]);
            return;
        }

        countdownEl.innerHTML = `
            <div class="pomo-countdown-modern" style="height: 75px; box-sizing: border-box; gap: 6px; padding: 0 8px; background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);">
                <div class="pomo-cd-unit" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); padding: 4px 0; border-radius: 8px;">
                    <span class="pomo-cd-val" style="font-size: 1.5rem; font-weight: 800; line-height: 1; color: var(--text-primary); letter-spacing: -0.5px;">${time.days}</span>
                    <span class="pomo-cd-lab" style="font-size: 0.6rem; font-weight: 700; margin-top: 4px; color: var(--text-muted); text-transform: uppercase;">Gün</span>
                </div>
                <div class="pomo-cd-unit" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); padding: 4px 0; border-radius: 8px;">
                    <span class="pomo-cd-val" style="font-size: 1.5rem; font-weight: 800; line-height: 1; color: var(--text-primary); letter-spacing: -0.5px;">${String(time.hours).padStart(2, '0')}</span>
                    <span class="pomo-cd-lab" style="font-size: 0.6rem; font-weight: 700; margin-top: 4px; color: var(--text-muted); text-transform: uppercase;">Saat</span>
                </div>
                <div class="pomo-cd-unit" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); padding: 4px 0; border-radius: 8px;">
                    <span class="pomo-cd-val" style="font-size: 1.5rem; font-weight: 800; line-height: 1; color: var(--text-primary); letter-spacing: -0.5px;">${String(time.minutes).padStart(2, '0')}</span>
                    <span class="pomo-cd-lab" style="font-size: 0.6rem; font-weight: 700; margin-top: 4px; color: var(--text-muted); text-transform: uppercase;">Dak</span>
                </div>
                <div class="pomo-cd-unit" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); padding: 4px 0; border-radius: 8px;">
                    <span class="pomo-cd-val" style="font-size: 1.5rem; font-weight: 800; line-height: 1; color: #ffffff; letter-spacing: -0.5px;">${String(time.seconds).padStart(2, '0')}</span>
                    <span class="pomo-cd-lab" style="font-size: 0.6rem; font-weight: 700; margin-top: 4px; color: var(--text-muted); text-transform: uppercase;">Sn</span>
                </div>
            </div>
        `;
    },

    /**
     * Ders listesini al
     */
    getLessonOptions(selectedId = null) {
        const lessons = Lessons?.lessons || [];
        return lessons.map(l => `<option value="${l.id}" data-name="${l.name}" data-grade="${l.grade}" data-semester="${l.semester}" ${selectedId === l.id ? 'selected' : ''}>${l.name}</option>`).join('');
    },

    setCategory(type) {
        this.filterType = type;
        this.renderToolbar();
        this.render();
    },

    setGrade(grade) {
        this.filterGrade = grade;
        this.renderToolbar();
        this.render();
    },

    setSemester(sem) {
        this.filterSemester = sem;
        this.renderToolbar();
        this.render();
    },

    setSearchQuery(query) {
        this.searchQuery = query;
        this.render();
    },

    getFilteredExams() {
        let filtered = this.exams;
        if (this.filterType !== 'all') {
            filtered = filtered.filter(e => e.name === this.filterType);
        }
        if (this.filterGrade !== 'all') {
            filtered = filtered.filter(e => e.academicGrade === this.filterGrade);
        }
        if (this.filterSemester !== 'all') {
            filtered = filtered.filter(e => e.semester === this.filterSemester);
        }

        const searchLower = this.searchQuery.toLowerCase();
        filtered = filtered.filter(e =>
            !this.searchQuery ||
            e.name.toLowerCase().includes(searchLower) ||
            (e.lessonName && e.lessonName.toLowerCase().includes(searchLower))
        );

        return filtered.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
            return dateA - dateB;
        });
    },

    /**
     * Sınav ekleme modalı
     */
    showAddModal() {
        this.showModal();
    },

    /**
     * Sınav düzenleme modalı
     */
    showEditModal(id) {
        const exam = this.exams.find(e => e.id === id);
        if (!exam) return;
        this.showModal(exam);
    },

    /**
     * Ortak modal fonksiyonu
     */
    showModal(exam = null) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        const today = App.getLocalDateString();

        modalTitle.textContent = exam ? 'Sınavı Düzenle' : 'Yeni Sınav Ekle';
        modalBody.innerHTML = `
            <form id="examForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Sınav Türü *</label>
                        <select class="form-select" name="name" required>
                            <option value="Vize" ${exam && exam.name === 'Vize' ? 'selected' : ''}>Vize</option>
                            <option value="Final" ${exam && exam.name === 'Final' ? 'selected' : ''}>Final</option>
                            <option value="Bütünleme" ${exam && exam.name === 'Bütünleme' ? 'selected' : ''}>Bütünleme</option>
                            <option value="Quiz" ${exam && exam.name === 'Quiz' ? 'selected' : ''}>Quiz</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Ders (İsteğe bağlı)</label>
                    <select class="form-select" name="lessonId" id="examLessonSelect" onchange="Exams.handleLessonChange(this)">
                        <option value="">-- Ders Seçin --</option>
                        ${this.getLessonOptions(exam ? exam.lessonId : null)}
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Sınıf</label>
                        <select class="form-select" name="academicGrade" id="examGradeSelect">
                            ${Lessons.grades.map(g => `<option value="${g.id}" ${exam && exam.academicGrade === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dönem</label>
                        <select class="form-select" name="semester" id="examSemesterSelect">
                            ${Lessons.semesters.map(s => `<option value="${s.id}" ${exam && exam.semester === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="datetime-group">
                    <div class="form-group">
                        <label class="form-label">Tarih *</label>
                        <input type="date" class="form-input" name="date" required value="${exam ? exam.date : today}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Saat *</label>
                        <input type="time" class="form-input" name="time" required value="${exam ? exam.time : '09:00'}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Alınan Not</label>
                    <input type="text" class="form-input" name="grade" placeholder="Örn: 85, AA" value="${exam ? (exam.grade || '') : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Notlar</label>
                    <textarea class="form-textarea" name="notes" placeholder="Sınav hakkında notlar...">${exam ? (exam.notes || '') : ''}</textarea>
                </div>
                <div class="modal-footer-modern" style="padding-top: 20px; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
                    ${exam ? `
                        <button type="button" class="btn btn-danger-soft" onclick="Notifications.confirm('Sınavı Sil', 'Bu sınav silinecek. Emin misiniz?', () => { Exams.remove('${exam.id}'); App.closeModal(); })" style="margin-right: auto; padding: 10px 16px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            Sil
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()" style="padding: 10px 20px;">İptal</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        ${exam ? 'Güncelle' : 'Ekle'}
                    </button>
                </div>
            </form>
    `;

        App.openModal();

        document.getElementById('examForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const lessonSelect = document.getElementById('examLessonSelect');
            const lessonName = lessonSelect.options[lessonSelect.selectedIndex]?.dataset.name || '';

            const data = {
                name: formData.get('name'),
                lessonId: formData.get('lessonId'),
                lessonName: lessonName,
                date: formData.get('date'),
                time: formData.get('time'),
                notes: formData.get('notes'),
                grade: formData.get('grade'),
                academicGrade: formData.get('academicGrade'),
                semester: formData.get('semester')
            };

            if (exam) {
                this.update(exam.id, data);
            } else {
                this.add(data);
            }
            App.closeModal();
        });
    },

    handleLessonChange(select) {
        const option = select.options[select.selectedIndex];
        if (!option || !option.value) return;

        const grade = option.dataset.grade;
        const semester = option.dataset.semester;

        if (grade) {
            const gradeSelect = document.getElementById('examGradeSelect');
            if (gradeSelect) gradeSelect.value = grade;
        }
        if (semester) {
            const semesterSelect = document.getElementById('examSemesterSelect');
            if (semesterSelect) semesterSelect.value = semester;
        }
    },

    /**
     * İstatistikleri hesapla
     */
    getStats() {
        const now = new Date();
        const upcoming = this.exams.filter(e => new Date(`${e.date}T${e.time || '00:00'}`) > now);
        const completed = this.exams.filter(e => new Date(`${e.date}T${e.time || '00:00'}`) <= now);

        return {
            total: this.exams.length,
            upcoming: upcoming.length,
            completed: completed.length
        };
    },

    /**
     * Render Toolbar
     */
    renderToolbar() {
        const pageExams = document.getElementById('page-exams');
        if (!pageExams) return;

        // Find or create toolbar
        let toolbar = document.getElementById('examsToolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'examsToolbar';
            // Insert before the grid but after the stats
            const grid = document.getElementById('examsGrid');
            if (grid) pageExams.insertBefore(toolbar, grid);
        }

        const selectedGrade = Lessons.grades.find(g => g.id === this.filterGrade);
        const selectedSemester = Lessons.semesters.find(s => s.id === this.filterSemester);
        const selectedCategory = this.categories.find(c => c.id === this.filterType);

        const gradeLabel = this.filterGrade === 'all' ? 'Sınıf' : selectedGrade.name;
        const gradeIcon = this.filterGrade === 'all' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v6"/><path d="M10 12v6"/></svg>' : selectedGrade.icon;

        const semesterLabel = this.filterSemester === 'all' ? 'Dönem' : selectedSemester.name;
        const semesterIcon = this.filterSemester === 'all' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>' : selectedSemester.icon;

        const typeLabel = this.filterType === 'all' ? 'Tür' : selectedCategory.id;
        const typeIcon = this.filterType === 'all' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>' : selectedCategory.icon;

        const typeChipsHtml = [
            { id: 'all', label: 'Tümü', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>' },
            ...this.categories.map(c => ({ id: c.id, label: c.id, icon: c.icon }))
        ].map(cat => `
            <div class="site-category-chip ${this.filterType === cat.id ? 'active' : ''}" onclick="window.Exams.setCategory('${cat.id}'); event.stopPropagation();">
                <span class="chip-icon">${cat.icon}</span>
                <span class="chip-label">${cat.label}</span>
            </div>
    `).join('');

        toolbar.innerHTML = `
            <div class="lesson-filter-container-modern">
                <div class="lesson-filters-wrapper filter-row-single">
                    <div class="filter-search-wrap">
                        <input type="text" id="examSearchInput" class="filter-search-input-modern" placeholder="🔍 Sınav ara..." 
                               value="${this.searchQuery}"
                               oninput="window.Exams.setSearchQuery(this.value)">
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger"><span class="chip-icon">${gradeIcon}</span> ${gradeLabel}</div>
                        <div class="filter-drop-inline">
                                <div class="site-category-chip ${this.filterGrade === 'all' ? 'active' : ''}" onclick="window.Exams.setGrade('all'); event.stopPropagation();">
                                    <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
                                    <span class="chip-label">Tümü</span>
                                </div>
                                ${Lessons.grades.map(g => `
                                    <div class="site-category-chip ${this.filterGrade === g.id ? 'active' : ''}" onclick="window.Exams.setGrade('${g.id}'); event.stopPropagation();">
                                        <span class="chip-icon">${g.icon}</span>
                                        <span class="chip-label">${g.name}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger"><span class="chip-icon">${semesterIcon}</span> ${semesterLabel}</div>
                        <div class="filter-drop-inline">
                                <div class="site-category-chip ${this.filterSemester === 'all' ? 'active' : ''}" onclick="window.Exams.setSemester('all'); event.stopPropagation();">
                                    <span class="chip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
                                    <span class="chip-label">Tümü</span>
                                </div>
                                ${Lessons.semesters.map(s => `
                                    <div class="site-category-chip ${this.filterSemester === s.id ? 'active' : ''}" onclick="window.Exams.setSemester('${s.id}'); event.stopPropagation();">
                                        <span class="chip-icon">${s.icon}</span>
                                        <span class="chip-label">${s.name}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                    <div class="filter-trigger-wrap">
                        <div class="filter-trigger"><span class="chip-icon">${typeIcon}</span> ${typeLabel}</div>
                        <div class="filter-drop-inline">${typeChipsHtml}</div>
                    </div>
                </div>
                <div class="lesson-toolbar-actions">
                    <span class="toolbar-result-count">${this.getFilteredExams().length} Sınav listeleniyor</span>
                    <button class="btn btn-primary btn-sm" onclick="Exams.showAddModal()" style="height: 40px; padding: 0 20px;">
                        <span>+</span> Yeni Sınav
                    </button>
                </div>
            </div>
    `;
    },

    /**
     * Render
     */
    render() {
        const stats = this.getStats();

        // Stats
        const statTotal = document.getElementById('examStatTotal');
        const statCompleted = document.getElementById('examStatCompleted');
        const statUpcoming = document.getElementById('examStatUpcoming');

        if (statTotal) statTotal.textContent = stats.total;
        if (statCompleted) statCompleted.textContent = stats.completed;
        if (statUpcoming) statUpcoming.textContent = stats.upcoming;

        // Grid
        const grid = document.getElementById('examsGrid');
        if (!grid) return;

        const filteredExams = this.getFilteredExams();

        if (this.exams.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-large">
                    <span class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    </span>
                    <h3>Henüz sınav eklenmedi</h3>
                    <p>Sınavlarınızı ekleyerek geri sayımı başlatın</p>
                </div>
            `;
        } else if (filteredExams.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-large">
                    <p style="opacity: 0.6; font-size: 14px;">Bu filtreyle eşleşen sınav bulunamadı</p>
                </div>
            `;
        } else {
            grid.innerHTML = filteredExams.map(exam => {
                const time = this.getTimeRemaining(exam.date, exam.time);
                const examDateTime = new Date(`${exam.date}T${exam.time || '00:00'}`);
                const longDate = examDateTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

                const gradeObj = Lessons.grades.find(g => g.id === exam.academicGrade);
                const semesterObj = Lessons.semesters.find(s => s.id === exam.semester);
                const categoryObj = this.categories.find(c => c.id === exam.name) || { color: 'var(--text-secondary)' };

                // Class Colors (Distinct per grade)
                const classColors = {
                    '1': 'var(--accent-purple)',
                    '2': 'var(--accent-blue)',
                    '3': 'var(--accent-pink)',
                    '4': 'var(--danger)',
                    'yuksek': 'var(--accent-green)',
                    'doktora': 'var(--accent-cyan)'
                };
                const classColor = classColors[exam.academicGrade] || 'var(--text-accent)'; // Fallback

                // Semester Colors (Distinct per term)
                const semesterColors = {
                    'guz': '#f97316',    // Güz - Turuncu
                    'bahar': '#10b981',  // Bahar - Yeşil
                    'yaz': '#06b6d4'     // Yaz - Mavi
                };
                const semesterColor = semesterColors[exam.semester] || 'var(--text-muted)'; // Fallback

                // Grade coloring logic
                const gradeVal = parseInt(exam.grade);
                let gradeColor = 'var(--text-muted)';
                if (!isNaN(gradeVal)) {
                    gradeColor = gradeVal >= 45 ? 'var(--accent-green)' : 'var(--accent-red)';
                } else if (exam.grade) {
                    gradeColor = 'var(--accent-purple)'; // Fallback for non-numeric grades
                }

                return `
                <div class="modern-card exam-premium-box ${time.expired ? 'expired' : ''}"
                     onclick="window.Exams.showDetailModal('${exam.id}')"
                     style="cursor: pointer; position: relative; padding: 16px 16px 20px 16px; height: 220px; display: flex; flex-direction: column; overflow: hidden; background: linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%); border: 1px solid var(--border-color); border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);">

                    <!-- Glass Reflection Effect -->
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 50%); pointer-events: none; z-index: 0;"></div>

                    <div style="position: absolute; top: 0; right: 0; padding: 8px 12px; background: ${categoryObj.color}15; color: ${categoryObj.color}; font-size: 10px; font-weight: 800; border-bottom-left-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2;">
                        ${exam.name}
                    </div>

                    <!-- Header Row: Lesson Name -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; position: relative; margin-bottom: 12px;">
                        <div style="flex: 1; padding-right: 60px;">
                            <div style="font-size: 17px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.4px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${exam.lessonName || 'Genel Sınav'}
                            </div>
                        </div>
                    </div>

                    <!-- Info Row: Badges & Grade -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; z-index: 1; position: relative; min-height: 38px;">
                        <!-- Left: Badges -->
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <div style="background: color-mix(in srgb, ${classColor} 10%, transparent); color: ${classColor}; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                                <span style="opacity: 0.7;">${gradeObj?.icon || ''}</span>
                                ${gradeObj?.name || 'Sınıf Yok'}
                            </div>
                            <div style="background: ${semesterColor}20; color: ${semesterColor}; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                                <span style="opacity: 0.7;">${semesterObj?.icon || ''}</span>
                                ${semesterObj?.name || 'Dönem Yok'}
                            </div>
                        </div>

                        <!-- Right: Grade -->
                        ${exam.grade ? `
                        <div class="exam-grade-display" style="margin-top: -10px; background: ${gradeColor}; color: #fff; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                            ${exam.grade}
                        </div>` : ''}
                    </div>

                    <!-- Footer Section: Date (Top) and Countdown (Bottom) -->
                    <div style="margin-top: auto; z-index: 1; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 2px; margin-bottom: 8px;">
                            <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                ${longDate}
                            </div>
                            <div style="font-size: 11px; font-weight: 800; color: var(--accent-purple); display: flex; align-items: center; gap: 5px; background: color-mix(in srgb, var(--accent-purple) 8%, transparent); padding: 4px 10px; border-radius: 8px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                ${exam.time}
                            </div>
                        </div>

                        <!-- Countdown area (Bottom) -->
                        <div class="exam-countdown-wrapper" id="countdown-${exam.id}" style="margin-bottom: 0;">
                            <!-- Rendered by updateCountdownDisplay -->
                        </div>
                    </div>
                    </div>
                </div>
            `;
            }).join('');

            // Sync result count in toolbar
            const countEl = document.querySelector('#examsToolbar .toolbar-result-count');
            if (countEl) {
                countEl.textContent = `${filteredExams.length} Sınav listeleniyor`;
            }

            // Start countdowns
            this.startAllCountdowns();
        }
    }
};

window.Exams = Exams;
