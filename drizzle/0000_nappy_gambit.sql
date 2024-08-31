-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Categories` (
	`CategoryID` integer PRIMARY KEY AUTOINCREMENT,
	`CategoryName` text,
	`Description` text
);
--> statement-breakpoint
CREATE TABLE `Customers` (
	`CustomerID` integer PRIMARY KEY AUTOINCREMENT,
	`CustomerName` text,
	`ContactName` text,
	`Address` text,
	`City` text,
	`PostalCode` text,
	`Country` text
);
--> statement-breakpoint
CREATE TABLE `Employees` (
	`EmployeeID` integer PRIMARY KEY AUTOINCREMENT,
	`LastName` text,
	`FirstName` text,
	`BirthDate` numeric,
	`Photo` text,
	`Notes` text
);
--> statement-breakpoint
CREATE TABLE `Shippers` (
	`ShipperID` integer PRIMARY KEY AUTOINCREMENT,
	`ShipperName` text,
	`Phone` text
);
--> statement-breakpoint
CREATE TABLE `Suppliers` (
	`SupplierID` integer PRIMARY KEY AUTOINCREMENT,
	`SupplierName` text,
	`ContactName` text,
	`Address` text,
	`City` text,
	`PostalCode` text,
	`Country` text,
	`Phone` text
);
--> statement-breakpoint
CREATE TABLE `Products` (
	`ProductID` integer PRIMARY KEY AUTOINCREMENT,
	`ProductName` text,
	`SupplierID` integer,
	`CategoryID` integer,
	`Unit` text,
	`Price` numeric DEFAULT 0,
	FOREIGN KEY (`SupplierID`) REFERENCES `Suppliers`(`SupplierID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`CategoryID`) REFERENCES `Categories`(`CategoryID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Orders` (
	`OrderID` integer PRIMARY KEY AUTOINCREMENT,
	`CustomerID` integer,
	`EmployeeID` integer,
	`OrderDate` numeric,
	`ShipperID` integer,
	FOREIGN KEY (`ShipperID`) REFERENCES `Shippers`(`ShipperID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`CustomerID`) REFERENCES `Customers`(`CustomerID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`EmployeeID`) REFERENCES `Employees`(`EmployeeID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `OrderDetails` (
	`OrderDetailID` integer PRIMARY KEY AUTOINCREMENT,
	`OrderID` integer,
	`ProductID` integer,
	`Quantity` integer,
	FOREIGN KEY (`ProductID`) REFERENCES `Products`(`ProductID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`OrderID`) REFERENCES `Orders`(`OrderID`) ON UPDATE no action ON DELETE no action
);

*/