<?php
// Set error reporting to prevent HTML errors
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors as HTML
ini_set('log_errors', 1); // Log errors instead

require_once 'config.php';

// Helper function: Convert camelCase to snake_case
function camelToSnake($str) {
    return strtolower(preg_replace('/([a-z])([A-Z])/', '$1_$2', $str));
}

// Set error handler to return JSON (after config.php is loaded)
set_error_handler(function($severity, $message, $file, $line) {
    if (error_reporting() & $severity) {
        // Use sendResponse directly to avoid circular dependency
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'PHP Error: ' . $message], JSON_UNESCAPED_UNICODE);
        exit();
    }
    return true;
});

$method = $_SERVER['REQUEST_METHOD'];
$table = $_GET['table'] ?? '';
$id = $_GET['id'] ?? null;

// Require authentication for write operations (POST, PUT, DELETE)
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    verifyAuth(true); // This will send error and exit if not authenticated
}

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
    'admissions' => 'admission_applications', // Frontend uses 'admissions'
    'admissionApplications' => 'admission_applications',
    'settings' => 'settings_general',
    'settings_head' => 'settings_head',
    'settings_homepage' => 'settings_homepage',
    'media' => 'media'
];

// Handle settings table name mapping
// If table is 'settings' and id is 'head' or 'homepage', map to the correct table
if ($table === 'settings' && $id === 'head') {
    $dbTable = 'settings_head';
} elseif ($table === 'settings' && $id === 'homepage') {
    $dbTable = 'settings_homepage';
} elseif ($table === 'settings') {
    $dbTable = 'settings_general';
} elseif ($table === 'settings_head') {
    $dbTable = 'settings_head';
} elseif ($table === 'settings_homepage') {
    $dbTable = 'settings_homepage';
} else {
    $dbTable = $tables[$table] ?? null;
}

if (!isset($dbTable)) {
    sendError('Invalid table name: ' . $table, 400);
}

$conn = getDB();

// GET - List or single item
if ($method === 'GET') {
    if ($id) {
        // Get single item
        // For settings tables and media table, use string id
        if (in_array($dbTable, ['settings_general', 'settings_head', 'settings_homepage', 'media'])) {
            $stmt = $conn->prepare("SELECT * FROM $dbTable WHERE id = ?");
            $stmt->bind_param("s", $id);
        } else {
            $stmt = $conn->prepare("SELECT * FROM $dbTable WHERE id = ?");
            $stmt->bind_param("i", $id);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // For media table with id='library', return empty object if not found
            if ($table === 'media' && $id === 'library') {
                sendResponse(['id' => 'library', 'files' => []]);
            } 
            // For settings tables, return empty object if not found (to prevent frontend crashes)
            elseif (in_array($dbTable, ['settings_general', 'settings_head', 'settings_homepage'])) {
                sendResponse(['id' => $id]);
            } else {
                sendError('Not found', 404);
            }
        } else {
            $row = $result->fetch_assoc();
            convertTimestamps($row);
            convertJsonFields($row);
            sendResponse($row);
        }
    } else {
        // Get list with filters
        $filters = $_GET['filters'] ?? '';
        $orderBy = $_GET['orderBy'] ?? 'created_at';
        $orderDir = strtoupper($_GET['orderDir'] ?? 'DESC');
        $limit = $_GET['limit'] ?? null;
        
        // Convert camelCase to snake_case for orderBy and sanitize
        $orderBy = camelToSnake($orderBy);
        $orderBy = preg_replace('/[^a-z0-9_]/', '', $orderBy); // Only allow alphanumeric and underscore
        
        // Validate orderDir
        if (!in_array($orderDir, ['ASC', 'DESC'])) {
            $orderDir = 'DESC';
        }
        
        $query = "SELECT * FROM $dbTable";
        $params = [];
        $types = '';
        
        if (!empty($filters)) {
            $filterData = json_decode($filters, true);
            if ($filterData && is_array($filterData)) {
                $conditions = [];
                foreach ($filterData as $filter) {
                    $field = sanitize($filter['field']);
                    // Convert camelCase to snake_case for filter field
                    $field = camelToSnake($field);
                    $operator = $filter['operator'];
                    $value = $filter['value'];
                    
                    if ($operator === '==') {
                        $operator = '=';
                    }
                    
                    $conditions[] = "$field $operator ?";
                    $params[] = $value;
                    $types .= getTypeChar($value);
                }
                if (!empty($conditions)) {
                    $query .= " WHERE " . implode(" AND ", $conditions);
                }
            }
        }
        
        $query .= " ORDER BY $orderBy $orderDir";
        
        if ($limit) {
            $query .= " LIMIT ?";
            $params[] = (int)$limit;
            $types .= 'i';
        }
        
        try {
            $stmt = $conn->prepare($query);
            if ($stmt === false) {
                sendError('SQL prepare error: ' . $conn->error, 500);
            }
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            
            if ($stmt->error) {
                sendError('SQL execute error: ' . $stmt->error, 500);
            }
            
            $result = $stmt->get_result();
            
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                convertTimestamps($row);
                convertJsonFields($row);
                $rows[] = $row;
            }
            
            sendResponse($rows);
        } catch (Exception $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    }
}

