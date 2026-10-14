<div align="center">

# 💸 SplitFlow

### Split expenses. Keep things simple.

A full-stack, multi-tenant expense management platform for friends, roommates, and teams — with role-based access control and an intelligent debt-simplification engine.

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://splitflow-woad.vercel.app)
[![API Status](https://img.shields.io/badge/API-Live-blue?style=for-the-badge&logo=render)](https://splitflow-1.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/vanishreebs105-hue/Splitflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**[🌐 Try the Live App](https://splitflow-woad.vercel.app)** · **[📖 API Health Check](https://splitflow-1.onrender.com/api/health)**

</div>

---

## 📖 Overview

**SplitFlow** is a modern expense-splitting application that solves a simple but surprisingly complex problem: **"Who owes whom, and how much?"**

Whether you're managing expenses with roommates, splitting bills on a trip, or tracking shared costs in a team — SplitFlow handles the math, simplifies the debts, and keeps everyone honest.

Unlike basic Splitwise clones, SplitFlow is built with **multi-tenancy** and **role-based access control** at its core — making it ready for real business use cases like PG/hostel management, freelancer teams, and shared households.

---

## ✨ Features

### 👥 Multi-Tenant Workspaces
- Create unlimited **workspaces** (PG, household, team, trip, event, business)
- One user can belong to multiple workspaces with **different roles**
- **4-tier RBAC**: `OWNER` · `ADMIN` · `MEMBER` · `VIEWER`
- Invite members by email with role assignment

### 💰 Expense Engine
- **4 split modes**: Equal, Exact amounts, Percentage, Shares
- Auto-calculation with intelligent rounding
- **10 categories** (food, travel, rent, utilities, etc.)
- Recurring expense support (rent, subscriptions)
- Full CRUD with soft-delete

### 🧮 Debt Simplification Algorithm ⭐
- **Greedy min-cash-flow algorithm** reduces N transactions to the minimum possible
- Example: 4 debts → 2 transactions
- Shows "savings" (transactions avoided) in the UI
- This is the **star feature** — real graph-algorithm thinking applied to a real problem

### 📊 Analytics & Reporting
- Monthly spending trends (line chart)
- Category breakdown (pie chart)
- Member contribution (bar chart)
- Largest expense highlight
- **CSV export** for tax/accounting
- Activity feed with filters

### 🔒 Enterprise-Grade Security
- JWT authentication with **refresh tokens**
- bcrypt password hashing (10 rounds)
- Rate limiting (100 req / 15 min per IP)
- Input validation (express-validator)
- Helmet.js security headers
- CORS protection
- Role-based route guards

### 🎨 Modern UX
- **Animated split-panel auth pages** (subtle ambient motion)
- Responsive design (mobile → desktop)
- Toast notifications
- Skeleton loaders + empty states
- Optimistic UI updates

---

## 🛠️ Tech Stack

**Frontend**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)

**Backend**
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

**Deployment**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

## 📸 Screenshots

### 🔐 Login — Animated Split-Panel Design
![Login](./client/public/screenshots/login.png)

### 📊 Dashboard — Overview of Workspaces & Balances
![Dashboard](./client/public/screenshots/dashboard.png)

### 💰 Workspace Detail — Expenses & Balances
![Workspace](./client/public/screenshots/workspace.png)

### 📈 Analytics — Charts & Insights
![Analytics](./client/public/screenshots/analytics.png)

---

## 🧮 How the Debt Simplification Works

### The Problem
Imagine 5 friends on a trip. After multiple expenses, everyone owes everyone else. The "naive" way to settle up might need **8-10 separate payments**.

### The Solution
SplitFlow uses a **greedy min-cash-flow algorithm** to reduce this to the **minimum number of transactions**.

### Example

**Before simplification:**
