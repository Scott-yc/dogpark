<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

   
    echo json_encode([
        'name' => $name,
        'email' => $email,
        'message' => $message
    ]);
} else {
    
    echo json_encode(['error' => 'Invalid request method']);
}
?>
