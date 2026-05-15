import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import foodRoutes from './routes/foodRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import foodLogRoutes from './routes/foodLogRoutes';
import routineRoutes from './routes/routineRoutes';
import progressRoutes from './routes/progressRoutes';
import postRoutes from './routes/postRoutes';
import coachRoutes from './routes/coachRoutes';
import paymentRoutes from './routes/paymentRoutes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/payments', paymentRoutes);





// Base route
app.get('/', (req, res) => {
  res.send('FitApp API is running...');
});

export default app;
