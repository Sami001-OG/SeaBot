#!/usr/bin/env node
import readline from 'readline';
import { spawn } from 'child_process';
import http from 'http';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3000/api/health', (res) => {
      if (res.statusCode === 200) resolve(true);
      else resolve(false);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

function streamAgent(objective) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://127.0.0.1:3000/api/agent/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      res.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.type === 'thought' || data.type === 'action' || data.type === 'observation') {
                 console.log(`\x1b[90m[${data.type.toUpperCase()}]\x1b[0m \x1b[36m${data.content.trim()}\x1b[0m`);
              } else if (data.type === 'reflection') {
                 console.log(`\n\x1b[32mAgent: ${data.content}\x1b[0m\n`);
                 resolve();
              } else if (data.type === 'error') {
                 console.log(`\x1b[31m[ERROR] ${data.content}\x1b[0m`);
                 resolve();
              }
            } catch (e) {}
          }
        }
      });
      res.on('end', () => resolve());
    });
    
    req.on('error', (e) => reject(e));
    req.write(JSON.stringify({ objective, provider: 'gemini' }));
    req.end();
  });
}

async function run() {
  console.clear();
  console.log(`\x1b[36m
  🌊 SeaBot Agent CLI v2.0
  ===========================================
  Welcome to the Native Command Line Interface.
  Type your prompt to converse with the agent.
  Type 'exit' or 'quit' to close.
  \x1b[0m`);

  const serverReady = await checkServerReady();
  if (!serverReady) {
    console.log(`\x1b[33m[WARN] Local Gateway Server is not running on port 3000.\x1b[0m`);
    console.log(`Start it via Web UI or run 'npm run dev' in another terminal.\n`);
    rl.close();
    return;
  }

  const loop = async () => {
    const input = await ask('\x1b[32mYou >\x1b[0m ');
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      return;
    }
    
    if (input.trim() === '') {
       loop();
       return;
    }

    try {
      await streamAgent(input);
    } catch (e) {
      console.log(`\x1b[31mConnection Error: Could not reach agent backend.\x1b[0m`);
    }

    loop();
  };

  loop();
}

run();
