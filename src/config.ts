// Configuration for the @carapis/encar-ts client package
// This file now relies on environment variables being set BEFORE the client is imported/used.
// Loading of .env files should be handled by the application using this client.

import process from 'process'; // Explicit import for clarity

// Default API URL if not set in environment
const DEFAULT_BASE_URL = "https://api.carapis.com";

/**
 * Gets the API Base URL.
 * Reads from the ENCAR_API_URL environment variable first,
 * then falls back to the default.
 * Ensures the URL does not have a trailing slash.
 */
export function getBaseUrl(): string {
    const url = process.env.ENCAR_API_URL || DEFAULT_BASE_URL;
    return url.replace(/\/$/, ''); // Remove trailing slash
}
