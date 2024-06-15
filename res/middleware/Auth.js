import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;
  token = req.headers.token;
  if (!token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", response: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.email = decoded.email;
    req.role = decoded.role;
    next();
  } catch (err) {
    console.error(err);
    return res
      .status(401)
      .json({ status: "error", response: "Unauthorized: Invalid token" });
  }
};

const authorizationLevels = {
  admin: ["admin"],
  editor: ["manager"],
  user: ["user"],
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.length) {
      return next();
    }

    const userRole = req.role;

    if (
      !authorizationLevels[userRole] ||
      !authorizationLevels[userRole].some((allowedRole) =>
        roles.includes(allowedRole)
      )
    ) {
      return res
        .status(403)
        .json({ response: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
