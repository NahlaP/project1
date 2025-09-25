// // middleware/auth.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1]; 
//   if (!token) return res.status(401).json({ error: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
//     (req as any).userId = decoded.userId; 
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };






// // middleware/auth.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1]; 
//   if (!token) return res.status(401).json({ error: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
//     (req as any).userId = decoded.userId; 
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };