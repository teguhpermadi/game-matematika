// ====================================================================
// script.js - Logika Game Puzzle Box (Dinamis & FIX Bug Tampilan)
// ====================================================================

let selectedTime = null;
let selectedLevelKey = null;
let selectedOperation = null; 
let currentPuzzle = null; 
let timerInterval = null;
let timeLeft = 0;

// --- DATA KONFIGURASI LEVEL SOAL ---
const LEVEL_CONFIG = {
    // 1. Penjumlahan/Pengurangan 2x2
    'plus_2x2': {
        gridDim: 2,
        isMultiplication: false,
        'level1': { min: 3, max: 10, targetMin: 6, targetMax: 20 }, 
        'level2': { min: 5, max: 20, targetMin: 10, targetMax: 40 },
        'level3': { min: 10, max: 35, targetMin: 20, targetMax: 70 },
        'level4': { min: 15, max: 50, targetMin: 30, targetMax: 100 }
    },
    // 2. Penjumlahan/Pengurangan 3x3
    'plus_3x3': {
        gridDim: 3,
        isMultiplication: false,
        'level1': { min: 3, max: 7, targetMin: 10, targetMax: 20 },
        'level2': { min: 5, max: 15, targetMin: 20, targetMax: 50 },
        'level3': { min: 10, max: 30, targetMin: 50, targetMax: 70 },
        'level4': { min: 15, max: 40, targetMin: 70, targetMax: 100 }
    },
    // 3. Perkalian/Pembagian 2x2
    'times_2x2': {
        gridDim: 2,
        isMultiplication: true,
        'level1': { min: 2, max: 5, targetMin: 4, targetMax: 25 }, 
        'level2': { min: 4, max: 8, targetMin: 16, targetMax: 64 }, 
        'level3': { min: 6, max: 10, targetMin: 36, targetMax: 100 }, 
        'level4': { min: 8, max: 12, targetMin: 64, targetMax: 144 } 
    },
    // 4. Perkalian/Pembagian 3x3
    'times_3x3': {
        gridDim: 3,
        isMultiplication: true,
        'level1': { min: 1, max: 3, targetMin: 1, targetMax: 27 }, 
        'level2': { min: 2, max: 5, targetMin: 8, targetMax: 125 }, 
        'level3': { min: 3, max: 7, targetMin: 27, targetMax: 343 },
        'level4': { min: 4, max: 8, targetMin: 64, targetMax: 512 }
    }
};

// --- FUNGSI HELPER ---

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- FUNGSI GENERATOR PUZZLE ---

function generateRandomPuzzle(operationKey, levelKey) {
    const operationConfig = LEVEL_CONFIG[operationKey];
    const levelConfig = operationConfig[levelKey];
    const gridDim = operationConfig.gridDim; 
    const isMultiplication = operationConfig.isMultiplication;
    
    const answers = {};
    const fixed = {};
    const sums = {};
    const numToFix = gridDim === 3 ? 4 : 2; 
    
    let rows = Array(gridDim).fill(isMultiplication ? 1 : 0); 
    let cols = Array(gridDim).fill(isMultiplication ? 1 : 0);
    
    for (let r = 0; r < gridDim; r++) {
        for (let c = 0; c < gridDim; c++) {
            const key = `c${r + 1}${c + 1}`;
            let value = getRandomInt(levelConfig.min, levelConfig.max); 
            
            answers[key] = value;
            
            if (!isMultiplication) { 
                rows[r] += value;
                cols[c] += value;
            } else { 
                rows[r] *= value;
                cols[c] *= value;
            }
        }
    }
    
    const allKeys = Object.keys(answers);
    const shuffledKeys = allKeys.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numToFix && i < allKeys.length; i++) {
        const key = shuffledKeys[i];
        fixed[key] = answers[key];
    }
    
    for (let i = 0; i < gridDim; i++) {
        sums[`r${i + 1}`] = rows[i];
        sums[`c${i + 1}`] = cols[i];
    }

    const opText = isMultiplication ? 'Perkalian/Pembagian' : 'Penjumlahan/Pengurangan';
    const dimText = `${gridDim}x${gridDim}`;
    return {
        id: new Date().getTime(),
        gridDim: gridDim,
        operation: operationKey,
        title: `Misi ${opText} (${dimText}) | Kekuatan Level ${levelKey.slice(-1)}`,
        answer: answers,
        fixedCells: fixed,
        sums: sums
    };
}


