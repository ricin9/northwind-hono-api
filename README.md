# Northwind API

This project is a REST API implementation of the Northwind sample database provided by Microsoft. The API offers CRUD operations on all resources with some business rules and constraints made up by me.

## Live API

The API is hosted at: https://northwind-api.miloudi.dev/

## Technologies Used

- Hono.js
- Drizzle ORM
- Libsql/Turso DB
- Zod and Zod to OpenAPI
- Scalar for OpenAPI UI
- Deployed on Cloudflare Workers

## Getting Started

To run the project locally:

```bash
pnpm install
pnpm run dev     # for local dev with wrangler
pnpm run dev:bun # for local dev with Bun
```

To deloy the project to Cloudflare Workers:

```bash
pnpm run deploy
```

## API Documentation

The API documentation is available at the root URL of the deployed API. It provides a comprehensive overview of all available endpoints, request/response schemas, and example usage.

## Generic Filter Pagination Sort Method

The project includes a powerful generic method for filtering, pagination, and sorting, located in the `filter-pagination-sorting.ts` file. This method can be used with any Drizzle SQLite table and is designed to accommodate browser clients using URL search params to get a filtered, sorted, and paginated list.

Key features of the generic method:

1. Supports nested query parameters using the `qs` library.
2. Generates a Zod schema for validating and parsing query parameters.
3. Handles various filter operators: eq, ne, lt, lte, gt, gte, like, in, nin, and is (null/notnull).
4. Automatically detects column data types and applies appropriate casting.
5. Supports multiple sort fields and directions.
6. Provides pagination with customizable page size.

Usage example:

```typescript
const filteringInput = c.req.valid("query"); // query string parsed with qs library that supports nesting and arrays
const { data, totalCount } = await advancedQuery(table, filteringInput); // table is drizzle sqlite table
const metadata = generatePaginationMetadata(c, totalCount); // a utility to generate page count and navigation links
return c.json({ metadata, data }, 200);
```

For more details on the implementation, refer to the `src/util/filter-pagination-sorting.ts` file in the project.

This generic method provides a flexible and powerful way to handle complex querying requirements in your API, making it easy to implement advanced filtering, sorting, and pagination across different resources.

For questions or suggestions please send me a message or open a issue.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
