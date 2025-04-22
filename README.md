# Encar – Official TypeScript Client for Encar API

[![NPM version](https://badge.fury.io/js/encar.svg)](https://www.npmjs.com/package/encar)
[![API Docs](https://img.shields.io/badge/API%20Docs-Carapis%20Encar%20API-blue)](https://carapis.com/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Carapis Catalog](https://img.shields.io/badge/Live%20Catalog-Carapis.com-green)](https://carapis.com/catalog)

**Encar** is the official TypeScript client for the **Carapis Encar API**, providing seamless programmatic access to real-time Korean used car data from Encar.com. With the `encar` library, you can easily query, filter, and analyze vehicle listings, manufacturers, models, and more using TypeScript or JavaScript – all powered by the robust **Encar API** provided by Carapis.com.

This client includes type definitions for better developer experience and safety.

Explore a live catalog powered by this **Encar API**: [Carapis Catalog](https://carapis.com/catalog)

## Features

- Easy access to real-time Encar.com vehicle data via **Carapis Encar API**
- Type-safe interaction with the **Encar API**
- List, filter, and retrieve detailed car listings
- Fetch manufacturer, model, and vehicle details programmatically
- Supports advanced search queries for the **Encar API** using `axios`
- Free tier available for testing the **Encar API** (up to 1,000 vehicles)
- Asynchronous operations using `async/await`

## Installation

Install the `encar` library using npm or yarn. Dependencies (`axios`, `js-yaml`) and necessary types (`@types/js-yaml`) are handled automatically.

```bash
npm install encar
# or
yarn add encar
```

## Configuration

1.  **API Key**: The client requires a **Carapis Encar API** key for full access. Get yours at [Carapis.com Pricing](https://carapis.com/pricing). Retrieve this key from a secure location, such as environment variables.

    *Without an API key, **Encar API** access is limited to the latest 1,000 vehicles (Free Tier).*

## How to use Encar API (TypeScript Client)

Initialize the client and make **Encar API** calls using `async/await`.

```typescript
import { CarapisClient, CarapisClientError } from 'encar';

// Assume API_KEY is available in the environment or defined elsewhere
const API_KEY = process.env.CARAPIS_API_KEY || 'YOUR_API_KEY_HERE'; // Example: Replace or set environment variable

// Check if API_KEY is set - crucial for authenticated access
if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn("Warning: CARAPIS_API_KEY is not set. Using limited free tier access.");
    // Consider exiting or handling this case if full access is mandatory
    // process.exit(1);
}

// Main async function to run examples
async function runEncarApiExamples() {
    let client: CarapisClient;

    try {
        // Initialize Encar API client
        // Pass the API key (or undefined/null for free tier)
        client = new CarapisClient(API_KEY);
        console.log("Carapis Encar API Client (TS) initialized successfully.");

        // --- Proceed with Encar API calls below ---

        // Example: List vehicles
        console.log("\n--- Querying Encar API for Vehicles ---");
        const vehicles = await client.listVehicles({ limit: 3, min_year: 2022 });
        console.log("Vehicles Found via Encar API:", vehicles.results ? `${vehicles.results.length} results` : 'No results');
        // Add more calls here...

    } catch (error) {
        if (error instanceof CarapisClientError) {
            console.error(`Encar API Client Error (${error.status || 'N/A'}): ${error.message}`,
                          error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '');
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}

// Run the examples
runEncarApiExamples();
```

---

## Encar API TypeScript Usage Examples

Below are examples for querying the **Encar API** using this TypeScript client.

*(Note: All client methods are `async` and return Promises. Use `await` inside an `async` function or `.then()` chaining.)*

### List Vehicles via Encar API

Retrieve a list of vehicles with filtering.

```typescript
async function listSomeVehicles(client: CarapisClient) {
    try {
        console.log("\n--- Querying Encar API for Vehicles ---");
        // Fetch vehicle data via Encar API
        const response = await client.listVehicles({
            limit: 5,
            min_year: 2021,
            fuel_type: 'gasoline',
            max_mileage: 50000,
            ordering: '-created_at'
        });
        console.log("Vehicles Found via Encar API:");
        if (response && response.results) {
            // Assuming results is an array of vehicles
            (response.results as any[]).forEach(v => {
                 console.log(`- ID: ${v.vehicle_id}, Model: ${v.model_name || 'N/A'}, Price: ${v.price}`);
            });
        } else {
            console.log("No vehicles found.");
        }
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error listing vehicles:", e);
    }
}
// Assuming 'client' is an initialized CarapisClient instance
// listSomeVehicles(client);
```

### Get Vehicle Details via Encar API

Retrieve details for a specific vehicle.

```typescript
async function getVehicle(client: CarapisClient, vehicleId: number) {
    try {
        console.log("\n--- Getting Vehicle Details from Encar API (ID: ${vehicleId}) ---");
        // Fetch specific vehicle details via Encar API
        // The actual method might be getVehicle or getVehicles depending on generation
        const vehicleDetails = await client.getVehicles({ vehicle_id: vehicleId });
        console.log("Vehicle Details Received from Encar API:");
        console.log(JSON.stringify(vehicleDetails, null, 2));
    } catch (e) {
         if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
         else console.error(`Error getting vehicle ${vehicleId}:`, e);
    }
}
// getVehicle(client, 12345678); // Replace with a valid ID
```

### List Manufacturers via Encar API

Retrieve a list of vehicle manufacturers.

```typescript
async function listManufacturers(client: CarapisClient) {
    try {
        console.log("\n--- Listing Manufacturers from Encar API ---");
        // Fetch manufacturers via Encar API
        const response = await client.listCatalogManufacturers({ country: 'KR', limit: 10 });
        console.log("Manufacturers Found via Encar API:");
        if (response && response.results) {
            (response.results as any[]).forEach(mfr => {
                 console.log(`- Code: ${mfr.code}, Name: ${mfr.name}`);
            });
        } else {
            console.log("No manufacturers found.");
        }
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error listing manufacturers:", e);
    }
}
// listManufacturers(client);
```

### Get Manufacturer Details via Encar API

Retrieve details for a specific manufacturer by its code.

```typescript
async function getManufacturer(client: CarapisClient, manufacturerCode: string) {
    try {
        console.log("\n--- Getting Manufacturer Details from Encar API (Code: ${manufacturerCode}) ---");
        const manufacturerInfo = await client.getCatalogManufacturers({ code: manufacturerCode });
        console.log("Manufacturer Details Received from Encar API:");
        console.log(JSON.stringify(manufacturerInfo, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error(`Error getting manufacturer ${manufacturerCode}:`, e);
    }
}
// getManufacturer(client, '101'); // Example: Hyundai
```

### Get Manufacturer Stats via Encar API

Retrieve overall statistics about manufacturers.

```typescript
async function getManufacturerStats(client: CarapisClient) {
    try {
        console.log("\n--- Getting Manufacturer Stats from Encar API ---");
        const mfrStats = await client.getCatalogManufacturersStats({}); // No args needed
        console.log("Manufacturer Statistics Received from Encar API:");
        console.log(JSON.stringify(mfrStats, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error getting manufacturer stats:", e);
    }
}
// getManufacturerStats(client);
```

### List Model Groups via Encar API

Retrieve a list of model groups, optionally filtered.

```typescript
async function listModelGroups(client: CarapisClient, manufacturerCode: string) {
    try {
        console.log("\n--- Listing Model Groups from Encar API (Manufacturer: ${manufacturerCode}) ---");
        const response = await client.listCatalogModelGroups({ manufacturer: manufacturerCode, search: 'Avante', limit: 5 });
        console.log("Model Groups Found via Encar API:");
        if (response && response.results) {
            (response.results as any[]).forEach(mg => {
                 console.log(`- Code: ${mg.code}, Name: ${mg.name}`);
            });
        } else {
            console.log("No model groups found.");
        }
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error listing model groups:", e);
    }
}
// listModelGroups(client, '101'); // Example: Hyundai
```

### Get Model Group Details via Encar API

Retrieve details for a specific model group by its code.

```typescript
async function getModelGroup(client: CarapisClient, modelGroupCode: string) {
    try {
        console.log("\n--- Getting Model Group Details from Encar API (Code: ${modelGroupCode}) ---");
        const modelGroupInfo = await client.getCatalogModelGroups({ code: modelGroupCode });
        console.log("Model Group Details Received from Encar API:");
        console.log(JSON.stringify(modelGroupInfo, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error(`Error getting model group ${modelGroupCode}:`, e);
    }
}
// getModelGroup(client, '1101'); // Example: Avante
```

### List Models via Encar API

Retrieve a list of specific vehicle models, optionally filtered.

```typescript
async function listModels(client: CarapisClient, modelGroupCode: string) {
    try {
        console.log("\n--- Listing Models from Encar API (Model Group: ${modelGroupCode}) ---");
        const response = await client.listCatalogModels({ model_group: modelGroupCode, search: 'CN7', limit: 5 });
        console.log("Models Found via Encar API:");
        if (response && response.results) {
            (response.results as any[]).forEach(mdl => {
                 console.log(`- Code: ${mdl.code}, Name: ${mdl.name}`);
            });
        } else {
            console.log("No models found.");
        }
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error listing models:", e);
    }
}
// listModels(client, '1101'); // Example: Avante
```

### Get Model Details via Encar API

Retrieve details for a specific vehicle model by its code.

```typescript
async function getModel(client: CarapisClient, modelCode: string) {
    try {
        console.log("\n--- Getting Model Details from Encar API (Code: ${modelCode}) ---");
        const modelInfo = await client.getCatalogModels({ code: modelCode });
        console.log("Model Details Received from Encar API:");
        console.log(JSON.stringify(modelInfo, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error(`Error getting model ${modelCode}:`, e);
    }
}
// getModel(client, '21101'); // Example: Specific Avante model
```

### List Dealers via Encar API

Retrieve a list of dealers.

```typescript
async function listDealers(client: CarapisClient) {
    try {
        console.log("\n--- Listing Dealers from Encar API ---");
        const response = await client.listBusinessDealers({ limit: 5, ordering: 'name' });
        console.log("Dealers Found via Encar API:");
        if (response && response.results) {
            (response.results as any[]).forEach(dealer => {
                 console.log(`- ID: ${dealer.user_id}, Name: ${dealer.name}`);
            });
        } else {
            console.log("No dealers found.");
        }
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error listing dealers:", e);
    }
}
// listDealers(client);
```

### Get Dealer Details via Encar API

Retrieve details for a specific dealer by their user ID.

```typescript
async function getDealer(client: CarapisClient, userId: string) {
    try {
        console.log("\n--- Getting Dealer Details from Encar API (ID: ${userId}) ---");
        const dealerInfo = await client.getBusinessDealers({ user_id: userId });
        console.log("Dealer Details Received from Encar API:");
        console.log(JSON.stringify(dealerInfo, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error(`Error getting dealer ${userId}:`, e);
    }
}
// getDealer(client, 'some_dealer_id'); // Replace with a valid dealer ID
```

### List Diagnosis Centers via Encar API

Retrieve a list of diagnosis centers.

```typescript
async function listDiagnosisCenters(client: CarapisClient) {
    try {
        console.log("\n--- Listing Diagnosis Centers from Encar API ---");
        const response = await client.listBusinessDiagnosisCenters({ limit: 5 });
        console.log("Diagnosis Centers Found via Encar API:");
        if (response && response.results) {
            (response.results as any[]).forEach(center => {
                 console.log(`- Code: ${center.code}, Name: ${center.name}`);
            });
        } else {
            console.log("No diagnosis centers found.");
        }
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error listing diagnosis centers:", e);
    }
}
// listDiagnosisCenters(client);
```

### Get Diagnosis Center Details via Encar API

Retrieve details for a specific diagnosis center by its code.

```typescript
async function getDiagnosisCenter(client: CarapisClient, centerCode: string) {
    try {
        console.log("\n--- Getting Diagnosis Center Details from Encar API (Code: ${centerCode}) ---");
        const centerInfo = await client.getBusinessDiagnosisCenters({ code: centerCode });
        console.log("Diagnosis Center Details Received from Encar API:");
        console.log(JSON.stringify(centerInfo, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error(`Error getting diagnosis center ${centerCode}:`, e);
    }
}
// getDiagnosisCenter(client, '123'); // Replace with a valid center code
```

### Get Vehicle Enums via Encar API

Retrieve available enumeration values (like body types, colors, etc.).

```typescript
async function getVehicleEnums(client: CarapisClient) {
    try {
        console.log("\n--- Getting Vehicle Enums from Encar API ---");
        const enums = await client.getVehiclesEnums({}); // No args needed
        console.log("Vehicle Enums Received from Encar API:");
        console.log(JSON.stringify(enums, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error getting vehicle enums:", e);
    }
}
// getVehicleEnums(client);
```

### Get Vehicle Stats via Encar API

Retrieve overall statistics about the vehicle listings.

```typescript
async function getVehicleStats(client: CarapisClient) {
    try {
        console.log("\n--- Getting Vehicle Stats from Encar API ---");
        const stats = await client.getVehiclesStats({}); // No args needed
        console.log("Vehicle Statistics Received from Encar API:");
        console.log(JSON.stringify(stats, null, 2));
    } catch (e) {
        if (e instanceof CarapisClientError) console.error("Encar API Error:", e.message, e.details);
        else console.error("Error getting vehicle stats:", e);
    }
}
// getVehicleStats(client);
```

---

## Direct Encar API Access & Documentation

Interact with the **Encar API** directly using `curl` or other HTTP clients.

**Full Encar API Documentation:** [https://carapis.com/docs](https://carapis.com/docs)

**Example `curl` Requests for Encar API:**

*   **With API Key (Full Encar API Access):**
    ```bash
    # Query Encar API for vehicles
    curl -X 'GET' \
      'https://carapis.com/apix/encar/v2/vehicles/?limit=5&min_year=2021' \
      -H 'accept: application/json' \
      -H 'Authorization: ApiKey YOUR_API_KEY_UUID'
    ```

*   **Without API Key (Free Tier Encar API Access - 1,000 Record Limit):**
    ```bash
    # Limited query to Encar API
    curl -X 'GET' \
      'https://carapis.com/apix/encar/v2/vehicles/?limit=5' \
      -H 'accept: application/json'
    ```

See [Carapis Pricing Plans](https://carapis.com/pricing) for **Encar API** access tiers.

## See Also

- [Carapis.com](https://carapis.com) - The provider of this Encar API.
- [Encar.com](https://encar.com) - The primary source of the vehicle data.

## Support & Contact

- Website: [https://carapis.com](https://carapis.com)
- Telegram: [t.me/markinmatrix](https://t.me/markinmatrix)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
