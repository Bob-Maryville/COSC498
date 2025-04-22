<?php
header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception('Invalid data received');
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
        $currentDate = $data['customer']['date'];
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
        // Rollback on error
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
