# Synkrisis: MERN Stack Transition Walkthrough

Welcome to the full-stack version of Synkrisis! We have officially transitioned the marketplace from a frontend-only mock application to a fully decoupled MERN (MongoDB, Express, React, Node.js) platform.

This document explains everything in the code, what has been built, and what you need to do next to synchronize your environments, configure `.env` files, run the application, and test the platform.

---

## What Has Been Built?

### 1. The Backend (Express + MongoDB)
We created a robust Node.js REST API with the following structure:
- **Models (`/models`)**: Defines the MongoDB schemas for User, Project, Application, ConsultingRequest, and Contract.
- **Controllers (`/controllers`)**: Holds the core business logic.
- **Routes (`/routes`)**: Maps HTTP methods to the controllers.
- **Services (`/services`)**: Includes a Nodemailer-powered `emailService.js` filled with 14 distinctive HTML email templates.
- **Authentication**: `passport.js` manages login via Local Strategy (Email/Password), Google OAuth, and GitHub OAuth. JWT tokens handle stateless sessions.

### 2. The Frontend Integration (React)
We modified the React frontend to communicate with the new backend:
- **`api.ts`**: An Axios-based API client that automatically intercepts requests and attaches the `Authorization: Bearer <token>` token.
- **`AuthContext.tsx`**: Manages user session state fetching the current logged-in user and storing the token.
- **`ProtectedRoute.tsx`**: Guards routes that shouldn't be accessible by non-authenticated users, and manages Role-Based Access Control (RBAC).
- **Page Replacements**: Mock datasets in `DashboardPage`, `PostCreationPage`, `ProjectDetailPage`, etc., were swapped out with React state and `useEffect` lifecycle methods pulling real database records.
- **Admin Panel**: Added an exclusive view for `admin` users to approve Providers and manually assign Consulting Requests.

---

## Setup & Configuration Guide

To get Synkrisis up and running locally, you must run *both* the backend and frontend simultaneously.

### 1. Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB**: You will need a MongoDB connection URI. You can get a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Email Server**: The backend sends automatic emails. You can configure your own SMTP (like Gmail), or continue using the currently configured testing credentials from [Ethereal Email](https://ethereal.email/).

### 2. Backend Configuration
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open/Create the `.env` file in the `backend/` directory and ensure it has the following configuration:
   ```ini
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=super_secret_synkrisis_jwt_key

   # OAuth Configuration (Optional: Create apps on Google/GitHub if you want working OAuth locally)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   FRONTEND_URL=http://localhost:5173

   # Email Configuration (Currently Setup for testing with Ethereal SMTP)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=daphne.mcclure57@ethereal.email
   SMTP_PASS=kE9VhwFvR6UWhwXfP1
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Open a *new* terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies. The project was using `pnpm` config, but can be forced via npm if needed. Note: We've added `react-router` and `sonner`, so ensuring an install is run is critical.
   ```bash
   npm install --legacy-peer-deps
   # OR
   pnpm install
   ```
3. Open/Create a `.env` file in the `frontend/` directory:
   ```ini
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## How to Test the E2E Flow

Run both apps. Your frontend should be running at `http://localhost:5173` and backend at `http://localhost:5000`.

### **Phase 1: Registration**
1. Navigate to `/signup`.
2. Register an **Artist** account. Keep note of the email and password.
3. Logout, then register a **Provider/Builder** account.

> **Note**: For security, Providers require manual approval. If you want to log in as the Provider, you must either approve them via the Admin panel or manually change the `isApproved: true` in your MongoDB database under the `User` collection.

### **Phase 2: Admin Operations (Approving Providers)**
1. Register a user with `role: 'admin'`. Alternatively, manually change your artist's role to `'admin'` in MongoDB via a tool like MongoDB Compass.
2. Log in as the admin. You will see an "Admin Panel" button in the Navbar.
3. Click "Approve" next to the newly registered Provider.

### **Phase 3: The Marketplace Loop**
1. Log in as the **Artist**.
2. Click "New Project". Choose **Post Publicly**.
3. Fill out the project details and submit. It will successfully save to MongoDB.
4. Log out and log in as the **Provider**.
5. On the dashboard, you will see the open project. Click "View Details".
6. Fill out a Cover Letter, Budget, and Timeline in the "Apply for this Project" form and click "Submit".
7. Log out and back in as the **Artist**.
8. Go to the project details. You will see the application from the provider under "Received Applications".
9. Click "**Accept & Contract**". This transitions the application into a formal Contract!

### **Phase 4: Contracts and Simulated Payments**
1. Both users will now see the Contract on their Dashboard.
2. Clicking the contract brings you to `ContractPaymentPage`.
3. The Provider clicks "Accept Contract".
4. The Artist clicks "Accept & Pay". (This currently simulates escrow payment logic).
5. The project flow is complete!

---

## Troubleshooting

- **Linting Errors (Frontend)**: If you experience missing type declaration errors (`react` or `react-router` not found), run `npm install --save-dev @types/react @types/react-dom @types/react-router` in the `frontend` directory. Make sure you restart your Dev server!
- **Email Testing**: We are using Ethereal. When emails are sent, the backend prints an `ethereal.email` preview URL directly in your terminal console. You can click that link to see the rendered HTML invoice/notification!
- **CORS Issues**: If the frontend fails to log in and you see a CORS error in the browser network console, ensure `FRONTEND_URL` is correct in your backend `.env`, and check the proxy settings.
