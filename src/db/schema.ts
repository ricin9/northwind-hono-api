import { sqliteTable, integer, text, numeric } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("Categories", {
  categoryId: integer("CategoryID").primaryKey({ autoIncrement: true }),
  categoryName: text("CategoryName").notNull(),
  description: text("Description"),
});

export const customers = sqliteTable("Customers", {
  customerId: integer("CustomerID").primaryKey({ autoIncrement: true }),
  customerName: text("CustomerName").notNull(),
  contactName: text("ContactName").notNull(),
  address: text("Address").notNull(),
  city: text("City").notNull(),
  postalCode: text("PostalCode").notNull(),
  country: text("Country").notNull(),
});

export const employees = sqliteTable("Employees", {
  employeeId: integer("EmployeeID").primaryKey({ autoIncrement: true }),
  lastName: text("LastName").notNull(),
  firstName: text("FirstName").notNull(),
  birthDate: numeric("BirthDate").notNull(),
  photo: text("Photo"),
  notes: text("Notes"),
});

export const shippers = sqliteTable("Shippers", {
  shipperId: integer("ShipperID").primaryKey({ autoIncrement: true }),
  shipperName: text("ShipperName").notNull(),
  phone: text("Phone").notNull(),
});

export const suppliers = sqliteTable("Suppliers", {
  supplierId: integer("SupplierID").primaryKey({ autoIncrement: true }),
  supplierName: text("SupplierName").notNull(),
  contactName: text("ContactName").notNull(),
  address: text("Address").notNull(),
  city: text("City").notNull(),
  postalCode: text("PostalCode").notNull(),
  country: text("Country").notNull(),
  phone: text("Phone").notNull(),
});

export const products = sqliteTable("Products", {
  productId: integer("ProductID").primaryKey({ autoIncrement: true }),
  productName: text("ProductName").notNull(),
  supplierId: integer("SupplierID")
    .references(() => suppliers.supplierId)
    .notNull(),
  categoryId: integer("CategoryID")
    .references(() => categories.categoryId)
    .notNull(),
  unit: text("Unit").notNull(),
  price: numeric("Price").notNull(),
});

export const orders = sqliteTable("Orders", {
  orderId: integer("OrderID").primaryKey({ autoIncrement: true }),
  customerId: integer("CustomerID")
    .references(() => customers.customerId)
    .notNull(),
  employeeId: integer("EmployeeID")
    .references(() => employees.employeeId)
    .notNull(),
  orderDate: numeric("OrderDate").notNull(),
  shipperId: integer("ShipperID")
    .references(() => shippers.shipperId)
    .notNull(),
});

export const orderDetails = sqliteTable("OrderDetails", {
  orderDetailId: integer("OrderDetailID").primaryKey({ autoIncrement: true }),
  orderId: integer("OrderID")
    .references(() => orders.orderId)
    .notNull(),
  productId: integer("ProductID")
    .references(() => products.productId)
    .notNull(),
  quantity: integer("Quantity").notNull(),
});
