import dotenv from 'dotenv';
dotenv.config();
import express, {type Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import attemptRoutes from './routes/attempt.routes.js';
import problemRoutes from './routes/problem.routes.js';
import Problem from './models/Problem.js';
const app: Application = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/attempts', attemptRoutes);
app.use('/api/problems', problemRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lld-practice';

// Database connection & Server start
mongoose.connect(MONGO_URI, {dbName: "lld-platform"})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
  });

  let prob = await Problem.find();
    console.log(prob)
export default app;