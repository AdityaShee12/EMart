import asyncHandler from "../utiles/asyncHandler.js";


 export const requireAdmin = asyncHandler(async (req,res,next) => {
    const isAdmin =
    req.user?.role === 'admin' ||                    // e.g. role: 'admin'
    req.user?.roles?.includes?.('admin');      // new multi‑role

  // 2️⃣  If not an admin → block with 403 Forbidden.
  if (!isAdmin) {
    return res.status(403).json({ message: 'Admins only' });
  }

  // 3️⃣  Otherwise → move on to the next middleware / controller.
  next();
 })
  

 // ✅ Always use verifyJWT before requireAdmin to ensure req.user is available for role checking
