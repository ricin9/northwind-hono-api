-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Categories` (
	`CategoryID` integer PRIMARY KEY AUTOINCREMENT,
	`CategoryName` text,
	`Description` text,
	`Picture` blob
);
--> statement-breakpoint
CREATE TABLE `CustomerCustomerDemo` (
	`CustomerID` text NOT NULL,
	`CustomerTypeID` text NOT NULL,
	PRIMARY KEY(`CustomerID`, `CustomerTypeID`),
	FOREIGN KEY (`CustomerTypeID`) REFERENCES `CustomerDemographics`(`CustomerTypeID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`CustomerID`) REFERENCES `Customers`(`CustomerID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `CustomerDemographics` (
	`CustomerTypeID` text PRIMARY KEY NOT NULL,
	`CustomerDesc` text
);
--> statement-breakpoint
CREATE TABLE `Customers` (
	`CustomerID` text PRIMARY KEY,
	`CompanyName` text,
	`ContactName` text,
	`ContactTitle` text,
	`Address` text,
	`City` text,
	`Region` text,
	`PostalCode` text,
	`Country` text,
	`Phone` text,
	`Fax` text
);
--> statement-breakpoint
CREATE TABLE `Employees` (
	`EmployeeID` integer PRIMARY KEY AUTOINCREMENT,
	`LastName` text,
	`FirstName` text,
	`Title` text,
	`TitleOfCourtesy` text,
	`BirthDate` numeric,
	`HireDate` numeric,
	`Address` text,
	`City` text,
	`Region` text,
	`PostalCode` text,
	`Country` text,
	`HomePhone` text,
	`Extension` text,
	`Photo` blob,
	`Notes` text,
	`ReportsTo` integer,
	`PhotoPath` text,
	FOREIGN KEY (`ReportsTo`) REFERENCES `Employees`(`EmployeeID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `EmployeeTerritories` (
	`EmployeeID` integer NOT NULL,
	`TerritoryID` text NOT NULL,
	PRIMARY KEY(`EmployeeID`, `TerritoryID`),
	FOREIGN KEY (`TerritoryID`) REFERENCES `Territories`(`TerritoryID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`EmployeeID`) REFERENCES `Employees`(`EmployeeID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Order Details` (
	`OrderID` integer NOT NULL,
	`ProductID` integer NOT NULL,
	`UnitPrice` numeric DEFAULT 0 NOT NULL,
	`Quantity` integer DEFAULT 1 NOT NULL,
	`Discount` real DEFAULT 0 NOT NULL,
	PRIMARY KEY(`OrderID`, `ProductID`),
	FOREIGN KEY (`ProductID`) REFERENCES `Products`(`ProductID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`OrderID`) REFERENCES `Orders`(`OrderID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Orders` (
	`OrderID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`CustomerID` text,
	`EmployeeID` integer,
	`OrderDate` numeric,
	`RequiredDate` numeric,
	`ShippedDate` numeric,
	`ShipVia` integer,
	`Freight` numeric DEFAULT 0,
	`ShipName` text,
	`ShipAddress` text,
	`ShipCity` text,
	`ShipRegion` text,
	`ShipPostalCode` text,
	`ShipCountry` text,
	FOREIGN KEY (`ShipVia`) REFERENCES `Shippers`(`ShipperID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`CustomerID`) REFERENCES `Customers`(`CustomerID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`EmployeeID`) REFERENCES `Employees`(`EmployeeID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Products` (
	`ProductID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ProductName` text NOT NULL,
	`SupplierID` integer,
	`CategoryID` integer,
	`QuantityPerUnit` text,
	`UnitPrice` numeric DEFAULT 0,
	`UnitsInStock` integer DEFAULT 0,
	`UnitsOnOrder` integer DEFAULT 0,
	`ReorderLevel` integer DEFAULT 0,
	`Discontinued` text DEFAULT '0' NOT NULL,
	FOREIGN KEY (`SupplierID`) REFERENCES `Suppliers`(`SupplierID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`CategoryID`) REFERENCES `Categories`(`CategoryID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Regions` (
	`RegionID` integer PRIMARY KEY NOT NULL,
	`RegionDescription` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Shippers` (
	`ShipperID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`CompanyName` text NOT NULL,
	`Phone` text
);
--> statement-breakpoint
CREATE TABLE `Suppliers` (
	`SupplierID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`CompanyName` text NOT NULL,
	`ContactName` text,
	`ContactTitle` text,
	`Address` text,
	`City` text,
	`Region` text,
	`PostalCode` text,
	`Country` text,
	`Phone` text,
	`Fax` text,
	`HomePage` text
);
--> statement-breakpoint
CREATE TABLE `Territories` (
	`TerritoryID` text PRIMARY KEY NOT NULL,
	`TerritoryDescription` text NOT NULL,
	`RegionID` integer NOT NULL,
	FOREIGN KEY (`RegionID`) REFERENCES `Regions`(`RegionID`) ON UPDATE no action ON DELETE no action
);

*/