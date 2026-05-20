let users = JSON.parse(
  localStorage.getItem("users")
) || [
  {
    username: "admin",
    password: "123",
    role: "admin"
  }
];

const currentUser = JSON.parse(
  localStorage.getItem("loginUser")
);

let chartJualan;
window.onerror = function(msg, url, line) {

  alert(
    "ERROR:\n" +
    msg +
    "\nLine: " + line
  );

};

let produk =
JSON.parse(localStorage.getItem("produkData")) || [];

let data =
JSON.parse(localStorage.getItem("dataJualan")) || [];

let keranjang =
JSON.parse(localStorage.getItem("keranjang")) || [];

let jumlahProduk = {};

function simpanData() {

  localStorage.setItem(
    "dataJualan",
    JSON.stringify(data)
  );

  autoBackup();
}

function autoBackup() {

  const backup = {
    tanggal:
new Date().toISOString().split("T")[0]
  };

  localStorage.setItem(
    "backupOtomatis",
    JSON.stringify(backup)
  );
}

function updateBackupInfo() {

  const backup =
    JSON.parse(localStorage.getItem("backupOtomatis"));

  if (!backup) return;

  const info =
    document.getElementById("backupInfo");

  if(!info) return;

  info.innerText =
    "☁️ Backup terakhir: " + backup.tanggal;
}


function formatRupiah(angka) {

  if (!angka || isNaN(angka)) {
    angka = 0;
  }

  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function tampilkanData(){

  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  const listData =
  document.getElementById("listData");

if(!listData){
  return;
}

  const cariTanggal =
    document.getElementById("cariTanggal")?.value || "";

  listData.innerHTML = "";

  data.forEach((item, index) => {

    if(cariTanggal && item.tanggal !== cariTanggal){
      return;
    }

    listData.innerHTML += `

      <div class="transaksi-card">

        <div class="transaksi-top">

          <div>

            <h3>${item.keterangan}</h3>

            <p class="tanggal">
              ${item.tanggal}
            </p>

          </div>

          <div class="${
            item.jenis === "belanja"
              ? "badge-belanja"
              : "badge-penghasilan"
          }">

            ${
              item.jenis === "belanja"
                ? "Belanja"
                : "Penghasilan"
            }

          </div>

        </div>

        <h2 class="nominal">
          Rp ${Number(item.jumlah)
            .toLocaleString("id-ID")}
        </h2>

        <div class="aksi-btn">

          <button
            class="edit-btn"
            onclick="editData(${index})"
          >
            ✏️ Edit
          </button>

          <button
            class="hapus-btn"
            onclick="hapusData(${index})"
          >
            🗑 Hapus
          </button>

        </div>

      </div>

    `;

  });

}

function updateLaporanHarian() {

  const belanjaHariIni =
    document.getElementById("belanjaHariIni");

  const penghasilanHariIni =
    document.getElementById("penghasilanHariIni");

  const keuntunganHariIni =
    document.getElementById("keuntunganHariIni");

  // kalau elemen tidak ada → hentikan
  if (
    !belanjaHariIni ||
    !penghasilanHariIni ||
    !keuntunganHariIni
  ) {
    return;
  }

  let totalBelanja = 0;
  let totalPenghasilan = 0;

  data.forEach(item => {

    if(item.jenis === "belanja"){
      totalBelanja += item.jumlah;
    } else {
      totalPenghasilan += item.jumlah;
    }

  });

  let keuntungan =
    totalPenghasilan - totalBelanja;

  belanjaHariIni.innerText =
    formatRupiah(totalBelanja);

  penghasilanHariIni.innerText =
    formatRupiah(totalPenghasilan);

  keuntunganHariIni.innerText =
    formatRupiah(keuntungan);
}

function tambahData(){

  const keterangan =
    document.getElementById("keterangan").value;

  const jumlah =
    parseInt(
      document.getElementById("jumlah").value
    );

  const jenis =
    document.getElementById("jenis").value;

  if(!keterangan || !jumlah){

    alert("Isi data dulu");

    return;

  }

  // AMBIL DATA LAMA
  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  // OBJECT TRANSAKSI
  const transaksi = {

    keterangan,
    jumlah,
    jenis,

    tanggal:
      new Date()
      .toISOString()
      .split("T")[0]

  };

  // MODE EDIT
  if(editIndex >= 0){

    data[editIndex] = transaksi;

    editIndex = -1;

  }else{

    // MODE TAMBAH
    data.push(transaksi);

  }

  // SIMPAN DATA
  localStorage.setItem(
    "dataJualan",
    JSON.stringify(data)
  );

  // RESET INPUT
  document.getElementById("keterangan").value = "";

  document.getElementById("jumlah").value = "";

  // REFRESH
  tampilkanData();

  hitungTotal();

  updateLaporan();
  
  buatGrafik();

}

let editIndex = -1;

function editData(index){

  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  const item = data[index];

  document.getElementById("keterangan").value =
    item.keterangan;

  document.getElementById("jumlah").value =
    item.jumlah;

  document.getElementById("jenis").value =
    item.jenis;

  editIndex = index;

  // pindah ke halaman penjualan
  showPage("penjualanPage");

  // scroll ke atas
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
buatGrafik();
}

function hitungTotal(){

  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  let totalBelanja = 0;
  let totalPenghasilan = 0;

  data.forEach(item => {

    if(item.jenis === "belanja"){

      totalBelanja += Number(item.jumlah);

    }else{

      totalPenghasilan += Number(item.jumlah);

    }

  });

  document.getElementById(
    "totalBelanja"
  ).innerText =
    "Rp " + totalBelanja.toLocaleString("id-ID");

  document.getElementById(
    "totalPenghasilan"
  ).innerText =
    "Rp " + totalPenghasilan.toLocaleString("id-ID");

  document.getElementById(
    "keuntungan"
  ).innerText =
    "Rp " +
    (totalPenghasilan - totalBelanja)
    .toLocaleString("id-ID");

}

function hapusData(index){

  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  if(confirm("Hapus transaksi ini?")){

    data.splice(index, 1);

    localStorage.setItem(
      "dataJualan",
      JSON.stringify(data)
    );

    tampilkanData();
    hitungTotal();
    updateLaporan();

  }

}

function resetData() {

  if(currentUser.role !== "admin"){
    alert("Akses ditolak");
    return;
  }

  const konfirmasi = confirm("Yakin ingin menghapus semua data?");

  if (konfirmasi) {
    data = [];

    localStorage.removeItem("dataJualan");

    tampilkanData();
  }
}


function toggleDarkMode() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "aktif");
  } else {
    localStorage.removeItem("darkMode");
  }
}

