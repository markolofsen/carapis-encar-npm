import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  Method,
} from 'axios';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

import { BASE_URL } from './config';

const SCHEMA_PATH = path.join(__dirname, 'schema.yaml');
const API_BASE_PATH = '/apix/encar/v2'; // Specific API path

// Basic types (can be expanded based on schema)
type PathParams = Record<string, string | number>;
type QueryParams = Record<string, string | number | boolean | undefined | null>;
type RequestArgs = Record<string, any>; // Arguments passed to client methods
type ApiResponse = Record<string, any>; // Generic API response

interface SchemaParameter {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    required?: boolean;
    schema?: Record<string, any>; // Simplified schema representation
}

interface EndpointInfo {
    method: Method;
    pathTemplate: string;
    parameters: SchemaParameter[];
}

interface Schema {
    paths: Record<string, Record<string, { operationId?: string; parameters?: SchemaParameter[] }>>;
    // Add other schema parts if needed
}

export class CarapisClientError extends Error {
    public status?: number | null;
    public details?: any;

    constructor(message: string, status?: number | null, details?: any) {
        super(message);
        this.name = 'CarapisClientError';
        this.status = status;
        this.details = details;
        // Set the prototype explicitly to allow instanceof checks
        Object.setPrototypeOf(this, CarapisClientError.prototype);
    }
}


export class CarapisClient {
    private apiKey: string;
    private baseUrl: string;
    private apiBasePath: string;
    private axiosInstance: AxiosInstance;
    private _schema: Schema;
    private _endpoints: Record<string, EndpointInfo> = {};
    // Index signature to allow dynamic method assignment
    [key: string]: any;

