import type { OpenAPIObjectConfigure } from "@hono/zod-openapi";

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
      name: "Query Parameters",
      description: `
## Using Query Parameters for Filtering, Pagination, and Sorting

### Pagination

Use 'page' and 'pageSize' parameters:
- page: The page number (default: 1)
- pageSize: Number of items per page (default: 10, max: 250)

    Example: ?page=2&pageSize=20
    
    ### Sorting
    Use the 'sort' parameter with field and order:
    - sort[0][field]: The field to sort by
    - sort[0][order]: The sort order ('asc' or 'desc')
   
    Example: ?sort[0][field]=productName&sort[0][order]=desc

    ### Multi-Sort
    use sort[1][field], sort[1][order] and so on.

    Example: ?sort[0][field]=productName&sort[0][order]=desc&sort[1][field]=unitPrice&sort[1][order]=asc
    ### Filtering
    Use the 'filter' parameter with various operators:
    - eq: Equal to
    - ne: Not equal to
    - lt: Less than
    - lte: Less than or equal to
    - gt: Greater than
    - gte: Greater than or equal to
    - like: SQL LIKE pattern matching
    - in: In a list of values
    - nin: Not in a list of values
    - is: Is null or not null
    
    Example: ?filter[productName][like]=%Chai%&filter[unitPrice][gte]=10
    
    You can combine multiple filters, sorting, and pagination in a single query.
    Example: ?page=1&pageSize=20&sort[0][field]=productName&sort[0][order]=asc&filter[categoryId][eq]=1&filter[unitPrice][gte]=10


    ## For javascript clients
    If your api client is written in javascript you can just use the *qs* library to stringify the filter pagination sort object and it'll just work.
      `,
    },
    {
      name: "Customers",
      description:
        "Customers represent companies that can place an *Order* on the *Products* we offer.",
    },
    {
      name: "Employees",
      description:
        "The employees that work at Northwind, an employee may be associated with an *Order*",
    },
    {
      name: "Orders",
      description: `An order is a collection of *Products* with various prices, quantities that our *Customers* 
         want to purchase, an order is also associated with the *Employee* that fills the order and a *Shipper*`,
    },
    {
      name: "Products",
      description:
        "The products supplied by our *Suppliers* that can be ordered by our *Customers*",
    },
    {
      name: "Shippers",
      description:
        "Shippers represent the companies that ship our *Orders* to *Customers*",
    },
    {
      name: "Suppliers",
      description:
        "Suppliers represent the companies that supply us with *Products*",
    },
  ],
};
