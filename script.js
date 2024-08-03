const totalGIF = [18, 5, 24, 17]; //jumlah gif setiap tab
const nameTab = ["Eye Collection", "Emoticon Collection", "Circular Collection", "Action Collection"];

let selected_tab = 1;
let device;
let tft;
let success = "#D1E7DD";
let failed = "#F8D7DA";
let uuidService = "dee13011-14d8-4e12-94af-a6edfeaa1af9";
let uuidChar = "dee13012-14d8-4e12-94af-a6edfeaa1af9";

document.onkeydown = function(e) {//KOde untuk mencegah klik kanan mouse
    if(event.keyCode == 123) {
       return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
       return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
       return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
       return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
       return false;
    }
  }

  
function addLog(message) {
    var logDiv = document.getElementById("log");
    logDiv.innerHTML += message + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight; // Auto scroll to bottom
}
// Fungsi untuk mendapatkan indeks radio button yang dipilih
function getIndexTab() {
    const container = document.getElementById('radioContainer');
    const radios = container.querySelectorAll('input[type="radio"]');

    let selectedIndex = -1;

    // Loop melalui setiap radio button untuk mencari yang dipilih
    radios.forEach((radio, index) => {
        if (radio.checked) {
            selectedIndex = index + 1; // Karena index dimulai dari 0, tambahkan 1 untuk mendapatkan nomor indeks yang benar
        }
    });

    return selectedIndex;
}

function checkSwitch() {
    const leftRadio = document.getElementById('left');
    const rightRadio = document.getElementById('right');

    if (leftRadio.checked) {
        return "LEFT";
    } else if (rightRadio.checked) {
        return "RIGHT";
    } else {
        return "NO";
    }
}

// function simulateLogging() {
//     var count = 0;
//     setInterval(function () {
//         addLog(checkSwitch());
//     }, 1000);
// }
// simulateLogging();
function convertFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    } else if (bytes < 1048576) {
        return (bytes / 1024).toFixed(2) + "  KB";
    } else if (bytes < 1073741824) {
        return (bytes / 1048576).toFixed(2) + " MB";
    } else {
        return (bytes / 1073741824).toFixed(2) + " GB";
    }
}
function showAlert(color, text) {
    var alertDiv = document.querySelector('.alert');
    alertDiv.classList.remove('hidden');
    alertDiv.style.backgroundColor = color;
    alertDiv.querySelector('p').innerText = text;
    setTimeout(function () {
        alertDiv.classList.add('hidden');
    }, 3000);
}
function showAlert2(color, text, klos) {
    var alertDiv = document.querySelector('.alert');
    alertDiv.style.backgroundColor = color;
    alertDiv.querySelector('p').innerText = text;
    if (klos == 'open') {
        alertDiv.classList.remove('hidden');
    } else if (klos == 'close') {
        alertDiv.classList.add('hidden');
    }
}
let progress = 0;
let countt = 0;
let startTime = Date.now();
let previousTime = startTime;
async function updateProgress(data, sije) {
    // Update progress 
    progress = Math.min(100, Math.round((data / sije) * 100));
    // showAlert(success, 'Tunggu ! Gif Sedang Di Update!');

    // Memperbarui indikator persentase
    const progressIndicator = document.getElementById('progressIndicator');
    progressIndicator.style.width = `${progress}%`;

    // Memperbarui nilai persentase
    const progressPercentage = document.getElementById('progressPercentage');
    progressPercentage.innerText = `${progress}%`;

    // Menghitung estimasi waktu yang tersisa
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const estimatedTotalTime = (elapsed / data) * sije;
    const remainingTime = estimatedTotalTime - elapsed;


    // Memperbarui estimasi waktu tersisa
    const timeRemaining = document.getElementById('timeRemaining');
    timeRemaining.innerText = `Estimated time remaining: ${formatTime(remainingTime)}`;

    // Memperbarui jmlah data
    const jmlData = document.getElementById('jmlData');
    jmlData.innerText = `Data Terkirim :${convertFileSize(data)}, dari ${convertFileSize(sije)} Bytes`;

    // Jeda antar pengiriman potongan untuk memastikan waktu pengiriman per potongan
    // await delay(500);

    // Catat waktu selesai iterasi sebelumnya untuk menghitung kecepatan
    previousTime = currentTime;
    // console.log(`Data berhasil dikirim:`, sije);
}

