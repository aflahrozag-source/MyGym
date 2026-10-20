// Data Default Gym
const gymData = {
    push: [
        { name: "Bench Press", totalSets: 4, currentSets: 0, reps: "6-8 Reps", restSec: 90 },
        { name: "Incline Dumbbell Press", totalSets: 3, currentSets: 0, reps: "8-10 Reps", restSec: 60 },
        { name: "Overhead Press", totalSets: 3, currentSets: 0, reps: "8-10 Reps", restSec: 60 }
    ],
    pull: [
        { name: "Barbell Row", totalSets: 4, currentSets: 0, reps: "6-8 Reps", restSec: 90 },
        { name: "Lat Pulldown", totalSets: 3, currentSets: 0, reps: "10-12 Reps", restSec: 60 },
        { name: "Face Pulls", totalSets: 3, currentSets: 0, reps: "12-15 Reps", restSec: 45 }
    ],
    leg: [
        { name: "Barbell Squats", totalSets: 4, currentSets: 0, reps: "6-8 Reps", restSec: 120 },
        { name: "Romanian Deadlift", totalSets: 3, currentSets: 0, reps: "8-10 Reps", restSec: 90 },
        { name: "Leg Press", totalSets: 3, currentSets: 0, reps: "10-12 Reps", restSec: 60 }
    ]
};

let currentDay = 'push';
let timerIntervals = {};
let currentCalDate = new Date();
let calendarNotes = {}; 
let selectedCalDateKey = null;

let dailyLogFlags = {
    started: false,
    completed: false
};

document.addEventListener('DOMContentLoaded', () => {
    startRealtimeClock();
    setupCalendar();
    setupEventListeners();
    renderWorkouts();
});

