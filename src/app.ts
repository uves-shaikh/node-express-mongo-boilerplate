import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

// --- Security middleware (always before routes) ---

// helmet sets secure HTTP headers (XSS, clickjacking, etc.)
app.use(helmet());

// cors should be configured per environment in production
app.use(cors({ origin: config.isDev ? '*' : process.env.ALLOWED_ORIGINS }));

// Rate limiting prevents brute-force and DDoS at the app layer
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs, // 15 min by default
    max: config.rateLimit.max,           // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// --- Body parsing ---
app.use(express.json({ limit: '10kb' })); // Prevents payload-based DoS
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
// Versioning in the prefix (v1) makes future breaking changes non-destructive
app.use('/api/v1', routes);

// --- Error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
