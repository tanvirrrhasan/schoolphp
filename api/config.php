<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'school_management');

// File Upload Configuration
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_FILE_TYPES', ['application/pdf']);

// Base URL for file access
define('BASE_URL', 'http://localhost/school-management/uploads/');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
function getDB() {
    static $conn = null;
    if ($conn === null) {
        try {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            $conn->set_charset("utf8mb4");
            if ($conn->connect_error) {
                throw new Exception("Connection failed: " . $conn->connect_error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit();
        }
    }
    return $conn;
}

// Create upload directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
    mkdir(UPLOAD_DIR . 'images/', 0777, true);
    mkdir(UPLOAD_DIR . 'pdfs/', 0777, true);
}

// Helper function to send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Helper function to send error response
function sendError($message, $statusCode = 400) {
    sendResponse(['error' => $message], $statusCode);
}

// Helper function to sanitize input
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Helper function to get request data
function getRequestData() {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        return $_POST;
    }
    return $data ?: $_POST;
}

// Helper function to get authentication token from request
function getAuthToken() {
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
    
    return $token;
}

// Helper function to verify authentication token
function verifyAuth($requireAuth = true) {
    $token = getAuthToken();
    
    if (empty($token)) {
        if ($requireAuth) {
            sendError('Authentication required', 401);
        }
        return null;
    }
    
    // Simple token validation (in production, use JWT)
    $decoded = @base64_decode($token, true);
    if ($decoded === false) {
        if ($requireAuth) {
            sendError('Invalid token format', 401);
        }
        return null;
    }
    
    $parts = explode(':', $decoded);
    if (count($parts) !== 2) {
        if ($requireAuth) {
            sendError('Invalid token structure', 401);
        }
        return null;
    }
    
    $userId = intval($parts[0]);
    if ($userId <= 0) {
        if ($requireAuth) {
            sendError('Invalid user ID', 401);
        }
        return null;
    }
    
    $conn = getDB();
    $stmt = $conn->prepare("SELECT id, email, role FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        if ($requireAuth) {
            sendError('User not found', 401);
        }
        return null;
    }
    
    $user = $result->fetch_assoc();
    return $user;
}

?>

