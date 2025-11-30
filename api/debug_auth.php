<?php
/**
 * Debug Authentication - Check token reading
 * Run: http://localhost/school-management/api/debug_auth.php
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Authentication Debug</h1>";

echo "<h2>1. All Headers</h2>";
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    echo "<pre>";
    print_r($headers);
    echo "</pre>";
} else {
    echo "getallheaders() function not available<br>";
}

echo "<h2>2. \$_SERVER Headers</h2>";
echo "<pre>";
foreach ($_SERVER as $key => $value) {
    if (stripos($key, 'HTTP_') === 0 || stripos($key, 'AUTHORIZATION') !== false) {
        echo "$key: $value\n";
    }
}
echo "</pre>";

echo "<h2>3. Token Extraction Test</h2>";

// Simulate the token reading logic
$token = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = $_SERVER['HTTP_AUTHORIZATION'];
    echo "✓ Found in \$_SERVER['HTTP_AUTHORIZATION']: $token<br>";
} elseif (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $token = $headers['Authorization'];
        echo "✓ Found in getallheaders()['Authorization']: $token<br>";
    } elseif (isset($headers['authorization'])) {
        $token = $headers['authorization'];
        echo "✓ Found in getallheaders()['authorization']: $token<br>";
    }
} elseif (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) {
        $token = $headers['Authorization'];
        echo "✓ Found in apache_request_headers()['Authorization']: $token<br>";
    } elseif (isset($headers['authorization'])) {
        $token = $headers['authorization'];
        echo "✓ Found in apache_request_headers()['authorization']: $token<br>";
    }
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    echo "✓ Found in \$_SERVER['REDIRECT_HTTP_AUTHORIZATION']: $token<br>";
}

if (empty($token)) {
    echo "✗ No token found in any method<br>";
    echo "<p><strong>Solution:</strong> Make sure you're sending the Authorization header from the frontend.</p>";
} else {
    // Remove Bearer prefix if present
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }
    
    echo "<h3>4. Token Decode Test</h3>";
    $decoded = @base64_decode($token, true);
    if ($decoded === false) {
        echo "✗ Token decode failed<br>";
    } else {
        echo "✓ Token decoded: $decoded<br>";
        $parts = explode(':', $decoded);
        if (count($parts) === 2) {
            echo "✓ Token structure valid<br>";
            echo "  - User ID: " . $parts[0] . "<br>";
            echo "  - Timestamp: " . $parts[1] . "<br>";
            
            // Check if user exists
            $userId = intval($parts[0]);
            if ($userId > 0) {
                $conn = getDB();
                $stmt = $conn->prepare("SELECT id, email, role FROM users WHERE id = ?");
                $stmt->bind_param("i", $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    echo "✓ User found: " . $user['email'] . " (Role: " . $user['role'] . ")<br>";
                } else {
                    echo "✗ User not found in database<br>";
                }
                $conn->close();
            }
        } else {
            echo "✗ Invalid token structure (expected 'id:timestamp')<br>";
        }
    }
}

echo "<hr>";
echo "<h2>5. Test with localStorage Token</h2>";
echo "<p>Open browser console and run:</p>";
echo "<pre>";
echo "const token = localStorage.getItem('auth_token');\n";
echo "console.log('Token:', token);\n";
echo "fetch('http://localhost/school-management/api/auth.php?action=check', {\n";
echo "  headers: { 'Authorization': token }\n";
echo "}).then(r => r.json()).then(console.log);\n";
echo "</pre>";

?>

