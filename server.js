import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set environment to production
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;

// Path to Next.js standalone entry point
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

try {
  // Pass execution directly to the Next.js standalone server
  require(standaloneServer);
} catch (err) {
  console.error('Failed to start Next.js standalone server:', err);
  process.exit(1);
}

