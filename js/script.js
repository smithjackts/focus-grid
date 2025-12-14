document.addEventListener('DOMContentLoaded', () => {
    console.log("FocusGrid Script Loaded ✅");

    /* ==================================================================
       1. HUDBA (Společné pro všechny stránky)
       ================================================================== */
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');

    if (musicBtn && bgMusic) {
        bgMusic.volume = 0.3; // Hlasitost 30%

        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.error("Chyba přehrávání:", e));
                musicBtn.classList.add('playing');
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
            }
        });
    }

    /* ==================================================================
       2. POMODORO TIMER (Pouze pro stránku pomodoro.html)
       ================================================================== */
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('btn-start');
    const resetBtn = document.getElementById('btn-reset');
    const modeButtons = document.querySelectorAll('.mode-toggles button');

    // Tento blok se spustí JEN pokud jsme na stránce s časovačem
    if (timerDisplay && startBtn) {
        let timeLeft = 25 * 60; // Výchozí: 25 min
        let timerId = null;
        let isRunning = false;

        function updateDisplay() {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${m}:${s}`;
            document.title = `${m}:${s} | FocusGrid`;
        }

        // Přepínání módů (Pomodoro / Short / Long)
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Reset vzhledu tlačítek
                modeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Zastavit časovač
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = "START";

                // Nastavit čas
                const mode = e.target.textContent.trim().toUpperCase();
                if (mode === 'POMODORO') timeLeft = 25 * 60;
                else if (mode === 'SHORT BREAK') timeLeft = 5 * 60;
                else if (mode === 'LONG BREAK') timeLeft = 10 * 60;
                
                updateDisplay();
            });
        });

        // Tlačítko START / PAUZA
        startBtn.addEventListener('click', () => {
            if (isRunning) {
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = "POKRAČOVAT";
            } else {
                isRunning = true;
                startBtn.textContent = "PAUZA";
                timerId = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateDisplay();
                    } else {
                        clearInterval(timerId);
                        isRunning = false;
                        alert("Čas vypršel!");
                        startBtn.textContent = "START";
                    }
                }, 1000);
            }
        });

        // Tlačítko RESET
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = "START";
                
                // Vrátit čas podle aktivního tlačítka
                const activeBtn = document.querySelector('.mode-toggles button.active');
                const mode = activeBtn ? activeBtn.textContent.trim().toUpperCase() : 'POMODORO';
                
                if (mode === 'SHORT BREAK') timeLeft = 5 * 60;
                else if (mode === 'LONG BREAK') timeLeft = 10 * 60;
                else timeLeft = 25 * 60;
                
                updateDisplay();
            });
        }

        // Spustit hned po načtení
        updateDisplay();
    }

    /* ==================================================================
       3. QUESTS / HABITS (Pouze pro stránku habits.html)
       ================================================================== */
    const habitsList = document.getElementById('habits-list');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitInput = document.getElementById('new-habit-input');
    const countDisplay = document.getElementById('completed-count');

    // Tento blok se spustí JEN pokud jsme na stránce Quests
    if (habitsList) {
        let myHabits = JSON.parse(localStorage.getItem('myHabits')) || [
            { text: "Vypít vodu", completed: false },
            { text: "Číst knihu", completed: false }
        ];

        function renderHabits() {
            habitsList.innerHTML = "";
            let completedCount = 0;

            myHabits.forEach((habit, index) => {
                const div = document.createElement('div');
                div.className = habit.completed ? 'habit-card completed' : 'habit-card';
                
                // Checkbox
                const check = document.createElement('div');
                check.className = 'custom-checkbox';
                check.textContent = habit.completed ? '✓' : '';
                check.style.display = "flex"; check.style.justifyContent="center"; check.style.alignItems="center";
                check.style.width="30px"; check.style.height="30px"; check.style.border="2px solid #333"; check.style.cursor="pointer";
                if(habit.completed) check.style.background = "#27ae60";

                check.onclick = () => {
                    habit.completed = !habit.completed;
                    saveHabits();
                };

                // Text
                const span = document.createElement('span');
                span.textContent = habit.text;
                span.style.flexGrow = "1"; span.style.marginLeft = "15px"; span.style.textAlign = "left";

                // Smazat
                const del = document.createElement('button');
                del.textContent = "X";
                del.className = "delete-btn";
                del.onclick = () => {
                    if(confirm("Smazat quest?")) {
                        myHabits.splice(index, 1);
                        saveHabits();
                    }
                };

                div.appendChild(check);
                div.appendChild(span);
                div.appendChild(del);
                habitsList.appendChild(div);

                if (habit.completed) completedCount++;
            });

            if (countDisplay) countDisplay.textContent = `${completedCount}/${myHabits.length}`;
        }

        function saveHabits() {
            localStorage.setItem('myHabits', JSON.stringify(myHabits));
            renderHabits();
        }

        function addNewHabit() {
            const txt = habitInput.value.trim();
            if (txt) {
                myHabits.push({ text: txt, completed: false });
                habitInput.value = "";
                saveHabits();
            }
        }

        // Listenery pro Quests
        renderHabits();
        if (addHabitBtn) addHabitBtn.onclick = addNewHabit;
        if (habitInput) habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewHabit();
        });
    }

    /* ==================================================================
       4. LOG / JOURNAL (Pouze pro stránku journal.html)
       ================================================================== */
    const journalEntry = document.getElementById('journal-entry');
    const saveJournalBtn = document.getElementById('btn-save');
    const deleteJournalBtn = document.getElementById('btn-delete');
    const downloadBtn = document.getElementById('btn-download'); // Zde hledáme tlačítko
    const saveStatus = document.getElementById('save-status');

    // Tento blok se spustí JEN pokud jsme na stránce Log
    if (journalEntry) {
        
        // 1. Načtení uloženého textu po startu
        const savedText = localStorage.getItem('journalText');
        if (savedText) {
            journalEntry.value = savedText;
        }

        // 2. Uložení (SAVE DATA)
        if (saveJournalBtn) {
            saveJournalBtn.addEventListener('click', () => {
                localStorage.setItem('journalText', journalEntry.value);
                if (saveStatus) {
                    saveStatus.innerHTML = "Status: <span style='color: green'>DATA SAVED ✅</span>";
                    setTimeout(() => { 
                        saveStatus.innerHTML = "Status: WAITING FOR INPUT..."; 
                    }, 2000);
                }
            });
        }

        // 3. Smazání (CLEAR)
        if (deleteJournalBtn) {
            deleteJournalBtn.addEventListener('click', () => {
                if (confirm("Smazat celý deník?")) {
                    journalEntry.value = "";
                    localStorage.removeItem('journalText');
                    if (saveStatus) saveStatus.textContent = "🗑️ SMAZÁNO";
                }
            });
        }

        // 4. STÁHNOUT .TXT (Tohle je ta oprava)
        if (downloadBtn) {
            console.log("Tlačítko pro stažení nalezeno!"); // Kontrola v konzoli

            downloadBtn.addEventListener('click', () => {
                const textToSave = journalEntry.value;

                // Kontrola, jestli není deník prázdný
                if (!textToSave) {
                    alert("Deník je prázdný, není co stahovat!");
                    return;
                }

                // Vytvoření souboru
                const blob = new Blob([textToSave], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                // Vytvoření neviditelného odkazu pro stažení
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Muj_Denik_FocusGrid.txt'; // Název souboru
                document.body.appendChild(a); // Nutné pro Firefox
                a.click(); // Simulace kliknutí
                
                // Úklid
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }
    }
});