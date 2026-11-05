# API Endpoints for Admin

This document provides a detailed guide on using the API endpoints available to users with the `ADMIN` role.

## Authentication

All endpoints requiring authentication must include a valid JWT token in the `Authorization` header as a Bearer token.

### `POST /auth/login`

- **Description:** Authenticate a user and receive a JWT token.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",
    "id": integer,
    "username": "string",
    "role": "string"
  }
  ```
- **Access:** Public (required for authentication)

### `POST /auth/register`

- **Description:** Register a new user. Admins can specify a role.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "string" // Optional, defaults to "customer" if not specified
  }
  ```
- **Response:** `User registered successfully!` or error message.
- **Access:** Public

## Admin Dashboard Statistics

Endpoints for retrieving various statistics for the admin dashboard.

### `GET /api/admin/stats/overview`

- **Description:** Get overview statistics including user count, product count, and order count.
- **Access:** ADMIN
- **Response:**
  ```json
  {
    "userCount": long,
    "productCount": long,
    "orderCount": long
  }
  ```

### `GET /api/admin/stats/sales`

- **Description:** Get sales statistics (currently returns placeholder data).
- **Access:** ADMIN
- **Response:**
  ```json
  {
    "totalRevenue": "string",
    "monthlyRevenue": "string",
    "dailyRevenue": "string"
  }
  ```

### `GET /api/admin/stats/products`

- **Description:** Get product statistics (currently returns placeholder data).
- **Access:** ADMIN
- **Response:**
  ```json
  {
    "topSellingProduct": "string",
    "lowStockItems": "string"
  }
  ```

## Category Management

Endpoints for managing product categories.

### `GET /api/categories`

- **Description:** Get a list of all categories.
- **Access:** Public (also accessible to ADMIN)
- **Response:** Array of CategoryDTO
  ```json
  [
    {
      "id": integer,
      "name": "string",
      "description": "string"
    }
  ]
  ```

### `GET /api/categories/{id}`

- **Description:** Get a category by its ID.
- **Access:** Public (also accessible to ADMIN)
- **Response:** CategoryDTO or 404 Not Found
  ```json
  {
    "id": integer,
    "name": "string",
    "description": "string"
  }
  ```

### `POST /api/categories`

- **Description:** Create a new category.
- **Access:** ADMIN
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response:** Created CategoryDTO

### `PUT /api/categories/{id}`

- **Description:** Update an existing category by ID.
- **Access:** ADMIN
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response:** Updated CategoryDTO

### `DELETE /api/categories/{id}`

- **Description:** Delete a category by ID.
- **Access:** ADMIN
- **Response:** 204 No Content

## Order Management

Endpoints for managing orders.

### `GET /api/orders/admin/orders`

- **Description:** Get a paginated list of all orders.
- **Access:** ADMIN
- **Request Parameters:**
  - `page`: integer (default 0)
  - `size`: integer (default 10)
- **Response:** PaginatedOrderResponse containing array of OrderDTO and total pages
  ```json
  {
    "orders": [
      {
        "id": integer,
        "userId": integer,
        "username": "string",
        "orderDate": "string (ISO format)",
        "status": "string",
        "totalAmount": double,
        "orderItems": [
          {
            "id": integer,
            "productId": integer,
            "productName": "string",
            "unitPrice": double,
            "quantity": integer
          }
        ]
      }
    ],
    "totalPages": integer
  }
  ```

### `GET /api/orders/{id}`

- **Description:** Get an order by its ID.
- **Access:** ADMIN or CUSTOMER (if the order belongs to them)
- **Response:** OrderDTO or 404 Not Found

### `PUT /api/orders/{id}/{status}`

- **Description:** Update the status of an order by ID.
- **Access:** ADMIN
- **Path Parameters:**
  - `id`: integer - The order ID
  - `status`: string - The new status (e.g., "Processing", "Shipped", "Delivered", "Cancelled")
- **Response:** Updated OrderDTO

## Product Management

Endpoints for managing products and product images.

### `GET /api/products`

- **Description:** Get a paginated list of products. Can filter by category or keyword.
- **Access:** Public (also accessible to ADMIN)
- **Request Parameters:**
  - `page`: integer (default 0)
  - `size`: integer (default 10)
  - `categoryId`: integer (optional)
  - `keyword`: string (optional)
- **Response:** Page of ProductDTO
  ```json
  {
    "content": [
      {
        "id": integer,
        "name": "string",
        "description": "string",
        "price": double,
        "stock": integer,
        "categoryId": integer,
        "categoryName": "string",
        "promotionId": integer,
        "promotionTitle": "string",
        "images": [
          {
            "id": integer,
            "imageUrl": "string",
            "isPrimary": integer
          }
        ]
      }
    ],
    "totalPages": integer,
    "totalElements": long,
    "size": integer,
    "number": integer,
    "first": boolean,
    "last": boolean,
    "empty": boolean
  }
  ```

### `GET /api/products/{id}`

- **Description:** Get a product by its ID.
- **Access:** Public (also accessible to ADMIN)
- **Response:** ProductDTO or 404 Not Found

