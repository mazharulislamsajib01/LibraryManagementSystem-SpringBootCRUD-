# 📚 Library Management System

A full-stack Library Management System built using **Java, Spring Boot, PostgreSQL, React.js, JavaScript, HTML, and CSS**.

This project was developed to practice backend development, REST API creation, database integration, and frontend-backend communication.

## 🚀 Features

### 📖 Book Management
- Add new books
- View all books
- Search books by keyword
- View book details by ID
- Update book information
- Update available copies
- Delete books

### 👤 Member Management
- Register new members
- View all members
- Search members
- View member details
- Update member information
- Delete members

### 🔄 Loan Management
- Issue books to members
- View all loan records
- View loan details
- View loans by member
- Return borrowed books
- Track loan status and dates

### 📊 Dashboard
- Display book statistics
- Display member statistics
- Display loan statistics
- Navigate between application sections

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot | Backend framework |
| Spring Web | REST API development |
| Spring Data JPA | Database operations |
| Hibernate | ORM and entity mapping |
| PostgreSQL | Relational database |
| React.js | Frontend UI development |
| JavaScript | Frontend logic and API calls |
| HTML / JSX | UI structure |
| CSS | Styling and layout |
| Vite | Frontend development server |
| Postman | API testing |
| IntelliJ IDEA | Development environment |

## 🏗️ Project Architecture

The project follows a layered backend architecture.

```text
React Frontend
      |
      | HTTP Requests / JSON
      v
Controller Layer
      |
      v
Service Layer
      |
      v
Repository Layer
      |
      v
Spring Data JPA / Hibernate
      |
      v
PostgreSQL Database
```

### Backend Layers

- **Entity:** Represents database data, such as Book, Member, and Loan.
- **Repository:** Handles database operations using Spring Data JPA.
- **Service:** Contains business logic and coordinates operations.
- **Controller:** Handles HTTP requests and returns responses.
- **Configuration:** Contains application settings, database configuration, and CORS configuration.

Separating these layers makes the code easier to maintain, understand, test, and extend.

## 🗂️ Main Data Models

### Book
Typical fields:
- `id`
- `title`
- `author`
- `isbn`
- `category`
- `totalCopies`
- `availableCopies`

### Member
Typical fields:
- `id`
- `name`
- `email`
- `phone`
- `address`
- `membershipDate`

### Loan
Typical fields:
- `id`
- `member`
- `book`
- `issueDate`
- `dueDate`
- `returnDate`
- `status`

The exact fields and relationships are defined in the entity classes.

## 🖼️ Application Screenshots

Add your screenshots to a folder named `screenshots` in the repository root. Replace the filenames below with the actual image filenames.

### 1. Dashboard

![Library Management System Dashboard](screenshots/dashboard.png)

### 2. Book Management

![Book Management](screenshots/books.png)

### 3. Add or Edit Book

![Add or Edit Book](screenshots/add-book.png)

### 4. Member Management

![Member Management](screenshots/members.png)

### 5. Loan Management / Issue Book

![Loan Management](screenshots/loans.png)

### 6. Loan History / Return Book

![Loan History](screenshots/loan-history.png)

> If you do not have all these screenshots, keep only the sections for the screenshots you actually add.

## 🗄️ Database Configuration

The project uses PostgreSQL.

Development database name:

```text
library_db
```

Create the database in PostgreSQL:

```sql
CREATE DATABASE library_db;
```

Configure `src/main/resources/application.properties`:

