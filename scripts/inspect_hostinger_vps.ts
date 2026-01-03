
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) {
    console.error("HOSTINGER_API_TOKEN is not set in .env");
    process.exit(1);
  }

  console.log("Starting Hostinger MCP inspection...");

  // Spawn the hostinger-api-mcp process
  // The bin name is 'hostinger-api-mcp' but since we installed it locally, we should find it in node_modules/.bin
  // Or we can just use `npx`

  // We need to pass the API_TOKEN as an environment variable to the spawned process
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["hostinger-api-mcp"],
    env: {
      ...process.env,
      API_TOKEN: token,
      PATH: process.env.PATH // Ensure npx can find node
    }
  });

  const client = new Client({
    name: "hostinger-inspector",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("Connected to Hostinger MCP.");

    // List tools to verify
    const { tools } = await client.listTools();
    console.log(`Found ${tools.length} tools.`);

    // 1. Get Virtual Machines
    console.log("\nFetching Virtual Machines...");
    const vms = await client.callTool({
      name: "VPS_getVirtualMachinesV1",
      arguments: {}
    });

    const vmList = vms.content[0].text ? JSON.parse(vms.content[0].text) : vms.content;
    // The structure might be inside a 'data' property depending on the API response structure
    // Let's print it to inspect
    // console.log("VM List Response:", JSON.stringify(vmList, null, 2));

    let machines = [];
    if (vmList.data) {
        machines = vmList.data;
    } else if (Array.isArray(vmList)) {
        machines = vmList;
    }

    if (machines.length === 0) {
      console.log("No virtual machines found.");
      return;
    }

    console.log(`Found ${machines.length} VMs.`);

    for (const vm of machines) {
      console.log(`\n--- Inspecting VM: ${vm.id} (${vm.ip || 'No IP'}) ---`);

      // Get Docker Projects
      console.log(`Fetching Docker projects for VM ${vm.id}...`);
      try {
        const projectsResult = await client.callTool({
            name: "VPS_getProjectListV1",
            arguments: { virtualMachineId: vm.id }
        });

        const projectsData = JSON.parse(projectsResult.content[0].text);
        // console.log("Projects Response:", JSON.stringify(projectsData, null, 2));

        const projects = projectsData.data || projectsData;

        if (!projects || projects.length === 0) {
            console.log("No Docker projects found on this VM.");
            continue;
        }

        console.log(`Found ${projects.length} projects.`);

        for (const project of projects) {
            console.log(`\n  Project: ${project.name}`);

            // Get Containers for this project
            try {
                const containersResult = await client.callTool({
                    name: "VPS_getProjectContainersV1",
                    arguments: {
                        virtualMachineId: vm.id,
                        projectName: project.name
                    }
                });

                const containersData = JSON.parse(containersResult.content[0].text);
                const containers = containersData.data || containersData;

                console.log(`  Containers (${containers.length}):`);
                containers.forEach(c => {
                    console.log(`    - ${c.name} (${c.state || c.status})`);
                });

            } catch (err) {
                console.error(`  Error fetching containers for project ${project.name}:`, err.message);
            }
        }

      } catch (err) {
          console.error(`Error fetching projects for VM ${vm.id}:`, err.message);
          // It might fail if the VM doesn't support Docker or the endpoint is not available for this plan
      }
    }

  } catch (error) {
    console.error("Error during inspection:", error);
  } finally {
    // transport.close(); // Stdio transport doesn't have close method exposed directly on type sometimes, but let's try
    process.exit(0);
  }
}

main();
