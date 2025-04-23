# Encar – Official TypeScript Client Parser for Carapis Encar API

[![NPM version](https://badge.fury.io/js/encar.svg)](https://www.npmjs.com/package/encar)
[![API Docs](https://img.shields.io/badge/API%20Docs-Carapis%20Encar%20API-blue)](https://carapis.com/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Carapis Catalog](https://img.shields.io/badge/Live%20Catalog-Carapis.com-green)](https://carapis.com/catalog)

**Encar** is the official TypeScript client parser for the **Carapis Encar API**, providing seamless programmatic access to real-time Korean used car data from Encar.com. With the `encar` library parser, you can easily query, filter, and analyze vehicle listings, manufacturers, models, and more using TypeScript or JavaScript – all powered by the robust **Encar API** provided by Carapis.com.

This client parser includes type definitions for better developer experience and safety.

Explore a live catalog powered by this **Carapis Encar API**: [Carapis Catalog](https://carapis.com/catalog)

## Features

- Easy access and parsing of real-time Encar.com vehicle data via the **Carapis Encar API** client parser.
- Type-safe interaction with the **Encar API** using the parser
- List, filter, and retrieve detailed car listings using the **Carapis Encar API** parser features.
- Fetch manufacturer, model, and vehicle details programmatically (using slugs for catalog items)
- Supports advanced search queries for the **Encar API** using `axios`
- Free tier available for testing the **Encar API** (up to 1,000 vehicles)

## Configuration

1.  **API Key (Optional)**: For full access to the **Carapis Encar API**, an API key is recommended. Get yours at [Carapis.com Pricing](https://carapis.com/pricing).

    *If an API key is **not** provided, the client parser will operate in **Free Tier mode**, limited to accessing the latest 1,000 vehicles.*
    *Retrieve your API key from a secure location, such as environment variables, if you use one.*

## How to use Encar API (TypeScript Client Parser)

Initialize the client parser and make **Encar API** calls using `async/await`.

```typescript
import { CarapisClient, CarapisClientError } from 'encar';

// --- Option 1: Initialize with API Key (Recommended for full access) ---
const API_KEY = process.env.CARAPIS_API_KEY; // Or get from a secure source
const clientWithKey = new CarapisClient(API_KEY);

// --- Option 2: Initialize without API Key (Free Tier - Limited Access) ---
const clientFreeTier = new CarapisClient(); // No API key provided

// --- Proceed with Encar API calls using either client parser ---

// Example API call using the free tier client (needs to be in an async context):
// async function runFreeTier() {
//    const vehicles = await clientFreeTier.listVehicles({ limit: 3 });
//    // Process vehicles.results (limited to latest 1000)
// }
// runFreeTier();
```

---

## Encar API TypeScript Usage Examples (Parser)

Below are examples for querying the **Encar API** using this TypeScript client parser.

*(Note: All client parser methods are `async` and return Promises. Use `await` inside an `async` function or `.then()` chaining.)*

### List Vehicles via Encar API Parser

Retrieve a list of vehicles with filtering. Uses slugs for manufacturer/model group/model.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const vehiclesResponse = await client.listVehicles({
    limit: 5,
    min_year: 2021,
    fuel_type: 'gasoline',
    manufacturer_slug: 'hyundai', // Filter by manufacturer slug
    model_group_slug: 'sonata',   // Filter by model group slug
    max_mileage: 50000,
    ordering: '-created_at'
});
// Process vehiclesResponse.results (array of vehicles)
// vehiclesResponse also contains count, page, pages, limit
```

### Get Vehicle Details via Encar API Parser

Retrieve details for a specific vehicle by its `vehicle_id`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const vehicleId = 38481829; // Replace with a valid ID
const vehicleDetails = await client.getVehicles({ vehicle_id: vehicleId });
// Process vehicleDetails (object with vehicle data)
```

### List Manufacturers via Encar API Parser

Retrieve a list of vehicle manufacturers.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const manufacturersResponse = await client.listCatalogManufacturers({ country: 'KR', limit: 10 });
// Process manufacturersResponse.results (array of manufacturers)
// manufacturersResponse also contains count, page, pages, limit
```

### Get Manufacturer Details via Encar API Parser

Retrieve details for a specific manufacturer by its `slug`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const manufacturerSlug = 'hyundai'; // Example slug
const manufacturerInfo = await client.getCatalogManufacturers({ slug: manufacturerSlug });
// Process manufacturerInfo (object with manufacturer data)
```

### Get Manufacturer Stats via Encar API Parser

Retrieve overall statistics about manufacturers.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const mfrStats = await client.getCatalogManufacturersStats({});
// Process mfrStats (object with statistics)
```

### List Model Groups via Encar API Parser

Retrieve a list of model groups, filtered by manufacturer's `slug`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const manufacturerSlugForGroups = 'hyundai'; // Example slug
const modelGroupsResponse = await client.listCatalogModelGroups({ manufacturer__slug: manufacturerSlugForGroups, search: 'Sonata', limit: 5 });
// Process modelGroupsResponse.results (array of model groups)
// modelGroupsResponse also contains count, page, pages, limit
```

### Get Model Group Details via Encar API Parser

Retrieve details for a specific model group by its `slug`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const modelGroupSlug = 'sonata'; // Example slug
const modelGroupInfo = await client.getCatalogModelGroups({ slug: modelGroupSlug });
// Process modelGroupInfo (object with model group data)
```

### List Models via Encar API Parser

Retrieve a list of specific vehicle models, filtered by model group's `slug`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const modelGroupSlugForModels = 'sonata'; // Example slug
const modelsResponse = await client.listCatalogModels({ model_group__slug: modelGroupSlugForModels, search: 'DN8', limit: 5 });
// Process modelsResponse.results (array of models)
// modelsResponse also contains count, page, pages, limit
```

### Get Model Details via Encar API Parser

Retrieve details for a specific vehicle model by its `slug`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const modelSlug = 'sonata-dn8'; // Example slug
const modelInfo = await client.getCatalogModels({ slug: modelSlug });
// Process modelInfo (object with model data)
```

### List Dealers via Encar API Parser

Retrieve a list of dealers.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const dealersResponse = await client.listBusinessDealers({ limit: 5, ordering: 'name' });
// Process dealersResponse.results (array of dealers)
// dealersResponse also contains count, page, pages, limit
```

### Get Dealer Details via Encar API

Retrieve details for a specific dealer by their `user_id`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const dealerUserId = 'A0123j'; // Replace with a valid dealer ID
const dealerInfo = await client.getBusinessDealers({ user_id: dealerUserId });
// Process dealerInfo (object with dealer data)
```

### List Diagnosis Centers via Encar API

Retrieve a list of diagnosis centers.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const centersResponse = await client.listBusinessDiagnosisCenters({ limit: 5 });
// Process centersResponse.results (array of centers)
// centersResponse also contains count, page, pages, limit
```

### Get Diagnosis Center Details via Encar API

Retrieve details for a specific diagnosis center by its `code`.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const centerCode = 'dA17201'; // Replace with a valid center code
const centerInfo = await client.getBusinessDiagnosisCenters({ code: centerCode });
// Process centerInfo (object with center data)
```

### Get Vehicle Enums via Encar API

Retrieve available enumeration values (like body types, colors, etc.).

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const vehicleEnums = await client.getVehiclesEnums({});
// Process vehicleEnums (object containing arrays of enum values, e.g., vehicleEnums.fuel_types)
```

### Get Vehicle Stats via Encar API

Retrieve overall statistics about the vehicle listings.

```typescript
// Assuming 'client' is an initialized CarapisClient instance
const vehicleStats = await client.getVehiclesStats({});
// Process vehicleStats (object with statistics)
```

---

## Direct Carapis Encar API Access & Documentation

Interact with the **Carapis Encar API** directly using `curl` or other HTTP clients. This API acts as a powerful data source, parsed effectively by the TypeScript client parser.

**Full Carapis Encar API Documentation:** [https://carapis.com/docs](https://carapis.com/docs)

**Example `curl` Requests for Carapis Encar API:**

*   **With API Key (Full Carapis Encar API Access):**
    ```bash
    # Query Carapis Encar API for vehicles
    curl -X 'GET' \
      'https://carapis.com/apix/encar/v2/vehicles/?limit=5&min_year=2021&manufacturer_slug=hyundai' \
      -H 'accept: application/json' \
      -H 'Authorization: ApiKey YOUR_API_KEY_UUID'
    ```

*   **Without API Key (Free Tier Carapis Encar API Access - 1,000 Record Limit):**
    ```bash
    # Limited query to Carapis Encar API
    curl -X 'GET' \
      'https://carapis.com/apix/encar/v2/vehicles/?limit=5' \
      -H 'accept: application/json'
    ```

See [Carapis Pricing Plans](https://carapis.com/pricing) for **Carapis Encar API** access tiers.

## See Also

*   [Carapis.com](https://carapis.com) - The provider of this Carapis Encar API.
*   [Encar.com](https://encar.com) - The primary source of the vehicle data.

## Support & Contact

*   Website: [https://carapis.com](https://carapis.com)
*   Telegram: [t.me/markinmatrix](https://t.me/markinmatrix)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