async function writeDataTo(data) {
    // await tft.writeValue(data);
    addLog(data);
}

async function writeDataSequentially(data) {
    const panjangData = data.length;
    const chunkSize = 512; // Ukuran chunk (disesuaikan dengan batas BLE)
    try {

        console.log(tft);
        let textToSend;
        let encoder;
        let dataArray;


        if (checkSwitch() == 'LEFT') {
            textToSend = "awala";
        } else if (checkSwitch() == 'RIGHT') {
            textToSend = "awalb";
        }

        encoder = new TextEncoder();
        dataArray = encoder.encode(textToSend);
        await tft.writeValue(dataArray);


        for (let i = 0; i < data.length; i += chunkSize) {
            let chunk = data.slice(i, i + chunkSize);
            // Konversi chunk menjadi Uint8Array
            let uintArray = new Uint8Array(chunk);
            // Mengonversi uintArray ke ArrayBuffer
            let arrayBuffer = uintArray.buffer;

            // Menampilkan alert loading
            const loadingAlert = document.getElementById('loadingAlert');
            loadingAlert.style.display = 'block';

            // Memperbarui pesan loading
            const loadingMessage = document.getElementById('loadingMessage');
            loadingMessage.innerText = 'Writing data...';

            showAlert2(success, 'Sedang dikirim, jangan tutup browsernya yak !!', 'open');
            // Potong bagian data sesuai dengan chunkSize

            await tft.writeValue(arrayBuffer); // console.log(`Bagian data terkirim: ${indeksAwal} dari ${panjangData} bytes`);
            updateProgress(i, panjangData);
            // Tunggu sebelum mengirim bagian berikutnya (opsional)
            // await new Promise(resolve => setTimeout(resolve, 100)); // Tunggu 100ms antara pengiriman

        }

        if (checkSwitch() == 'LEFT') {
            textToSend = "akhira";
        } else if (checkSwitch() == 'RIGHT') {
            textToSend = "akhirb";
        }
        dataArray = encoder.encode(textToSend);
        // writeDataTo(dataArray);
        await tft.writeValue(dataArray);

        console.log(`Awal : ${indeksAwal} , Akhir : ${indeksAkhir} , total : ${data.length} `);
        showAlert2(success, '  !', 'close');
        console.log('Seluruh data telah dikirim.');
        // Kosongkan chunk untuk mengumpulkan data baru
        chunk = '';


    } catch (error) {    // Handle specific GATT errors
        if (error.code === 0x85) {
            console.error('GATT Error: Characteristic Not Found');
        } else if (error.code === 0x81) {
            console.error('GATT Error: Write Not Permitted');
        } else {
            console.error('GATT Error: Unknown Error');
        }
        // Sembunyikan alert loading setelah selesai
        loadingAlert.style.display = 'none';
        // Tangani kesalahan jika ada
        console.error('Gagal mengubah nilai:', error);
        showAlert(failed, 'Gif Gagal Di Update!');
    } finally {
        // Sembunyikan alert loading setelah selesai
        loadingAlert.style.display = 'none';
        // Jika semua data berhasil ditulis
        console.log('Seluruh data telah berhasil ditulis.');
        showAlert(success, `GIF sudah update !!\nData Terkirim ${convertFileSize(data.length)} \nMemulai Ulang Perangkat....`);

    }
}

// Fungsi untuk menunda eksekusi dalam milidetik
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fungsi untuk memformat waktu dalam format jam:menit:detik
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function changegif(newValue) {

    let fileName = `${newValue}.h`; // Nama file .h berdasarkan indeks, misalnya gif1.h, gif2.h, dll.
    let gifData;
    let data;
    // Lakukan pengambilan data GIF dari file .h
    try {
        // Ambil definisi array byte dari file .h 
        let pilihan;

        if (checkSwitch() == 'LEFT') {
            pilihan = 'left';
        } else if (checkSwitch() == 'RIGHT') {
            pilihan = 'right';
        }
        // addLog(pilihan + `/code/${fileName}`);
        let response = await fetch(pilihan + `/tab${selected_tab}/code/${fileName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
        }
        data = await response.text();
    }
    catch (error) {
        showAlert(failed, `Gagal mengambil file ${fileName}. Pastikan file tersedia.`);
        console.error('Error:', error);
    }

    // Ekstrak definisi array byte dari isi file .h
    let match = data.match(/const uint8_t\s+(\w+)\[\]\s+PROGMEM\s+=\s+\{([^}]*)\};/s);
    let byteData;
    if (match) {
        // Ambil data byte dan ubah ke dalam Uint8Array
        byteData = match[2].trim().split(',').map(item => parseInt(item.trim(), 16));
        gifData = new Uint8Array(byteData);
        console.log(`Data GIF dari ${fileName} berhasil diambil dan diproses.`);
        // return gifData;
    } else {
        throw new Error(`Format file ${fileName} tidak valid.`);
    }


    // if (1) {
    if (device && device.gatt && device.gatt.connected && tft) {
        writeDataSequentially(gifData);

    } else {
        showAlert(failed, 'Tidak Ada Device Terhubung, Harap Reload Halaman!');
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const leftRadio = document.getElementById('left');
    const rightRadio = document.getElementById('right');
    var num = document.querySelector('.num');

    function handleSwitchChange() {
        var existingSwiper = document.querySelector('.mySwiper');
        if (existingSwiper) {
            existingSwiper.swiper.destroy(true, true); // Hancurkan Swiper dengan membersihkan DOM juga
        }
        showSwiper();
        var swiper = document.querySelector('.mySwiper').swiper;
        getSizeData(num.innerText);
        swiper.slideTo(num.innerText - 1); // Pindah ke slide dengan indeks yang sesuai 

    }

    leftRadio.addEventListener('change', handleSwitchChange);
    rightRadio.addEventListener('change', handleSwitchChange);
});

function generateSwiperSlides(numSlides) {
    var swiperWrapper = document.querySelector('.swiper-wrapper');
    swiperWrapper.replaceChildren(); // Menghapus semua elemen anak dari swiperWrapper

    for (var i = 1; i <= numSlides; i++) {
        var div = document.createElement('div');
        div.classList.add('swiper-slide');
        div.dataset.value = i;
        var img = document.createElement('img');
        let pilihan;

        if (checkSwitch() == 'LEFT') {
            pilihan = 'left';
        } else if (checkSwitch() == 'RIGHT') {
            pilihan = 'right';
        }

        let fileTab = `tab${selected_tab}`;
        let sauce = pilihan + '/' + fileTab + '/GIF/' + i + '.gif';
        img.src = sauce;
        // writeDataTo(sauce);
        div.appendChild(img);
        swiperWrapper.appendChild(div);
    }
}
function showSwiper() {
    var connect = document.querySelector('.connect');
    var swiper = document.querySelector('.swiper');
    var num = document.querySelector('.num');
    var sc = document.querySelector('.switch-container');
    var sizeData = document.querySelector('.sizeData');

    var container = document.querySelector('.container');
    var tn = document.querySelector('.tabName');
    container.classList.remove('hidden');
    tn.classList.remove('hidden');
    connect.classList.add('hidden');
    swiper.classList.remove('hidden');
    num.classList.remove('hidden');
    sc.classList.remove('hidden');
    sizeData.classList.remove('hidden');

    generateSwiperSlides(totalGIF[selected_tab - 1]);
    var swiper = new Swiper(".mySwiper", {
        effect: 'cards',
        cardsEffect: {
            slideShadows: true,
            perSlideRotate: 3
        },
        on: {
            doubleTap: function () {
                var activeSlide = this.slides[this.activeIndex];
                var value = activeSlide.getAttribute('data-value');
                console.log('Nilai data-value:', value);
                console.log('Double tap terdeteksi!');
                changegif(value);
            }
        }
    });
    // Mengupdate nilai .num berdasarkan slide aktif saat ini
    swiper.on('slideChange', function () {
        var activeSlide = swiper.slides[swiper.activeIndex];
        var val = activeSlide.getAttribute('data-value');
        var num = document.querySelector('.num');
        num.innerText = val;
        getSizeData(val);
        // console.log(dt.length);
    });

}

async function getSizeData(newValue) {
    let fileName = `${newValue}.h`; // Nama file .h berdasarkan indeks, misalnya gif1.h, gif2.h, dll.
    let gifData;
    let data;
    let size;

    // Lakukan pengambilan data GIF dari file .h
    try {
        let pilihan;

        if (checkSwitch() == 'LEFT') {
            pilihan = 'left';
        } else if (checkSwitch() == 'RIGHT') {
            pilihan = 'right';
        }

        let fileTab = `/tab${selected_tab}`;
        let response = await fetch(pilihan + fileTab + `/code/${fileName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
        }

        // Coba dapatkan ukuran dari header Content-Length 

        data = await response.text();

    } catch (error) {
        console.error('Error:', error);
        document.querySelector(".sizeData").innerText = "0";
        return null;
    }

    // Ekstrak definisi array byte dari isi file .h
    let match = data.match(/const uint8_t\s+(\w+)\[\]\s+PROGMEM\s+=\s+\{([^}]*)\};/s);
    let byteData;
    if (match) {
        // Ambil data byte dan ubah ke dalam Uint8Array
        byteData = match[2].trim().split(',').map(item => parseInt(item.trim(), 16));
        gifData = new Uint8Array(byteData);
        console.log(`Data GIF dari ${fileName} berhasil diambil dan diproses.`);
        size = new TextEncoder().encode(byteData).length;
        // Tampilkan ukuran data
        // console.log(gifData.length);
        document.querySelector(".sizeData").innerText = convertFileSize(gifData.length);
        return gifData;
    } else {
        throw new Error(`Format file ${fileName} tidak valid.`);
    }
}

async function connect() {
    // showSwiper();

    try { //INITIALIZE CODE DISINI
        var tn = document.querySelector('.tabName');
        tn.innerText = nameTab[getIndexTab() - 1];
        getSizeData(1);
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [uuidService] }]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(uuidService);
        tft = await service.getCharacteristic(uuidChar);
        console.log('Connected to ESP32');
        showSwiper();
        showAlert(success, 'Device Terhubung!');
    } catch (error) {
        console.error('Error connecting to ESP32:', error);
        showAlert(failed, 'Device Gagal Terhubung!');
    }
}


// var connect = document.querySelector('.connect');
// var swiper = document.querySelector('.swiper');
// var num = document.querySelector('.num');
// var container = document.querySelector('.container');
// var tn = document.querySelector('.tabName');
// container.classList.remove('hidden');
// tn.classList.remove('hidden');
// var sc = document.querySelector('.switch-container');
// var sizeData = document.querySelector('.sizeData');
// console.log('Connected to ESP32');
// connect.classList.add('hidden');
// swiper.classList.remove('hidden');
// num.classList.remove('hidden');
// sc.classList.remove('hidden');
// sizeData.classList.remove('hidden');
// showSwiper();
// showAlert(success, 'Device Terhubung!');

// Mendapatkan elemen radio container
const radioContainer = document.getElementById('radioContainer');
// Mendapatkan semua radio button di dalam radio container
const radios = radioContainer.querySelectorAll('input[type="radio"]');
// Menambahkan event listener untuk setiap radio button
radios.forEach(radio => {
    radio.addEventListener('change', function () {
        // Ketika sebuah radio button dipilih
        console.log('Tombol dengan ID:', this.id, 'dipilih.');
        var tn = document.querySelector('.tabName');
        tn.innerText = nameTab[getIndexTab() - 1];
        selected_tab = getIndexTab();
        var existingSwiper = document.querySelector('.mySwiper');
        if (existingSwiper) {
            existingSwiper.swiper.destroy(true, true); // Hancurkan Swiper dengan membersihkan DOM juga
        }
        showSwiper();
        var num = document.querySelector('.num');
        num.innerText = 1;
        getSizeData(num.innerText);
    });
});

let scrollPosition = 0;
const scrollAmount = 60; // Adjust this value based on the width of the buttons

function scrollLeftt() {
    const container = document.getElementById('radioContainer');
    scrollPosition = Math.max(scrollPosition - scrollAmount, 0);
    container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });

}

function scrollRight() {
    const container = document.getElementById('radioContainer');
    const maxScroll = container.scrollWidth - container.clientWidth;
    scrollPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
    container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
}