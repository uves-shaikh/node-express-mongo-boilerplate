import app from './app';
import { config } from './config';
import { connectDB } from './config/database';

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
  });

  // --- Graceful shutdown ---
  // On SIGTERM/SIGINT (from Docker, K8s, PM2), stop accepting new connections,
  // finish in-flight requests, then exit cleanly. This avoids dropped requests.
  const shutdown = (signal: string) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10s if something is stuck
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections — log and exit (let orchestrator restart)
  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
  });
};

startServer();
