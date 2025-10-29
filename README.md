# ERP System Backend (Node.js + Express + PostgreSQL + Prisma + JWT)

## Quick start
```bash
cp .env.example .env     # edit DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed             # optional seed (payment methods + sample product)
npm run dev
```

## Auth
- `POST /auth/register` { email, password, name } -> token
- `POST /auth/login` { email, password } -> token

Use `Authorization: Bearer <token>` for all other endpoints.

## Core Endpoints
- **Products** `/products` (CRUD) with inventory auto-create
- **Customers** `/customers` (CRUD)
- **Orders**
  - `POST /orders` `{ customer_id, items: [{ product_id, quantity, unit_price }] }`
    - Decrements inventory, logs `inventory_transactions`
  - `POST /orders/:id/pay` `{ method_id, amount, reference_no?, notes? }`
    - Updates order status to PAID when sum(payments) >= total
- **Returns**
  - `POST /returns` `{ order_id, items: [{ product_id, quantity, refund_amount }] }`
    - Increments inventory, logs `inventory_transactions`
- **Payments**
  - `GET /payments/methods` list
  - `POST /payments/methods` create
- **Inventory**
  - `GET /inventory` all
  - `GET /inventory/:productId` by product
  - `POST /inventory/adjust` `{ product_id, quantity_change }` -> manual adjust (positive/negative)

## Notes
- Decimal values should be sent as strings when precision matters (Prisma Decimal).
- Uses ES Modules (`"type": "module"`).

MIT © 2025
