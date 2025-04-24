<?php
// Set proper headers to allow POST
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Please use POST.'
    ]);
    exit;
}

try {
    // Get POST data
    $jsonData = file_get_contents('php://input');
    if (!$jsonData) {
        throw new Exception('No data received');
    }

    $data = json_decode($jsonData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    // Database connection
    $conn = new mysqli('localhost', 'your_username', 'your_password', 'ConstructionEstimates');
    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert customer
        $stmt = $conn->prepare("INSERT INTO Customers (Name, Email, Phone, Address) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", 
            $data['customer']['name'],
            $data['customer']['email'],
            $data['customer']['phone'],
            $data['customer']['address']
        );
        $stmt->execute();
        $customerId = $conn->insert_id;

        // Insert estimate
        $stmt = $conn->prepare("INSERT INTO Estimates (CustomerID, EstimateNumber, DateCreated, TotalAmount) VALUES (?, ?, ?, ?)");
        $estimateNumber = 'EST-' . date('Ymd') . '-' . rand(1000, 9999);
        $currentDate = date('Y-m-d');
        $stmt->bind_param("issd", 
            $customerId,
            $estimateNumber,
            $currentDate,
            $data['totalAmount']
        );
        $stmt->execute();
        $estimateId = $conn->insert_id;

        // Insert line items
        $stmt = $conn->prepare("INSERT INTO EstimateItems (EstimateID, Category, Type, Quantity, UnitPrice, LinePrice) VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($data['items'] as $item) {
            $stmt->bind_param("issidd",
                $estimateId,
                $item['itemType'],
                $item['selectedItem'],
                $item['quantity'],
                $item['unitPrice'],
                $item['lineTotal']
            );
            $stmt->execute();
        }

        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Estimate saved successfully',
            'estimateId' => $estimateId
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error saving estimate: ' . $e->getMessage()
    ]);
}
?>
