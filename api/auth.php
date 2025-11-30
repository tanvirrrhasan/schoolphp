<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $data = getRequestData();
    $email = sanitize($data['email'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        sendError('Email and password are required');
    }
    
    $conn = getDB();
    $stmt = $conn->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Invalid email or password', 401);
    }
    
    $user = $result->fetch_assoc();
    
    if (!password_verify($password, $user['password'])) {
        sendError('Invalid email or password', 401);
    }
    
    // Generate simple token (in production, use JWT)
    $token = base64_encode($user['id'] . ':' . time());
    
    sendResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
}

if ($method === 'POST' && $action === 'logout') {
    sendResponse(['success' => true, 'message' => 'Logged out successfully']);
}

if ($method === 'GET' && $action === 'check') {
    // Get token from custom header X-Auth-Token (works reliably with Apache/XAMPP)
    $token = '';
    
    // Method 1: Try custom header X-Auth-Token (most reliable)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['X-Auth-Token'])) {
            $token = $headers['X-Auth-Token'];
        } elseif (isset($headers['x-auth-token'])) {
            $token = $headers['x-auth-token'];
        }
    }
    
    // Method 2: From $_SERVER (X-Auth-Token becomes HTTP_X_AUTH_TOKEN)
    if (empty($token) && isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $token = $_SERVER['HTTP_X_AUTH_TOKEN'];
    }
    
    // Method 3: Fallback to Authorization header (if available)
    if (empty($token)) {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $token = $headers['Authorization'];
            } elseif (isset($headers['authorization'])) {
                $token = $headers['authorization'];
            }
        }
        
        // Remove "Bearer " prefix if present
        if (!empty($token) && strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7);
        }
    }
    
    if (empty($token)) {
        sendError('Not authenticated', 401);
    }
    
    // Simple token validation (in production, use JWT)
    $decoded = @base64_decode($token, true);
    if ($decoded === false) {
        sendError('Invalid token format', 401);
    }
    
    $parts = explode(':', $decoded);
    if (count($parts) !== 2) {
        sendError('Invalid token structure', 401);
    }
    
    $userId = intval($parts[0]);
    if ($userId <= 0) {
        sendError('Invalid user ID', 401);
    }
    $conn = getDB();
    $stmt = $conn->prepare("SELECT id, email, role FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('User not found', 401);
    }
    
    $user = $result->fetch_assoc();
    sendResponse([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
}

sendError('Invalid action', 400);

?>

