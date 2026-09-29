# 📖 PhoneBook - Contact Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://navid1256.github.io/PhoneBook/)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-Supported-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Dexie.js-orange?style=for-the-badge&logo=javascript&logoColor=white)](https://dexie.org/)
[![Tests](https://img.shields.io/badge/Tests-PHPUnit%20%26%20Node.js-blue?style=for-the-badge&logo=vitest&logoColor=white)](https://phpunit.de/)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

A fast, responsive, and accessible contact directory and management web application built with **dual storage architectures**: a full-stack **PHP MVC + MySQL** backend and an offline-first **Client-side IndexedDB (Dexie.js)** implementation.

---

## 🌐 Live Demo

Experience the client-side IndexedDB version deployed live on GitHub Pages:
👉 **[https://navid1256.github.io/PhoneBook/](https://navid1256.github.io/PhoneBook/)**

---

## 💡 Business Use Case

Designed as an internal personnel directory for organizations and companies with **500+ employees**:

- Instant, centralized search for internal telephone extensions and department contacts.
- Zero server overhead when running in client-side / offline-first mode.
- Extensible architecture ready for Role-Based Access Control (**RBAC**) and user authentication.

---

## 🛠️ Architecture & Branches

The repository demonstrates two complementary data management paradigms across dedicated git branches:

| Branch | Architecture | Data Storage | Key Highlights |
| :--- | :--- | :--- | :--- |
| **[`indexdb`](https://github.com/navid1256/PhoneBook/tree/indexdb)** | Client-Side SPA / Offline-First | **IndexedDB (Dexie.js)** | Ultra-fast local client storage, client-side pagination & filtering, zero server dependency. |
| **[`mysqldb`](https://github.com/navid1256/PhoneBook/tree/mysqldb)** | Full-Stack Server-Side MVC | **MySQL (Medoo ORM)** | Custom PHP Router, OOP architecture, database CRUD with prepared queries. |
| **[`gh-pages`](https://github.com/navid1256/PhoneBook/tree/gh-pages)** | Static Deployment | **IndexedDB** | Pure static entry point (`index.html` + `Assets/`) hosted on GitHub Pages. |

---

## ✨ Features

- **⚡ Instant Real-Time Search**: Filters contacts seamlessly across name, phone number, and email.
- **✏️ Inline Contact Editing**: Edit contact details directly within the table with one click.
- **🔒 Input Restrictions & Validation**: Enforces strict 10–12 digit phone rules (blocks invalid characters and exponential notation), robust regex validation, and XSS sanitization.
- **♿ WCAG 2.1 AA Accessibility**: High-contrast color palette (15.4:1 ratio), semantic headings (`<h1>`), full ARIA labels, and keyboard accessibility.
- **🚀 Performance & LCP Optimized**: 82% image compression (WebP hero background), `<link rel="preload">` prioritization, and streamlined CSS.
- **🛡️ Apache Security Headers**: Configured with `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy`.

---

## 💻 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap, jQuery, Font Awesome.
- **Client Storage**: [Dexie.js](https://dexie.org/) (Wrapper for Browser IndexedDB).
- **Backend**: PHP 8.2+ (OOP, MVC, Custom Router, Medoo Database Abstraction Layer).
- **Server**: Apache (`.htaccess` URL rewriting and security headers).
- **Automated Testing**: [PHPUnit 11.5](https://phpunit.de/) (Backend) and Node.js Test Runner (Frontend).

---

## 🧪 Automated Testing

The project maintains comprehensive test suites for both frontend logic and backend routing/models:

```bash
# Run backend PHPUnit tests (Router, Validator, Utilities, Models)
vendor/bin/phpunit

# Run frontend tests (Dexie CRUD, phone restrictions, regex validations)
node --test tests/Frontend/*.test.js
```

All 41 automated tests pass with 100% success rate.

---

## 🚀 Local Setup & Installation

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 18+ (for running frontend tests)
- Apache / XAMPP (for MySQL branch)

### 1. Clone the repository

```bash
git clone https://github.com/navid1256/PhoneBook.git
cd PhoneBook
```

### 2. Choose your branch

```bash
# To run the IndexedDB (client-side) version:
git checkout indexdb

# To run the MySQL (full-stack MVC) version:
git checkout mysqldb
```

### 3. Install dependencies

```bash
composer install
```

### 4. Serve the application

- **Via PHP Built-in Server**:

  ```bash
  php -S localhost:8000
  ```

- **Via XAMPP / WAMP**:
  Place the directory under `htdocs` and access `http://localhost/PhoneBook/`.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Navid Ahmadzade**

- GitHub: [@navid1256](https://github.com/navid1256)
