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
  console.log(`
  🌊 SeaBot Initialization CLI
  ===========================================
  Welcome to SeaBot. Let's configure your local 
  agent environment. You can skip any step by 
  pressing Enter.
  `);

  const keys = {};

  keys['GEMINI_API_KEY'] = await ask('Enter Primary AI API Key (Gemini/OpenAI) [Skip]: ');
  keys['TELEGRAM_BOT_TOKEN'] = await ask('Enter Telegram Bot Token [Skip]: ');
  keys['WHATSAPP_TOKEN'] = await ask('Enter WhatsApp Cloud API Token [Skip]: ');
  keys['SEARCH_API_KEY'] = await ask('Enter Tavily Search API Key [Skip]: ');

  console.log('\nSaving configuration...');

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

  // Launch the server/dev process just like OpenClaw
  const child = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    shell: true 
  });

  child.on('error', (err) => {
    console.error('Failed to start SeaBot Dev Server:', err);
  });
}

run();
