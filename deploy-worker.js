#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('Starting wrangler deployment...');

const wrangler = spawn('wrangler', ['deploy', '--env', 'production'], {
  cwd: 'c:\\FreelanceFlow',
  stdio: 'inherit',
  shell: true
});

wrangler.on('close', (code) => {
  console.log(`Wrangler process exited with code ${code}`);
  process.exit(code);
});

wrangler.on('error', (err) => {
  console.error('Failed to start wrangler:', err);
  process.exit(1);
});
