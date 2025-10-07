// ====================================================================
// script.js - Logika Game Puzzle Box (Dinamis)
// ====================================================================

let selectedTime = null;
let selectedLevelKey = null;
let currentPuzzle = null; // Menyimpan puzzle yang sedang dimainkan (generated)
let timerInterval = null;
let timeLeft = 0;

// --- DATA KONFIGURASI LEVEL SOAL ---
const LEVEL_CONFIG = {
    'level1': { min: 3, max: 7, targetMin: 10, targetMax: 20 }, // Angka internal kecil
    'level2': { min: 5, max: 15, targetMin: 20, targetMax: 50 }, // Angka internal sedang
    'level3': { min: 10, max: 30, targetMin: 50, targetMax: 70 }, // Angka internal besar
    'level4': { min: 15, max: 40, targetMin: 70, targetMax: 100 } // Angka internal sangat besar
};

// --- FUNGSI HELPER ---

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- FUNGSI GENERATOR PUZZLE (Inti Perubahan) ---

function generateRandomPuzzle(levelKey) {
    const config = LEVEL_CONFIG[levelKey];
    const cells = {};
    const fixed = {};
    const answers = {};
    const rows = [0, 0, 0];
    const cols = [0, 0, 0];
    const totalCells = 9;
    const numToFix = 4; // Jumlah sel yang akan diisi di awal (fixed cells)
    
    // 1. Generate angka acak untuk 9 sel (c11 hingga c33)
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const key = `c${r + 1}${c + 1}`;
            // Angka acak berdasarkan min/max Level Config
            let value = getRandomInt(config.min, config.max); 
            cells[key] = value;
            answers[key] = value; // Kunci jawaban
            
            rows[r] += value;
            cols[c] += value;
        }
    }
    
    // 2. Terapkan batasan hasil penjumlahan (TargetMin/Max)
    // Cek apakah hasilnya terlalu besar atau kecil, jika ya, sesuaikan salah satu angka di baris/kolom tersebut.
    // Catatan: Generator ini sederhana, jadi mungkin ada hasil yang sedikit di luar batas, tapi angkanya acak.
    
    // 3. Tentukan 4 sel yang akan di-fixed (ditampilkan)
    const allKeys = Object.keys(answers);
    const shuffledKeys = allKeys.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numToFix; i++) {
        const key = shuffledKeys[i];
        fixed[key] = answers[key];
    }
    
    // 4. Susun objek puzzle
    return {
        id: new Date().getTime(), // ID unik untuk puzzle ini
        title: `Level Soal: ${levelKey.toUpperCase()} (Hasil ${config.targetMin}-${config.targetMax})`,
        answer: answers,
        fixedCells: fixed,
        sums: { 'r1': rows[0], 'r2': rows[1], 'r3': rows[2], 'c1': cols[0], 'c2': cols[1], 'c3': cols[2] }
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
    }

    // Reset semua tombol di kategori yang dipilih
    document.querySelectorAll(containerClass).forEach(btn => {
        btn.classList.remove('selected-btn');
    });

    // Tandai tombol yang dipilih
    document.getElementById(`${buttonPrefix}${selectedValue}`).classList.add('selected-btn');
    
    // Cek apakah start button bisa diaktifkan
    if (selectedTime && selectedLevelKey) {
        document.getElementById('start-btn').disabled = false;
    }
}

function startGame() {
    const nameInput = document.getElementById('student-name').value.trim();
    if (!nameInput || !selectedTime || !selectedLevelKey) {
        alert("Mohon masukkan nama, pilih waktu, dan pilih tingkat soal terlebih dahulu!");
        return;
    }

    // GENERATE PUZZLE BARU SETIAP KALI START
    currentPuzzle = generateRandomPuzzle(selectedLevelKey);
    
    document.getElementById('display-name').textContent = nameInput;
    document.getElementById('name-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    loadPuzzle(currentPuzzle);
    startTimer(selectedTime);
}

// Gunakan 'puzzle' sebagai argumen, bukan 'puzzleId'
function loadPuzzle(puzzle) {
    
    // Reset tampilan
    document.getElementById('puzzle-title').textContent = puzzle.title;
    document.getElementById('puzzle-grid-container').innerHTML = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('check-btn').disabled = false;
    document.getElementById('retry-btn').classList.add('hidden');

    // Buat grid Soal (Interaktif) dan Kunci Jawaban (Tersembunyi)
    const gridHTML = createGridHTML(puzzle, false);
    const keyHTML = createGridHTML(puzzle, true);
    
    document.getElementById('puzzle-grid-container').innerHTML += `
        <div id="puzzle-grid-${puzzle.id}" class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2 text-gray-700">Soal Anda</h3>
            <div class="grid grid-cols-4 gap-1">${gridHTML}</div>
        </div>
        <div id="puzzle-key-${puzzle.id}" class="hidden flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2 text-mat-primary">Kunci Jawaban</h3>
            <div class="grid grid-cols-4 gap-1 border-4 border-mat-primary p-1 rounded-md">
                ${keyHTML}
            </div>
        </div>
    `;
    
    // Isi input field setelah HTML di-render
    initializeInputFields(puzzle);
}

function startTimer(duration) {
    clearInterval(timerInterval);
    timeLeft = duration;
    const timerDisplay = document.getElementById('timer-display');
    
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
    
    for (let r = 1; r <= 3; r++) {
        for (let c = 1; c <= 3; c++) {
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

    for (let c = 1; c <= 3; c++) {
        html += `<div class="puzzle-cell bg-gray-200">${puzzle.sums[`c${c}`]}</div>`;
    }
    html += `<div class="puzzle-cell bg-transparent border-transparent"></div>`;
    
    return html;
}

function initializeInputFields(puzzle) {
    const allCells = Object.keys(puzzle.answer);
    const inputCells = allCells.filter(cellId => puzzle.fixedCells[cellId] === undefined);
    
    // Tentukan nilai max length input berdasarkan Level Angka
    const config = LEVEL_CONFIG[selectedLevelKey];
    const maxLength = config.max < 100 ? 2 : 3; // Jika max < 100, max length 2 digit

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
    
    const puzzle = currentPuzzle; // Gunakan currentPuzzle yang sudah digenerate
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
        const timeTaken = selectedTime - (isTimeUp ? 0 : timeLeft);
        feedbackElement.textContent = `🎉 SELAMAT, ${document.getElementById('display-name').textContent}! Semua jawaban BENAR! Anda menyelesaikannya dalam ${timeTaken} detik.`;
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
    document.querySelectorAll('.option-btn-time, .option-btn-level').forEach(btn => {
        btn.classList.remove('selected-btn');
        btn.classList.add('bg-gray-400');
    });
    document.getElementById('start-btn').disabled = true;
    
    selectedTime = null;
    selectedLevelKey = null;
    currentPuzzle = null;
}