import { relations } from "drizzle-orm/relations";
import {
  customerDemographics,
  customerCustomerDemo,
  customers,
  employees,
  territories,
  employeeTerritories,
  products,
  orderDetails,
  orders,
  shippers,
  suppliers,
  categories,
  regions,
} from "./schema";

export const customerCustomerDemoRelations = relations(
  customerCustomerDemo,
  ({ one }) => ({
    customerDemographic: one(customerDemographics, {
      fields: [customerCustomerDemo.customerTypeId],
      references: [customerDemographics.customerTypeId],
    }),
    customer: one(customers, {
      fields: [customerCustomerDemo.customerId],
      references: [customers.customerId],
    }),
  })
);

export const customerDemographicsRelations = relations(
  customerDemographics,
  ({ many }) => ({
    customerCustomerDemos: many(customerCustomerDemo),
  })
);

export const customersRelations = relations(customers, ({ many }) => ({
  customerCustomerDemos: many(customerCustomerDemo),
  orders: many(orders),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employees.reportsTo],
    references: [employees.employeeId],
    relationName: "employees_reportsTo_employees_employeeId",
  }),
  employees: many(employees, {
    relationName: "employees_reportsTo_employees_employeeId",
  }),
  employeeTerritories: many(employeeTerritories),
  orders: many(orders),
}));

export const employeeTerritoriesRelations = relations(
  employeeTerritories,
  ({ one }) => ({
    territory: one(territories, {
      fields: [employeeTerritories.territoryId],
      references: [territories.territoryId],
    }),
    employee: one(employees, {
      fields: [employeeTerritories.employeeId],
      references: [employees.employeeId],
    }),
  })
);

export const territoriesRelations = relations(territories, ({ one, many }) => ({
  employeeTerritories: many(employeeTerritories),
  region: one(regions, {
    fields: [territories.regionId],
    references: [regions.regionId],
  }),
}));

export const orderDetailsRelations = relations(orderDetails, ({ one }) => ({
  product: one(products, {
    fields: [orderDetails.productId],
    references: [products.productId],
  }),
  order: one(orders, {
    fields: [orderDetails.orderId],
    references: [orders.orderId],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  orderDetails: many(orderDetails),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.supplierId],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.categoryId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  orderDetails: many(orderDetails),
  shipper: one(shippers, {
    fields: [orders.shipVia],
    references: [shippers.shipperId],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.customerId],
  }),
  employee: one(employees, {
    fields: [orders.employeeId],
    references: [employees.employeeId],
  }),
}));

export const shippersRelations = relations(shippers, ({ many }) => ({
  orders: many(orders),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  territories: many(territories),
}));
