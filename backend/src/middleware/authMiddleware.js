const jwt = require('jsonwebtoken');

// JWT Secretの取得
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.authMiddleware = (req, res, next) => {
  // トークン取得
  const token = req.header('x-auth-token');

  // トークンの存在確認
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // トークン検証
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ユーザーIDをリクエストに追加
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};