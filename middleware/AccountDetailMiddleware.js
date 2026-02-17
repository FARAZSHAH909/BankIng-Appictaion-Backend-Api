
import jwt from 'jsonwebtoken';

const accountDetailMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.accountDetails = {
            userId: decoded.userId,
            username: decoded.username,
            accountId: decoded.accountId,
            accountNumber: decoded.accountNumber,
            accountTitle: decoded.accountTitle
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default accountDetailMiddleware;