// POST - Create
if ($method === 'POST') {
    $data = getRequestData();
    $data = sanitize($data);
    
    // Handle special cases for settings and media
    if ($table === 'settings') {
        $data['id'] = 'general';
    } elseif ($table === 'settings_head') {
        $data['id'] = 'head';
    } elseif ($table === 'settings_homepage') {
        $data['id'] = 'homepage';
    } elseif ($table === 'media') {
        // Allow media library creation with string ID
        if (!isset($data['id'])) {
            $data['id'] = 'library';
        }
    }
    
    // Handle array fields (JSON encode)
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            $data[$key] = json_encode($value);
        }
    }
    
    $fields = [];
    $values = [];
    $params = [];
    $types = '';
    
    foreach ($data as $key => $value) {
        // Convert camelCase to snake_case for database
        $dbKey = camelToSnake($key);
        $fields[] = $dbKey;
        $values[] = '?';
        $params[] = is_array($value) ? json_encode($value) : $value;
        $types .= getTypeChar($value);
    }
    
    // Add timestamps
    $fields[] = 'created_at';
    $values[] = 'NOW()';
    
    $query = "INSERT INTO $dbTable (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $values) . ")";
    
    // Remove NOW() from params and adjust types accordingly
    $filteredParams = [];
    $filteredTypes = '';
    foreach ($params as $index => $param) {
        if ($param !== 'NOW()') {
            $filteredParams[] = $param;
            $filteredTypes .= $types[$index];
        }
    }
    $params = $filteredParams;
    $types = $filteredTypes;
    
    $stmt = $conn->prepare($query);
    if ($stmt === false) {
        sendError('SQL prepare error: ' . $conn->error, 500);
    }
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    if ($stmt->execute()) {
        // For tables with string IDs, return the provided ID, otherwise use insert_id
        if (in_array($table, ['settings', 'settings_head', 'settings_homepage', 'media']) && isset($data['id'])) {
            $insertId = $data['id'];
        } else {
            $insertId = $conn->insert_id;
        }
        sendResponse(['id' => $insertId, 'success' => true], 201);
    } else {
        $errorMsg = $stmt->error ? $stmt->error : $conn->error;
        sendError('Failed to create record: ' . $errorMsg, 500);
    }
}

// PUT - Update
if ($method === 'PUT') {
    if (!$id) {
        sendError('ID is required for update', 400);
    }
    
    $data = getRequestData();
    $data = sanitize($data);
    
    $sets = [];
    $params = [];
    $types = '';
    
    foreach ($data as $key => $value) {
        if ($key === 'id') continue;
        $dbKey = camelToSnake($key);
        $sets[] = "$dbKey = ?";
        $params[] = is_array($value) ? json_encode($value) : $value;
        $types .= getTypeChar($value);
    }
    
    $params[] = $id;
    // For settings tables and media table, use string id
    if (in_array($table, ['settings', 'settings_head', 'settings_homepage', 'media'])) {
        $types .= 's';
    } else {
        $types .= 'i';
    }
    
    $query = "UPDATE $dbTable SET " . implode(', ', $sets) . ", updated_at = NOW() WHERE id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        sendResponse(['success' => true, 'id' => $id]);
    } else {
        sendError('Failed to update record: ' . $conn->error, 500);
    }
}

// DELETE
if ($method === 'DELETE') {
    if (!$id) {
        sendError('ID is required for delete', 400);
    }
    
    // For settings tables and media table, use string id
    if (in_array($table, ['settings', 'settings_head', 'settings_homepage', 'media'])) {
        $stmt = $conn->prepare("DELETE FROM $dbTable WHERE id = ?");
        $stmt->bind_param("s", $id);
    } else {
        $stmt = $conn->prepare("DELETE FROM $dbTable WHERE id = ?");
        $stmt->bind_param("i", $id);
    }
    
    if ($stmt->execute()) {
        sendResponse(['success' => true, 'id' => $id]);
    } else {
        sendError('Failed to delete record: ' . $conn->error, 500);
    }
}

sendError('Method not allowed', 405);

// Helper functions
function getTypeChar($value) {
    if (is_int($value)) return 'i';
    if (is_float($value)) return 'd';
    if (is_bool($value)) return 'i';
    return 's';
}

function convertTimestamps(&$row) {
    if (isset($row['created_at'])) {
        $row['createdAt'] = $row['created_at'];
        unset($row['created_at']);
    }
    if (isset($row['updated_at'])) {
        $row['updatedAt'] = $row['updated_at'];
        unset($row['updated_at']);
    }
    if (isset($row['published_at'])) {
        $row['publishedAt'] = $row['published_at'];
        unset($row['published_at']);
    }
}

function snakeToCamel($str) {
    return lcfirst(str_replace('_', '', ucwords($str, '_')));
}

function convertJsonFields(&$row) {
    // Convert JSON fields back to arrays
    $jsonFields = ['subjects', 'sections', 'attachments', 'slider_images', 'featured_sections', 'gallery', 'assigned_textbooks', 'table_data', 'files'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $decoded = json_decode($row[$field], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $row[$field] = $decoded;
                // Also convert to camelCase for frontend compatibility
                $camelField = snakeToCamel($field);
                if ($camelField !== $field) {
                    $row[$camelField] = $decoded;
                }
            }
        }
    }
}

?>

