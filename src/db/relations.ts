import { relations } from "drizzle-orm/relations";
import { suppliers, products, categories, shippers, orders, customers, employees, orderDetails } from "./schema";

export const productsRelations = relations(products, ({one, many}) => ({
	supplier: one(suppliers, {
		fields: [products.supplierId],
		references: [suppliers.supplierId]
	}),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.categoryId]
	}),
	orderDetails: many(orderDetails),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	products: many(products),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	shipper: one(shippers, {
		fields: [orders.shipperId],
		references: [shippers.shipperId]
	}),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.customerId]
	}),
	employee: one(employees, {
		fields: [orders.employeeId],
		references: [employees.employeeId]
	}),
	orderDetails: many(orderDetails),
}));

export const shippersRelations = relations(shippers, ({many}) => ({
	orders: many(orders),
}));

export const customersRelations = relations(customers, ({many}) => ({
	orders: many(orders),
}));

export const employeesRelations = relations(employees, ({many}) => ({
	orders: many(orders),
}));

export const orderDetailsRelations = relations(orderDetails, ({one}) => ({
	product: one(products, {
		fields: [orderDetails.productId],
		references: [products.productId]
	}),
	order: one(orders, {
		fields: [orderDetails.orderId],
		references: [orders.orderId]
	}),
}));