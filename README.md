# 🛒 Full Stack E-Commerce Application

A complete E-Commerce application built with **Angular**, **Spring Boot**, and **MySQL**, fully containerized with **Docker**.

This project follows a microservices-ready architecture, where the frontend, backend, and database run in isolated containers orchestrated via Docker Compose.

> **Based on the Udemy course:** Full Stack Angular and Spring Boot Tutorial

---

## 🛠️ Tech Stack

**Frontend:** Angular, TypeScript, HTML5, CSS3, Bootstrap.  
**Backend:** Java 21, Spring Boot 3.x, Spring Data JPA, Hibernate.  
**Database:** MySQL 8.0.  
**Infrastructure:** Docker, Docker Compose, Nginx (frontend server).  
**Payment:** Stripe API Integration.

---

## ✨ Key Features

- Product catalog with pagination and keyword search.
- Persistent shopping cart (local storage).
- Secure checkout using Stripe.
- Order history stored in the database.
- Automatic schema creation with Hibernate.
- Full setup requiring only **Docker**.

---

## 📋 Prerequisites

You only need:

- **Docker Desktop**

> No need to install Java, Node.js, or MySQL locally.

---

## 🚀 Quick Start

### 1. Create the `.env` file
Create a `.env` file in the project root (same level as `docker-compose.yml`) with your Stripe keys:

```env
STRIPE_API_KEY=dummy_value
STRIPE_PUBLIC_KEY=dummy_value
STRIPE_WEBHOOK_SECRET=dummy_value
```

### 2. Start the application
Run:

```bash
docker compose up --build -d
```

### 3. Stop the application
```bash
docker compose stop
```

---

## 📦 Architecture & Ports

| Service       | Container Name              | Local URL                          | Internal Port |
|---------------|-----------------------------|-------------------------------------|----------------|
| Frontend      | angular-ecommerce-frontend  | http://localhost               | 80           |
| Backend API   | spring-ecommerce-backend    | http://localhost:8080/api           | 8080           |
| Database      | mysql-db                    | localhost:3307                      | 3306           |

**Swagger UI:** http://localhost:8080/swagger-ui.html

---

## 🛢️ Database Access

The MySQL container port **3306** is mapped to **3307** on your host.

### Connect using MySQL Workbench, DBeaver, DataGrip

- **Host:** 127.0.0.1
- **Port:** 3307
- **Database:** full-stack-ecommerce
- **Username:** ecommerceapp
- **Password:** ecommerceapp

### Access through terminal

```bash
docker compose exec mysql-db mysql -u root -p
# password: root
```

---

## 🔧 Troubleshooting

### 1. "Connection Refused" when accessing the database
Ensure you are connecting through port **3307**, not 3306.

### 2. Empty database
Verify that the SQL scripts inside `backend/src/main/resources/schema` were loaded.

### 3. Error: "Stripe API Key missing"
Ensure the `.env` file was created correctly before running Docker Compose.