// 1. Clock & Reminder
function startRealtimeClock() {
    function updateClock() {
        const now = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        const dateEl = document.getElementById('realtime-date');
        const timeEl = document.getElementById('realtime-time');

        if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        if (timeEl) timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

        setDailyReminder(days[now.getDay()], now.getDay());
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function setDailyReminder(dayName, dayIdx) {
    const reminderText = document.getElementById('reminder-text');
    if (!reminderText) return;

    const restCheckboxes = document.querySelectorAll('.rest-day-check:checked');
    const userRestDays = Array.from(restCheckboxes).map(cb => parseInt(cb.value));

    if (userRestDays.includes(dayIdx)) {
        reminderText.textContent = `Hari ini (${dayName}) adalah Rest Day! Fokus pemulihan otot & hidrasi.`;
    } else if (dayName === 'Senin' || dayName === 'Kamis') {
        reminderText.textContent = "Hari ini jadwal PUSH DAY! Fokus Otot Dada, Bahu, & Tricep.";
    } else if (dayName === 'Selasa' || dayName === 'Jumat') {
        reminderText.textContent = "Hari ini jadwal PULL DAY! Hajar Otot Punggung & Bicep.";
    } else if (dayName === 'Rabu' || dayName === 'Sabtu') {
        reminderText.textContent = "Hari ini jadwal LEG DAY! Latih Kaki & Core secara optimal.";
    }
}

// 2. Realtime Calendar & Rest Day
function setupCalendar() {
    const monthYearText = document.getElementById('calendar-month-year');
    const grid = document.getElementById('calendar-grid');
    const recText = document.getElementById('rec-text');
    const btnPrev = document.getElementById('btn-prev-month');
    const btnNext = document.getElementById('btn-next-month');
    const noteBox = document.getElementById('calendar-note-box');
    const inputCalNote = document.getElementById('input-cal-note');
    const btnSaveCalNote = document.getElementById('btn-save-cal-note');

    if (btnPrev) {
        btnPrev.onclick = () => {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            renderCalendar();
        };
    }
    if (btnNext) {
        btnNext.onclick = () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderCalendar();
        };
    }

    if (btnSaveCalNote) {
        btnSaveCalNote.onclick = () => {
            if (selectedCalDateKey && inputCalNote) {
                calendarNotes[selectedCalDateKey] = inputCalNote.value.trim();
                alert('Catatan tanggal berhasil disimpan!');
                renderCalendar();
            }
        };
    }

    document.querySelectorAll('.rest-day-check').forEach(cb => {
        cb.onchange = () => {
            const now = new Date();
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            setDailyReminder(days[now.getDay()], now.getDay());
            renderCalendar();
        };
    });

    function renderCalendar() {
        if (!grid || !monthYearText) return;
        grid.innerHTML = '';
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        monthYearText.textContent = `${months[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const restCheckboxes = document.querySelectorAll('.rest-day-check:checked');
        const userRestDays = Array.from(restCheckboxes).map(cb => parseInt(cb.value));

        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement('div'));
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-day';
            dayEl.textContent = d;

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (calendarNotes[dateKey]) {
                dayEl.classList.add('has-note');
            }

            if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('today');
            }

            dayEl.onclick = () => {
                document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('active-day'));
                dayEl.classList.add('active-day');

                selectedCalDateKey = dateKey;
                const selectedDate = new Date(year, month, d);
                const dayIdx = selectedDate.getDay();
                let type = "", recs = "";

                if (userRestDays.includes(dayIdx)) {
                    type = "Rest Day (Jadwal Kustom)";
                    recs = "Rekomendasi Pemulihan: Foam rolling, jalan santai 15-20 menit, & tidur 8 jam.";
                } else if (dayIdx === 1 || dayIdx === 4) {
                    type = "Push Day";
                    recs = "Rekomendasi Latihan: Bench Press, Overhead Press, Incline Dumbbell, & Tricep Dips.";
                } else if (dayIdx === 2 || dayIdx === 5) {
                    type = "Pull Day";
                    recs = "Rekomendasi Latihan: Barbell Row, Lat Pulldown, Face Pulls, & Bicep Curls.";
                } else if (dayIdx === 3 || dayIdx === 6) {
                    type = "Leg Day";
                    recs = "Rekomendasi Latihan: Barbell Squats, Romanian Deadlift, Leg Press, & Calf Raises.";
                }

                const savedNote = calendarNotes[dateKey] ? `<br>📝 <strong>Catatan:</strong> ${calendarNotes[dateKey]}` : '';

                if (recText) recText.innerHTML = `<strong>Tanggal: ${d} ${months[month]} ${year} (${type})</strong><br>${recs}${savedNote}`;
                if (noteBox) noteBox.classList.remove('hidden');
                if (inputCalNote) inputCalNote.value = calendarNotes[dateKey] || '';
            };

            grid.appendChild(dayEl);
        }
    }
    renderCalendar();
}

// 3. Event Listeners & Form Toggles
function setupEventListeners() {
    const dayButtons = document.querySelectorAll('.day-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const btnToggleAdd = document.getElementById('btn-toggle-add-form');
    const btnToggleHistory = document.getElementById('btn-toggle-history');
    const addWorkoutForm = document.getElementById('add-workout-form');
    const btnModalReset = document.getElementById('btn-modal-reset');
    const btnSaveDailyLog = document.getElementById('btn-save-daily-log');

    const btnOpenProfile = document.getElementById('btn-open-profile');
    const btnCloseProfile = document.getElementById('btn-close-profile');
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    const inputAvatar = document.getElementById('input-avatar');
    const profilePreview = document.getElementById('profile-preview');
    const headerAvatar = document.getElementById('header-avatar');

    dayButtons.forEach(button => {
        button.addEventListener('click', () => {
            dayButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDay = button.getAttribute('data-day');
            
            dailyLogFlags.started = false;
            dailyLogFlags.completed = false;
            
            renderWorkouts();
        });
    });

    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            document.body.toggleAttribute('data-theme-light');
            if (document.body.hasAttribute('data-theme-light')) {
                document.body.setAttribute('data-theme', 'light');
            } else {
                document.body.removeAttribute('data-theme');
            }
        };
    }

    if (btnToggleAdd) {
        btnToggleAdd.onclick = () => {
            const card = document.getElementById('add-workout-card');
            if (card) card.classList.toggle('hidden');
        };
    }

    if (btnToggleHistory) {
        btnToggleHistory.onclick = () => {
            const card = document.getElementById('history-log-card');
            if (card) card.classList.toggle('hidden');
        };
    }

    if (addWorkoutForm) {
        addWorkoutForm.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('input-name').value;
            const totalSets = parseInt(document.getElementById('input-sets').value);
            const reps = document.getElementById('input-reps').value;
            const restSec = parseInt(document.getElementById('input-rest-sec').value);

            gymData[currentDay].push({ name, totalSets, currentSets: 0, reps, restSec });
            e.target.reset();
            document.getElementById('add-workout-card').classList.add('hidden');
            renderWorkouts();
        };
    }

    if (btnModalReset) {
        btnModalReset.onclick = () => {
            gymData[currentDay].forEach(item => item.currentSets = 0);
            dailyLogFlags.started = false;
            dailyLogFlags.completed = false;
            document.getElementById('congrats-modal').classList.add('hidden');
            renderWorkouts();
        };
    }

    if (btnSaveDailyLog) {
        btnSaveDailyLog.onclick = () => {
            const inputNote = document.getElementById('input-daily-note');
            if (inputNote && inputNote.value.trim() !== '') {
                addHistoryLog(`Catatan Manual: "${inputNote.value.trim()}"`);
                inputNote.value = '';
            }
        };
    }

    // Profil Logic
    if (btnOpenProfile && profileModal) btnOpenProfile.onclick = () => profileModal.classList.remove('hidden');
    if (btnCloseProfile && profileModal) btnCloseProfile.onclick = () => profileModal.classList.add('hidden');

    if (inputAvatar) {
        inputAvatar.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    if (profilePreview) profilePreview.src = evt.target.result;
                    if (headerAvatar) headerAvatar.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (profileForm) {
        profileForm.onsubmit = (e) => {
            e.preventDefault();
            alert('Profil berhasil diperbarui!');
            if (profileModal) profileModal.classList.add('hidden');
        };
    }
}

// 4. Render Workout & Dynamic Calculation
function renderWorkouts() {
    const workoutList = document.getElementById('workout-list');
    const dayTitle = document.getElementById('day-title');
    if (!workoutList) return;

    workoutList.innerHTML = '';
    if (dayTitle) dayTitle.textContent = `${currentDay.toUpperCase()} DAY PROGRESS`;

    gymData[currentDay].forEach((item, index) => {
        // Kalkulasi Persentase Menu Latihan
        const itemPercent = item.totalSets > 0 ? Math.round((item.currentSets / item.totalSets) * 100) : 0;

        const card = document.createElement('div');
        card.className = `workout-card ${itemPercent >= 100 ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="workout-header">
                <div class="exercise-info">
                    <h3 class="exercise-name">${item.name}</h3>
                    <div class="exercise-sub">Target Reps: ${item.reps}</div>
                    <div class="set-setting-inline">
                        🎯 Target Set: 
                        <input type="number" value="${item.totalSets}" min="1" onchange="updateTotalSets(${index}, this.value)">
                    </div>
                </div>
                <div class="set-counter-group">
                    <button class="btn-set-action" onclick="changeSet(${index}, -1)">-</button>
                    <span style="font-size:0.85rem; font-weight:600;">${item.currentSets} / ${item.totalSets} Set</span>
                    <button class="btn-set-action" onclick="changeSet(${index}, 1)">+</button>
                </div>
            </div>

            <!-- Bar Persen Per Menu Latihan -->
            <div class="item-progress-box">
                <div class="item-progress-text">
                    <span>Progress Menu</span>
                    <span>${itemPercent}%</span>
                </div>
                <div class="item-progress-bar-bg">
                    <div class="item-progress-bar-fill" style="width: ${Math.min(100, itemPercent)}%"></div>
                </div>
            </div>

            <!-- Inline Rest Timer -->
            <div class="card-timer-box">
                <div class="timer-input-group">
                    ⏱️ Rest: 
                    <input type="number" class="timer-input" id="timer-val-${index}" value="${item.restSec}" min="5">s
                </div>
                <div class="timer-controls-inline">
                    <button class="btn-timer-sm" onclick="startInlineTimer(${index})">Start</button>
                    <button class="btn-timer-sm" onclick="stopInlineTimer(${index})">Stop</button>
                    <button class="btn-timer-sm" onclick="resetInlineTimer(${index}, ${item.restSec})">Reset</button>
                </div>
            </div>
        `;

        workoutList.appendChild(card);
    });

    updateOverallProgress();
}

// Pengaturan Target Set Bebas
function updateTotalSets(index, newTotal) {
    const val = parseInt(newTotal);
    if (!isNaN(val) && val > 0) {
        gymData[currentDay][index].totalSets = val;
        renderWorkouts();
    }
}

function changeSet(index, delta) {
    const item = gymData[currentDay][index];
    item.currentSets = Math.max(0, item.currentSets + delta);

    if (!dailyLogFlags.started && item.currentSets > 0) {
        dailyLogFlags.started = true;
        addHistoryLog(`Memulai sesi latihan ${currentDay.toUpperCase()} DAY.`);
    }

    renderWorkouts();
}

function addHistoryLog(message) {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    const emptyLog = historyList.querySelector('.empty-log');
    if (emptyLog) emptyLog.remove();

    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const li = document.createElement('li');
    li.innerHTML = `<strong>[${dayName}, ${dateStr} - ${timeStr}]</strong> ${message}`;

    historyList.prepend(li);
}

function startInlineTimer(index) {
    stopInlineTimer(index);
    const inputEl = document.getElementById(`timer-val-${index}`);
    if (!inputEl) return;
    let timeLeft = parseInt(inputEl.value);
    if (isNaN(timeLeft) || timeLeft <= 0) return;

    timerIntervals[index] = setInterval(() => {
        timeLeft--;
        inputEl.value = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerIntervals[index]);
            alert(`⏰ Rest Selesai! Lanjut set berikutnya.`);
        }
    }, 1000);
}

function stopInlineTimer(index) {
    if (timerIntervals[index]) clearInterval(timerIntervals[index]);
}

function resetInlineTimer(index, defaultSec) {
    stopInlineTimer(index);
    const inputEl = document.getElementById(`timer-val-${index}`);
    if (inputEl) inputEl.value = defaultSec;
}

// Progress Harian Dihitung dari Rata-Rata Persentase Seluruh Menu Latihan
function updateOverallProgress() {
    const progressPercent = document.getElementById('progress-percent');
    const progressFill = document.getElementById('progress-fill');

    const exercises = gymData[currentDay];
    if (exercises.length === 0) {
        if (progressPercent) progressPercent.textContent = `0%`;
        if (progressFill) progressFill.style.width = `0%`;
        return;
    }

    let sumPercent = 0;
    exercises.forEach(item => {
        const p = item.totalSets > 0 ? (item.currentSets / item.totalSets) * 100 : 0;
        sumPercent += Math.min(100, p);
    });

    const totalPercent = Math.round(sumPercent / exercises.length);

    if (progressPercent) progressPercent.textContent = `${totalPercent}%`;
    if (progressFill) progressFill.style.width = `${totalPercent}%`;

    if (totalPercent >= 100 && !dailyLogFlags.completed) {
        dailyLogFlags.completed = true;
        addHistoryLog(`🏆 MENCAPAI 100%! Berhasil menyelesaikan seluruh target latihan ${currentDay.toUpperCase()} DAY hari ini.`);
        setTimeout(() => {
            const modal = document.getElementById('congrats-modal');
            if (modal) modal.classList.remove('hidden');
        }, 300);
    }
}