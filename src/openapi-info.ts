import { OpenAPIObjectConfigure } from "@hono/zod-openapi";

export const openApiInfo: OpenAPIObjectConfigure<any, any> = {
  openapi: "3.0.0",
  info: {
    title: "Northwind API",
    version: "1.0.0",
    description: `This a REST API implementation for the northwind sample db provided by micrsosoft, 
    the api offers the usual CRUD on all resources with business rules and constraints made up by me.
    <br><br>Technologies used: 
    Hono.js, Drizzle ORM, Libsql/Turso DB, Zod and Zod to OpenApi, Scalar for OpenAPI UI (this UI). Deployed on 
    Cloudflare Workers.<br><br>
    The source code is available here https://github.com/ricin9/northwind-hono-api`,
  },
  tags: [
    {
      name: "Employees",
      description:
        "The employees that work at Northwind, an employee may be associated with an *Order*",
    },
    {
      name: "Customers",
      description:
        "Customers represent companies that can place an *Order* on the *Products* we offer.",
    },
    {
      name: "Suppliers",
      description:
        "Suppliers represent the companies that supply us with *Products*",
    },
    {
      name: "Shippers",
      description:
        "Shippers represent the companies that ship our *Orders* to *Customers*",
    },
    {
      name: "Products",
      description:
        "The products supplied by our *Suppliers* that can be ordered by our *Customers*",
    },
    {
      name: "Orders",
      description: `An order is a collection of *Products* with various prices, quantities that our *Customers* 
         want to purchase, an order is also associated with the *Employee* that fills the order and a *Shipper*`,
    },
  ],
};