if (localStorage.getItem("darkMode") === "aktif") {
  document.body.classList.add("dark");
}

function downloadPDF() {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  let totalBelanja = 0;
  let totalPenghasilan = 0;

  // JUDUL
  doc.setFontSize(18);
  doc.text("Laporan Penjualan", 20, 20);

  doc.setFontSize(11);
  doc.text(
    "Tanggal: " +
    new Date().toLocaleDateString("id-ID"),
    20,
    30
  );

  // GARIS
  doc.line(20, 35, 190, 35);

  let y = 45;

  data.forEach((item, index) => {

    const nominal =
      "Rp " +
      item.jumlah.toLocaleString("id-ID");

    doc.text(
      `${index + 1}. ${item.keterangan}`,
      20,
      y
    );

    doc.text(
      item.jenis,
      110,
      y
    );

    doc.text(
      nominal,
      150,
      y
    );

    y += 10;

    // pindah halaman
    if(y > 270){

      doc.addPage();

      y = 20;
    }

    if(item.jenis === "belanja"){
      totalBelanja += item.jumlah;
    }else{
      totalPenghasilan += item.jumlah;
    }

  });

  const keuntungan =
    totalPenghasilan - totalBelanja;

  y += 10;

  doc.line(20, y, 190, y);

  y += 10;

  doc.setFontSize(13);

  doc.text(
    "Total Belanja: Rp " +
    totalBelanja.toLocaleString("id-ID"),
    20,
    y
  );

  y += 10;

  doc.text(
    "Penghasilan: Rp " +
    totalPenghasilan.toLocaleString("id-ID"),
    20,
    y
  );

  y += 10;

  doc.text(
    "Keuntungan Bersih: Rp " +
    keuntungan.toLocaleString("id-ID"),
    20,
    y
  );

  doc.save("laporan-penjualan.pdf");

}


function logout(){

  const setuju = confirm("Yakin ingin logout?");

  if(!setuju) return;

  localStorage.removeItem("loginUser");

  window.location.href = "login.html";
}


