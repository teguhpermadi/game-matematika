let playerName = '';
let selectedLevel = '';
let starCount = 0;
let multiplicationNumbers = [];
let totalBoxes = 0;

// Struktur dasar untuk satu Box Labirin (4x4)
// Setiap sel:
// - string: operasi matematika atau angka yang sudah terisi
// - 'input': sel yang harus diisi pengguna
// - 'prize': sel input yang memiliki hadiah bintang tersembunyi
const baseBoxStructure = [
    // Struktur di-rotasi agar cocok dengan gambar (Horizontal)
    // [0,0] [0,1] [0,2] [0,3]
    // [1,0] [1,1] [1,2] [1,3]
    // [2,0] [2,1] [2,2] [2,3]
    // [3,0] [3,1] [3,2] [3,3]

    // Contoh: Box 4x4 (16 sel), tapi hanya 8 operasi (misal: A op B = C)
    // Kita anggap 8 operasi membutuhkan 3 sel, total 24 sel yang terisi/input.
    // Karena ini 4x4, kita fokus pada 8 operasi horizontal/vertikal yang saling berhubungan
    
    // Simplifikasi Struktur Labirin (8 operasi per Box)
    // Sel input akan diberi penanda khusus untuk diisi

    // Model Soal: (Sel 0 op Sel 1 = Sel 2) dan (Sel 3 op Sel 4 = Sel 5) ...
    // Kita akan buat 8 titik operasi yang harus diselesaikan
    { cellIndices: [0, 1, 2], orientation: 'H', type: 'equation' }, // Horizontal
    { cellIndices: [4, 5, 6], orientation: 'H', type: 'equation' },
    { cellIndices: [8, 9, 10], orientation: 'H', type: 'equation' },
    { cellIndices: [12, 13, 14], orientation: 'H', type: 'equation' },
    
    { cellIndices: [0, 4, 8], orientation: 'V', type: 'equation' }, // Vertikal
    { cellIndices: [1, 5, 9], orientation: 'V', type: 'equation' },
    { cellIndices: [2, 6, 10], orientation: 'V', type: 'equation' },
    { cellIndices: [3, 7, 11], orientation: 'V', type: 'equation' }, // Jika ada 4 baris, butuh 4 vertikal
    // Perlu disesuaikan agar 8 operasi saling terkait
];

// Array untuk menyimpan data semua box yang dibuat
let gameBoxes = [];

// Fungsi untuk membuat operasi perkalian/pembagian/penjumlahan/pengurangan
function generateOperation(tables) {
    const operations = ['*', '/', '+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, result;

    if (op === '*') {
        // Fokus pada perkalian yang dipilih
        const table = tables[Math.floor(Math.random() * tables.length)];
        num1 = table;
        num2 = Math.floor(Math.random() * 9) + 2; // Angka 2-10
        result = num1 * num2;
    } else if (op === '/') {
        // Pembagian harus menghasilkan bilangan bulat
        const table = tables[Math.floor(Math.random() * tables.length)];
        num2 = Math.floor(Math.random() * 9) + 2;
        result = table * num2; // Result adalah hasil kali
        num1 = result;
        result = table; // Hasil bagi adalah 'table'
    } else if (op === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        result = num1 + num2;
    } else if (op === '-') {
        result = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * (result - 1)) + 1;
        num1 = result + num2;
        // Penjumlahan/Pengurangan dibuat agak lebih menantang
    }

    return { num1, op, num2, result };
}

