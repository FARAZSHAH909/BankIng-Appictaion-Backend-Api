# Banking Application Backend API

A robust and secure backend for a digital banking application built with Node.js, Express, and MongoDB. This API handles user registration, account management, transaction processing, and virtual/physical card services.

## 🚀 Features

- **User Authentication**: Secure signup, login, password recovery, and OTP-based email verification using JWT.
- **Account Management**: Facilitates opening bank accounts with secondary OTP verification.
- **Balance & Transactions**: Check real-time balances, transfer money between accounts, and view detailed transaction history with filtering options.
- **Card Services**: Issue virtual/physical cards, set/update PINs, and perform card-based withdrawals.
- **Security Middleware**: Includes authorization guards for protected routes and admin-only access.
- **Email Notifications**: Integrated with `nodemailer` for OTPs and notifications.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & Bcryptjs
- **Middleware**: Morgan (logging), Cors, Body-parser
- **File Uploads**: Multer
- **Environment**: Dotenv

## 📂 Project Structure

```text
├── config/             # Database configuration
├── controllers/        # Business logic for each module
├── middleware/         # Auth and account validation middleware
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── tests/              # Test files and guides
├── app.js              # Entry point
└── .env                # Environment variables (not pushed)
```

## 🚥 API Endpoints

### Authentication (`/api`)
- `POST /register` - Register a new user.
- `POST /verify-email` - Verify email via OTP.
- `POST /login` - User login.
- `POST /forgotpassword` - Request password reset.
- `POST /verifyotp` - Verify password reset OTP.
- `POST /resetpassword` - Reset password.

### Account Management (`/account/open`)
- `POST /open-account` - Request to open a bank account.
- `POST /verify-otp` - Confirm account opening via OTP.

### Balance & Transactions (`/account/balance`)
- `POST /user-balance` - Get account balance.
- `POST /transaction-money` - Transfer money (Protected).
- `GET /transaction-history` - Get full transaction history (Protected).
- `GET /filter-transaction-history/:receiverId` - Filter transactions (Protected).

### Bank Card Services (`/account/card`)
- `POST /create-card` - Issue a new bank card.
- `POST /set-pin` - Set initial card PIN.
- `POST /request-otp` - Request OTP for card actions.
- `POST /update-status-pin` - Modify card status or PIN.
- `POST /transaction-money` - Card withdrawal simulation.

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/FARAZSHAH909/BankIng-Appictaion-Backend-Api.git
   cd BankIng-Appictaion-Backend-Api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Run the application**:
   ```bash
   # Production
   npm start
   
   # Development
   npm run dev
   ```

## 📜 License
This project is licensed under the ISC License.
