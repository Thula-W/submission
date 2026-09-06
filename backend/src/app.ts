import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import submissionRoutes from './routes/submission.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

export default app;