    /**
     * TypeScript client for the Carapis Encar v2 API.
     * Loads API definitions from schema.yaml.
     */
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("apiKey cannot be empty.");
        }

        this.apiKey = apiKey;
        this.baseUrl = BASE_URL.replace(/\/$/, ''); // Remove trailing slash
        this.apiBasePath = API_BASE_PATH;

        try {
            const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
            // Use type assertion as js-yaml load result is unknown
            this._schema = yaml.load(schemaContent) as Schema;
            if (typeof this._schema !== 'object' || !this._schema.paths) {
                throw new Error(`Invalid schema format in ${SCHEMA_PATH}`);
            }
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
            } else if (e instanceof yaml.YAMLException) {
                throw new Error(`Error parsing schema file ${SCHEMA_PATH}: ${e.message}`);
            } else {
                throw new Error(`An unexpected error occurred loading schema: ${e.message}`);
            }
        }

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000, // 30 seconds
            headers: this._getHeaders()
        });

        this._endpoints = this._extractEndpoints(this.apiBasePath);
        this._createMethods();
    }

    private _getPackageVersion(): string {
        try {
            // Navigate up one level from src to find package.json
            const packageJsonPath = path.join(__dirname, '..', 'package.json');
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);
            return packageJson.version || 'unknown';
        } catch (error) {
            // console.error("Error reading package version:", error);
            return 'unknown';
        }
    }

    private _getHeaders(): Record<string, string> {
        return {
            'Accept': 'application/json',
            'Authorization': `ApiKey ${this.apiKey}`,
            'User-Agent': `encar/npm/${this._getPackageVersion()}`
        };
    }

    private _extractEndpoints(basePathPrefix: string): Record<string, EndpointInfo> {
        const endpoints: Record<string, EndpointInfo> = {};
        const paths = this._schema.paths || {};

        for (const [pathKey, pathItem] of Object.entries(paths)) {
            if (pathKey.startsWith(basePathPrefix)) {
                let relativePath = pathKey.substring(basePathPrefix.length);
                if (!relativePath.startsWith('/')) {
                    relativePath = '/' + relativePath;
                }

                for (const [method, operation] of Object.entries(pathItem)) {
                    const lowerMethod = method.toLowerCase();
                    // Check if operation is an object and has operationId
                    if (typeof operation === 'object' && operation !== null && operation.operationId &&
                        ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(lowerMethod)) {

                        endpoints[operation.operationId] = {
                            method: method.toUpperCase() as Method,
                            pathTemplate: relativePath,
                            parameters: operation.parameters || []
                        };
                    } else if (typeof operation === 'object' && operation !== null && !operation.operationId &&
                        ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(lowerMethod)) {
                        console.warn(`Warning: Missing operationId for ${method.toUpperCase()} ${pathKey}`);
                    }
                }
            }
        }
        return endpoints;
    }

    private async _request(
        method: Method,
        endpointPathTemplate: string,
        pathParams: PathParams = {},
        queryParams: QueryParams = {},
        jsonData: any = null
    ): Promise<ApiResponse> {

        let formattedPath = endpointPathTemplate;
        const pathParamKeys = Object.keys(pathParams);

        if (pathParamKeys.length > 0) {
            pathParamKeys.forEach(key => {
                const placeholder = `{${key}}`;
                if (formattedPath.includes(placeholder)) {
                    formattedPath = formattedPath.replace(placeholder, encodeURIComponent(pathParams[key]));
                }
            });
            // Check if any placeholders remain
            if (/\{\w+\}/.test(formattedPath)) {
                throw new CarapisClientError(`Missing required path parameters for endpoint ${endpointPathTemplate}. Remaining path: ${formattedPath}`, 400);
            }
        }

        const url = `${this.apiBasePath}${formattedPath}`; // Use relative path for axios instance

        const actualQueryParams: QueryParams = {};
        if (queryParams) {
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] !== null && queryParams[key] !== undefined) {
                    actualQueryParams[key] = queryParams[key];
                }
            });
        }

        const config: AxiosRequestConfig = {
            method: method,
            url: url,
            params: actualQueryParams,
            data: jsonData,
            // Headers are set globally in axiosInstance, but can be overridden here if needed
        };

        try {
            const response = await this.axiosInstance.request(config);

            if (response.status === 204 || !response.data) {
                return {};
            }
            return response.data as ApiResponse;
        } catch (error) {
            const axiosError = error as AxiosError;
            const requestInfo = `${method} ${url}`;

            if (axiosError.response) {
                const status = axiosError.response.status;
                const errorMessage = `HTTP error ${status} for ${requestInfo}`;
                let errorDetails = axiosError.response.data;

                if (typeof errorDetails === 'object' && errorDetails !== null) {
                    // Attempt to extract a more specific message
                    // Adjust keys ('detail', 'message') based on actual API error structure
                    const detailMsg = (errorDetails as any).detail || (errorDetails as any).message || JSON.stringify(errorDetails);
                    throw new CarapisClientError(`${errorMessage}: ${detailMsg}`, status, errorDetails);
                } else {
                    // Fallback to status text or raw details
                    throw new CarapisClientError(`${errorMessage}: ${errorDetails || axiosError.response.statusText}`, status, errorDetails);
                }
            } else if (axiosError.request) {
                // No response received
                throw new CarapisClientError(`Request failed for ${requestInfo}: No response received`, null, axiosError.code);
            } else {
                // Error setting up the request
                throw new CarapisClientError(`Request setup failed for ${requestInfo}: ${axiosError.message}`, null, axiosError.stack);
            }
        }
    }

    private _prepareParams(operationId: string, funcArgs: RequestArgs): { pathParams: PathParams, queryParams: QueryParams } {
        if (!this._endpoints[operationId]) {
            throw new Error(`Unknown operationId: ${operationId}`);
        }

        const endpointInfo = this._endpoints[operationId];
        const paramDefs = endpointInfo.parameters || [];

        const pathParams: PathParams = {};
        const queryParams: QueryParams = {};
        const knownParamNames = new Set<string>();

        paramDefs.forEach(paramDef => {
            const paramName = paramDef.name;
            const paramIn = paramDef.in;
            const isRequired = paramDef.required || false;
            knownParamNames.add(paramName);

            let value = funcArgs[paramName];

            // Handle special mapping for list_vehicles 'model_group' -> 'model__model_group'
            if (operationId === 'encar_v2_vehicles_list' && paramName === 'model__model_group' && funcArgs.hasOwnProperty('model_group')) {
                value = funcArgs.model_group; // Use the user-friendly 'model_group' arg
            } else if (operationId === 'encar_v2_vehicles_list' && paramName === 'model_group') {
                // Skip the original 'model_group' param from schema if we mapped 'model__model_group'
                if (funcArgs.hasOwnProperty('model_group')) return;
            }

            if (value !== undefined && value !== null) {
                if (paramIn === 'path') {
                    pathParams[paramName] = value;
                } else if (paramIn === 'query') {
                    // Use the schema parameter name (potentially model__model_group)
                    queryParams[paramName] = value;
                }
            } else if (isRequired) {
                throw new CarapisClientError(`Missing required parameter '${paramName}' for operation '${operationId}'`, 400);
            }
        });

        // Warn about extra arguments
        const extraArgs = Object.keys(funcArgs).filter(key =>
            !knownParamNames.has(key) &&
            // Allow 'model_group' for listVehicles as it maps to 'model__model_group'
            !(operationId === 'encar_v2_vehicles_list' && key === 'model_group')
        );
        if (extraArgs.length > 0) {
            console.warn(`Warning: Unexpected arguments provided for '${operationId}': ${extraArgs.join(', ')}`);
        }

        return { pathParams, queryParams };
    }

    private _createMethods(): void {
        Object.keys(this._endpoints).forEach(operationId => {
            const endpointInfo = this._endpoints[operationId];
            const methodName = this._operationIdToMethodName(operationId);

            if (this[methodName]) {
                // console.warn(`Warning: Method ${methodName} potentially conflicts. Overwriting for ${operationId}.`);
            }

            // Assign async function to the class instance using index signature
            this[methodName] = async (args: RequestArgs = {}): Promise<ApiResponse> => {
                const { pathParams, queryParams } = this._prepareParams(operationId, args);
                return this._request(endpointInfo.method, endpointInfo.pathTemplate, pathParams, queryParams, null);
            };
        });
    }

    private _operationIdToMethodName(operationId: string): string {
        const parts = operationId.split('_').filter(p => !['encar', 'v2', 'api'].includes(p));
        if (parts.length === 0) return operationId; // Fallback

        let action = parts[parts.length - 1];
        let resourceParts = parts.slice(0, -1);

        if (action === 'retrieve' && resourceParts.length > 0) {
            action = 'get';
        } else if (action === 'list' && resourceParts.length === 0) {
            return operationId; // Keep as is e.g., 'list'
        } else if (action === 'stats' || action === 'enums') {
            if (resourceParts.length > 0) {
                action = action.charAt(0).toUpperCase() + action.slice(1);
                resourceParts.push(action);
                action = 'get';
            } else {
                action = 'get' + action.charAt(0).toUpperCase() + action.slice(1);
                resourceParts = [];
            }
        }

        const capitalizedResource = resourceParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
        return `${action}${capitalizedResource}`;
    }
}