```properties
spring.application.name=library_management
spring.datasource.url=jdbc:postgresql://localhost:5432/library_db
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Set the `DB_PASSWORD` environment variable to your local PostgreSQL password.

**Security note:** Never upload real database passwords, API keys, or other secrets to GitHub.

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- JDK compatible with the project's Spring Boot version
- PostgreSQL
- Node.js and npm
- IntelliJ IDEA or another Java IDE
- Postman (recommended for API testing)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Open the project in IntelliJ IDEA.

### 2. Configure PostgreSQL

- Start the PostgreSQL service.
- Create the `library_db` database.
- Configure the database credentials in `application.properties` or environment variables.

### 3. Run the Backend

Run the main Spring Boot class:

```text
LibraryManagementApplication.java
```

The backend runs locally at:

```text
http://localhost:8080
```

### 4. Run the Frontend

Open a terminal inside the `frontend` directory:

```bash
npm install
npm run dev
```

Vite will display the frontend URL, usually:

```text
http://localhost:5173
```

Keep both the backend and frontend running while using the application.

## 🔌 REST API Endpoints

Base URL:

```text
http://localhost:8080
```

The endpoints below document the routes used during development. Check the controller classes if the routes have changed.

### Book APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/books/post` | Add a book |
| GET | `/api/books/get` | Get all books |
| GET | `/api/books/{id}` | Get a book by ID |
| GET | `/api/books/search?keyword=Java` | Search books |
| PUT | `/api/books/{id}` | Update book details |
| PATCH | `/api/books/{id}/available-copies` | Update available copies |
| DELETE | `/api/books/{id}` | Delete a book |

### Member APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/members/post` | Register a member |
| GET | `/api/members/get` | Get all members |
| GET | `/api/members/{id}` | Get a member by ID |
| GET | `/api/members/search?keyword=sajib` | Search members |
| PUT | `/api/members/{id}` | Update member details |
| DELETE | `/api/members/{id}` | Delete a member |

### Loan APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/loans/issue?memberId=1&bookId=1` | Issue a book |
| GET | `/api/loans/get` | Get all loans |
| GET | `/api/loans/{id}` | Get a loan by ID |
| GET | `/api/loans/member/{memberId}` | Get loans by member |
| POST | `/api/loans/{id}/return` | Return a book |

## 🧪 API Testing with Postman

The APIs can be tested using Postman.

Recommended testing sequence:

1. Test `GET /api/books/get`.
2. Add a book using `POST /api/books/post`.
3. Retrieve the book to verify it was saved.
4. Test search, update, and delete operations.
5. Test member registration and member APIs.
6. Create a member and a book before issuing a loan.
7. Test book issue, loan history, and book return.
8. Verify that the database records and available-copy counts are correct.

For JSON request bodies, select **Body → raw → JSON** in Postman.

## 🔗 Frontend and Backend Integration

The React frontend communicates with the Spring Boot backend using HTTP requests and JSON.

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

Example API request:

```javascript
const response = await fetch(
  "http://localhost:8080/api/books/get"
);

if (!response.ok) {
  throw new Error("Failed to fetch books");
}

const books = await response.json();
```

A CORS configuration was added to allow the frontend origin to access the backend API during development.

## 📚 Key Concepts Practiced

- Java and object-oriented programming
- Spring Boot project structure
- REST API development
- HTTP methods and JSON
- Entity mapping with JPA/Hibernate
- Repository and service layers
- Controller request handling
- PostgreSQL database integration
- CRUD operations
- API testing with Postman
- React components and JSX
- Fetching backend data from React
- CORS configuration
- Frontend and backend integration

## 🔮 Future Improvements

Potential improvements include:

- DTOs for request and response objects
- Input validation
- Centralized exception handling
- Pagination and sorting
- Authentication and role-based authorization
- Automated unit and integration tests
- Database migrations
- Improved loading states and frontend error handling

## 👨‍💻 Project Summary

This project demonstrates how a React frontend communicates with a Java Spring Boot REST API and how Spring Data JPA/Hibernate interacts with a PostgreSQL database.

The main objective was to understand the complete flow of data from the frontend to the backend, through the service and repository layers, and into the database.

---

**Project Type:** Full-Stack Web Application  
**Backend:** Java + Spring Boot  
**Frontend:** React.js + JavaScript + CSS  
**Database:** PostgreSQL  
**API Testing:** Postman