function showTab(tabId, button){

  const tabs =
    document.querySelectorAll(".tab-page");

  tabs.forEach(tab => {
    tab.style.display = "none";
  });

  document.getElementById(tabId)
    .style.display = "block";


  const buttons =
    document.querySelectorAll(".tab-btn");

  buttons.forEach(btn => {
    btn.classList.remove("active-tab");
  });

  button.classList.add("active-tab");
}


function simpanProduk(){

  localStorage.setItem(
    "produkData",
    JSON.stringify(produk)
  );
}

function tampilkanProduk(){

  const list =
    document.getElementById("listProduk");

  if(!list) return;

  list.innerHTML = "";
  
  const keyword =
  document.getElementById("searchProduk")?.value.toLowerCase() || "";

  produk.forEach((item, index) => {
 if(
  !item.nama.toLowerCase().includes(keyword)
   ){
  return;
   }
    if(!jumlahProduk[index]){
      jumlahProduk[index] = 1;
    }

    list.innerHTML += `

    <div class="produk-card">

      <h3>${item.nama}</h3>

      <p>Stok: ${item.stok}</p>

      <h4>
        Rp ${item.harga.toLocaleString("id-ID")}
      </h4>

      <div class="jumlah-box">

        <button onclick="kurangJumlah(${index})">
          -
        </button>

        <span id="jumlah-${index}">
          ${jumlahProduk[index]}
        </span>

        <button onclick="tambahJumlah(${index})">
          +
        </button>

      </div>

      <div class="produk-actions">

  <button
    class="btn-keranjang"
    onclick="tambahKeKeranjang(${index})">

    🛒 Keranjang

  </button>

  <button
    class="btn-hapus-produk"
    onclick="hapusProduk(${index})">

    🗑 Hapus

  </button>

</div>

    </div>

    `;
  });
  updateBadgeKeranjang();
}

function tambahProduk(){

  const nama =
    document.getElementById("namaProduk").value;

  const harga =
    parseInt(
      document.getElementById("hargaProduk").value
    );

  const stok =
    parseInt(
      document.getElementById("stokProduk").value
    );

  if(!nama || !harga || !stok){

    alert("Isi data produk!");
    return;
  }

  produk.push({
    nama,
    harga,
    stok
  });

  simpanProduk();
  tampilkanProduk();

  document.getElementById("namaProduk").value = "";
  document.getElementById("hargaProduk").value = "";
  document.getElementById("stokProduk").value = "";
}

function tambahKeKeranjang(index){

    let produkDipilih = produk[index];

    let jumlah = jumlahProduk[index] || 1;

    if(jumlah > produkDipilih.stok){
        alert("Stok tidak cukup");
        return;
    }

    produkDipilih.stok -= jumlah;

    let itemLama = keranjang.find(item =>
        item.nama === produkDipilih.nama
    );

    if(itemLama){

        itemLama.jumlah += jumlah;

    }else{

        keranjang.push({
            nama: produkDipilih.nama,
            harga: produkDipilih.harga,
            jumlah: jumlah
        });

    }

    localStorage.setItem("produkData", JSON.stringify(produk));

    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    
    // ANIMASI BADGE
const badge = document.getElementById("cartBadge");

badge.classList.remove("badge-animasi");

void badge.offsetWidth;

badge.classList.add("badge-animasi");


    tampilkanProduk();

    renderKeranjang();

    alert("Produk masuk ke keranjang");
    
    renderKeranjang();
updateCartBadge();
}

function renderKeranjang(){

    let boxKeranjang =
        document.getElementById("listKeranjang");

    let totalBox =
        document.getElementById("totalKeranjang");

    if(!boxKeranjang || !totalBox) return;

    boxKeranjang.innerHTML = "";

    let total = 0;

    keranjang.forEach((item,index)=>{

        total += item.harga * item.jumlah;

        boxKeranjang.innerHTML += `

<div class="cart-item">

  <div class="cart-item-top">

    <div>
      <h3>${item.nama}</h3>

      <p>
        ${item.jumlah} x Rp ${item.harga.toLocaleString("id-ID")}
      </p>
    </div>

    <div class="cart-price">
      Rp ${(item.jumlah * item.harga).toLocaleString("id-ID")}
    </div>

  </div>

  <button
    class="hapus-cart-btn"
    onclick="hapusKeranjang(${index})"
  >
    🗑
  </button>

</div>

`;
    });

    totalBox.innerHTML =
        "Rp " + total.toLocaleString("id-ID");
}

function hapusKeranjang(index){

    const yakin = confirm("Yakin ingin menghapus produk dari keranjang?");

    if(!yakin){
        return;
    }

    keranjang.splice(index,1);

    localStorage.setItem(
        "keranjang",
        JSON.stringify(keranjang)
    );

    renderKeranjang();
updateCartBadge();
}


function checkoutCart() {

  if (keranjang.length === 0) {
    alert("Keranjang kosong");
    return;
  }

  let totalBayar = 0;

  keranjang.forEach(item => {
    totalBayar += item.harga * item.jumlah;
  });

  // INPUT UANG BAYAR
  let uangBayar = prompt(
    "Masukkan uang pembayaran:"
  );

  if (uangBayar === null) {
    return;
  }

  uangBayar = parseInt(uangBayar);

  // VALIDASI
  if (isNaN(uangBayar)) {
    alert("Uang bayar tidak valid");
    return;
  }

  if (uangBayar < totalBayar) {
    alert("Uang pembayaran kurang");
    return;
  }

  // HITUNG KEMBALIAN
  const kembalian =
    uangBayar - totalBayar;

  // AMBIL DATA LAMA
  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  // SIMPAN TRANSAKSI
  keranjang.forEach(item => {

    data.push({

      keterangan: item.nama,

      qty: item.jumlah,

      jumlah: item.jumlah * item.harga,

      jenis: "penghasilan",

      tanggal:
        new Date()
        .toISOString()
        .split("T")[0]

    });

  });

  // SIMPAN KE LOCAL STORAGE
  localStorage.setItem(
    "dataJualan",
    JSON.stringify(data)
  );

  // PRINT STRUK
  const print = confirm(
    "Print struk sekarang?"
  );

  if (print) {

    printStruk(
      keranjang,
      totalBayar,
      uangBayar,
      kembalian
    );

  }

  // KOSONGKAN KERANJANG
  keranjang = [];

  localStorage.setItem(
    "keranjang",
    JSON.stringify(keranjang)
  );

  // REFRESH UI
  renderKeranjang();

  tampilkanData();

  updateLaporan();

  updateCartBadge();

  // ALERT BERHASIL
  alert(
    "Checkout berhasil\n" +
    "Kembalian: Rp " +
    kembalian.toLocaleString("id-ID")
  );

}

function printStruk() {

  const userData =
    JSON.parse(localStorage.getItem("loginUser"));

  const namaKasir =
    userData.username;

  const namaToko =
    localStorage.getItem("namaToko") || "TOKO";

  let isi = `
    <html>
    <head>
      <title>Struk Belanja</title>

      <style>
        body{
          font-family: monospace;
          padding:20px;
          font-size:14px;
        }

        h2,h3,p{
          margin:4px 0;
        }

        .center{
          text-align:center;
        }

        .item{
          margin-bottom:10px;
        }

        hr{
          border:none;
          border-top:1px dashed #000;
        }
      </style>
    </head>

    <body>

      <div class="center">

        <h2>${namaToko}</h2>

        <p>Kasir : ${namaKasir}</p>

        <p>
          ${new Date().toLocaleString("id-ID")}
        </p>

      </div>

      <hr>
  `;

  let total = 0;

  keranjang.forEach(item => {

    let subtotal = item.harga * item.jumlah;

    total += subtotal;

    isi += `
      <div class="item">
        ${item.nama}<br>
        ${item.jumlah} x Rp ${item.harga.toLocaleString("id-ID")}<br>
        <b>Rp ${subtotal.toLocaleString("id-ID")}</b>
      </div>
    `;

  });
  
const dibayar =
  parseInt(
    document.getElementById("inputBayar").value
  ) || 0;

const kembalian =
  dibayar - total;

isi += `
  <hr>

  <h3>
    Total:
    Rp ${total.toLocaleString("id-ID")}
  </h3>

  <p>
    Dibayar:
    Rp ${dibayar.toLocaleString("id-ID")}
  </p>

  <p>
    Kembalian:
    Rp ${kembalian.toLocaleString("id-ID")}
  </p>

  <p>
    ${new Date().toLocaleString("id-ID")}
  </p>
  
</body>
</html>
`;
  

  const printWindow = window.open("", "_blank");

  if(!printWindow){
    alert("Browser memblokir popup print");
    return;
  }

  printWindow.document.write(isi);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {

    printWindow.print();

  }, 500);
