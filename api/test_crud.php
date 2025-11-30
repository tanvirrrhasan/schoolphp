<?php
/**
 * Test CRUD API
 * Run: http://localhost/school-management/api/test_crud.php?table=teachers&orderBy=createdAt
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

// Helper function: Convert camelCase to snake_case
function camelToSnake($str) {
    return strtolower(preg_replace('/([a-z])([A-Z])/', '$1_$2', $str));
}

$table = $_GET['table'] ?? 'teachers';
$orderBy = $_GET['orderBy'] ?? 'createdAt';

echo "<h1>CRUD API Test</h1>";
echo "<h2>Parameters:</h2>";
echo "Table: $table<br>";
echo "OrderBy (original): $orderBy<br>";

$orderBySnake = camelToSnake($orderBy);
echo "OrderBy (converted): $orderBySnake<br>";

// Table mapping
$tables = [
    'notices' => 'notices',
    'posts' => 'posts',
    'teachers' => 'teachers',
    'students' => 'students',
    'supportStaff' => 'support_staff',
    'committee' => 'committee',
    'alumni' => 'alumni',
    'routines' => 'routines',
    'results' => 'results',
    'pages' => 'pages',
    'classes' => 'classes',
    'admissions' => 'admission_applications',
    'admissionApplications' => 'admission_applications',
    'settings' => 'settings_general',
    'settings_head' => 'settings_head',
    'settings_homepage' => 'settings_homepage',
    'media' => 'media_library'
];

if ($table === 'settings') {
    $dbTable = 'settings_general';
} elseif ($table === 'settings_head') {
    $dbTable = 'settings_head';
} elseif ($table === 'settings_homepage') {
    $dbTable = 'settings_homepage';
} else {
    $dbTable = $tables[$table] ?? null;
}

if (!isset($dbTable)) {
    echo "<p style='color:red;'>✗ Invalid table name: $table</p>";
    exit;
}

echo "Database Table: $dbTable<br>";

$conn = getDB();

// Test query
$query = "SELECT * FROM $dbTable ORDER BY $orderBySnake DESC LIMIT 5";
echo "<h2>SQL Query:</h2>";
echo "<code>$query</code><br><br>";

try {
    $stmt = $conn->prepare($query);
    if ($stmt === false) {
        echo "<p style='color:red;'>✗ SQL prepare error: " . $conn->error . "</p>";
        exit;
    }
    
    $stmt->execute();
    
    if ($stmt->error) {
        echo "<p style='color:red;'>✗ SQL execute error: " . $stmt->error . "</p>";
        exit;
    }
    
    $result = $stmt->get_result();
    
    echo "<h2>Results:</h2>";
    echo "<p style='color:green;'>✓ Query successful! Found " . $result->num_rows . " rows</p>";
    
    if ($result->num_rows > 0) {
        echo "<table border='1' cellpadding='5'>";
        $firstRow = $result->fetch_assoc();
        echo "<tr>";
        foreach (array_keys($firstRow) as $col) {
            echo "<th>$col</th>";
        }
        echo "</tr>";
        
        // Reset result pointer
        $result->data_seek(0);
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $val) {
                echo "<td>" . htmlspecialchars(substr($val, 0, 50)) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>✗ Exception: " . $e->getMessage() . "</p>";
}

$conn->close();
?>

