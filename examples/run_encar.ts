import dotenv from 'dotenv';
import fs from 'fs'; // Import fs for file system operations
import path from 'path';

import { CarapisClient, CarapisClientError } from '../src/index'; // Use local src for example

// --- Setup Paths and Environment ---
const SCRIPT_DIR = __dirname;
const DOWNLOADS_DIR = path.join(SCRIPT_DIR, 'downloads');
const PROJECT_ROOT = path.join(SCRIPT_DIR, '..', '..'); // Adjust if necessary
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const API_KEY = process.env.CARAPIS_API_KEY;

// Type for args, adjust as needed or import from a types file
type ApiArgs = Record<string, any>;

// --- Helper function to save results ---
function saveResult(methodName: string, args: ApiArgs, result: any) {
    if (!result || typeof result !== 'object') {
        console.debug(`Skipping save for ${methodName}: No valid object result.`);
        return;
    }

    try {
        // Create filename (e.g., listVehicles_limit_2.json or getVehicle_12345.json)
        const keyArg = Object.keys(args).find(k => ['vehicle_id', 'code', 'user_id'].includes(k));
        const argSuffix = keyArg ? `_${args[keyArg]}` : '';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${methodName}${argSuffix}_${timestamp}.json`;
        const filepath = path.join(DOWNLOADS_DIR, filename);

        console.info(`Saving result of '${methodName}' to: ${filepath}`);
        fs.writeFileSync(filepath, JSON.stringify(result, null, 2), { encoding: 'utf-8' });
    } catch (e: any) {
        console.error(`Failed to save result for ${methodName} to file: ${e.message}`);
    }
}

// --- Ensure Downloads Directory Exists ---
function setupDownloadsDir() {
    try {
        if (fs.existsSync(DOWNLOADS_DIR)) {
            console.info(`Cleaning up downloads directory: ${DOWNLOADS_DIR}`);
            fs.rmSync(DOWNLOADS_DIR, { recursive: true, force: true });
            console.info("Removed existing downloads directory.");
        }
        fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
        console.info(`Recreated downloads directory: ${DOWNLOADS_DIR}`);
    } catch (e: any) {
        console.error(`Could not clean/create downloads directory ${DOWNLOADS_DIR}: ${e.message}`);
        process.exit(1); // Exit if cannot create downloads dir
    }
}


// --- Main execution async function ---
async function main() {
    if (!API_KEY) {
        console.error("Error: CARAPIS_API_KEY environment variable not set.");
        console.log("Please create a '.env' file in the package root with your API key.");
        process.exit(1);
    }

    setupDownloadsDir(); // Setup downloads directory

    console.log("Initializing Carapis TS Client...");
    let client: CarapisClient;
    try {
        client = new CarapisClient(API_KEY);
        console.log("TS Client initialized successfully.");
    } catch (initError: any) {
        console.error("Failed to initialize TS client:", initError.message);
        process.exit(1);
    }

    console.log("\n=== Starting Encar API Run (TypeScript) ===\n");

    let firstDealerId: string | null = null;
    let firstCenterCode: string | null = null;
    let firstMfrCode: string | null = null;
    let firstModelGroupCode: string | null = null;
    let firstModelCode: string | null = null;
    let firstVehicleId: number | null = null;
    let result: any; // Variable to hold results

    // --- Business Endpoints ---
    console.log("\n*** Running Business Endpoints ***");
    try {
        const args = { limit: 2, ordering: 'name' as const };
        console.log(`\n--- Calling: listBusinessDealers with args: ${JSON.stringify(args)} ---`);
        result = await client.listBusinessDealers(args);
        console.log(`SUCCESS: listBusinessDealers -> Got ${result?.results?.length ?? 0} results.`);
        saveResult('listBusinessDealers', args, result);
        if (result?.results?.length > 0) {
            firstDealerId = result.results[0]?.user_id;
            if (firstDealerId) console.log(` --> Fetched dealer ID: ${firstDealerId}`);
        } else {
            console.log(" --> Could not get dealer ID from list.");
        }
    } catch (error: any) {
        console.error(`FAILED: listBusinessDealers`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    if (firstDealerId) {
        try {
            const args = { user_id: firstDealerId };
            console.log(`\n--- Calling: getBusinessDealers with args: ${JSON.stringify(args)} ---`);
            result = await client.getBusinessDealers(args);
            console.log(`SUCCESS: getBusinessDealers -> Result keys: ${Object.keys(result).join(', ')}`);
            saveResult('getBusinessDealers', args, result);
        } catch (error: any) {
            console.error(`FAILED: getBusinessDealers`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    }

    try {
        const args = { limit: 2 };
        console.log(`\n--- Calling: listBusinessDiagnosisCenters with args: ${JSON.stringify(args)} ---`);
        result = await client.listBusinessDiagnosisCenters(args);
        console.log(`SUCCESS: listBusinessDiagnosisCenters -> Got ${result?.results?.length ?? 0} results.`);
        saveResult('listBusinessDiagnosisCenters', args, result);
        if (result?.results?.length > 0) {
            firstCenterCode = result.results[0]?.code;
            if (firstCenterCode) console.log(` --> Fetched center code: ${firstCenterCode}`);
        } else {
            console.log(" --> Could not get center code from list.");
        }
    } catch (error: any) {
        console.error(`FAILED: listBusinessDiagnosisCenters`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    if (firstCenterCode) {
        try {
            const args = { code: firstCenterCode };
            console.log(`\n--- Calling: getBusinessDiagnosisCenters with args: ${JSON.stringify(args)} ---`);
            result = await client.getBusinessDiagnosisCenters(args);
            console.log(`SUCCESS: getBusinessDiagnosisCenters -> Result keys: ${Object.keys(result).join(', ')}`);
            saveResult('getBusinessDiagnosisCenters', args, result);
        } catch (error: any) {
            console.error(`FAILED: getBusinessDiagnosisCenters`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    }


    // --- Catalog Endpoints ---
    console.log("\n*** Running Catalog Endpoints ***");
    try {
        const args = { limit: 2, country: 'KR' as const };
        console.log(`\n--- Calling: listCatalogManufacturers with args: ${JSON.stringify(args)} ---`);
        result = await client.listCatalogManufacturers(args);
        console.log(`SUCCESS: listCatalogManufacturers -> Got ${result?.results?.length ?? 0} results.`);
        saveResult('listCatalogManufacturers', args, result);
        if (result?.results?.length > 0) {
            firstMfrCode = result.results[0]?.code;
            if (firstMfrCode) console.log(` --> Fetched manufacturer code: ${firstMfrCode}`);
        } else {
            console.log(" --> Could not get manufacturer code from list.");
        }
    } catch (error: any) {
        console.error(`FAILED: listCatalogManufacturers`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    if (firstMfrCode) {
        try {
            const args = { code: firstMfrCode };
            console.log(`\n--- Calling: getCatalogManufacturers with args: ${JSON.stringify(args)} ---`);
            result = await client.getCatalogManufacturers(args);
            console.log(`SUCCESS: getCatalogManufacturers -> Result keys: ${Object.keys(result).join(', ')}`);
            saveResult('getCatalogManufacturers', args, result);
        } catch (error: any) {
            console.error(`FAILED: getCatalogManufacturers`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    }

    try {
        const args = {}; // No args for stats
        console.log(`\n--- Calling: getCatalogManufacturersStats ---`);
        result = await client.getCatalogManufacturersStats(args);
        console.log(`SUCCESS: getCatalogManufacturersStats -> Result keys: ${Object.keys(result).join(', ')}`);
        saveResult('getCatalogManufacturersStats', args, result);
    } catch (error: any) {
        console.error(`FAILED: getCatalogManufacturersStats`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details, null, 2)}` : ''); // Nicer formatting for details
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    if (firstMfrCode) {
        try {
            const args = { manufacturer: firstMfrCode, limit: 2, search: 'Avante' };
            console.log(`\n--- Calling: listCatalogModelGroups with args: ${JSON.stringify(args)} ---`);
            result = await client.listCatalogModelGroups(args);
            console.log(`SUCCESS: listCatalogModelGroups -> Got ${result?.results?.length ?? 0} results.`);
            saveResult('listCatalogModelGroups', args, result);
            if (result?.results?.length > 0) {
                firstModelGroupCode = result.results[0]?.code;
                if (firstModelGroupCode) console.log(` --> Fetched model group code: ${firstModelGroupCode}`);
            } else {
                console.log(" --> Could not get model group code from list.");
            }
        } catch (error: any) {
            console.error(`FAILED: listCatalogModelGroups`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    } else {
        console.log("Skipping model group calls as manufacturer code was not fetched.");
    }

    if (firstModelGroupCode) {
        try {
            const args = { code: firstModelGroupCode };
            console.log(`\n--- Calling: getCatalogModelGroups with args: ${JSON.stringify(args)} ---`);
            result = await client.getCatalogModelGroups(args);
            console.log(`SUCCESS: getCatalogModelGroups -> Result keys: ${Object.keys(result).join(', ')}`);
            saveResult('getCatalogModelGroups', args, result);
        } catch (error: any) {
            console.error(`FAILED: getCatalogModelGroups`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }

        try {
            const args = { model_group: firstModelGroupCode, limit: 2, search: 'CN7' };
            console.log(`\n--- Calling: listCatalogModels with args: ${JSON.stringify(args)} ---`);
            result = await client.listCatalogModels(args);
            console.log(`SUCCESS: listCatalogModels -> Got ${result?.results?.length ?? 0} results.`);
            saveResult('listCatalogModels', args, result);
            if (result?.results?.length > 0) {
                firstModelCode = result.results[0]?.code;
                if (firstModelCode) console.log(` --> Fetched model code: ${firstModelCode}`);
            } else {
                console.log(" --> Could not get model code from list.");
            }
        } catch (error: any) {
            console.error(`FAILED: listCatalogModels`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    } else {
        console.log("Skipping model list/get calls as model group code was not fetched.");
    }

    if (firstModelCode) {
        try {
            const args = { code: firstModelCode };
            console.log(`\n--- Calling: getCatalogModels with args: ${JSON.stringify(args)} ---`);
            result = await client.getCatalogModels(args);
            console.log(`SUCCESS: getCatalogModels -> Result keys: ${Object.keys(result).join(', ')}`);
            saveResult('getCatalogModels', args, result);
        } catch (error: any) {
            console.error(`FAILED: getCatalogModels`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    }


    // --- Vehicle Endpoints ---
    console.log("\n*** Running Vehicle Endpoints ***");
    try {
        const args = { limit: 1, ordering: '-created_at' as const };
        console.log(`\n--- Calling: listVehicles with args: ${JSON.stringify(args)} ---`);
        result = await client.listVehicles(args);
        console.log(`SUCCESS: listVehicles -> Got ${result?.results?.length ?? 0} results.`);
        saveResult('listVehicles', args, result);
        if (result?.results?.length > 0) {
            firstVehicleId = result.results[0]?.vehicle_id;
            if (firstVehicleId) console.log(` --> Fetched vehicle ID: ${firstVehicleId}`);
        } else {
            console.log(" --> Could not get vehicle ID from list.");
        }
    } catch (error: any) {
        console.error(`FAILED: listVehicles`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    if (firstVehicleId) {
        try {
            const args = { vehicle_id: firstVehicleId };
            console.log(`\n--- Calling: getVehicles with args: ${JSON.stringify(args)} ---`);
            result = await client.getVehicles(args);
            console.log(`SUCCESS: getVehicles -> Result keys: ${Object.keys(result).join(', ')}`);
            saveResult('getVehicles', args, result);
        } catch (error: any) {
            console.error(`FAILED: getVehicles`);
            if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
            else console.error(`  -> Unexpected Error: ${error.message}`);
        }
    }

    // Additional list example
    try {
        const args = { limit: 2, min_year: 2022, fuel_type: 'gasoline' as const };
        console.log(`\n--- Calling: listVehicles with args: ${JSON.stringify(args)} ---`);
        result = await client.listVehicles(args);
        console.log(`SUCCESS: listVehicles -> Got ${result?.results?.length ?? 0} results.`);
        saveResult('listVehicles', args, result);
    } catch (error: any) {
        console.error(`FAILED: listVehicles (additional)`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    // Enums and Stats
    try {
        const args = {}; // No args
        console.log(`\n--- Calling: getVehiclesEnums ---`);
        result = await client.getVehiclesEnums(args);
        console.log(`SUCCESS: getVehiclesEnums -> Result keys: ${Object.keys(result).join(', ')}`);
        saveResult('getVehiclesEnums', args, result);
    } catch (error: any) {
        console.error(`FAILED: getVehiclesEnums`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }

    try {
        const args = {}; // No args
        console.log(`\n--- Calling: getVehiclesStats ---`);
        result = await client.getVehiclesStats(args);
        console.log(`SUCCESS: getVehiclesStats -> Result keys: ${Object.keys(result).join(', ')}`);
        saveResult('getVehiclesStats', args, result);
    } catch (error: any) {
        console.error(`FAILED: getVehiclesStats`);
        if (error instanceof CarapisClientError) console.error(`  -> API Error (${error.status || 'N/A'}): ${error.message}`, error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        else console.error(`  -> Unexpected Error: ${error.message}`);
    }


    console.log("\n=== Finished Encar API Run (TypeScript) ===\n");
}

// Execute main async function
main().catch(error => {
    console.error("\n--- UNEXPECTED SCRIPT ERROR ---");
    console.error(error);
    process.exit(1);
});
