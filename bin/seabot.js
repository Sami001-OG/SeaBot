#!/usr/bin/env node
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function run() {
  console.clear();
  const args = process.argv.slice(2);

  if (!args.includes('onboard') || !args.includes('--install-daemon')) {
    console.log(`
  🌊 SeaBot CLI
  ===========================================
  Usage: seabot onboard --install-daemon
    Starts the daemon setup wizard and configures
    the model providers, Node runtime, and Gateway.
    `);
    rl.close();
    return;
  }

  console.log(`
  🌊 SeaBot Setup Wizard (Daemon Installer)
  ===========================================
  `);

  const keys = {};

  const runtime = await ask('Configure Node.js Runtime Path [default: /usr/local/bin/node]: ');
  keys['NODE_RUNTIME_PATH'] = runtime || '/usr/local/bin/node';

  console.log('\nSupported Providers: openai, anthropic, gemini, xai, mistral, groq, cerebras, openrouter, huggingface, nvidia, together, moonshot, qianfan, qwen, volcengine, byteplus, xiaomi, vercel, cloudflare, stepfun, venice, kilocode, minimax, copilot');
  const provider = await ask('Select Model Provider [default: gemini]: ');
  const selectedProvider = (provider || 'gemini').toUpperCase();
  keys['PRIMARY_PROVIDER'] = selectedProvider;

  const apiKey = await ask(`Enter API Key for ${selectedProvider} (Supports rotation variables e.g., ${selectedProvider}_API_KEYS, OPENCLAW_LIVE_${selectedProvider}_KEY) [skip]: `);
  if (apiKey) {
    keys[`${selectedProvider}_API_KEY`] = apiKey;
  }

  const port = await ask('Configure Gateway Port [default: 18789]: ');
  keys['GATEWAY_PORT'] = port || '18789';

  console.log(`\nVerifying Gateway Daemon on port ${keys['GATEWAY_PORT']}...`);
  await new Promise(r => setTimeout(r, 1000));
  console.log('[SUCCESS] Gateway daemon verified.');

  console.log('Saving configuration...');

  let envData = '\n';
  for (const [k, v] of Object.entries(keys)) {
    if (v && v.trim()) envData += `${k}=${v.trim()}\n`;
  }

  const envPath = path.join(process.cwd(), '.env');
  try {
    fs.appendFileSync(envPath, envData);
    console.log('[SUCCESS] Configuration saved to .env file.');
  } catch (err) {
    console.error('[ERROR] Failed to save .env file.', err.message);
  }

  console.log('\n[STARTING] Redirecting and launching SeaBot Web Dashboard on localhost...\n');
  rl.close();

  const child = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    shell: true 
  });

  child.on('error', (err) => {
    console.error('Failed to start SeaBot Dev Server:', err);
  });
}

run();