// --- FUNGSI UTAMA GAME FLOW ---

function selectOption(type, value, buttonPrefix) {
    let containerClass;
    let selectedValue;

    if (type === 'time') {
        selectedTime = value;
        containerClass = '.option-btn-time';
        selectedValue = selectedTime;
    } else if (type === 'level') {
        selectedLevelKey = value;
        containerClass = '.option-btn-level';
        selectedValue = selectedLevelKey;
    } else if (type === 'operation') { 
        selectedOperation = value;
        containerClass = '.option-btn-operation';
        selectedValue = selectedOperation;
    }

    document.querySelectorAll(containerClass).forEach(btn => {
        btn.classList.remove('selected-btn');
        btn.classList.remove('bg-gray-400', 'bg-mat-info', 'bg-mat-primary', 'bg-mat-accent', 'bg-mat-danger');
        
        // Tetapkan warna default yang cerah (mengikuti warna Tailwind yang didefinisikan)
        if (type === 'time') {
             if (btn.id === 'btn-time-90') btn.classList.add('bg-mat-primary');
             else if (btn.id === 'btn-time-60') btn.classList.add('bg-mat-accent');
             else if (btn.id === 'btn-time-30') btn.classList.add('bg-mat-danger');
             else if (btn.id === 'btn-time-unlimited') btn.classList.add('bg-mat-info');
        } else if (type === 'operation') {
             if (btn.id.includes('plus')) btn.classList.add('bg-mat-info');
             else if (btn.id.includes('times')) btn.classList.add('bg-mat-primary');
        } else if (type === 'level') {
             btn.classList.add('bg-gray-400');
        }
    });

    // Tandai tombol yang dipilih
    const selectedBtn = document.getElementById(`${buttonPrefix}${selectedValue}`);
    selectedBtn.classList.remove('bg-gray-400', 'bg-mat-info', 'bg-mat-primary', 'bg-mat-accent', 'bg-mat-danger');
    selectedBtn.classList.add('selected-btn');
    
    if (selectedTime && selectedLevelKey && selectedOperation) {
        document.getElementById('start-btn').disabled = false;
    }
}

