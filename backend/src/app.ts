import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import submissionRoutes from './routes/submission.routes';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, 
  }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

app.use(errorHandler);

export default app;