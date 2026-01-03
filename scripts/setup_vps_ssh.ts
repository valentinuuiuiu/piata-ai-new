
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import os from 'os';

dotenv.config();

const VM_ID = 1236581;
const KEY_NAME = `jules-agent-key-${Date.now()}`;
const SSH_KEY_PATH = path.join(os.homedir(), '.ssh', 'id_rsa_hostinger');

async function main() {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) {
    console.error("HOSTINGER_API_TOKEN is not set in .env");
    process.exit(1);
  }

  // 1. Generate SSH Key if not exists
  if (!fs.existsSync(SSH_KEY_PATH)) {
    console.log("Generating SSH key pair...");
    // Ensure .ssh dir exists
    const sshDir = path.dirname(SSH_KEY_PATH);
    if (!fs.existsSync(sshDir)) fs.mkdirSync(sshDir, { recursive: true });

    execSync(`ssh-keygen -t rsa -b 4096 -f ${SSH_KEY_PATH} -N "" -C "jules@piata-ai"`);
    console.log("SSH Key generated.");
  } else {
    console.log("SSH Key already exists.");
  }

  const publicKey = fs.readFileSync(`${SSH_KEY_PATH}.pub`, 'utf8').trim();

  // 2. Connect to MCP
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["hostinger-api-mcp"],
    env: { ...process.env, API_TOKEN: token, PATH: process.env.PATH }
  });

  const client = new Client({ name: "ssh-setup", version: "1.0.0" }, { capabilities: {} });

  try {
    await client.connect(transport);
    console.log("Connected to MCP.");

    // 3. Get VM Details (IP)
    console.log(`Fetching details for VM ${VM_ID}...`);
    const vmDetailsResult = await client.callTool({
        name: "VPS_getVirtualMachineDetailsV1",
        arguments: { virtualMachineId: VM_ID }
    });

    const vmData = JSON.parse(vmDetailsResult.content[0].text);
    const vm = vmData.data || vmData;

    // console.log("VM Details:", JSON.stringify(vm, null, 2));
    const ip = vm.ip || vm.ip_address || (vm.network && vm.network.ip) || (vm.interfaces && vm.interfaces[0] && vm.interfaces[0].ip_addresses && vm.interfaces[0].ip_addresses[0]);

    if (!ip) {
        console.error("Could not find IP address in VM details. Dumping details:");
        console.log(JSON.stringify(vm, null, 2));
        // Don't exit, maybe we can still upload key, but we can't SSH without IP.
    } else {
        console.log(`VM IP Address: ${ip}`);
    }

    // 4. Upload Public Key
    console.log(`Uploading public key '${KEY_NAME}'...`);
    const createKeyResult = await client.callTool({
        name: "VPS_createPublicKeyV1",
        arguments: {
            name: KEY_NAME,
            key: publicKey
        }
    });

    const keyData = JSON.parse(createKeyResult.content[0].text);
    const keyId = (keyData.data && keyData.data.id) || keyData.id;

    if (!keyId) {
        console.error("Failed to get Key ID from response:", createKeyResult.content[0].text);
        return;
    }
    console.log(`Key uploaded with ID: ${keyId}`);

    // 5. Attach Key to VM
    console.log(`Attaching key ${keyId} to VM ${VM_ID}...`);
    await client.callTool({
        name: "VPS_attachPublicKeyV1",
        arguments: {
            virtualMachineId: VM_ID,
            ids: [keyId] // The API expects an array of IDs? The tool def said 'ids'
        }
    });
    console.log("Key attached successfully.");

    console.log(`\nREADY TO CONNECT:`);
    console.log(`ssh -i ${SSH_KEY_PATH} root@${ip}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

main();
