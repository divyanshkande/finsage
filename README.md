<!-- Banner -->
<p align="center">
  <img src="https://your-banner-image-link.com/banner.png" alt="Finsage Banner" width="100%" style="max-width: 800px;" />
</p>

<h1 align="center">💰 Finsage – Personal Finance Manager</h1>
<p align="center"><b>Track • Save • Grow</b> – A smart, full-stack personal finance web app built with React and Spring Boot</p>



---

## 📌 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Future Scope](#future-scope)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About
Finsage is a full-stack personal finance application designed to help users manage their income, expenses, budgets, and financial events. With secure authentication, intuitive budget planning, and insightful visual analytics, Finsage empowers users to take control of their finances.

---

## ✨ Features
- **Transaction Management**: Perform CRUD operations for transactions, categories, and budgets.  
- **Visual Analytics**: View interactive charts and summaries for monthly and yearly insights.  
- **Secure Authentication**: Supports Google OAuth 2.0 and BCrypt password encoding.  
- **Budget & Event Tracking**: Manage budgets and track financial events effortlessly.  
- **Responsive Design**: Optimized for both mobile and desktop devices.  
- **Category Filters**: Organize and filter expenses by categories for better clarity.

---

## 🛠 Tech Stack
| **Category**       | **Technologies**                          |
|--------------------|-------------------------------------------|
| **Frontend**       | React (CRA), Tailwind CSS                 |
| **Backend**        | Spring Boot, Spring Security, Java        |
| **Database**       | MySQL                                    |
| **Authentication** | BCrypt Password Encoder, Google OAuth 2.0 |
| **Tools**          | Postman, Maven, npm                      |

---

## 📁 Repository Structure
finsage/
├── backend/                    # Spring Boot backend source code
│   ├── src/                    # Backend source files
│   ├── .env                    # Environment variables (DB, mail, secrets)
│   └── pom.xml                 # Maven configuration
├── frontend/                   # React frontend source code
│   ├── src/                    # Frontend source files
│   └── package.json            # Frontend dependencies
├── package.json                # Root-level scripts for running both apps
└── README.md                   # Project documentation


---

## 📸 Screenshots
| **Dashboard** | **Add Transaction** |
|---------------|---------------------|
| ![Dashboard](path-to-your-screenshot1.png) <br> *Overview of expenses and budgets* | ![Add Transaction](path-to-your-screenshot2.png) <br> *Form to add new transactions* |

*Replace `path-to-your-screenshot1.png` and `path-to-your-screenshot2.png` with actual image paths.*

---

## 🛠 Installation

### 📋 Prerequisites
- **Node.js**: v16 or higher
- **Java**: JDK 17 or higher
- **Maven**: Latest stable version
- **MySQL**: Server running locally or remotely

### 📥 Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/divyanshkande/finsage.git
   cd finsage
```
   ---
 ⚡One-Time Setup for Combined Start
Create a root-level `package.json`:
```bash
npm init -y
```
### Install concurrently in the root:
```bash
npm install concurrently
```
### Edit root package.json and add:
```bash
"scripts": {
  "start": "concurrently \"mvn -f backend/pom.xml spring-boot:run\" \"npm start --prefix frontend\"",
  "install-all": "npm install --prefix frontend && mvn -f backend/pom.xml install"
}
```

### Install frontend dependencies:
```bash
npm install --prefix frontend
```
### Install backend dependencies:
```bash
mvn -f backend/pom.xml install
```
## 🚀 Usage (Quick Start)
### From the root of the project:
```bash
npm start
```
This will:

Start the backend at http://localhost:8080
Start the frontend at http://localhost:3000

Open http://localhost:3000 in your browser to access the app.

## 🔐 Environment Variables
Backend (backend/.env):
```bash
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret
SPRING_MAIL_HOST=smtp.example.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@example.com
SPRING_MAIL_PASSWORD=your_email_password
```
Your backend/src/main/resources/application.properties should use:
```bash
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
spring.mail.host=${SPRING_MAIL_HOST}
spring.mail.port=${SPRING_MAIL_PORT}
spring.mail.username=${SPRING_MAIL_USERNAME}
spring.mail.password=${SPRING_MAIL_PASSWORD}
```
## 🔮 Future Scope

Multi-currency support
Dark Mode support
AI-based expense prediction
PWA (offline mode) support


## 🤝 Contributing

🤝 Contributing

Fork the repository 🍴

Create a feature branch 🌿

Commit your changes ✅

Open a Pull Request 🚀



## 📜 License

This project is licensed under the MIT License.