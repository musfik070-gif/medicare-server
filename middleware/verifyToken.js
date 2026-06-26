const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Look for the "Authorization" header in the incoming request
  const authHeader = req.headers.authorization;

  // 2. If there is no header, or it doesn't start with "Bearer ", block them!
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. No token provided.",
    });
  }

  // 3. The token looks like "Bearer eyJhbGci...". We just want the token part.
  const token = authHeader.split(" ")[1];

  // 4. Verify the token using your secret key from the .env file
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access. Invalid or expired token.",
      });
    }

    // 5. If successful, attach the decoded user info (id, email, role) to the request!
    req.user = decoded;

    // 6. Tell Express to move on to the actual route controller
    next();
  });
};

module.exports = verifyToken;
