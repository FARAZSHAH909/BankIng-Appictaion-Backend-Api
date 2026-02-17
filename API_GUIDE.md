# 🏦 Banking API: The ULTIMATE A-Z Technical Guide (Deep Detail)

This guide explains **every part** of the Banking Backend API. We use simple English to help you understand how the code works "under the hood."

---

## 🏗️ 1. Project Organization (The Folders)
Think of the project like a restaurant:
- **`app.js` (The Manager)**: Starts the server and tells everyone where to go.
- **`routes/` (The Menu)**: Lists all the things you can ask for (like `/login` or `/send-money`).
- **`controllers/` (The Kitchen)**: This is where the actual work happens. The logic is cooked here.
- **`models/` (The Store Room)**: This is where we keep all the data safely in a database (MongoDB).
- **`middleware/` (The Gatekeeper)**: Checks if you are allowed to enter or if your "ticket" (Token) is valid.

---

## 🔑 2. Authentication & Users (`registerController.js`)
This is how we keep the app secure.

### A. Simple Registration
- **Code Logic**: When a user signs up, the code first checks if they have a **Bank Account** (Phase A). You cannot register if you don't have an account first!
- **OTP Security**: We generate a random 6-digit number. We use `nodemailer` to send this to the user's email.
- **Password Hashing**: We use a library called `bcrypt`. It turns your password (like "123456") into a long secret code (like "$2b$10$X8..."). Even if someone steals the database, they cannot see your real password.

### B. The Login "Token" (JWT)
- **Token Creation**: When you login, the server gives you a **JWT (JSON Web Token)**. 
- **What's inside?**: It hides your User ID and Account Number inside a secret string. 
- **Usage**: You must send this token every time you want to check your balance or send money. It's like having a digital VIP pass.

---

## 🏧 3. Bank Account Management (`openAccountController.js`)
This module creates your "Bank Identity."

- **Account Number**: The code uses `Math.random()` to create a unique **13-digit number**.
- **Bank Title**: To make it look real, the code randomly picks a bank name like **"Meezan Islamic Bank"** or **"UBL"** for you.
- **Initial Balance**: The moment your account is created, the system makes a record in the **Balance Store Room** and sets your money to `0`.

---

## 💸 4. Sending Money (`transactionMoneyController.js`)
This is the most complex part. Here is exactly what happens in the code:

1. **The Check**: The code asks: "Does the person receiving the money exist?" and "Does the sender have enough money?"
2. **The Email**: If the check fails (e.g., not enough money), the code immediately sends a "Failed" email.
3. **The Math**: If everything is okay, the code does two things at the same time:
   - `-` (Minus) the amount from the Sender.
   - `+` (Plus) the amount to the Receiver.
4. **The Ledger**: A permanent record of this transfer is saved with a **Transaction ID** (e.g., `TXN-170821...`). 
5. **Double Confirmation**: Both the sender and the receiver get a "Success" email.

---

## 💳 5. Bank Cards (`bankCardController.js`)
You can manage virtual or physical cards here.

- **CVV & Expiry**: The code generates a 3-digit CVV and sets the expiry date to exactly **5 years** from today.
- **Card Status**: A card can be `active` or `inactive`. 
- **PIN Security**: Just like passwords, your Card PIN is **hashed** (encrypted). The bank never knows your 4-digit PIN!
- **ATM Withdrawal**: When you withdraw money using a card, the code checks the **Daily Limit** and ensures **Contactless** is enabled in the settings.

---

## 🛡️ 6. The Gatekeepers (`middleware/`)
- **`authMiddleware.js`**: This checks if your Token is valid. If your token is expired or fake, it stops you with an "Unauthorized" message.
- **`AccountDetailMiddleware.js`**: This is a smart helper. It opens up your Token, reads your Account Number, and attaches it to the request so the controllers know exactly who you are without asking again.

---

## 📊 7. Database Models (The Data Structure)

| Model Name | What it stores? | Why is it important? |
| :--- | :--- | :--- |
| **User** | Username, Email, Encrypted Password, Role. | Handles your login. |
| **OpenAccount** | Full Name, Account Number, Bank Name, Verified Status. | Your official bank identity. |
| **Balance** | The current amount of money you have. | Keeps track of your wealth. |
| **Card** | Card Number, CVV, PIN, Status (Active/Blocked). | Manages your spending tool. |
| **Transaction** | Sender, Receiver, Amount, Time, Description. | The history of everything you do. |

---

## 🚀 Summary of the Tech "A to Z"
1. **Node.js/Express**: The engine that runs the code.
2. **MongoDB/Mongoose**: The database that remembers everything.
3. **JWT**: The security passport.
4. **Bcrypt**: The guard that encrypts passwords.
5. **Nodemailer**: The postman that sends emails/OTPs.

**Everything in this API is built to be fast, secure, and professional.**