// Fungsi untuk membuat 8 operasi unik untuk satu Box (seperti gambar)
function createOneBoxData() {
    // Implementasi ini akan sangat kompleks jika harus mengikuti tata letak gambar 100%.
    // Kita akan buat array 4x4 (16 sel) untuk merepresentasikan Box dan mengisi 8 operasi.
    // Contoh Sederhana untuk 1 Box 4x4 (16 sel)
    
    // Array 4x4, diisi dengan string atau null
    let box = Array.from({ length: 4 }, () => Array(4).fill(null));
    let answerMap = new Map(); // Untuk menyimpan kunci jawaban: key=koordinat(i,j), value=jawaban
    let inputCells = []; // Menyimpan koordinat sel input

    // 8 Operasi (4 Horizontal, 4 Vertikal, harus saling berhubungan)
    const totalOperations = 8;
    for (let i = 0; i < totalOperations; i++) {
        // Logika untuk menempatkan operasi dan memastikan ada kotak input
        // ... (Ini adalah bagian paling kompleks dari game, membutuhkan algoritma penempatan)
        
        // **Simplifikasi:** Untuk demo ini, kita hanya akan mengisi beberapa sel
        // dan menandai input, tanpa menjamin keterkaitan labirin yang kompleks.
        const op = generateOperation(multiplicationNumbers);
        
        // Contoh penempatan acak untuk input (Sangat disimplifikasi!)
        const r = Math.floor(Math.random() * 4);
        const c = Math.floor(Math.random() * 4);

        if (box[r][c] === null) {
            // Tentukan posisi input (misal: hasil)
            box[r][c] = { value: '', type: 'input', answer: op.result, isPrize: Math.random() < 0.2 };
            inputCells.push({ r, c });
        }
        
        // Tentukan posisi operasi dan angka (Misal: 4 * 5 = [Input])
        // Operasi Horizontal (Hanya contoh)
        if (i < 4) { 
             box[i][0] = { value: op.num1, type: 'fixed' };
             box[i][1] = { value: op.op, type: 'fixed' };
             box[i][2] = { value: op.num2, type: 'fixed' };
             box[i][3] = { value: '', type: 'input', answer: op.result, isPrize: Math.random() < 0.2 };
             inputCells.push({ r: i, c: 3 });
        } else {
             // Operasi Vertikal (Hanya contoh)
             box[0][i-4] = { value: op.num1, type: 'fixed' };
             box[1][i-4] = { value: op.op, type: 'fixed' };
             box[2][i-4] = { value: op.num2, type: 'fixed' };
             box[3][i-4] = { value: '', type: 'input', answer: op.result, isPrize: Math.random() < 0.2 };
             inputCells.push({ r: 3, c: i-4 });
        }
        
    }
    
    return { data: box, answerMap, inputCells };
}


// Fungsi utama untuk memulai game
function startGame(level) {
    playerName = document.getElementById('userName').value.trim() || 'Pemain';
    const tablesInput = document.getElementById('multiplicationTables').value;
    
    // 2. User memilih hafal perkalian berapa saja
    multiplicationNumbers = tablesInput.split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n) && n > 0);
    
    if (multiplicationNumbers.length === 0) {
        alert('Mohon masukkan angka perkalian yang valid (misal: 7, 8, 9).');
        return;
    }

    selectedLevel = level;

    // 4-7. Tentukan jumlah box berdasarkan level
    if (level === 'mudah') totalBoxes = 2;
    else if (level === 'sedang') totalBoxes = 4;
    else if (level === 'sulit') totalBoxes = 6;
    
    // Reset dan buat box baru
    gameBoxes = [];
    for (let i = 0; i < totalBoxes; i++) {
        gameBoxes.push(createOneBoxData());
    }

    // Update UI
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('player-name').textContent = playerName;
    document.getElementById('game-level').textContent = level.charAt(0).toUpperCase() + level.slice(1);
    starCount = 0;
    document.getElementById('star-count').textContent = starCount + ' ⭐';

    renderMaze();
}

