import axios from "axios";

/**
 * Middleware to validate user type.
 * @param {string} requiredType - The user_type that is allowed (e.g., "system_admin").
 */
function requireUserType(requiredType) {
  return async (req, res, next) => {
    try {
      // 1. Extract token from request headers
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Invalid Authorization header" });
      }

      // 2. Send token to hosted backend for validation
      const response = await axios.post(
        "https://rationally-endless-mammal.ngrok-free.app/api/auth/users/show",
        {}, // empty body because token is in header
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // hosted backend returns { code, message, data: { user fields... } }
      const user = response.data?.data;

      if (!user) {
        return res.status(500).json({ error: "Invalid response from auth server" });
      }

      // 3. Check user_type
      if (user.user_type !== requiredType) {
        return res.status(403).json({ error: "Forbidden: Wrong user type" });
      }
      console.log(user.user_type, requiredType);

      // 4. Attach user to req and continue
      req.user = user;
      next();
    } catch (err) {
      console.error("Auth middleware error:", err.message);

      if (err.response) {
        // Pass through error from hosted backend
        return res.status(err.response.status).json(err.response.data);
      }

      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export default requireUserType;
