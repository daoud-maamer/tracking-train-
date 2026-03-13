const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if no auth header or wrong format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

        // Add user from payload
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    // Requires authMiddleware to have run first
    if (!req.user) {
        return res.status(401).json({ error: 'Authorization denied' });
    }

    if (req.user.role !== 'admin' && req.user.id !== 1) {
        return res.status(403).json({ error: 'Access denied: Requires admin privileges' });
    }

    next();
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
            req.user = decoded;
        } catch (err) {
            // Ignore invalid token for optional auth, just continue
        }
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
