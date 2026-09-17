import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRouter from './auth/auth.routes.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import auctionRoutes from './routes/auction.routes.js';

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error('FRONTEND_URL is not defined');
}

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hammr backend is running',
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// --------------------
// Start Server
// --------------------

app.listen(PORT, () => {
  console.log(`Hammr backend running on port ${PORT}`);
});