struk += "\n\n\n";
  
}

function hapusProduk(index){

  if(currentUser.role !== "admin"){
    alert("Akses ditolak");
    return;
  }

  const yakin =
    confirm("Hapus produk ini?");

  if(!yakin) return;

  produk.splice(index,1);

  simpanProduk();

  tampilkanProduk();
}



function bukaTab(id){

  document.querySelectorAll(".tab-page")
  .forEach(page => {
    page.style.display = "none";
  });

  document.getElementById(id)
  .style.display = "block";

  document.querySelectorAll(".bottom-nav button")
  .forEach(btn => {
    btn.classList.remove("active");
  });

  event.currentTarget.classList.add("active");
}

function tambahQty() {
  let qty = document.getElementById("qtyProduk");
  qty.value = parseInt(qty.value) + 1;
}

function kurangQty() {
  let qty = document.getElementById("qtyProduk");

  if (parseInt(qty.value) > 1) {
    qty.value = parseInt(qty.value) - 1;
  }
}


function tambahJumlah(index) {
    if (!jumlahProduk[index]) {
        jumlahProduk[index] = 1;
    }

    jumlahProduk[index]++;

    document.getElementById(`jumlah-${index}`).innerText =
        jumlahProduk[index];
}

function kurangJumlah(index) {
    if (!jumlahProduk[index] || jumlahProduk[index] <= 1) {
        jumlahProduk[index] = 1;
    } else {
        jumlahProduk[index]--;
    }

    document.getElementById(`jumlah-${index}`).innerText =
        jumlahProduk[index];
}

function updateLaporan(){

  let data =
    JSON.parse(
      localStorage.getItem("dataJualan")
    ) || [];

  const tanggal =
    document.getElementById("filterTanggal")?.value || "";

  let totalBelanja = 0;
  let totalPenghasilan = 0;
  let totalTransaksi = 0;

  data.forEach(item => {

    if(tanggal && item.tanggal !== tanggal){
      return;
    }

    totalTransaksi++;

    if(item.jenis === "belanja"){

      totalBelanja += Number(item.jumlah);

    }else{

      totalPenghasilan += Number(item.jumlah);

    }

  });

  const totalTransaksiEl =
    document.getElementById("totalTransaksi");

  const laporanBelanjaEl =
    document.getElementById("laporanBelanja");

  const laporanPenghasilanEl =
    document.getElementById("laporanPenghasilan");

  const laporanKeuntunganEl =
    document.getElementById("laporanKeuntungan");

  if(totalTransaksiEl){
    totalTransaksiEl.innerText = totalTransaksi;
  }

  if(laporanBelanjaEl){
    laporanBelanjaEl.innerText =
      "Rp " + totalBelanja.toLocaleString("id-ID");
  }

  if(laporanPenghasilanEl){
    laporanPenghasilanEl.innerText =
      "Rp " + totalPenghasilan.toLocaleString("id-ID");
  }

  if(laporanKeuntunganEl){
    laporanKeuntunganEl.innerText =
      "Rp " +
      (totalPenghasilan - totalBelanja)
      .toLocaleString("id-ID");
  }

}

function showPage(pageId) {

  // sembunyikan semua halaman
  const pages =
    document.querySelectorAll(".tab-page");

  pages.forEach(page => {
    page.style.display = "none";
  });

  // tampilkan halaman
  document.getElementById(pageId)
    .style.display = "block";

  // reset active
  const buttons =
    document.querySelectorAll(".bottom-nav button");

  buttons.forEach(btn => {
    btn.classList.remove("active");
  });

  // tombol aktif
  if(pageId === "produkPage"){
    buttons[0].classList.add("active");
  }

  if(pageId === "keranjangPage"){
    buttons[1].classList.add("active");
  }

  if(pageId === "penjualanPage"){

    buttons[2].classList.add("active");

    tampilkanData();

    hitungTotal();

  }

  if(pageId === "laporanPage"){

    buttons[3].classList.add("active");

    updateLaporan();

  }

  if(pageId === "profilPage"){
    buttons[4].classList.add("active");
  }

}

