# Connected App Setup for Agentforce

## Getting Your Connected App Credentials

### Step 1: Create a Connected App (if not already done)

1. Go to **Setup** → **App Manager** → **New Connected App**
2. Fill in the basic info:
   - **Connected App Name**: `Project Advisor API`
   - **API Name**: `Project_Advisor_API`
   - **Contact Email**: your email

3. Enable OAuth Settings:
   - ✅ **Enable OAuth Settings**
   - **Callback URL**: `https://localhost/callback` (or your actual callback)
   - **Selected OAuth Scopes**:
     - `Access the identity URL service (id, profile, email, address, phone)`
     - `Manage user data via APIs (api)`
     - `Perform requests at any time (refresh_token, offline_access)`
     - `Access Einstein GPT services (einstein_gpt_api)`
     - `Manage Agents (agent_api)`

4. Click **Save** and wait ~10 minutes for activation

### Step 2: Get the Consumer Key (Client ID)

1. Go to **Setup** → **App Manager**
2. Find your Connected App → Click the dropdown arrow → **View**
3. Under **API (Enable OAuth Settings)**:
   - **Consumer Key** = `VITE_AGENTFORCE_CLIENT_ID`

### Step 3: Get the Consumer Secret (Client Secret)

1. On the same Connected App page, click **Manage Consumer Details**
2. You'll be prompted to verify your identity (email code or authenticator)
3. After verification:
   - **Consumer Secret** = `VITE_AGENTFORCE_CLIENT_SECRET`

### Step 4: Configure OAuth Policies

1. Go to **Setup** → **App Manager** → Find your app → **Manage**
2. Under **OAuth Policies**:
   - **Permitted Users**: `All users may self-authorize`
   - **IP Relaxation**: `Relax IP restrictions`

### Step 5: Add to .env.local

```bash
# Agentforce Configuration
VITE_AGENTFORCE_AGENT_ID=<from get-agent-id.js script>
VITE_AGENTFORCE_CLIENT_ID=<Consumer Key>
VITE_AGENTFORCE_CLIENT_SECRET=<Consumer Secret>
VITE_AGENTFORCE_INSTANCE_URL=https://me1770077769573.lightning.force.com
VITE_USE_MOCK_DATA=false
```

## Quick SF CLI Commands

```bash
# List all Connected Apps
sf data query --query "SELECT Id, Name, Description FROM ConnectedApplication"

# Get OAuth settings for a specific app (by Id)
sf data query --query "SELECT Id, Name, OptionsAllowAdminApprovedUsersOnly FROM ConnectedApplication WHERE Name = 'Project Advisor API'"
```

## Troubleshooting

### "Invalid client credentials"
- Wait 10 minutes after creating the Connected App
- Verify the Consumer Key and Secret are copied correctly (no extra spaces)
- Check that OAuth scopes include `agent_api`

### "User not authorized"
- Go to App Manager → Your App → Manage → Pre-Authorized Users
- Add the user that will be making API calls

### "Invalid grant"
- Ensure IP restrictions are relaxed or your IP is whitelisted
- Check the callback URL matches what's configured
