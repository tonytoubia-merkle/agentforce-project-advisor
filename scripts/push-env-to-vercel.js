#!/usr/bin/env node
/**
 * Push environment variables from .env.local to Vercel
 *
 * Usage:
 *   node scripts/push-env-to-vercel.js              # Push all env vars
 *   node scripts/push-env-to-vercel.js --preview    # Only preview environment
 *   node scripts/push-env-to-vercel.js --dry-run    # Show what would be pushed
 *
 * Prerequisites:
 *   - Vercel CLI installed: npm i -g vercel
 *   - Project linked: vercel link
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const previewOnly = args.includes('--preview');

// Read .env.local
const envPath = path.join(projectRoot, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found. Create it first with your environment variables.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n').filter(line =>
  line.trim() && !line.startsWith('#') && line.includes('=')
);

console.log('\n🚀 Pushing Environment Variables to Vercel');
console.log('==========================================\n');

if (dryRun) {
  console.log('🔍 DRY RUN - No changes will be made\n');
}

const environments = previewOnly ? ['preview'] : ['production', 'preview', 'development'];
console.log(`📍 Target environments: ${environments.join(', ')}\n`);

// Skip Vercel's auto-injected variables
const skipVars = ['VERCEL_OIDC_TOKEN', 'VERCEL_URL', 'VERCEL_ENV', 'VERCEL_REGION'];

// Add env var for a single environment
async function addEnvVarSingle(key, value, env) {
  return new Promise((resolve) => {
    const proc = spawn('npx', ['vercel', 'env', 'add', key, env], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let stderr = '';
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    // Write the value to stdin and close
    proc.stdin.write(value);
    proc.stdin.end();

    proc.on('close', (code) => {
      resolve({ success: code === 0, stderr });
    });

    proc.on('error', (err) => {
      resolve({ success: false, stderr: err.message });
    });
  });
}

// Remove env var for a single environment
async function removeEnvVar(key, env) {
  return new Promise((resolve) => {
    const proc = spawn('npx', ['vercel', 'env', 'rm', key, env, '--yes'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    proc.on('close', () => resolve());
    proc.on('error', () => resolve());
  });
}

async function main() {
  const results = [];

  for (const line of lines) {
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.substring(0, eqIndex).trim();
    let value = line.substring(eqIndex + 1).trim();

    // Skip Vercel auto-injected vars
    if (skipVars.includes(key)) {
      console.log(`⏭️  ${key} (skipped - Vercel auto-injected)`);
      continue;
    }

    // Skip empty values
    if (!value) continue;

    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    console.log(`📦 ${key}`);

    if (dryRun) {
      const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
      console.log(`   Would set: ${preview}`);
      results.push({ key, success: true });
      continue;
    }

    let allSuccess = true;
    const failedEnvs = [];

    // Process each environment separately
    for (const env of environments) {
      // Remove existing first
      await removeEnvVar(key, env);

      // Add new value
      const result = await addEnvVarSingle(key, value, env);
      if (!result.success) {
        allSuccess = false;
        failedEnvs.push(env);
      }
    }

    if (allSuccess) {
      console.log('   ✅ Success');
      results.push({ key, success: true });
    } else {
      console.log(`   ❌ Failed for: ${failedEnvs.join(', ')}`);
      results.push({ key, success: false });
    }
  }

  // Summary
  console.log('\n\n📊 Summary');
  console.log('==========');
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Succeeded: ${succeeded}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);

  if (!dryRun && succeeded > 0) {
    console.log('\n💡 Run `vercel --prod` to deploy with the new env variables.\n');
  }
}

main().catch(console.error);
