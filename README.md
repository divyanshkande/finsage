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
  - [Frontend (React)](#frontend-react)
  - [Backend (Spring Boot)](#backend-spring-boot)
- [Usage](#-usage)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About
Finsage is a full-stack personal finance app to track income, expenses, budgets, and events. Includes secure auth (BCrypt), Google OAuth login, event-based budget planning, charts and summaries.

---

## ✨ Features
- CRUD transactions, categories, budget alerts
- Charts & summaries (monthly/yearly)
- Secure password encoding (BCrypt)
- Google OAuth 2.0 login
- Budget event management (create / track events)
- Responsive UI
- User authentication & authorization
- Expense Management with proper listing and categorization
---

## 🛠 Tech Stack
**Frontend:** React, Tailwind CSS  
**Backend:** Spring Boot, Spring Security, Java  
**Database:** MySQL  
**Auth:** BCrypt Password Encoder, Google OAuth 2.0  
**Tools:** Postman, Maven, npm

---

## 📁 Repository Structure
finsage/
│
├── backend/ # Spring Boot backend source code
│ ├── src/
│ ├── .env # Environment variables for backend (DB, mail credentials)
│ ├── pom.xml
│
├── frontend/ # React frontend source code
│ ├── src/
│ ├── package.json
│
├── README.md
└──package.json



---

## 📸 Screenshots

![Dashboard](path-to-your-screenshot1.png)  
*Dashboard showing expenses overview*

![Add Transaction](path-to-your-screenshot2.png)  
*Form to add new transactions*



## 🛠 Installation & Setup

### 📌 Prerequisites
- Ensure you have **Node.js** and **MySQL** installed on your machine.

---

### 🛠 Clone the repository
```bash
git clone https://github.com/divyanshkande/finsage.git
cd finsage

🔧 Backend Setup
cd backend
npm install

🎨 Frontend Setup
cd frontend
npm install
npm start