### `POST /api/products`

- **Description:** Create a new product.
- **Access:** ADMIN
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "price": double,
    "stock": integer,
    "categoryId": integer, // Required
    "promotionId": integer // Optional
  }
  ```
- **Response:** Created ProductDTO

### `PUT /api/products/{id}`

- **Description:** Update an existing product by ID.
- **Access:** ADMIN
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "price": double,
    "stock": integer,
    "categoryId": integer, // Required
    "promotionId": integer // Optional
  }
  ```
- **Response:** Updated ProductDTO

### `DELETE /api/products/{id}`

- **Description:** Delete a product by ID.
- **Access:** ADMIN
- **Response:** 204 No Content

### `POST /api/products/{productId}/images`

- **Description:** Upload an image for a product.
- **Access:** ADMIN
- **Request Parameters:**
  - `productId`: integer (path variable)
  - `file`: MultipartFile (request part)
  - `isPrimary`: integer (optional, default 0)
- **Response:** Created ProductImageDTO
  ```json
  {
    "id": integer,
    "imageUrl": "string",
    "isPrimary": integer
  }
  ```

### `GET /api/products/{productId}/images`

- **Description:** Get images for a specific product.
- **Access:** Public (also accessible to ADMIN)
- **Response:** Array of ProductImageDTO
  ```json
  [
    {
      "id": integer,
      "imageUrl": "string",
      "isPrimary": integer
    }
  ]
  ```

### `DELETE /api/products/images/{imageId}`

- **Description:** Delete a product image by ID.
- **Access:** ADMIN
- **Response:** 204 No Content

## User Management

Endpoints for managing users.

### `GET /api/users`

- **Description:** Get a list of all users.
- **Access:** ADMIN
- **Response:** Array of User entity
  ```json
  [
    {
      "id": integer,
      "username": "string",
      "password": "string", // Potentially sensitive
      "role": "string"
    }
  ]
  ```

### `GET /api/users/{id}`

- **Description:** Get a user by ID.
- **Access:** ADMIN
- **Response:** User entity or 404 Not Found

### `PUT /api/users/{id}`

- **Description:** Update a user by ID.
- **Access:** ADMIN
- **Request Body:** User entity (provide fields to update)
- **Response:** Updated User entity

### `DELETE /api/users/{id}`

- **Description:** Delete a user by ID.
- **Access:** ADMIN
- **Response:** 204 No Content

## Promotion Management

Endpoints for managing promotions.

### `GET /api/promotions`

- **Description:** Get a list of all promotions.
- **Access:** Public (also accessible to ADMIN)
- **Response:** Array of PromotionDTO
  ```json
  [
    {
      "id": integer,
      "title": "string",
      "discountPercent": double,
      "startDate": "string (ISO format)",
      "endDate": "string (ISO format)"
    }
  ]
  ```

### `GET /api/promotions/{id}`

- **Description:** Get a promotion by its ID.
- **Access:** Public (also accessible to ADMIN)
- **Response:** PromotionDTO or 404 Not Found

### `POST /api/promotions`

- **Description:** Create a new promotion.
- **Access:** ADMIN
- **Request Body:**
  ```json
  {
    "title": "string",
    "discountPercent": double,
    "startDate": "string (ISO format)",
    "endDate": "string (ISO format)"
  }
  ```
- **Response:** Created PromotionDTO

### `PUT /api/promotions/{id}`

- **Description:** Update an existing promotion by ID.
- **Access:** ADMIN
- **Request Body:**
  ```json
  {
    "title": "string",
    "discountPercent": double,
    "startDate": "string (ISO format)",
    "endDate": "string (ISO format)"
  }
  ```
- **Response:** Updated PromotionDTO

### `DELETE /api/promotions/{id}`

- **Description:** Delete a promotion by ID.
- **Access:** ADMIN
- **Response:** 204 No Content

## Customer Management

Endpoints for managing customer information.

### `GET /api/customers`

- **Description:** Get a list of all customers.
- **Access:** ADMIN
- **Response:** Array of Customer objects
  ```json
  [
    {
      "id": integer,
      "userId": integer,
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "createdAt": "string (ISO format)"
    }
  ]
  ```

### `GET /api/customers/{id}`

- **Description:** Get a customer by its ID.
- **Access:** ADMIN
- **Response:** Customer object or 404 Not Found

### `GET /api/customers/user/{userId}`

- **Description:** Get a customer by userId (associated with account).
- **Access:** ADMIN or authenticated customer
- **Response:** Customer object or 404 Not Found
  ```json
  {
    "id": integer,
    "userId": integer,
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "createdAt": "string (ISO format)"
  }
  ```

### `PUT /api/customers/user/{userId}`

- **Description:** Update a customer by userId.
- **Access:** ADMIN or authenticated customer
- **Request Body:**
  ```json
  {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  }
  ```
- **Response:** Updated Customer object

### `DELETE /api/customers/user/{userId}`

- **Description:** Delete a customer by userId.
- **Access:** ADMIN
- **Response:** 204 No Content
