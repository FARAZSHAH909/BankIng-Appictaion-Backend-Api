import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from "./config/DataBase.js";
import registerRoutes from './routes/registerRoutes.js';

// Open Account Api 
import openAccountRoutes from './routes/openAccountRoutes.js';

// User Balance Api 
import userBalanceRoutes from './routes/userBalanceRoutes.js';

// Bank Card Api 
import bankCardRoutes from './routes/bankCardRoutes.js';
//
 






dotenv.config();

connectDB();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));


// Routes
// app.use('/api/auth', registerRoutes);
app.use('/api', registerRoutes);
// Open Account Api 
app.use('/account/open', openAccountRoutes);

// User Balance Api 
app.use('/account/balance', userBalanceRoutes);

// Bank Card Api 
app.use('/account/card', bankCardRoutes);





// Sample route
app.get('/', (req, res) => {
    res.send('Hello World hi!');
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
