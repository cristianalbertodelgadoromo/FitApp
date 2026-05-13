import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import foodRoutes from './routes/foodRoutes';
import exerciseRoutes from './routes/exerciseRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/exercises', exerciseRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('FitApp API is running...');
});

export default app;
