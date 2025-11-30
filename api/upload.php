<?php
require_once 'config.php';

// Handle file upload
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Require authentication for file uploads
verifyAuth(true); // This will send error and exit if not authenticated

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    sendError('No file uploaded or upload error');
}

$file = $_FILES['file'];
$fileType = $file['type'];
$fileSize = $file['size'];
$fileName = $file['name'];
$tmpName = $file['tmp_name'];

// Validate file size
if ($fileSize > MAX_FILE_SIZE) {
    sendError('File size exceeds maximum allowed size (5MB)');
}

// Determine file type and directory
$isImage = in_array($fileType, ALLOWED_IMAGE_TYPES);
$isPdf = in_array($fileType, ALLOWED_FILE_TYPES);

if (!$isImage && !$isPdf) {
    sendError('Invalid file type. Only images and PDFs are allowed');
}

// Generate unique filename
$extension = pathinfo($fileName, PATHINFO_EXTENSION);
$uniqueName = uniqid() . '_' . time() . '.' . $extension;
$uploadDir = $isImage ? UPLOAD_DIR . 'images/' : UPLOAD_DIR . 'pdfs/';
$uploadPath = $uploadDir . $uniqueName;

// Move uploaded file
if (!move_uploaded_file($tmpName, $uploadPath)) {
    sendError('Failed to save file', 500);
}

// Get relative URL
$relativePath = ($isImage ? 'images/' : 'pdfs/') . $uniqueName;
$fileUrl = BASE_URL . $relativePath;

// Save to database
$conn = getDB();
$stmt = $conn->prepare("INSERT INTO media_library (file_path, file_name, file_type, file_size) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $relativePath, $fileName, $fileType, $fileSize);
$stmt->execute();
$fileId = $conn->insert_id;
$stmt->close();

// Also update the media table (for MediaLibrary component)
// Get existing files array from media table
$mediaStmt = $conn->prepare("SELECT files FROM media WHERE id = 'library'");
$mediaStmt->execute();
$mediaResult = $mediaStmt->get_result();
$existingFiles = [];

if ($mediaResult->num_rows > 0) {
    $row = $mediaResult->fetch_assoc();
    $existingFiles = json_decode($row['files'] ?? '[]', true) ?: [];
}

// Add new file URL to the array (only for images, as MediaLibrary only shows images)
if ($isImage) {
    $existingFiles[] = $fileUrl;
    
    // Update or insert media table
    $updateStmt = $conn->prepare("INSERT INTO media (id, files) VALUES ('library', ?) ON DUPLICATE KEY UPDATE files = ?");
    $filesJson = json_encode($existingFiles, JSON_UNESCAPED_UNICODE);
    $updateStmt->bind_param("ss", $filesJson, $filesJson);
    $updateStmt->execute();
    $updateStmt->close();
}

$mediaStmt->close();

sendResponse([
    'success' => true,
    'url' => $fileUrl,
    'path' => $relativePath,
    'id' => $fileId,
    'name' => $fileName,
    'type' => $fileType,
    'size' => $fileSize
]);

?>