function startGame() {
    const nameInput = document.getElementById('student-name').value.trim();
    if (!nameInput || !selectedTime || !selectedLevelKey || !selectedOperation) {
        alert("Mohon masukkan nama dan lengkapi ketiga pilihan di atas!");
        return;
    }

    // Perbaikan: Hapus logika yang mengaktifkan/menonaktifkan tombol di sini jika sudah ada di selectOption
    document.getElementById('start-btn').disabled = true;

    currentPuzzle = generateRandomPuzzle(selectedOperation, selectedLevelKey);
    
    document.getElementById('display-name').textContent = nameInput;
    document.getElementById('name-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    loadPuzzle(currentPuzzle);
    startTimer(selectedTime); // Mengirim 'unlimited' jika dipilih
}

function loadPuzzle(puzzle) {
    
    document.getElementById('puzzle-title').textContent = puzzle.title;
    document.getElementById('puzzle-grid-container').innerHTML = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('check-btn').disabled = false;
    document.getElementById('retry-btn').classList.add('hidden');

    const gridHTML = createGridHTML(puzzle, false);
    const keyHTML = createGridHTML(puzzle, true);
    
    // Penyesuaian agar grid tampil dengan benar
    const gridCols = `grid-cols-${puzzle.gridDim + 1}`;
    
    document.getElementById('puzzle-grid-container').innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 w-full justify-center items-start">
            <div id="puzzle-grid-${puzzle.id}" class="flex-1 flex flex-col items-center bg-white/50 p-6 rounded-xl shadow-lg border-4 border-mat-accent/50">
                <h3 class="text-2xl font-semibold mb-4 text-mat-dark">Soal Seru! 🧩</h3>
                <div class="grid ${gridCols} gap-2">${gridHTML}</div>
            </div>
            <div id="puzzle-key-${puzzle.id}" class="hidden flex-1 flex flex-col items-center bg-green-50/50 p-6 rounded-xl shadow-lg border-4 border-mat-primary/50">
                <h3 class="text-2xl font-semibold mb-4 text-mat-primary">Kunci Jawaban! 🗝️</h3>
                <div class="grid ${gridCols} gap-2">${keyHTML}</div>
            </div>
        </div>
    `;
    
    // Pastikan elemen grid telah dimuat sebelum menginisialisasi input fields
    setTimeout(() => {
        initializeInputFields(puzzle);
    }, 100);
}

/**
 * Fungsi untuk memulai timer atau menampilkan mode longgar
 * @param {number|string} duration - Durasi dalam detik atau string 'unlimited'
 */
function startTimer(duration) {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timer-display');
    
    if (duration === 'unlimited') {
        timerDisplay.innerHTML = `Waktu: 🧠<span class="text-mat-primary font-extrabold">Longgar</span>`;
        // Set timeLeft ke nilai yang besar agar checkPuzzle(false) tidak menganggap waktu habis
        timeLeft = 999999; 
        return; // Hentikan fungsi, tidak perlu timer interval
    }

    // Logika Timer Berwaktu
    timeLeft = duration;
    timerDisplay.innerHTML = `Waktu: ⏳<span class="text-mat-accent">${timeLeft}s</span>`;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 10) {
            timerDisplay.innerHTML = `Waktu: ⏳<span class="text-mat-danger font-extrabold">${timeLeft}s</span>`;
        } else {
            timerDisplay.innerHTML = `Waktu: ⏳<span class="text-mat-accent">${timeLeft}s</span>`;
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.innerHTML = `Waktu: 💀<span class="text-mat-danger font-extrabold">Habis!</span>`;
            checkPuzzle(true); 
        }
    }, 1000);
}


/**
 * Fungsi untuk membangun HTML grid puzzle/key.
 * FUNGSI INI HANYA MEMBANGUN HTML, TIDAK MELAKUKAN PERHITUNGAN.
 */
function createGridHTML(puzzle, isKey) {
    let html = '';
    const prefix = isKey ? 'k' : '';
    const gridDim = puzzle.gridDim; 
    
    // Looping melalui baris
    for (let r = 1; r <= gridDim; r++) {
        // Looping melalui kolom (sel grid)
        for (let c = 1; c <= gridDim; c++) {
            const cellId = `c${r}${c}`;
            const fixedValue = puzzle.fixedCells[cellId];
            const answerValue = puzzle.answer[cellId]; 
            
            if (!isKey && fixedValue !== undefined) {
                // Mode Puzzle: Tampilkan angka tetap
                html += `<div id="${prefix}${cellId}" class="puzzle-cell fixed-cell">${fixedValue}</div>`;
            } else if (isKey) {
                // Mode Kunci: Tampilkan jawaban
                const bgColor = puzzle.fixedCells[cellId] !== undefined ? '#CFD8DC' : '#FFFDE7';
                const textColor = '#3E2723';
                html += `<div id="${prefix}${cellId}" class="puzzle-cell" style="background-color: ${bgColor}; color: ${textColor}; box-shadow: 0 4px 0 0 #A1887F;">${answerValue}</div>`;
            } else {
                // Mode Puzzle: Tampilkan wadah untuk kolom input
                html += `<div id="${prefix}${cellId}" class="puzzle-cell"></div>`;
            }
        }
        // Tambahkan Total Baris/Hasil 
        html += `<div class="puzzle-cell bg-mat-info/80 border-mat-info shadow-none font-extrabold">${puzzle.sums[`r${r}`]}</div>`;
    }

    // Tambahkan Baris Total Kolom/Hasil 
    for (let c = 1; c <= gridDim; c++) {
        html += `<div class="puzzle-cell bg-mat-primary/80 border-mat-primary shadow-none font-extrabold">${puzzle.sums[`c${c}`]}</div>`;
    }
    // Tambahkan sel Sudut (kosong)
    html += `<div class="puzzle-cell bg-transparent border-transparent shadow-none"></div>`; 
    
    return html;
}

function initializeInputFields(puzzle) {
    const allCells = Object.keys(puzzle.answer);
    const inputCells = allCells.filter(cellId => puzzle.fixedCells[cellId] === undefined);
    
    const operationConfig = LEVEL_CONFIG[selectedOperation];
    const levelConfig = operationConfig[selectedLevelKey];
    
    let maxLength = 2;
    if (levelConfig.max >= 100) {
        maxLength = 3;
    } else if (levelConfig.max < 10) {
        maxLength = 1;
    }


    inputCells.forEach(cellId => {
        const cell = document.getElementById(cellId);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.maxLength = maxLength; 
        input.id = `input-${cellId}`;
        input.classList.add('puzzle-input');
        
        input.oninput = function() {
            if (this.value.length > this.maxLength) {
                this.value = this.value.slice(0, this.maxLength);
            }
        };
        
        cell.innerHTML = '';
        cell.appendChild(input);
    });
}

function displayKey(puzzleId) {
    const keyElement = document.getElementById(`puzzle-key-${puzzleId}`);
    if (keyElement) {
        keyElement.classList.remove('hidden');
    }
}

/**
 * Fungsi untuk mengecek jawaban siswa
 */
function checkPuzzle(isTimeUp = false) {
    clearInterval(timerInterval); 
    
    const puzzle = currentPuzzle; 
    const allCells = Object.keys(puzzle.answer);
    const inputCells = allCells.filter(cellId => puzzle.fixedCells[cellId] === undefined);
    let correctCount = 0;
    const feedbackElement = document.getElementById(`feedback`);
    const checkBtn = document.getElementById('check-btn');
    
    checkBtn.disabled = true;
    document.getElementById('retry-btn').classList.remove('hidden');

    inputCells.forEach(cellId => {
        const inputElement = document.getElementById(`input-${cellId}`);
        if (!inputElement) return;

        const studentAnswer = parseInt(inputElement.value.trim());
        const correctAnswer = puzzle.answer[cellId];
        
        inputElement.disabled = true;

        if (studentAnswer === correctAnswer) {
            inputElement.style.backgroundColor = '#C8E6C9';
            correctCount++;
        } else {
            inputElement.style.backgroundColor = '#FFCDD2';
        }
    });

    if (correctCount === inputCells.length) {
        let timeReport = "";
        if (selectedTime !== 'unlimited') {
            const timeTaken = selectedTime - (isTimeUp ? 0 : timeLeft);
            timeReport = `Wow! Kamu menyelesaikannya dalam ${timeTaken} detik.`;
        } else {
            timeReport = "Misi berhasil diselesaikan!";
        }
        
        feedbackElement.textContent = `🎉 FANTASTIS, ${document.getElementById('display-name').textContent}! Semua jawaban BENAR! ${timeReport} 🎉`;
        feedbackElement.classList.remove('bg-mat-danger/20', 'text-red-500');
        feedbackElement.classList.add('bg-mat-primary/20', 'text-green-700', 'border-4', 'border-mat-primary');
    } else {
        displayKey(puzzle.id); 
        
        if (isTimeUp) {
            feedbackElement.textContent = `❌ Waktu habis! Kamu berhasil menjawab ${correctCount} dari ${inputCells.length}. Coba lagi ya!`;
        } else {
            feedbackElement.textContent = `Jawabanmu benar ${correctCount} dari ${inputCells.length} kotak. Jangan menyerah, coba lagi!`;
        }
        feedbackElement.classList.remove('bg-mat-primary/20', 'text-green-700');
        feedbackElement.classList.add('bg-mat-danger/20', 'text-red-500', 'border-4', 'border-mat-danger');
    }
}

function resetPuzzle() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('name-screen').classList.remove('hidden');
    
    clearInterval(timerInterval);
    
    // Reset tampilan dan variabel
    document.querySelectorAll('.option-btn-time, .option-btn-level, .option-btn-operation').forEach(btn => {
        btn.classList.remove('selected-btn');
        btn.classList.add('bg-gray-400');
        
        // Atur kembali warna khusus tombol Longgar
        if (btn.id === 'btn-time-unlimited') {
             btn.classList.remove('bg-gray-400');
             btn.classList.add('bg-mat-info', 'hover:bg-blue-400');
        } else if (btn.id.includes('plus')) {
             btn.classList.remove('bg-gray-400');
             btn.classList.add('bg-mat-info', 'hover:bg-blue-400');
        } else if (btn.id.includes('times')) {
             btn.classList.remove('bg-gray-400');
             btn.classList.add('bg-mat-primary', 'hover:bg-green-500');
        }
        // Tombol level tetap abu-abu hingga dipilih
    });
    
    document.getElementById('start-btn').disabled = true;
    
    selectedTime = null;
    selectedLevelKey = null;
    selectedOperation = null; 
    currentPuzzle = null;
}