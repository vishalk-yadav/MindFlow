const fs = require('fs');
const path = require('path');

// Auto-patch Prisma Client 5.x runtime on Node.js 24 (where native QueryEngine binary does not export trace)
try {
  const runtimeDir = path.resolve(__dirname, '../../node_modules/@prisma/client/runtime');
  ['library.js', 'library.mjs'].forEach(file => {
    const fullPath = path.join(runtimeDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('trace:r.trace.bind(r)')) {
        fs.writeFileSync(fullPath, content.replace(/trace:r\.trace\.bind\(r\)/g, 'trace:r.trace?.bind(r)'), 'utf8');
      }
    }
  });
} catch (_) {}

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
