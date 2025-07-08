# API Endpoints for Customer

This document provides a detailed guide on using the API endpoints available to customers (users with the `USER` role).

## Authentication

Endpoints for user authentication and registration.

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

- **Description:** Register a new user.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
    // Role is not specified by customer, defaults to "USER"
  }
  ```
- **Response:** `User registered successfully!` or error message.
- **Access:** Public

## Product and Category Information

Endpoints for browsing products and categories.

### `GET /api/categories`

- **Description:** Get a list of all categories.
- **Access:** Public
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
- **Access:** Public
- **Response:** CategoryDTO or 404 Not Found
  ```json
  {
    "id": integer,
    "name": "string",
    "description": "string"
  }
  ```

### `GET /api/products`

- **Description:** Get a paginated list of products. Can filter by category or keyword.
- **Access:** Public
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
- **Access:** Public
- **Response:** ProductDTO or 404 Not Found

### `GET /api/products/{productId}/images`

- **Description:** Get images for a specific product.
- **Access:** Public
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

## Order Management

Endpoints for managing customer orders. Requires authentication.

### `GET /api/orders`

- **Description:** Get a list of orders for the currently authenticated user. In a real application, the user ID would be obtained from the security context.
- **Access:** CUSTOMER or ADMIN
- **Response:** Array of OrderDTO
  ```json
  [
    {
      "id": integer,
      "userId": integer,
      "username": "string",
      "orderDate": "string (ISO 8601)",
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
  ]
  ```

### `GET /api/orders/{id}`

- **Description:** Get a specific order by its ID. Accessible if the order belongs to the authenticated user or if the user is an ADMIN.
- **Access:** CUSTOMER or ADMIN
- **Response:** OrderDTO or 404 Not Found

### `POST /api/orders`

- **Description:** Create a new order.
- **Access:** CUSTOMER or ADMIN
- **Request Body:**
  ```json
  {
    "userId": integer, // Should match the authenticated user's ID
    "items": [
      {
        "productId": integer,
        "quantity": integer
      }
    ]
  }
  ```
- **Response:** Created OrderDTO

## Promotion Information

Endpoints for viewing active promotions.

### `GET /api/promotions`

- **Description:** Get a list of all active promotions.
- **Access:** Public
- **Response:** Array of PromotionDTO
  ```json
  [
    {
      "id": integer,
      "title": "string",
      "discountPercent": double,
      "startDate": "string (ISO 8601)",
      "endDate": "string (ISO 8601)"
    }
  ]
  ```

### `GET /api/promotions/{id}`

- **Description:** Get a promotion by its ID.
- **Access:** Public
- **Response:** PromotionDTO or 404 Not Found
  ```json
  {
    "id": integer,
    "title": "string",
    "discountPercent": double,
    "startDate": "string (ISO 8601)",
    "endDate": "string (ISO 8601)"
  }
  ```
