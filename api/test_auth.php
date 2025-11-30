<?php
/**
 * Test Authentication API
 * Use this to test if authentication is working
 * Run: http://localhost/school-management/api/test_auth.php
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Authentication API Test</h1>";

// Test 1: Database Connection
echo "<h2>1. Database Connection Test</h2>";
try {
    $conn = getDB();
    echo "✓ Database connection successful<br>";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "<br>";
    exit;
}

// Test 2: Check if user exists
echo "<h2>2. User Check</h2>";
$email = 'admin@school.com';
$stmt = $conn->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "✗ User not found: $email<br>";
    echo "Please run reset_password.php first<br>";
} else {
    $user = $result->fetch_assoc();
    echo "✓ User found:<br>";
    echo "  - ID: " . $user['id'] . "<br>";
    echo "  - Email: " . $user['email'] . "<br>";
    echo "  - Role: " . $user['role'] . "<br>";
    echo "  - Password Hash: " . substr($user['password'], 0, 20) . "...<br>";
}

// Test 3: Password Verification
echo "<h2>3. Password Verification Test</h2>";
$testPassword = 'admin123';
if (isset($user)) {
    if (password_verify($testPassword, $user['password'])) {
        echo "✓ Password verification successful for: $testPassword<br>";
    } else {
        echo "✗ Password verification failed for: $testPassword<br>";
        echo "Please run reset_password.php to reset the password<br>";
    }
}

// Test 4: Test Login API
echo "<h2>4. Login API Test</h2>";
echo "<form method='POST' action='auth.php?action=login' style='margin: 20px 0;'>";
echo "<input type='hidden' name='test' value='1'>";
echo "<p>Email: <input type='email' name='email' value='admin@school.com' required></p>";
echo "<p>Password: <input type='password' name='password' value='admin123' required></p>";
echo "<button type='submit'>Test Login</button>";
echo "</form>";

// Test 5: API Endpoint Check
echo "<h2>5. API Endpoint Check</h2>";
$apiUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/auth.php?action=login';
echo "API URL: <code>$apiUrl</code><br>";
echo "Make sure this URL is accessible from your frontend<br>";

// Test 6: CORS Check
echo "<h2>6. CORS Headers Check</h2>";
$headers = headers_list();
$corsFound = false;
foreach ($headers as $header) {
    if (stripos($header, 'Access-Control') !== false) {
        echo "✓ CORS header found: $header<br>";
        $corsFound = true;
    }
}
if (!$corsFound) {
    echo "⚠ CORS headers may not be set. Check config.php<br>";
}

echo "<hr>";
echo "<h2>Next Steps:</h2>";
echo "<ol>";
echo "<li>If user not found or password verification failed, run: <a href='reset_password.php'>reset_password.php</a></li>";
echo "<li>Check browser console for any JavaScript errors</li>";
echo "<li>Verify API_BASE_URL in your frontend matches: <code>$apiUrl</code></li>";
echo "<li>Make sure XAMPP Apache is running</li>";
echo "</ol>";

$conn->close();
?>

