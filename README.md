<!-- Banner -->
<p align="center">
  <img src="https://your-banner-image-link.com/banner.png" alt="Finsage Banner" width="100%"/>
</p>

<h1 align="center">💰 Finsage – Personal Finance Manager</h1>
<p align="center"><b>Track • Save • Grow</b> – Smart personal finance web app (React + Spring Boot)</p>

<p align="center">
  <img src="https://img.shields.io/github/license/divyanshkande/finsage?color=brightgreen" alt="License" />
  <img src="https://img.shields.io/github/stars/divyanshkande/finsage" alt="Stars" />
  <img src="https://img.shields.io/github/forks/divyanshkande/finsage" alt="Forks" />
  <img src="https://img.shields.io/badge/Full%20Stack-React%20%26%20Spring%20Boot-blue" alt="Tech Stack" />
</p>

---

## 📌 Table of Contents
- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage (Quick Start)](#-usage-quick-start)
- [Environment Variables](#-environment-variables)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About
Finsage is a full-stack personal finance application for tracking income, expenses, budgets, and events.  
It features secure authentication, Google OAuth login, budget planning, and visual analytics.

---

## ✨ Features
- CRUD operations for transactions, categories, and budgets  
- Interactive charts and summaries (monthly/yearly)  
- Secure password encoding with BCrypt  
- Google OAuth 2.0 authentication  
- Budget event management and tracking  
- Responsive UI for mobile & desktop  
- Expense management with category filters

---

## 🛠 Tech Stack
**Frontend:** React (CRA), Tailwind CSS  
**Backend:** Spring Boot, Spring Security, Java  
**Database:** MySQL  
**Authentication:** BCrypt Password Encoder, Google OAuth 2.0  
**Tools:** Postman, Maven, npm

---

## 📁 Repository Structure
finsage/
│
├── backend/ # Spring Boot backend source code
│ ├── src/
│ ├── .env # Environment variables for backend (DB, mail, secrets)
│ ├── pom.xml
│
├── frontend/ # React frontend source code
│ ├── src/
│ ├── package.json
│
├── package.json # Root scripts for running both frontend & backend
└── README.md

---

## 📸 Screenshots
![Dashboard](path-to-your-screenshot1.png)  
*Dashboard showing expense overview*

![Add Transaction](path-to-your-screenshot2.png)  
*Add transaction form*

---

## 🛠 Installation

### 📌 Prerequisites
- **Node.js** (v16+ recommended)
- **Java** (JDK 17+)
- **Maven**
- **MySQL Server**

---

### 📥 Clone the repository
```bash
git clone https://github.com/divyanshkande/finsage.git
cd finsage


⚡ One-Time Setup for Combined Start
Create a root-level package.json:
npm init -y

Install concurrently in the root:
npm install concurrently

Edit root package.json and add:
"scripts": {
  "start": "concurrently \"mvn -f backend/pom.xml spring-boot:run\" \"npm start --prefix frontend\""
}

Install frontend dependencies:
npm install --prefix frontend


🚀 Usage (Quick Start)
From the root of the project:
npm start
This will:

Start the backend at http://localhost:8080

Start the frontend at http://localhost:3000

🔐 Environment Variables
Backend (backend/.env)
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret

SPRING_MAIL_HOST=smtp.example.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@example.com
SPRING_MAIL_PASSWORD=your_email_password


Your application.properties should use:

spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}

spring.mail.host=${SPRING_MAIL_HOST}
spring.mail.port=${SPRING_MAIL_PORT}
spring.mail.username=${SPRING_MAIL_USERNAME}
spring.mail.password=${SPRING_MAIL_PASSWORD}


🔮 Future Scope
Multi-currency support
Dark Mode support
AI-based expense prediction
PWA (offline mode) support


🤝 Contributing

1.Fork the repository

2.Create a feature branch

3.Commit your changes

4.Open a Pull Request

📜 License
This project is licensed under the MIT License.
