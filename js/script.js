// Tambah Baris Input Artikel Baru
function tambahArtikel(judul = "", link = "") {
    const container = document.getElementById('artikelContainer');
    const div = document.createElement('div');
    div.className = 'artikel-item';
    div.innerHTML = `
        <div class="row g-2">
            <div class="col-12">
                <input type="text" name="judul[]" class="form-control judulInput" placeholder="Judul artikel..." required value="${escapeHtml(judul)}">
            </div>
            <div class="col-12">
                <input type="url" name="link[]" class="form-control linkInput" placeholder="https://link-artikel.com/..." required value="${escapeHtml(link)}">
            </div>
        </div>
    `;
    container.appendChild(div);
}

// Kurangi Baris Input Artikel
function kurangiArtikel() {
    const container = document.getElementById('artikelContainer');
    if (container.children.length > 1) {
        container.removeChild(container.lastElementChild);
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;");
}

// Fitur Paste Banyak Judul / Link Sekaligus
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('artikelContainer');

    container.addEventListener('paste', function(e) {
        const target = e.target;
        if (!target.classList.contains('judulInput') && !target.classList.contains('linkInput')) return;

        const clipboard = e.clipboardData ? e.clipboardData : window.clipboardData;
        const pasteData = clipboard.getData('text');
        const lines = pasteData.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');

        if (lines.length > 1) {
            e.preventDefault();
            const isJudul = target.classList.contains('judulInput');
            const items = container.querySelectorAll('.artikel-item');
            let startIndex = Array.from(items).indexOf(target.closest('.artikel-item'));

            lines.forEach((line, idx) => {
                const targetIdx = startIndex + idx;
                if (targetIdx >= container.children.length) {
                    tambahArtikel();
                }
                const currentItem = container.children[targetIdx];
                if (isJudul) {
                    currentItem.querySelector('.judulInput').value = line;
                } else {
                    currentItem.querySelector('.linkInput').value = line;
                }
            });
        }
    });

    // Notifikasi SweetAlert2
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const jumlah = urlParams.get('jumlah');

    if (status === 'sukses') {
        Swal.fire({
            icon: 'success',
            title: 'Artikel Berhasil Disimpan!',
            text: `${jumlah} artikel telah ditambahkan ke database.`,
            confirmButtonColor: '#4a90e2'
        });
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'terhapus') {
        Swal.fire({
            icon: 'info',
            title: 'Artikel Dihapus',
            text: 'Data artikel berhasil dihapus.',
            confirmButtonColor: '#4a90e2'
        });
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Konfirmasi Sebelum Menghapus Data
function konfirmasiHapus(id) {
    Swal.fire({
        title: 'Hapus artikel ini?',
        text: "Data yang dihapus tidak dapat dikembalikan.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `index.php?hapus=${id}`;
        }
    });
}