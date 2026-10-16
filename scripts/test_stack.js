#!/usr/bin/env node
/**
 * scripts/test_stack.js
 * Waits for Backend (/api/v1/health) and Frontend (:3000), then runs full suite.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function checkHealth(url, expectedStatus = 200, timeoutMs = 40000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === expectedStatus) {
        return true;
      }
    } catch (e) {
      // service starting up
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log('[TEST:STACK] Checking stack health...');

  const backendHealthy = await checkHealth('http://localhost:4000/api/v1/health', 200);
  if (!backendHealthy) {
    console.error('✗ Backend failed to report healthy status at http://localhost:4000/api/v1/health');
    process.exit(1);
  }
  console.log('✓ Backend healthy with connected database');

  const frontendHealthy = await checkHealth('http://localhost:3000', 200);
  if (!frontendHealthy) {
    console.error('✗ Frontend failed to return HTTP 200 at http://localhost:3000');
    process.exit(1);
  }
  console.log('✓ Frontend healthy and responding on :3000');

  console.log('\n[TEST:STACK] Executing comprehensive test suite...');
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';

  const testRunner = spawn(npxCmd, ['tsx', 'comprehensive_test_suite.ts'], {
    cwd: path.join(rootDir, 'frontend'),
    stdio: 'inherit',
    shell: true,
  });

  testRunner.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
