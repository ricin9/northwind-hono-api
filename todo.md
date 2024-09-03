1. disallow order or its details modification (PUT PATCH DELETE) after shipping date
2. return 404 for GET /:id if not found
3. pagination filtering sorting
4. alert/endpoint about products whose unitsInstock + unitsInOrder < reorder level
5. return order with aggregate subtotals, discount and total fees MAYBE or just leave it to client lol
6. [IMPORTANT] change actual db schema to add some non null constraints, triggers, FTS.
7. soft deletes?
