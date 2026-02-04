#!/usr/bin/env node
/**
 * Deploy Salesforce metadata for Project Advisor agent
 *
 * Usage:
 *   node scripts/deploy.js              # Deploy all metadata
 *   node scripts/deploy.js --flows      # Deploy flows only
 *   node scripts/deploy.js --apex       # Deploy Apex classes only
 *   node scripts/deploy.js --objects    # Deploy objects only
 *   node scripts/deploy.js --validate   # Validate without deploying
 *
 * Prerequisites:
 *   - Salesforce CLI (sf) installed
 *   - Authenticated to your org: sf org login web --alias my-org --set-default
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const validateOnly = args.includes('--validate');
const flowsOnly = args.includes('--flows');
const apexOnly = args.includes('--apex');
const objectsOnly = args.includes('--objects');

const projectRoot = path.resolve(__dirname, '..');

console.log('\n🚀 Salesforce Deployment Script');
console.log('================================\n');

// Check if authenticated
try {
  const orgInfo = execSync('sf org display --json', {
    encoding: 'utf-8',
    cwd: projectRoot
  });
  const org = JSON.parse(orgInfo);
  if (org.status === 0) {
    console.log(`✅ Connected to: ${org.result.instanceUrl}`);
    console.log(`   Username: ${org.result.username}\n`);
  }
} catch (error) {
  console.error('❌ Not authenticated to a Salesforce org.');
  console.log('\n💡 Run: sf org login web --alias my-org --set-default\n');
  process.exit(1);
}

function runCommand(cmd, description) {
  console.log(`\n📦 ${description}...`);
  try {
    const output = execSync(cmd, {
      encoding: 'utf-8',
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log('   ✅ Success');
    return { success: true, output };
  } catch (error) {
    console.log('   ❌ Failed');
    // Try to extract meaningful error from stderr
    const stderr = error.stderr || '';
    const match = stderr.match(/Error[^:]*:\s*(.+)/);
    if (match) {
      console.log(`   Error: ${match[1].substring(0, 200)}`);
    } else {
      console.log(`   Error: ${error.message.substring(0, 200)}`);
    }
    return { success: false, error: error.message };
  }
}

const deployFlag = validateOnly ? '--dry-run' : '';
const deployWord = validateOnly ? 'Validating' : 'Deploying';
const hasSpecificFlag = flowsOnly || apexOnly || objectsOnly;

// Deployment commands - ORDER MATTERS! Objects must come before flows that reference them.
const deployments = [];

// 1. Custom Objects (must deploy first as flows depend on them)
if (!flowsOnly && !apexOnly) {
  deployments.push({
    description: `${deployWord} Custom Objects`,
    command: `sf project deploy start --source-dir force-app/main/default/objects ${deployFlag} --ignore-warnings`
  });
}

// 2. Apex Classes
if (!flowsOnly && !objectsOnly) {
  deployments.push({
    description: `${deployWord} Apex Classes`,
    command: `sf project deploy start --source-dir force-app/main/default/classes ${deployFlag} --ignore-warnings`
  });
}

// 3. Flows (depend on objects)
if (!apexOnly && !objectsOnly) {
  deployments.push({
    description: `${deployWord} Flows`,
    command: `sf project deploy start --source-dir force-app/main/default/flows ${deployFlag} --ignore-warnings`
  });
}

// 4. Permission Sets (depend on objects and apex)
if (!flowsOnly && !apexOnly && !objectsOnly) {
  deployments.push({
    description: `${deployWord} Permission Sets`,
    command: `sf project deploy start --source-dir force-app/main/default/permissionsets ${deployFlag} --ignore-warnings`
  });
}

// 5. Agent Definitions (optional, may not work via CLI)
if (!hasSpecificFlag) {
  deployments.push({
    description: `${deployWord} Agent Definitions (may require manual setup)`,
    command: `sf project deploy start --source-dir force-app/main/default/agentDefinitions ${deployFlag} --ignore-warnings`,
    optional: true
  });
}

console.log(`\n${validateOnly ? '🔍 Validation' : '🚀 Deployment'} Plan:`);
deployments.forEach((d, i) => console.log(`   ${i + 1}. ${d.description}`));

// Execute deployments
const results = [];
for (const deployment of deployments) {
  const result = runCommand(deployment.command, deployment.description);
  results.push({ ...deployment, ...result });
}

// Summary
console.log('\n\n📊 Deployment Summary');
console.log('=====================');

let allSuccess = true;
let allRequired = true;
results.forEach(r => {
  const status = r.success ? '✅' : '❌';
  const optionalNote = r.optional ? ' (optional)' : '';
  console.log(`${status} ${r.description}${optionalNote}`);
  if (!r.success) {
    allSuccess = false;
    if (!r.optional) allRequired = false;
  }
});

if (allSuccess) {
  console.log('\n🎉 All deployments successful!\n');
} else if (allRequired) {
  console.log('\n✅ Required deployments successful (some optional items failed).\n');
}

if (allRequired && !validateOnly) {
  console.log('📋 Next Steps:');
  console.log('   1. Assign the "Project Advisor Agent" permission set to your agent user');
  console.log('   2. Get your Agent ID: node scripts/get-agent-id.js');
  console.log('   3. Configure .env.local with your credentials');
  console.log('   4. Set VITE_USE_MOCK_DATA=false');
  console.log('   5. Start the app: npm run dev\n');
}

if (!allRequired) {
  console.log('\n⚠️  Some required deployments failed. Check errors above.\n');
  process.exit(1);
}
