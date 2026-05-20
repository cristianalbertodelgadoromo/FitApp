import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes      from './routes/auth.routes';
import usersRoutes     from './routes/users.routes';
import coachesRoutes   from './routes/coaches.routes';
import clientsRoutes   from './routes/clients.routes';
import exercisesRoutes from './routes/exercises.routes';
import foodsRoutes     from './routes/foods.routes';
import foodLogsRoutes  from './routes/food_logs.routes';
import progressRoutes  from './routes/progress.routes';
import routinesRoutes  from './routes/routines.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/users',      usersRoutes);
app.use('/api/coaches',    coachesRoutes);
app.use('/api/clients',    clientsRoutes);
app.use('/api/exercises',  exercisesRoutes);
app.use('/api/foods',      foodsRoutes);
app.use('/api/food-logs',  foodLogsRoutes);
app.use('/api/progress',   progressRoutes);
app.use('/api/routines',   routinesRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('FitApp API is running...');
});

export default app;
