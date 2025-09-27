import axios from "axios";

/**
 * Middleware to validate user type.
 * @param {string} requiredType - The user_type that is allowed (e.g., "system_admin").
 */
function requireUserType(requiredType) {
  return async (req, res, next) => {
    console.log("requiredType", requiredType);
    try {
      // 1. Extract token from request headers
      const authHeader = req.headers["authorization"];
      console.log("Auth Header:", authHeader); // Debug log
      if (!authHeader) {
        console.log("Missing Authorization header"); // Debug log
        return res.status(401).json({ error: "Missing Authorization header" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Invalid Authorization header" });
      }

      // 2. Send token to hosted backend for validation
      console.log("Sending token to auth server..."); // Debug log
      const response = await axios.post(
          process.env.URL_FOR_VALIDATION,
        {}, // empty body because token is in header
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Auth server response:", response.data); // Debug log

      // hosted backend returns { code, message, data: { user fields... } }
      const user = response.data?.data;
      console.log("Extracted user data:", user); // Debug log

      if (!user) {
        return res.status(500).json({ error: "Invalid response from auth server" });
      }

      // 3. Check user_type
      console.log("User type from token:", user.user_type, "Required:", requiredType); // Debug log
      if (user.user_type !== requiredType) {
        console.log("User type mismatch - returning 403"); // Debug log
        return res.status(403).json({ 
          error: "Forbidden: Wrong user type", 
          userType: user.user_type, 
          requiredType: requiredType 
        });
      }
      console.log(user.user_type, requiredType);

      // 4. Attach user to req and continue
      req.user = user;
      next();
    } catch (err) {
      console.error("Auth middleware error:", err.message);
      console.error("Full error:", err); // More detailed error logging

      if (err.response) {
        console.error("Auth server error response:", err.response.status, err.response.data);
        // Pass through error from hosted backend
        return res.status(err.response.status).json(err.response.data);
      }

      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        console.error("Cannot connect to auth server");
        return res.status(503).json({ error: "Authentication service unavailable" });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export default requireUserType;
