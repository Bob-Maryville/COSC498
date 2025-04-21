CREATE DATABASE ConstructionEstimates;

USE ConstructionEstimates;

-- Customers table remains the same as it matches the customer form
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255),
    Phone VARCHAR(20),
    Address VARCHAR(255)
);

-- Materials table to store predefined items and their base prices
CREATE TABLE Materials (
    MaterialID INT PRIMARY KEY,
    Category VARCHAR(50) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Size VARCHAR(20),
    UnitPrice DECIMAL(10,2) NOT NULL
);

-- Estimates table - added EstimateDate to match the form
CREATE TABLE Estimates (
    EstimateID INT PRIMARY KEY,
    CustomerID INT,
    EstimateNumber NVARCHAR(20) UNIQUE NOT NULL,
    EstimateDate DATE NOT NULL,
    DateCreated DATE NOT NULL,
    ValidUntil DATE,
    Status NVARCHAR(20) CHECK(Status IN ('draft', 'sent', 'accepted', 'rejected')) DEFAULT 'draft',
    TotalAmount DECIMAL(10,2) NOT NULL,
    Notes NVARCHAR(200),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- EstimateItems table - updated to match form structure
CREATE TABLE EstimateItems (
    ItemID INT PRIMARY KEY,
    EstimateID INT,
    Category VARCHAR(50) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Size VARCHAR(20),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    LinePrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (EstimateID) REFERENCES Estimates(EstimateID)
);

-- Create indexes
CREATE INDEX IX_Estimates_CustomerID ON Estimates(CustomerID);
CREATE INDEX IX_EstimateItems_EstimateID ON EstimateItems(EstimateID);

-- Insert predefined materials data
INSERT INTO Materials (MaterialID, Category, Type, Size, UnitPrice) VALUES
-- Shingles
(1, 'Shingles', '3-tab', NULL, 25.00),
(2, 'Shingles', 'architectural', NULL, 35.00),
(3, 'Shingles', 'designer', NULL, 45.00),

-- Drip Edge
(4, 'Drip Edge', 'standard', 'small', 15.00),
(5, 'Drip Edge', 'standard', 'large', 20.00),

-- Vents
(6, 'Vents', 'box', NULL, 30.00),
(7, 'Vents', 'turbine', NULL, 40.00),
(8, 'Vents', 'ridge', NULL, 35.00),

-- Chimney Flashing
(9, 'Chimney Flashing', 'standard', 'small', 50.00),
(10, 'Chimney Flashing', 'standard', 'medium', 75.00),
(11, 'Chimney Flashing', 'standard', 'large', 100.00),

-- Underlayment
(12, 'Underlayment', 'felt', NULL, 25.00),
(13, 'Underlayment', 'synthetic', NULL, 35.00),

-- Dumpster
(14, 'Dumpster', 'standard', 'small', 200.00),
(15, 'Dumpster', 'standard', 'medium', 300.00),
(16, 'Dumpster', 'standard', 'large', 400.00)
;