function filterLaporan(){

  const tanggalInput =
    document.getElementById("filterTanggal").value;

  if(!tanggalInput){
    updateLaporan();
    return;
  }

  let totalBelanja = 0;
  let totalPenghasilan = 0;

  data.forEach(item => {

    if(item.tanggal === tanggalInput){

      if(item.jenis === "belanja"){
        totalBelanja += item.jumlah;
      }else{
        totalPenghasilan += item.jumlah;
      }

    }

  });

  const keuntungan =
    totalPenghasilan - totalBelanja;

  document.getElementById("laporanBelanja")
    .innerText =
    "Rp " + totalBelanja.toLocaleString("id-ID");

  document.getElementById("laporanPenghasilan")
    .innerText =
    "Rp " + totalPenghasilan.toLocaleString("id-ID");

  document.getElementById("laporanKeuntungan")
    .innerText =
    "Rp " + keuntungan.toLocaleString("id-ID");

}

let chartPenjualan;
function buatGrafik(){

  const ctx =
    document.getElementById("grafikJualan");

  if(!ctx) return;

  let totalBelanja = 0;
  let totalPenghasilan = 0;

  data.forEach(item => {

    if(item.jenis === "belanja"){
      totalBelanja += item.jumlah;
    }else{
      totalPenghasilan += item.jumlah;
    }

  });

  // HAPUS GRAFIK LAMA
  if(chartJualan){
    chartJualan.destroy();
  }

  chartJualan = new Chart(ctx, {

    type: 'doughnut',

    data: {

      labels: [
        'Belanja',
        'Penghasilan'
      ],

      datasets: [{
        data: [
          totalBelanja,
          totalPenghasilan
        ]
      }]

    }

  });
tampilkanData();
updateLaporan();
}

function updateBadgeKeranjang(){

  let totalItem = 0;

  keranjang.forEach(item => {
    totalItem += item.jumlah;
  });

  const badge =
    document.getElementById("cartBadge");

  if(!badge) return;

  badge.innerText = totalItem;
}




function updateCartBadge(){

  const badge =
    document.getElementById("cartBadge");

  if(!badge) return;

  let total = 0;

  keranjang.forEach(item => {
    total += item.jumlah;
  });

  badge.innerText = total;
}

function simpanNamaToko(){

  const nama =
    document.getElementById("namaToko").value;

  localStorage.setItem(
    "namaToko",
    nama
  );

  alert("Nama toko disimpan");
}

function loadNamaToko(){

  const nama =
    localStorage.getItem("namaToko");

  if(nama){

    document.getElementById("namaToko").value =
      nama;

  }

}
function updateStatistik(){

  const statProduk =
    document.getElementById("statProduk");

  const statTransaksi =
    document.getElementById("statTransaksi");

  if(statProduk){
    statProduk.innerText = produk.length;
  }

  if(statTransaksi){
    statTransaksi.innerText = data.length;
  }

}

function tambahUser(){

  if(!currentUser || currentUser.role !== "admin"){
    alert("Hanya admin yang bisa menambah user");
    return;
  }

  const username =
    document.getElementById("newUsername").value;

  const password =
    document.getElementById("newPassword").value;

  const role =
    document.getElementById("newRole").value;

  if(!username || !password){
    alert("Isi data user");
    return;
  }

  users.push({
    username,
    password,
    role
  });

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

  alert("User berhasil ditambah");
}

function getValue(id){

  const el =
    document.getElementById(id);

  return el ? el.value : "";

}

document.addEventListener("DOMContentLoaded", () => {

  const loginUser =
    JSON.parse(
      localStorage.getItem("loginUser")
    );

  const logoutBox =
    document.getElementById("logoutKasirBox");

  if(!logoutBox) return;

  if(loginUser && loginUser.role === "admin"){

    logoutBox.style.display = "none";

  }else{

    logoutBox.style.display = "flex";

  }
  const hariIni =
  new Date()
  .toISOString()
  .split('T')[0];

const filterLaporan =
  document.getElementById("filterTanggal");

if(filterLaporan && !filterLaporan.value){

  filterLaporan.value = hariIni;

}
  

document.getElementById("cariTanggal").value = hariIni;
  
  const namaUser =
  localStorage.getItem("loginUser");

const namaUserEl =
  document.getElementById("namaUser");

if(namaUserEl){

  const userData =
  JSON.parse(namaUser);

namaUserEl.innerText =
  userData.username;

}
  
  tampilkanProduk();

  renderKeranjang();

  tampilkanData();

  updateLaporan();

  buatGrafik();

  updateBadgeKeranjang();

  loadNamaToko();

  updateStatistik();

});
