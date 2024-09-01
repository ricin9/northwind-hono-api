import {
  sqliteTable,
  integer,
  text,
  blob,
  foreignKey,
  primaryKey,
  numeric,
  real,
} from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("Categories", {
  categoryId: integer("CategoryID").primaryKey({ autoIncrement: true }),
  categoryName: text("CategoryName"),
  description: text("Description"),
  picture: blob("Picture"),
});

export const customerCustomerDemo = sqliteTable(
  "CustomerCustomerDemo",
  {
    customerId: text("CustomerID")
      .notNull()
      .references(() => customers.customerId),
    customerTypeId: text("CustomerTypeID")
      .notNull()
      .references(() => customerDemographics.customerTypeId),
  },
  (table) => {
    return {
      pk0: primaryKey({
        columns: [table.customerId, table.customerTypeId],
        name: "CustomerCustomerDemo_CustomerID_CustomerTypeID_pk",
      }),
    };
  }
);

export const customerDemographics = sqliteTable("CustomerDemographics", {
  customerTypeId: text("CustomerTypeID").primaryKey().notNull(),
  customerDesc: text("CustomerDesc"),
});

export const customers = sqliteTable("Customers", {
  customerId: text("CustomerID").primaryKey(),
  companyName: text("CompanyName"),
  contactName: text("ContactName"),
  contactTitle: text("ContactTitle"),
  address: text("Address"),
  city: text("City"),
  region: text("Region"),
  postalCode: text("PostalCode"),
  country: text("Country"),
  phone: text("Phone"),
  fax: text("Fax"),
});

export const employees = sqliteTable(
  "Employees",
  {
    employeeId: integer("EmployeeID").primaryKey({ autoIncrement: true }),
    lastName: text("LastName"),
    firstName: text("FirstName"),
    title: text("Title"),
    titleOfCourtesy: text("TitleOfCourtesy"),
    birthDate: numeric("BirthDate"),
    hireDate: numeric("HireDate"),
    address: text("Address"),
    city: text("City"),
    region: text("Region"),
    postalCode: text("PostalCode"),
    country: text("Country"),
    homePhone: text("HomePhone"),
    extension: text("Extension"),
    photo: blob("Photo"),
    notes: text("Notes"),
    reportsTo: integer("ReportsTo"),
    photoPath: text("PhotoPath"),
  },
  (table) => {
    return {
      employeesReportsToEmployeesEmployeeIdFk: foreignKey(() => ({
        columns: [table.reportsTo],
        foreignColumns: [table.employeeId],
        name: "Employees_ReportsTo_Employees_EmployeeID_fk",
      })),
    };
  }
);

export const employeeTerritories = sqliteTable(
  "EmployeeTerritories",
  {
    employeeId: integer("EmployeeID")
      .notNull()
      .references(() => employees.employeeId),
    territoryId: text("TerritoryID")
      .notNull()
      .references(() => territories.territoryId),
  },
  (table) => {
    return {
      pk0: primaryKey({
        columns: [table.employeeId, table.territoryId],
        name: "EmployeeTerritories_EmployeeID_TerritoryID_pk",
      }),
    };
  }
);

export const orderDetails = sqliteTable(
  "Order Details",
  {
    orderId: integer("OrderID")
      .notNull()
      .references(() => orders.orderId),
    productId: integer("ProductID")
      .notNull()
      .references(() => products.productId),
    unitPrice: numeric("UnitPrice").notNull(),
    quantity: integer("Quantity").default(1).notNull(),
    discount: real("Discount").default(0).notNull(),
  },
  (table) => {
    return {
      pk0: primaryKey({
        columns: [table.orderId, table.productId],
        name: "Order Details_OrderID_ProductID_pk",
      }),
    };
  }
);

export const orders = sqliteTable("Orders", {
  orderId: integer("OrderID").primaryKey({ autoIncrement: true }).notNull(),
  customerId: text("CustomerID").references(() => customers.customerId),
  employeeId: integer("EmployeeID").references(() => employees.employeeId),
  orderDate: numeric("OrderDate"),
  requiredDate: numeric("RequiredDate"),
  shippedDate: numeric("ShippedDate"),
  shipVia: integer("ShipVia").references(() => shippers.shipperId),
  freight: numeric("Freight"),
  shipName: text("ShipName"),
  shipAddress: text("ShipAddress"),
  shipCity: text("ShipCity"),
  shipRegion: text("ShipRegion"),
  shipPostalCode: text("ShipPostalCode"),
  shipCountry: text("ShipCountry"),
});

export const products = sqliteTable("Products", {
  productId: integer("ProductID").primaryKey({ autoIncrement: true }).notNull(),
  productName: text("ProductName").notNull(),
  supplierId: integer("SupplierID").references(() => suppliers.supplierId),
  categoryId: integer("CategoryID").references(() => categories.categoryId),
  quantityPerUnit: text("QuantityPerUnit"),
  unitPrice: numeric("UnitPrice").notNull(),
  unitsInStock: integer("UnitsInStock").default(0),
  unitsOnOrder: integer("UnitsOnOrder").default(0),
  reorderLevel: integer("ReorderLevel").default(0),
  discontinued: text("Discontinued").default("0").notNull(),
});

export const regions = sqliteTable("Regions", {
  regionId: integer("RegionID").primaryKey().notNull(),
  regionDescription: text("RegionDescription").notNull(),
});

export const shippers = sqliteTable("Shippers", {
  shipperId: integer("ShipperID").primaryKey({ autoIncrement: true }).notNull(),
  companyName: text("CompanyName").notNull(),
  phone: text("Phone"),
});

export const suppliers = sqliteTable("Suppliers", {
  supplierId: integer("SupplierID")
    .primaryKey({ autoIncrement: true })
    .notNull(),
  companyName: text("CompanyName").notNull(),
  contactName: text("ContactName"),
  contactTitle: text("ContactTitle"),
  address: text("Address"),
  city: text("City"),
  region: text("Region"),
  postalCode: text("PostalCode"),
  country: text("Country"),
  phone: text("Phone"),
  fax: text("Fax"),
  homePage: text("HomePage"),
});

export const territories = sqliteTable("Territories", {
  territoryId: text("TerritoryID").primaryKey().notNull(),
  territoryDescription: text("TerritoryDescription").notNull(),
  regionId: integer("RegionID")
    .notNull()
    .references(() => regions.regionId),
});
