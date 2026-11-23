<?php
// Koneksi ke Database MySQL
$host = "localhost";
$user = "root";
$pass = "";
$db   = "tugas_pkl";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Koneksi database gagal: " . $conn->connect_error);
}

// Proses Simpan Banyak Artikel Sekaligus
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['kumpul'])) {
    $nama     = trim($_POST['nama'] ?? '');
    $titles   = $_POST['judul'] ?? [];
    $links    = $_POST['link'] ?? [];
    $inserted = 0;

    if ($nama !== '') {
        $stmt = $conn->prepare("INSERT INTO pengumpulan (nama, judul, link) VALUES (?, ?, ?)");
        if ($stmt) {
            foreach ($titles as $i => $judulRaw) {
                $judul = trim($judulRaw);
                $link  = trim($links[$i] ?? '');
                if ($judul === '' or $link === '') continue;

                $stmt->bind_param("sss", $nama, $judul, $link);
                if ($stmt->execute()) {
                    $inserted++;
                }
            }
            $stmt->close();
        }
    }

    $status = $inserted > 0 ? 'sukses' : 'gagal';
    header("Location: index.php?status=" . $status . "&jumlah=" . $inserted);
    exit;
}

// Proses Hapus Artikel
if (isset($_GET['hapus'])) {
    $id = intval($_GET['hapus']);
    $conn->query("DELETE FROM pengumpulan WHERE id = $id");
    header("Location: index.php?status=terhapus");
    exit;
}

// Fitur Pencarian (Search), Filter Tanggal & Sorting
$search         = $_GET['search'] ?? '';
$filter_tanggal = $_GET['filter_tanggal'] ?? '';
$sort           = $_GET['sort'] ?? 'tanggal_desc';
$page           = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit          = 15;
$offset         = ($page - 1) * $limit;

$where = [];
if ($search !== '') {
    $safe_search = $conn->real_escape_string($search);
    $where[] = "(nama LIKE '%$safe_search%' OR judul LIKE '%$safe_search%' OR link LIKE '%$safe_search%')";
}
if ($filter_tanggal !== '') {
    $safe_tgl = $conn->real_escape_string($filter_tanggal);
    $where[] = "DATE(tanggal) = '$safe_tgl'";
}

$whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

$orderBy = "ORDER BY tanggal DESC";
if ($sort === 'nama_asc') {
    $orderBy = "ORDER BY nama ASC, tanggal DESC";
} elseif ($sort === 'tanggal_asc') {
    $orderBy = "ORDER BY tanggal ASC";
}

// Hitung Total Data
$totalResult = $conn->query("SELECT COUNT(*) AS jml FROM pengumpulan $whereSql");
$totalRows   = $totalResult->fetch_assoc()['jml'] ?? 0;
$totalPages  = max(1, ceil($totalRows / $limit));

// Ambil Data Artikel
$sql    = "SELECT * FROM pengumpulan $whereSql $orderBy LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);

// Ambil Nama Domain Otomatis dari Link
function getDomain($url) {
    $host = parse_url($url, PHP_URL_HOST);
    return $host ? preg_replace('/^www\./', '', $host) : 'tautan-web';
}
?>