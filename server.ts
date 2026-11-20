import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  applyPrivacyHeaders,
  createApiApp,
  hardenIsolatedHtml,
  isPrivacyHardenedPath,
} from './server/app.ts';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = createApiApp();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get('*', async (req, res, next) => {
      if (!isPrivacyHardenedPath(req.path)) {
        return next();
      }
      try {
        applyPrivacyHeaders(res);
        const rawHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        res.status(200).type('html').send(hardenIsolatedHtml(transformed));
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
      if (isPrivacyHardenedPath(req.path)) {
        applyPrivacyHeaders(res);
        res.status(200).type('html').send(hardenIsolatedHtml(indexHtml));
        return;
      }
      res.status(200).type('html').send(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`His & Hers Circle of Hope server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
