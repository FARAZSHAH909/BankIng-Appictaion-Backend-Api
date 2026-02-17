# 🏦 Banking API: The Complete A-Z Technical Guide

This document provides an in-depth explanation of how the Banking Application Backend API works, from project architecture to the internal logic of every module.

---

## 🏗️ 1. Architecture & Design
The project follows a **Modular MVC (Model-View-Controller)** pattern for scalability and maintainability.

- **Models**: Define the data structure (Schemas) using Mongoose.
- **Controllers**: Contain the "Brain" or Business Logic.
- **Routes**: Define the entry points (Endpoints) for the API.
- **Middleware**: Professional-grade security checks (Authentication, Authorization, and Data Injection).

---

## 🔄 2. The Core Lifecycle (A-Z Flow)

### Phase A: Opening an Account (`/account/open`)
Before a user can log in, they must have a "Bank Account" in the system.
1. **Initiation**: User provides Name, Email, and Phone.
2. **OTP Generation**: A 6-digit OTP is sent via Email.
3. **System Generation**: The API automatically generates a unique 13-digit **Account Number** and assigns a random **Bank Title** (e.g., UBL, HBL).
4. **Balance Initialization**: A record in the `UserBalance` model is created with `0` balance.
5. **Verification**: Once the OTP is verified, the account status becomes `ACTIVATED`.

### Phase B: User Registration & Security (`/api`)
Once a bank account is open, the user creates a "Login Profile."
1. **Linkage**: The API checks if the email matches a verified bank account.
2. **Hashing**: Passwords are never stored as plain text. They are hashed using `Bcrypt` (10 rounds).
3. **Email Verification**: A second layer of security ensures the user's login email is valid.

### Phase C: Authentication & Access
- **Login**: Upon successful login, the server issues a **JWT (JSON Web Token)**.
- **Token Payload**: The token contains the User ID, Username, Account ID, and Account Number.
- **Persistent State**: The `isLogin` status and `lastLogin` timestamp are updated in the database.

---

## 💸 3. Transaction Logic & Safety
Transactions are the most critical part of the API.

1. **Gatekeeping**: The `accountDetailMiddleware` extracts the sender's account information from the JWT.
2. **Pre-check**:
    - Validates if the receiver exists.
    - Checks if the sender has enough `balance`.
3. **The Atomic Update**:
    - Subtracts amount from Sender's balance.
    - Adds amount to Receiver's balance.
4. **Email Notifications**: Both parties receive a professional HTML email confirming the success (or failure) of the transfer.
5. **Double-Entry Logging**: Every transaction is stored in the `TransactionMoney` model with a unique Transaction ID for audit trails.

---

## 💳 4. Card Services Lifecycle
The API simulates real-world banking card management:
- **Creation**: Generates a 16-digit Card Number, CVV, and sets a 5-year expiry.
- **Setup**: The card is initially inactive until a **4-digit PIN** is set by the user.
- **Withdrawal Logic**:
    - Validates Card Status (must be `active`).
    - Validates Expiry and Daily Limits.
    - Validates PIN via Bcrypt comparison.
    - Subtracts from balance just like a transfer.

---

## 🔒 5. Security Summary
- **JWT**: Ensures only authorized users can touch their own data.
- **Bcrypt**: State-of-the-art password and PIN encryption.
- **Role-Based Access**: Some routes are restricted to `Admin` users only.
- **OTP Expiry**: All OTPs have a 10-minute lifespan for maximum security.

---

## 📦 6. Database Models Overview
| Model | Purpose |
| :--- | :--- |
| **OpenAccount** | Global repository of all bank account holders. |
| **User** | Login credentials and security status. |
| **UserBalance** | Real-time tracking of funds. |
| **BankCard** | Physical/Virtual card details and statuses. |
| **TransactionMoney** | Permanent ledger of all money movements. |

---

*This API is designed to be the backbone of a secure, modern financial ecosystem.*
