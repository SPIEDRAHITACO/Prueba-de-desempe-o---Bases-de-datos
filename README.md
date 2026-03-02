# LogiTech Solutions - MegaStore Global API

## 1. Introduction
This repository contains the backend solution for MegaStore Global, migrating a legacy flat-file data structure (CSV) into a modern, scalable Polyglot Persistence architecture. It uses Node.js, Express, PostgreSQL, MongoDB and Docker.

## 2. Architecture & Data Model Justification

### Relational Database (PostgreSQL)
To ensure data integrity and eliminate redundancies, the flat file was normalized to the **3rd Normal Form (3NF)**, creating 6 tables: `cities`, `customers`, `suppliers`, `products`, `transactions`, and `transaction_items`.
* **City Separation:** The original customer address contained the city string. This was dynamically separated during the migration algorithm to create a distinct `cities` table.
* **Idempotency:** The migration script uses SQL `ON CONFLICT` constraints, allowing the CSV to be processed multiple times without generating duplicate entities.

### NoSQL Database (MongoDB)
MongoDB handles the **Audit Log** system.
* **Embedding Strategy:** When a product is deleted from SQL, the entire object is *embedded* into a NoSQL document. We chose embedding over referencing because if the data is hard-deleted from SQL, a reference would be broken. Embedding guarantees a permanent historical snapshot.

## 3. Deployment Steps (Docker)
1. Ensure Docker Desktop is installed.
2. Navigate to the root directory `Prueba-de-desempe-o---Bases-de-datos`.
3. Run the following command:
   \`\`\`bash
   docker-compose up -d --build
   \`\`\`
4. The API will start at `http://localhost:3000`.

## 4. Migration Tool Usage
1. Open Postman.
2. `POST http://localhost:3000/api/migrate`.
3. In Body > form-data, create a key named `file` (type File), upload `megastoreglobal.csv`, and send.

## 5. Endpoints
* `POST /api/migrate` - Process CSV data idempotently.
* `GET /api/products` - Read all products.
* `POST /api/products` - Create a product.
* `DELETE /api/products/:sku` - Delete a product (Logs to MongoDB).
* `GET /api/reports/suppliers` - Total inventory value by supplier.
* `GET /api/reports/customers/:id` - Customer purchase history.
* `GET /api/reports/top-products?category=Name` - Top products by category.
 