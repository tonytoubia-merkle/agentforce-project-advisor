#!/usr/bin/env node
/**
 * Get Agentforce Agent ID by name
 *
 * Usage:
 *   node scripts/get-agent-id.js "Project Advisor"
 *   node scripts/get-agent-id.js  # defaults to "Project Advisor"
 *
 * Prerequisites:
 *   - Salesforce CLI (sf) installed
 *   - Authenticated to your org: sf org login web --alias my-org
 */

import { execSync } from 'child_process';

const agentName = process.argv[2] || 'Project Advisor';
const devName = agentName.replace(/\s+/g, '_');

console.log(`\n🔍 Searching for agent: "${agentName}"\n`);

function runQuery(query, silent = false) {
  try {
    const result = execSync(`sf data query --query "${query}" --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(result);
  } catch (e) {
    if (!silent) {
      // Try to parse error message
      try {
        const errData = JSON.parse(e.stdout || e.stderr || '{}');
        if (errData.message) {
          console.log(`   ⚠️  ${errData.message.substring(0, 80)}`);
        }
      } catch {
        // ignore
      }
    }
    return null;
  }
}

function printTable(title, records, idField = 'Id') {
  console.log(`\n┌─────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ ${title.padEnd(68)}│`);
  console.log(`├──────────────────────┬─────────────────────┬────────────────────────┤`);
  console.log(`│ ID                   │ Developer Name      │ Label                  │`);
  console.log(`├──────────────────────┼─────────────────────┼────────────────────────┤`);

  records.forEach(record => {
    const id = (record[idField] || '').padEnd(18);
    const dev = (record.DeveloperName || record.Name || '').substring(0, 19).padEnd(19);
    const label = (record.MasterLabel || record.Label || record.Name || '').substring(0, 22).padEnd(22);
    console.log(`│ ${id} │ ${dev} │ ${label} │`);
  });

  console.log(`└──────────────────────┴─────────────────────┴────────────────────────┘`);
}

// Objects to search for Agent Studio agents
const agentObjects = [
  { name: 'GenAiPlanner', fields: 'Id, DeveloperName, MasterLabel' },
  { name: 'GenAiPlannerDefinition', fields: 'Id, DeveloperName, MasterLabel' },
  { name: 'GenAiPlugin', fields: 'Id, DeveloperName, MasterLabel' },
  { name: 'AiAssistantDefinition', fields: 'Id, DeveloperName, MasterLabel' },
  { name: 'BotDefinition', fields: 'Id, DeveloperName, MasterLabel' },
];

let found = false;

// First, try to find by exact name match
for (const obj of agentObjects) {
  if (found) break;

  // Try exact match by label
  const exactQuery = `SELECT ${obj.fields} FROM ${obj.name} WHERE MasterLabel = '${agentName}' OR DeveloperName = '${devName}' LIMIT 1`;
  const exactResult = runQuery(exactQuery, true);

  if (exactResult?.status === 0 && exactResult.result?.records?.length > 0) {
    const record = exactResult.result.records[0];
    found = true;

    console.log(`✅ Found agent in ${obj.name}!\n`);
    console.log('┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ Agent Details                                                        │');
    console.log('├──────────────────────┬──────────────────────────────────────────────┤');
    console.log(`│ Object Type          │ ${obj.name.padEnd(44)} │`);
    console.log(`│ Agent ID             │ ${record.Id.padEnd(44)} │`);
    console.log(`│ Developer Name       │ ${(record.DeveloperName || '').padEnd(44)} │`);
    console.log(`│ Label                │ ${(record.MasterLabel || '').padEnd(44)} │`);
    console.log('└──────────────────────┴──────────────────────────────────────────────┘');

    console.log('\n📋 Add this to your .env.local file:\n');
    console.log(`VITE_AGENTFORCE_AGENT_ID=${record.Id}`);
    console.log('');
    break;
  }
}

// If not found, list all available agents from each object
if (!found) {
  console.log('⚠️  Could not find exact match for "' + agentName + '"');
  console.log('\n📋 Searching all agent-related objects...\n');

  for (const obj of agentObjects) {
    const listQuery = `SELECT ${obj.fields} FROM ${obj.name} ORDER BY LastModifiedDate DESC LIMIT 10`;
    console.log(`🔍 Querying ${obj.name}...`);

    const result = runQuery(listQuery, false);

    if (result?.status === 0 && result.result?.records?.length > 0) {
      printTable(`${obj.name} Records`, result.result.records);
      console.log(`\n💡 If your agent is here, use the ID for VITE_AGENTFORCE_AGENT_ID\n`);
    } else if (result?.status === 0) {
      console.log(`   (no records found)`);
    }
  }

  // Also try to describe the objects to see what's available
  console.log('\n\n📌 Alternative: Check Agent Studio URL');
  console.log('═══════════════════════════════════════');
  console.log('1. Open your Agent in Agent Studio');
  console.log('2. Look at the URL - it may contain the agent ID');
  console.log('3. Or use Setup → Agents → find your agent → copy the ID from the URL\n');

  console.log('📌 Manual Query Options:');
  console.log('═══════════════════════════════════════');
  console.log('Run these queries in Developer Console or Workbench:\n');
  console.log('  SELECT Id, Name FROM SetupEntityAccess WHERE SetupEntityType = \'ApexClass\'');
  console.log('  SELECT Id, DeveloperName FROM GenAiFunction');
  console.log('  SELECT Id, Name FROM AIApplication\n');
}
