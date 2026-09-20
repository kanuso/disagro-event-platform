import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import clientRoutes from './routes/client.routes';
import serviceRoutes from './routes/service.routes';
import productRoutes from './routes/product.routes';
import attendanceRoutes from './routes/attendance.routes';
import reportRoutes from './routes/report.routes';

const app = express();

app.use(helmet());

// ---- CORS dinámico (múltiples orígenes) ----
const allowedOrigins = (
  process.env.FRONTEND_URL ??
  'http://localhost:5173,http://localhost:8081,http://localhost:8080'
)
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'DISAGRO Event Platform API is running',
  });
});

app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/reports', reportRoutes);

export default app;