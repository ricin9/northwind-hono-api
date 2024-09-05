<!-- 1. disallow order or its details modification (PUT PATCH DELETE) after shipping date -->

<!-- 2. return 404 for GET /:id if not found -->
<!-- 3. pagination filtering sorting -->

3. alert/endpoint about products whose unitsInstock + unitsInOrder < reorder level
4. return order with aggregate subtotals, discount and total fees MAYBE or just leave it to client lol
5. [IMPORTANT] change actual db schema to add some non null constraints, triggers, FTS. <!-- done and reverted due to breaking when uploading dump containing FTS5 tables in turso -->
6. soft deletes?
