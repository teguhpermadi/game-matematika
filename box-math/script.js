// ====================================================================
// script.js - Logika Game Puzzle Box (Dinamis dengan Opsi Waktu Longgar)
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
        title: `Mode: ${opText} (${dimText}) | Level: ${levelKey.toUpperCase()}`,
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
        btn.classList.add('bg-gray-400');
        // Kustomisasi warna untuk tombol Longgar saat tidak dipilih
        if (btn.id === 'btn-time-unlimited' && !btn.classList.contains('selected-btn')) {
             btn.classList.remove('bg-gray-400');
             btn.classList.add('bg-mat-primary', 'hover:bg-green-600');
        }
    });

    // Tandai tombol yang dipilih
    document.getElementById(`${buttonPrefix}${selectedValue}`).classList.remove('bg-gray-400', 'bg-mat-primary', 'hover:bg-green-600');
    document.getElementById(`${buttonPrefix}${selectedValue}`).classList.add('selected-btn');
    
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
    
    const gridCols = `grid-cols-${puzzle.gridDim + 1}`;
    
    document.getElementById('puzzle-grid-container').innerHTML += `
        <div id="puzzle-grid-${puzzle.id}" class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2 text-gray-700">Soal Anda</h3>
            <div class="grid ${gridCols} gap-1">${gridHTML}</div>
        </div>
        <div id="puzzle-key-${puzzle.id}" class="hidden flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2 text-mat-primary">Kunci Jawaban</h3>
            <div class="grid ${gridCols} gap-1 border-4 border-mat-primary p-1 rounded-md">
                ${keyHTML}
            </div>
        </div>
    `;
    
    initializeInputFields(puzzle);
}

/**
 * Fungsi untuk memulai timer atau menampilkan mode longgar
 * @param {number|string} duration - Durasi dalam detik atau string 'unlimited'
 */
function startTimer(duration) {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timer-display');
    
    if (duration === 'unlimited') {
        timerDisplay.innerHTML = `Waktu: 🧠<span class="text-mat-primary">Longgar (Tanpa Batas)</span>`;
        // Set timeLeft ke nilai yang besar agar checkPuzzle(false) tidak menganggap waktu habis
        timeLeft = 999999; 
        return; // Hentikan fungsi, tidak perlu timer interval
    }

    // Logika Timer Berwaktu
    timeLeft = duration;
    timerDisplay.innerHTML = `Waktu: ⏳<span class="text-mat-primary">${timeLeft}s</span>`;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 10) {
            timerDisplay.innerHTML = `Waktu: ⏳<span class="text-mat-danger">${timeLeft}s</span>`;
        } else {
            timerDisplay.innerHTML = `Waktu: ⏳<span class="text-mat-primary">${timeLeft}s</span>`;
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.innerHTML = `Waktu: 💀<span class="text-mat-danger">0s - Habis!</span>`;
            checkPuzzle(true); 
        }
    }, 1000);
}


function createGridHTML(puzzle, isKey) {
    let html = '';
    const prefix = isKey ? 'k' : '';
    const gridDim = puzzle.gridDim; 
    
    for (let r = 1; r <= gridDim; r++) {
        for (let c = 1; c <= gridDim; c++) {
            const cellId = `c${r}${c}`;
            const fixedValue = puzzle.fixedCells[cellId];
            const answerValue = puzzle.answer[cellId];
            
            if (fixedValue !== undefined && !isKey) {
                html += `<div id="${prefix}${cellId}" class="puzzle-cell fixed-cell">${fixedValue}</div>`;
            } else if (isKey) {
                const bgColor = puzzle.fixedCells[cellId] !== undefined ? '#CFD8DC' : '#FFFDE7';
                const textColor = '#1B5E20';
                html += `<div id="${prefix}${cellId}" class="puzzle-cell" style="background-color: ${bgColor}; color: ${textColor};">${answerValue}</div>`;
            } else {
                html += `<div id="${prefix}${cellId}" class="puzzle-cell"></div>`;
            }
        }
        html += `<div class="puzzle-cell bg-gray-200">${puzzle.sums[`r${r}`]}</div>`;
    }

    for (let c = 1; c <= gridDim; c++) {
        html += `<div class="puzzle-cell bg-gray-200">${puzzle.sums[`c${c}`]}</div>`;
    }
    html += `<div class="puzzle-cell bg-transparent border-transparent"></div>`; 
    
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
            timeReport = `Anda menyelesaikannya dalam ${timeTaken} detik.`;
        } else {
            timeReport = "Anda menyelesaikannya tanpa batas waktu.";
        }
        
        feedbackElement.textContent = `🎉 SELAMAT, ${document.getElementById('display-name').textContent}! Semua jawaban BENAR! ${timeReport}`;
        feedbackElement.classList.remove('text-red-500', 'text-blue-600');
        feedbackElement.classList.add('text-green-600');
    } else {
        displayKey(puzzle.id); 
        
        if (isTimeUp) {
            feedbackElement.textContent = `❌ Waktu habis! Anda berhasil menjawab ${correctCount} dari ${inputCells.length}. Kunci jawaban telah ditampilkan.`;
        } else {
            feedbackElement.textContent = `Anda menjawab benar ${correctCount} dari ${inputCells.length} kotak. Silakan lihat kunci jawaban di samping dan coba lagi!`;
        }
        feedbackElement.classList.remove('text-green-600');
        feedbackElement.classList.add('text-red-500');
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
             btn.classList.add('bg-mat-primary', 'hover:bg-green-600');
        }
    });
    
    document.getElementById('start-btn').disabled = true;
    
    selectedTime = null;
    selectedLevelKey = null;
    selectedOperation = null; 
    currentPuzzle = null;
}