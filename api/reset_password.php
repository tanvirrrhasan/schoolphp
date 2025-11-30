<?php
/**
 * Password Reset Script
 * Use this to reset admin password
 * Run: http://localhost/school-management/api/reset_password.php
 */

require_once 'config.php';

// Password to set
$email = 'admin@school.com';
$newPassword = 'admin123';

// Generate password hash
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

$conn = getDB();

// Check if user exists
$stmt = $conn->prepare("SELECT id, email FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Create user if doesn't exist
    $stmt = $conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'super_admin')");
    $stmt->bind_param("ss", $email, $hashedPassword);
    if ($stmt->execute()) {
        echo "User created successfully!<br>";
        echo "Email: $email<br>";
        echo "Password: $newPassword<br>";
        echo "Hash: $hashedPassword<br>";
    } else {
        echo "Error creating user: " . $conn->error;
    }
} else {
    // Update existing user
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->bind_param("ss", $hashedPassword, $email);
    if ($stmt->execute()) {
        echo "Password updated successfully!<br>";
        echo "Email: $email<br>";
        echo "Password: $newPassword<br>";
        echo "Hash: $hashedPassword<br>";
    } else {
        echo "Error updating password: " . $conn->error;
    }
}

// Test password verification
echo "<br>--- Testing Password Verification ---<br>";
$stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (password_verify($newPassword, $user['password'])) {
    echo "✓ Password verification successful!<br>";
} else {
    echo "✗ Password verification failed!<br>";
}

$conn->close();
?>