// Fungsi untuk merender labirin ke HTML
function renderMaze(isAnswerKey = false) {
    const container = isAnswerKey ? document.getElementById('answer-key-content') : document.getElementById('maze-area');
    container.innerHTML = ''; // Bersihkan konten lama

    gameBoxes.forEach((boxData, boxIndex) => {
        const boxEl = document.createElement('div');
        boxEl.className = 'maze-box p-1';
        
        boxData.data.forEach((row, rowIndex) => {
            row.forEach((cellData, colIndex) => {
                const cellEl = document.createElement('div');
                cellEl.className = 'maze-cell';
                
                if (cellData && cellData.type === 'input') {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.className = 'input-cell w-full h-full';
                    input.dataset.box = boxIndex;
                    input.dataset.row = rowIndex;
                    input.dataset.col = colIndex;
                    
                    if (isAnswerKey) {
                        // 12. Tampilkan kunci jawaban
                        input.value = cellData.answer;
                        input.readOnly = true;
                        input.classList.add('bg-green-200');
                        // Tampilkan hadiah di kunci jawaban
                        if (cellData.isPrize) {
                             cellEl.innerHTML = `<span class="text-xl text-yellow-600">${cellData.answer} ⭐</span>`;
                        } else {
                             cellEl.textContent = cellData.answer;
                        }
                    } else {
                        // Tampilkan nilai yang sudah diinput user
                        input.value = cellData.value;
                        cellEl.appendChild(input);
                    }
                    
                } else if (cellData && cellData.type === 'fixed') {
                    cellEl.textContent = cellData.value;
                } else {
                    // Kotak kosong/penghubung
                    cellEl.classList.add('bg-gray-200'); 
                    cellEl.style.border = 'none'; // Hilangkan border untuk estetika
                }
                
                boxEl.appendChild(cellEl);
            });
        });

        container.appendChild(boxEl);
    });
}

// Fungsi untuk memeriksa jawaban
function checkAnswers() {
    let totalCorrect = 0;
    let totalQuestions = 0;
    let newStars = 0;

    gameBoxes.forEach((boxData, boxIndex) => {
        boxData.inputCells.forEach(({ r, c }) => {
            totalQuestions++;
            const cellData = boxData.data[r][c];
            const inputEl = document.querySelector(`input[data-box="${boxIndex}"][data-row="${r}"][data-col="${c}"]`);
            
            if (!inputEl) return;

            const userAnswer = parseInt(inputEl.value);
            const correctAnswer = cellData.answer;

            // Simpan jawaban user ke dalam data
            cellData.value = userAnswer; 

            if (userAnswer === correctAnswer) {
                totalCorrect++;
                inputEl.classList.remove('border-red-500');
                inputEl.classList.add('border-green-500');
                
                // 9-10. Cek hadiah bintang
                if (cellData.isPrize && !cellData.starCollected) {
                    newStars++;
                    cellData.starCollected = true; // Tandai bintang sudah diambil
                    inputEl.classList.add('bg-yellow-100');
                }
            } else {
                inputEl.classList.remove('border-green-500');
                inputEl.classList.add('border-red-500');
            }
        });
    });

    starCount += newStars;
    document.getElementById('star-count').textContent = starCount + ' ⭐';
    
    // 11. Cek semua soal terjawab benar
    if (totalCorrect === totalQuestions && totalQuestions > 0) {
        starCount += 5; // Bonus 5 bintang
        document.getElementById('star-count').textContent = starCount + ' ⭐ (Bonus 5!)';
        alert(`🎉 Selamat, ${playerName}! Semua soal terjawab benar! Anda mendapatkan bonus 5 bintang! Total Bintang: ${starCount}`);
    } else {
        alert(`Hasil: ${totalCorrect} dari ${totalQuestions} soal benar. Terus mencoba!`);
    }
}

// Fungsi untuk menampilkan kunci jawaban (Modal)
function showAnswerKey() {
    renderMaze(true);
    document.getElementById('answer-key-modal').classList.remove('hidden');
    document.getElementById('answer-key-modal').classList.add('flex');
}

// Fungsi untuk menutup modal kunci jawaban
function closeAnswerKey() {
    document.getElementById('answer-key-modal').classList.add('hidden');
    document.getElementById('answer-key-modal').classList.remove('flex');
}