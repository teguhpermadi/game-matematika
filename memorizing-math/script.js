const mainContainer = document.getElementById('main-container');
let userName = '';
let mode = ''; // 'latihan' atau 'tes'
let operation = ''; // 'perkalian', 'pembagian', 'pembagian_bersusun'
let number = 0; // Angka tabel (1-10) atau jenis multi-digit ('campuran', '2x1', 'campuran-div', dll.)
let totalQuestions = 0;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let testAnswers = [];
let timerSeconds = 30; // Batas waktu default per soal
let startTimePerQuestion;
let totalTimeElapsed = 0;
let selectedMultiplicationTables = [];

// --- UTILITY FUNCTIONS ---

// Fungsi animasi menggunakan anime.js
function animateElement(selector) {
    anime({
        targets: selector,
        scale: [0.95, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

// Helper function untuk mendapatkan nama tampilan dari tipe soal
function getMultiplicationDisplayName(numberType) {
    const displayNames = {
        'campuran': 'Perkalian Dasar Campuran (1-10)',
        'campuran-div': 'Pembagian Dasar Campuran (1-10)',
        '2x1': 'Perkalian 2 Digit × 1 Digit',
        '3x1': 'Perkalian 3 Digit × 1 Digit',
        '2x2': 'Perkalian 2 Digit × 2 Digit',
        '3x2': 'Perkalian 3 Digit × 2 Digit',
        '2d1d': 'Pembagian Bersusun 2 Digit ÷ 1 Digit',
        '3d1d': 'Pembagian Bersusun 3 Digit ÷ 1 Digit',
        '4d1d': 'Pembagian Bersusun 4 Digit ÷ 1 Digit',
        '5d1d': 'Pembagian Bersusun 5 Digit ÷ 1 Digit'
    };
    return displayNames[numberType] || `Tabel ${numberType}`;
}

// Tampilkan pesan kesalahan
function showAlert(message) {
    const alertBox = document.getElementById('alert-message');
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
    anime({
        targets: alertBox,
        translateY: [-10, 0],
        opacity: [0, 1],
        duration: 300
    });
}

// Tampilkan pesan kesalahan untuk tabel selection
function showTableAlert(message) {
    const alertBox = document.getElementById('table-alert-message');
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
    anime({
        targets: alertBox,
        translateY: [-10, 0],
        opacity: [0, 1],
        duration: 300
    });
}

// --- FUNGSI RENDER HALAMAN ---

// Tampilkan halaman awal
function renderStartPage() {
    clearInterval(timerInterval);
    mainContainer.innerHTML = `
        <div id="start-screen" class="space-y-6">
            <h1 class="text-4xl font-extrabold text-pink-600 mb-4">Aplikasi Latihan Matematika 🥳</h1>
            <p class="text-gray-600">Selamat datang, calon juara! Masukkan nama Anda untuk memulai.</p>
            <input type="text" id="name-input" placeholder="Nama Anda" class="w-full px-4 py-3 text-lg border-2 border-pink-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all duration-300 shadow-inner">
            <button onclick="setName()" class="w-full py-3 text-lg font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors duration-300 transform hover:scale-[1.01]">Mulai Petualangan</button>
            <div id="alert-message" class="mt-4 hidden p-3 bg-red-100 text-red-700 rounded-lg font-medium border border-red-300"></div>
        </div>
    `;
    animateElement('#start-screen');
    document.getElementById('name-input').focus();
}

// Simpan nama dan tampilkan halaman pilihan operasi
function setName() {
    const nameInput = document.getElementById('name-input');
    userName = nameInput.value.trim();
    if (userName) {
        renderOperationSelection();
    } else {
        showAlert("Silakan masukkan nama Anda!");
    }
}

// Tampilkan halaman pilihan operasi (Perkalian atau Pembagian)
function renderOperationSelection() {
    mainContainer.innerHTML = `
        <div id="operation-screen" class="space-y-6">
            <h1 class="text-4xl font-bold text-gray-800">Hai, ${userName}! Pilih Challenge-mu! 🏆</h1>
            <p class="text-gray-600">Pilih operasi matematika yang ingin Anda latih:</p>
            <div class="space-y-4">
                <button onclick="setOperation('perkalian')" class="w-full py-4 text-xl font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-lg">Perkalian <span class="text-2xl ml-2">✖️</span></button>
                <button onclick="setOperation('pembagian')" class="w-full py-4 text-xl font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-lg">Pembagian <span class="text-2xl ml-2">➗</span></button>
            </div>
            <button onclick="renderStartPage()" class="mt-6 w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Ganti Nama</button>
        </div>
    `;
    animateElement('#operation-screen');
}

// Simpan operasi dan tampilkan halaman pilihan mode atau submenu pembagian
function setOperation(selectedOperation) {
    operation = selectedOperation;
    if (selectedOperation === 'pembagian') {
        renderDivisionTypeSelection();
    } else {
        renderModeSelection();
    }
}

// Tampilkan halaman pilihan tipe pembagian
function renderDivisionTypeSelection() {
    mainContainer.innerHTML = `
        <div id="division-type-screen" class="space-y-6">
            <h1 class="text-4xl font-bold text-gray-800">Pilih Tipe Pembagian 💡</h1>
            <p class="text-gray-600">Pilih jenis pembagian yang ingin Anda latih:</p>
            <div class="space-y-4">
                <button onclick="setDivisionType('biasa')" class="w-full py-4 text-xl font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-lg">Pembagian Biasa (Hafalan)</button>
                <button onclick="setDivisionType('bersusun')" class="w-full py-4 text-xl font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-lg">Pembagian Bersusun (Langkah Panjang)</button>
            </div>
            <button onclick="renderOperationSelection()" class="mt-6 w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Kembali</button>
        </div>
    `;
    animateElement('#division-type-screen');
}

// Simpan tipe pembagian dan lanjut ke mode selection atau langsung ke number selection
function setDivisionType(divisionType) {
    if (divisionType === 'biasa') {
        operation = 'pembagian';
        renderModeSelection();
    } else {
        operation = 'pembagian_bersusun';
        mode = 'tes'; // Langsung set ke mode tes untuk pembagian bersusun
        renderNumberSelection();
    }
}

// Tampilkan halaman pilihan mode (Latihan atau Tes)
function renderModeSelection() {
    const opDisplay = operation === 'perkalian' ? 'Perkalian' : 'Pembagian Biasa';
    mainContainer.innerHTML = `
        <div id="mode-screen" class="space-y-6">
            <h1 class="text-4xl font-bold text-gray-800">Pilih Mode Latihan ${opDisplay} 🎯</h1>
            <p class="text-gray-600">Pilih cara Anda ingin berlatih:</p>
            <div class="space-y-4">
                <button onclick="setMode('latihan')" class="w-full py-4 text-xl font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-lg">Latihan Hafalan (Flash Card) 💡</button>
                <button onclick="setMode('tes')" class="w-full py-4 text-xl font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-lg">Tes Hafalan (Isian Singkat) 📝</button>
            </div>
            <button onclick="renderOperationSelection()" class="mt-6 w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Kembali</button>
        </div>
    `;
    animateElement('#mode-screen');
}

// Simpan mode dan tampilkan halaman pilihan angka
function setMode(selectedMode) {
    mode = selectedMode;
    renderNumberSelection();
}

// Tampilkan halaman pilihan angka (REVISI PEMBAGIAN CAMPURAN)
function renderNumberSelection() {
    let numberSelectionHTML = '';
    let isMultiplication = operation === 'perkalian';
    let isLongDivision = operation === 'pembagian_bersusun';

    if (isMultiplication) {
        numberSelectionHTML = `
            <div class="space-y-4">
                <h3 class="text-xl font-semibold text-gray-700">Perkalian Dasar (1-10)</h3>
                <button onclick="setNumber('campuran')" class="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-[1.02]">Tes Campuran (1-10) 🎲</button>
                <div class="grid grid-cols-5 gap-3">
                    ${Array.from({length: 10}, (_, i) => i + 1).map(num => `
                        <button onclick="setNumber(${num})" class="w-full py-3 text-lg font-semibold text-white bg-pink-500 rounded-xl hover:bg-pink-600 transition-colors duration-300 transform hover:scale-[1.02]">${num}</button>
                    `).join('')}
                </div>
        `;

        if (mode === 'tes') {
            numberSelectionHTML += `
                <h3 class="text-xl font-semibold text-gray-700 mt-6">Perkalian Multi-Digit</h3>
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="setNumber('2x1')" class="py-3 text-md font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors duration-300 transform hover:scale-[1.02]">2 Digit × 1 Digit</button>
                    <button onclick="setNumber('3x1')" class="py-3 text-md font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors duration-300 transform hover:scale-[1.02]">3 Digit × 1 Digit</button>
                    <button onclick="setNumber('2x2')" class="py-3 text-md font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors duration-300 transform hover:scale-[1.02]">2 Digit × 2 Digit</button>
                    <button onclick="setNumber('3x2')" class="py-3 text-md font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors duration-300 transform hover:scale-[1.02]">3 Digit × 2 Digit</button>
                </div>
            `;
        }
        numberSelectionHTML += `</div>`;
    } else if (isLongDivision) {
        numberSelectionHTML = `
            <div class="space-y-4">
                <h3 class="text-xl font-semibold text-gray-700">Pembagian Bersusun (Divisor 1 Digit)</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onclick="setNumber('2d1d')" class="py-3 text-lg font-semibold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-colors duration-300 transform hover:scale-[1.02]">2 Digit</button>
                    <button onclick="setNumber('3d1d')" class="py-3 text-lg font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors duration-300 transform hover:scale-[1.02]">3 Digit</button>
                    <button onclick="setNumber('4d1d')" class="py-3 text-lg font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors duration-300 transform hover:scale-[1.02]">4 Digit</button>
                    <button onclick="setNumber('5d1d')" class="py-3 text-lg font-semibold text-white bg-pink-600 rounded-xl hover:bg-pink-700 transition-colors duration-300 transform hover:scale-[1.02]">5 Digit</button>
                </div>
            </div>
        `;
    } else { // Pembagian Biasa
        numberSelectionHTML = `
            <div class="space-y-4">
                <h3 class="text-xl font-semibold text-gray-700">Pembagian Dasar (Hasil 1-10)</h3>
                <button onclick="setNumber('campuran-div')" class="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-[1.02]">Tes Campuran (1-10) 🎲</button>
                <div class="grid grid-cols-5 gap-3">
                    ${Array.from({length: 10}, (_, i) => i + 1).map(num => `
                        <button onclick="setNumber(${num})" class="w-full py-3 text-lg font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors duration-300 transform hover:scale-[1.02]">${num}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const backButtonHandler = isLongDivision ? 'renderDivisionTypeSelection()' : 'renderModeSelection()';

    mainContainer.innerHTML = `
        <div id="number-screen" class="space-y-6">
            <h1 class="text-3xl font-bold text-gray-800">Pilih Angka Tabel 🔢</h1>
            <p class="text-gray-600">Pilih tabel ${isMultiplication ? 'perkalian' : 'pembagian'} yang ingin Anda kuasai:</p>
            ${numberSelectionHTML}
            <button onclick="${backButtonHandler}" class="mt-6 w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Kembali</button>
        </div>
    `;
    animateElement('#number-screen');
}

// Simpan angka dan tampilkan halaman pilihan tabel perkalian (jika multi-digit) atau jumlah soal
function setNumber(selectedNumber) {
    number = selectedNumber;
    // Jika memilih perkalian multi-digit, tanyakan tabel perkalian yang sudah dihafal
    if (['2x1', '3x1', '4x1', '2x2', '3x2', '4x2'].includes(String(selectedNumber))) {
        renderMultiplicationTableSelection();
    } else {
        renderQuestionCountSelection();
    }
}

// Tampilkan halaman pilihan tabel perkalian yang sudah dihafal (untuk multi-digit)
function renderMultiplicationTableSelection() {
    mainContainer.innerHTML = `
        <div id="table-selection-screen" class="space-y-6">
            <h1 class="text-3xl font-bold text-gray-800">Perkalian Multi-Digit: Tabel Hafalan 📚</h1>
            <p class="text-gray-600">Pilih **semua** tabel perkalian dasar (1-10) yang sudah Anda kuasai. Ini akan menjadi **pengali/pembagi** dalam soal ${getMultiplicationDisplayName(number)}:</p>
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
                    ${Array.from({length: 10}, (_, i) => i + 1).map(num => `
                        <label class="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded-lg shadow-sm hover:bg-blue-100 transition-colors">
                            <input type="checkbox" id="table-${num}" value="${num}" class="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-base font-medium text-gray-700">Tabel ${num}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="flex space-x-4">
                <button onclick="selectAllTables()" class="flex-1 py-3 text-md font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors duration-300">Pilih Semua</button>
                <button onclick="clearAllTables()" class="flex-1 py-3 text-md font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors duration-300">Hapus Semua</button>
            </div>
            <button onclick="confirmTableSelection()" class="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-[1.01]">Lanjutkan ke Jumlah Soal</button>
            <button onclick="renderNumberSelection()" class="w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Kembali</button>
            <div id="table-alert-message" class="mt-4 hidden p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium"></div>
        </div>
    `;
    animateElement('#table-selection-screen');
}

// Pilih semua tabel perkalian
function selectAllTables() {
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`table-${i}`).checked = true;
    }
}

// Hapus semua pilihan tabel perkalian
function clearAllTables() {
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`table-${i}`).checked = false;
    }
}

// Konfirmasi pilihan tabel perkalian
function confirmTableSelection() {
    selectedMultiplicationTables = [];
    for (let i = 1; i <= 10; i++) {
        if (document.getElementById(`table-${i}`).checked) {
            selectedMultiplicationTables.push(i);
        }
    }

    if (selectedMultiplicationTables.length === 0) {
        showTableAlert("Silakan pilih minimal satu tabel perkalian sebagai pengali!");
        return;
    }

    renderQuestionCountSelection();
}

// Tampilkan halaman pilihan jumlah soal
function renderQuestionCountSelection() {
    let options = [];
    const isMultiDigit = ['campuran', 'campuran-div', '2x1', '3x1', '4x1', '2x2', '3x2', '4x2', '2d1d', '3d1d', '4d1d', '5d1d'].includes(String(number));

    if (isMultiDigit) {
        options = [10, 15, 20];
    } else {
        options = [5, 10, 15, 20];
    }

    mainContainer.innerHTML = `
        <div id="count-screen" class="space-y-6">
            <h1 class="text-3xl font-bold text-gray-800">Pilih Jumlah Soal ❓</h1>
            <p class="text-gray-600">Pilih berapa soal yang ingin Anda kerjakan untuk ${getMultiplicationDisplayName(number)}:</p>
            <div class="grid grid-cols-2 gap-4">
                ${options.map(count => `
                    <button onclick="setQuestionCount(${count})" class="py-3 text-lg font-semibold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-md">${count} Soal</button>
                `).join('')}
            </div>
            <button onclick="renderNumberSelection()" class="mt-6 w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Kembali</button>
        </div>
    `;
    animateElement('#count-screen');
}

// Simpan jumlah soal dan tampilkan halaman pilihan kesulitan
function setQuestionCount(count) {
    totalQuestions = count;
    // Pembagian Bersusun langsung ke generateQuestions
    if (operation === 'pembagian_bersusun') {
        setDifficulty('longgar'); // Default: Tanpa waktu
    } else {
        renderDifficultySelection();
    }
}

// Tampilkan halaman pilihan kesulitan
function renderDifficultySelection() {
    mainContainer.innerHTML = `
        <div id="difficulty-screen" class="space-y-6">
            <h1 class="text-3xl font-bold text-gray-800">Pilih Tingkat Kesulitan ⏱️</h1>
            <p class="text-gray-600">Pilih batas waktu untuk setiap soal (di mode Tes):</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onclick="setDifficulty('mudah')" class="py-3 text-md font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors duration-300 transform hover:scale-[1.02]">Mudah (30s)</button>
                <button onclick="setDifficulty('sedang')" class="py-3 text-md font-semibold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-colors duration-300 transform hover:scale-[1.02]">Sedang (20s)</button>
                <button onclick="setDifficulty('sulit')" class="py-3 text-md font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors duration-300 transform hover:scale-[1.02]">Sulit (10s)</button>
                <button onclick="setDifficulty('longgar')" class="py-3 text-md font-semibold text-white bg-gray-500 rounded-xl hover:bg-gray-600 transition-colors duration-300 transform hover:scale-[1.02]">Longgar (Tanpa Waktu)</button>
            </div>
            <button onclick="renderQuestionCountSelection()" class="mt-6 w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">⬅️ Kembali</button>
        </div>
    `;
    animateElement('#difficulty-screen');
}

// Simpan kesulitan dan mulai tes atau latihan
function setDifficulty(difficulty) {
    switch(difficulty) {
        case 'mudah':
            timerSeconds = 30;
            break;
        case 'sedang':
            timerSeconds = 20;
            break;
        case 'sulit':
            timerSeconds = 10;
            break;
        case 'longgar':
            timerSeconds = 0; // No time limit
            break;
    }
    generateQuestions();
    currentQuestionIndex = 0;
    score = 0;
    testAnswers = [];
    totalTimeElapsed = 0;
    if (mode === 'latihan') {
        renderFlashcard();
    } else {
        renderTestQuestion();
    }
}

// --- FUNGSI GENERATE SOAL ---

// Buat soal acak tanpa pengulangan berurutan
function generateQuestions() {
    questions = [];
    let possibleNumbers = Array.from({length: 10}, (_, i) => i + 1);
    let lastA = -1;
    let lastB = -1;
    const numberStr = String(number);

    for (let i = 0; i < totalQuestions; i++) {
        let a, b, answer;

        if (operation === 'perkalian') {
            if (numberStr === 'campuran') {
                do {
                    a = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
                    b = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
                } while (a === lastA && b === lastB);
                answer = a * b;
            } else if (['2x1', '3x1'].includes(numberStr)) {
                // Multi-digit x 1 digit (pengali dari selectedMultiplicationTables)
                const numDigits = parseInt(numberStr[0]);
                const min = Math.pow(10, numDigits - 1);
                const max = Math.pow(10, numDigits) - 1;
                do {
                    a = Math.floor(Math.random() * (max - min + 1)) + min;
                    b = selectedMultiplicationTables[Math.floor(Math.random() * selectedMultiplicationTables.length)];
                } while (a === lastA && b === lastB);
                answer = a * b;
            } else if (['2x2', '3x2'].includes(numberStr)) {
                // Multi-digit x 2 digit
                const numDigitsA = parseInt(numberStr[0]);
                const minA = Math.pow(10, numDigitsA - 1);
                const maxA = Math.pow(10, numDigitsA) - 1;
                do {
                    a = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
                    // B: 2 digit, puluhan dari tabel yang dipilih, satuan 0-9
                    let tensDigit = selectedMultiplicationTables[Math.floor(Math.random() * selectedMultiplicationTables.length)];
                    let onesDigit = Math.floor(Math.random() * 10);
                    b = tensDigit * 10 + onesDigit;
                    if (b < 10) b += 10; // Pastikan minimal 2 digit
                } while (a === lastA && b === lastB);
                answer = a * b;
            } else {
                // Perkalian dasar (1-10)
                const fixedNumber = parseInt(number);
                do {
                    a = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
                } while (a === lastA);
                b = fixedNumber;
                answer = a * b;
            }
        } else if (operation === 'pembagian') { // Pembagian biasa
            if (numberStr === 'campuran-div') { // Pembagian Campuran
                do {
                    let multiplier = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
                    b = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)]; // Pembagi 1-10
                    a = b * multiplier; // Pembilang
                    answer = multiplier; // Hasil
                } while (a === lastA && b === lastB);
            } else {
                // Pembagian berdasarkan tabel angka
                const fixedNumber = parseInt(number);
                do {
                    // a = pembilang, b = penyebut, answer = hasil
                    let multiplier = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
                    b = fixedNumber;
                    a = fixedNumber * multiplier;
                    answer = multiplier;
                } while (a === lastA && b === lastB);
            }
        } else if (operation === 'pembagian_bersusun') { // Pembagian bersusun
            const digitMap = { '2d1d': 2, '3d1d': 3, '4d1d': 4, '5d1d': 5 };
            const numDigits = digitMap[numberStr];

            if (numDigits) {
                do {
                    // b = pembagi (divisor) 2-9
                    b = Math.floor(Math.random() * 8) + 2;
                    // quotient = hasil, jumlah digit sesuai pilihan
                    const minQ = Math.pow(10, numDigits - 1);
                    const maxQ = Math.pow(10, numDigits) - 1;
                    let quotient = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ;
                    a = b * quotient; // a = yang dibagi (dividend), pastikan habis dibagi
                    answer = quotient;
                } while (a === lastA && b === lastB);
            }
        }
        questions.push({ a, b, answer });
        lastA = a;
        lastB = b;
    }
}

// --- FUNGSI LATIHAN (FLASHCARD) ---

// Tampilkan flash card
function renderFlashcard() {
    if (currentQuestionIndex >= totalQuestions) {
        renderResultPage();
        return;
    }
    const question = questions[currentQuestionIndex];
    const symbol = operation === 'perkalian' ? 'x' : '÷';
    const questionText = `${question.a} ${symbol} ${question.b}`;

    mainContainer.innerHTML = `
        <div id="flashcard-screen" class="space-y-6">
            <h2 class="text-3xl font-semibold text-gray-700">Flash Card: ${getMultiplicationDisplayName(number)}</h2>
            <div class="w-full max-w-sm mx-auto h-64 p-4 flashcard-container">
                <div id="flashcard" class="relative w-full h-full rounded-2xl shadow-2xl bg-white border-4 border-pink-400 cursor-pointer flashcard" onclick="flipFlashcard()">
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-5xl font-extrabold text-indigo-600 flashcard-face p-4">
                        ${questionText}
                        <p class="text-lg mt-4 text-gray-500 font-normal">Klik untuk melihat jawaban!</p>
                    </div>
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-6xl font-extrabold text-green-600 flashcard-face flashcard-back p-4 bg-green-50 rounded-2xl">
                        ${question.answer}
                    </div>
                </div>
            </div>
            <button onclick="nextFlashcard()" class="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-[1.01]">Soal Berikutnya ( ${currentQuestionIndex + 1} / ${totalQuestions} )</button>
            <button onclick="renderOperationSelection()" class="w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">Keluar Latihan</button>
        </div>
    `;
    animateElement('#flashcard-screen');
}

// Balik flash card
function flipFlashcard() {
    const flashcard = document.getElementById('flashcard');
    // Toggle class untuk animasi flip (Membutuhkan CSS transform: rotateY(180deg) di CSS)
    if (flashcard.style.transform === 'rotateY(180deg)') {
        flashcard.style.transform = 'rotateY(0deg)';
    } else {
        flashcard.style.transform = 'rotateY(180deg)';
    }
}

// Lanjut ke flash card berikutnya
function nextFlashcard() {
    currentQuestionIndex++;
    renderFlashcard();
}

// --- FUNGSI TES (ISIAN SINGKAT) ---

// Update tampilan timer
function updateTimerDisplay(time) {
    const timerDisplay = document.getElementById('timer-display');
    const timerBox = document.getElementById('timer-box');
    if (timerDisplay) {
        timerDisplay.textContent = time;
        if (time <= 5) {
            timerBox.classList.remove('bg-yellow-100');
            timerBox.classList.add('bg-red-100', 'animate-pulse');
        } else if (time <= 15) {
            timerBox.classList.add('bg-yellow-100');
        } else {
            timerBox.classList.remove('bg-red-100', 'bg-yellow-100', 'animate-pulse');
        }
    }
}

// Tampilkan halaman tes
function renderTestQuestion() {
    if (currentQuestionIndex >= totalQuestions) {
        renderResultPage();
        return;
    }
    const question = questions[currentQuestionIndex];
    const symbol = (operation === 'perkalian') ? 'x' : '÷';
    const questionText = `${question.a} ${symbol} ${question.b} = ?`;

    // Set timer (only if not in longgar mode)
    let remainingTime = timerSeconds;
    startTimePerQuestion = Date.now();
    clearInterval(timerInterval);

    if (timerSeconds > 0) {
        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                checkAnswer(true); // Waktu habis
            }
            updateTimerDisplay(remainingTime);
        }, 1000);
    }

    mainContainer.innerHTML = `
        <div id="test-screen" class="space-y-6">
            <h2 class="text-3xl font-bold text-gray-700">Tes: ${getMultiplicationDisplayName(number)}</h2>
            <div class="flex justify-between items-center text-gray-700 p-2 border-b border-gray-200">
                <span class="text-xl font-bold text-indigo-600">Soal ${currentQuestionIndex + 1} dari ${totalQuestions}</span>
                <div id="timer-box" class="p-2 rounded-lg ${timerSeconds > 0 ? 'bg-gray-100' : 'bg-blue-100'}">
                    ${timerSeconds > 0 ? `<span class="text-red-500 font-extrabold text-2xl">Waktu: <span id="timer-display">${remainingTime}</span>s</span>` : `<span class="text-blue-500 font-extrabold text-2xl">Mode Longgar</span>`}
                </div>
            </div>
            <div id="question-element" class="text-6xl font-extrabold text-indigo-600 p-8 bg-pink-50 rounded-xl shadow-inner">${questionText}</div>
            <input type="number" id="answer-input" placeholder="Masukkan Jawaban (Angka)" class="w-full px-4 py-3 text-xl border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 text-center font-bold">
            <button onclick="checkAnswer(false)" class="w-full py-4 text-xl font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors duration-300 transform hover:scale-[1.01] shadow-lg">Jawab dan Lanjut</button>
            <button onclick="renderOperationSelection()" class="w-full py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">Keluar Tes</button>
        </div>
    `;
    animateElement('#test-screen');
    document.getElementById('answer-input').focus();
    if (timerSeconds > 0) {
        updateTimerDisplay(remainingTime);
    }
}

// Cek jawaban tes
function checkAnswer(timeout) {
    clearInterval(timerInterval);
    const endTimePerQuestion = Date.now();
    const timeTaken = ((endTimePerQuestion - startTimePerQuestion) / 1000).toFixed(2);

    const answerInput = document.getElementById('answer-input');
    const userAnswer = parseInt(answerInput ? answerInput.value : NaN);
    const question = questions[currentQuestionIndex];
    const isCorrect = !timeout && !isNaN(userAnswer) && userAnswer === question.answer;

    testAnswers.push({
        question: `${question.a} ${(operation === 'perkalian') ? 'x' : '÷'} ${question.b}`,
        userAnswer: timeout ? 'Waktu habis' : (isNaN(userAnswer) ? 'Tidak dijawab' : userAnswer),
        correctAnswer: question.answer,
        isCorrect: isCorrect,
        time: (timerSeconds === 0 || timeout) ? 'N/A' : timeTaken + 's',
        dividend: question.a,
        divisor: question.b
    });

    if (!timeout && timerSeconds > 0) {
        totalTimeElapsed += parseFloat(timeTaken);
    }

    if (isCorrect) {
        score++;
    }

    currentQuestionIndex++;
    renderTestQuestion();
}

// Tampilkan halaman hasil
function renderResultPage() {
    clearInterval(timerInterval);
    const formattedTotalTime = totalTimeElapsed.toFixed(2);
    const totalCorrect = testAnswers.filter(a => a.isCorrect).length;

    let resultHTML = `
        <div id="result-content" class="text-left space-y-6">
            <h1 class="text-4xl font-extrabold text-pink-600 text-center mb-4">Hasil ${mode === 'tes' ? 'Tes' : 'Latihan'} Selesai! 🎉</h1>
            <div class="bg-indigo-50 p-6 rounded-xl space-y-2 border-2 border-indigo-200 shadow-md">
                <p class="text-lg font-medium"><strong>Nama:</strong> ${userName}</p>
                <p class="text-lg font-medium"><strong>Operasi:</strong> ${operation === 'pembagian_bersusun' ? 'Pembagian Bersusun' : operation}</p>
                <p class="text-lg font-medium"><strong>Topik:</strong> ${getMultiplicationDisplayName(number)}</p>
            </div>
    `;

    if (mode === 'tes') {
        resultHTML += `
            <div class="text-center p-4 bg-white rounded-xl shadow-lg border-2 border-green-300">
                <h2 class="text-3xl font-bold text-gray-700">Skor Akhir:</h2>
                <p class="text-5xl font-extrabold text-green-600">${totalCorrect} / ${totalQuestions}</p>
                ${timerSeconds > 0 ? `<h3 class="text-xl font-bold text-gray-700 mt-2">Total Waktu: ${formattedTotalTime} detik</h3>` : `<h3 class="text-xl font-bold text-gray-700 mt-2">Mode: Tanpa Batas Waktu</h3>`}
            </div>
            <h3 class="text-2xl font-bold text-gray-700 mt-6 border-b pb-2">Rincian Jawaban:</h3>
            <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
    `;

        testAnswers.forEach((answer, index) => {
            const status = answer.isCorrect ? 'Benar' : 'Salah';
            const statusColor = answer.isCorrect ? 'text-green-600' : 'text-red-600';
            const bgColor = answer.isCorrect ? 'bg-green-50' : 'bg-red-50';

            resultHTML += `
                <div class="${bgColor} p-4 rounded-lg shadow-sm border border-gray-200">
                    <p class="font-semibold text-lg mb-1">Soal ${index + 1}: <span class="text-indigo-600">${answer.question} = ?</span></p>
                    <p class="text-base">Jawaban Anda: <span class="${statusColor} font-bold">${answer.userAnswer}</span></p>
                    <p class="text-base">Jawaban Benar: <span class="text-green-700 font-extrabold">${answer.correctAnswer}</span></p>
                    <p class="text-sm mt-1">Hasil: <span class="${statusColor} font-bold">${status}</span> | Waktu: <span class="font-bold">${answer.time}</span></p>
                    
                    <div class="mt-2 p-2 bg-blue-100 rounded-md">
                        <p class="text-sm font-semibold text-blue-800 mb-2">Kunci Jawaban:</p>
                        <div class="font-mono text-sm text-blue-700">
                            <p>${answer.dividend} ÷ ${answer.divisor} = ${answer.correctAnswer}</p>
                            <p>Pemeriksaan: ${answer.correctAnswer} × ${answer.divisor} = ${answer.dividend}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        resultHTML += `</div>`;
    } else { // Mode Latihan
         resultHTML += `
            <h2 class="text-2xl font-bold text-gray-700 text-center">Latihan Selesai!</h2>
            <p class="text-gray-600 text-center">Anda telah menyelesaikan sesi latihan **${getMultiplicationDisplayName(number)}** dengan **${totalQuestions}** soal flash card. Silakan coba mode tes untuk menguji pemahaman Anda. 💪</p>
        `;
    }

    resultHTML += `
        </div>
        <div class="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onclick="renderOperationSelection()" class="w-full sm:w-auto py-3 text-lg font-semibold text-white bg-pink-600 rounded-xl hover:bg-pink-700 transition-colors duration-300 shadow-lg">Pilih Operasi Lain 🔄</button>
            <button onclick="renderStartPage()" class="w-full sm:w-auto py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors duration-300">Mulai Lagi dari Awal</button>
        </div>
    `;
    mainContainer.innerHTML = resultHTML;
    animateElement('#result-content');
}

// Jalankan aplikasi saat script dimuat
renderStartPage();