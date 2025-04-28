# Astroluma App Integration Documentation

## Overview

Astroluma supports a powerful plugin system that allows developers to create applications and integrations that enhance the core functionality. These integrations can display stats, provide interactive features, and pull data from third-party services directly into your Astroluma listings.

This document provides comprehensive guidance on how to create, structure, test, and distribute your own Astroluma app integrations.

## Table of Contents

- [Integration System Architecture](#integration-system-architecture)
- [Creating a New Integration](#creating-a-new-integration)
  - [Directory Structure](#directory-structure)
  - [Required Files](#required-files)
  - [Manifest File Reference](#manifest-file-reference)
  - [App.js Structure](#appjs-structure)
  - [Response Templates](#response-templates)
  - [Package.json Configuration](#packagejson-configuration)
- [Integration API Reference](#integration-api-reference)
  - [Connection Testing](#connection-testing)
  - [Initialize Function](#initialize-function)
  - [Available API Methods](#available-api-methods)
- [Using External Services](#using-external-services)
  - [Allowed Modules](#allowed-modules)
  - [Making API Requests](#making-api-requests)
  - [Authentication Patterns](#authentication-patterns)
- [User Configuration](#user-configuration)
  - [Config Schema](#config-schema)
  - [Core Settings](#core-settings)
  - [Field Types](#field-types)
- [Packaging & Distribution](#packaging--distribution)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Integration System Architecture

The Astroluma integration system is built around a sandboxed JavaScript execution environment that allows third-party code to run safely within the Astroluma platform. Each integration consists of a set of required files and runs within its own context.

Key architectural features:
- **Sandboxed Execution**: App code runs in a Node.js VM sandbox with limited permissions
- **Dependency Isolation**: Each app has its own `node_modules` and dependencies
- **Configuration System**: Apps can define configuration fields that users must complete
- **Template-based Response**: Apps return data through a templating system
- **Connection Testing**: Built-in mechanism to verify if connections to external services work

## Creating a New Integration

### Directory Structure

A complete Astroluma integration should have the following structure:

```
com.your-app-id/
├── app.js              # Main application code
├── manifest.json       # App metadata and configuration schema
├── package.json        # Node.js package definition
├── response.tpl        # HTML template for rendering in listings
└── node_modules/       # Dependencies (auto-installed)
```

### Required Files

#### manifest.json

The manifest file contains metadata about your integration and defines its configuration requirements.

```json
{
  "appId": "com.example",
  "appName": "Example Integration",
  "version": "1.0.0",
  "appDescription": "This is an example integration for Astroluma",
  "appIcon": "https://cdn.example.com/icon.svg",
  "category": "tools",
  "supportedThemes": ["light", "dark"],
  "supportedViewportSize": "default",
  "alwaysShowDetailedView": false,
  "autoRefreshAfterSeconds": 3600,
  "config": [
    {
      "name": "apiKey",
      "label": "API Key",
      "type": "password",
      "required": true,
      "placeholder": "Enter your API key"
    },
    {
      "name": "showStatistics",
      "label": "Show Statistics",
      "type": "checkbox",
      "required": false
    }
  ]
}
```

#### app.js

The app.js file must export two global functions: `connectionTest` and `initialize`.

```javascript
const connectionTest = async (testerInstance) => {
    try {
        // Test connection to external service
        await testerInstance.connectionSuccess();
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    try {
        // Your app logic goes here
        
        // Send response data
        const variables = [
            { key: '{{value1}}', value: 'Data 1' },
            { key: '{{value2}}', value: 'Data 2' }
        ];
        
        await application.sendResponse('response.tpl', 200, variables);
    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;
```

#### response.tpl

HTML template that renders in the Astroluma listing. Variables from your app.js are injected using double curly braces.

```html
<div class="integration-container">
  <div class="integration-header">
    <h3>Example App</h3>
  </div>
  <div class="integration-body">
    <p>Value 1: {{value1}}</p>
    <p>Value 2: {{value2}}</p>
  </div>
</div>
```

#### package.json

Defines your app's Node.js dependencies.

```json
{
  "name": "com.example",
  "version": "1.0.0",
  "description": "Example Integration for Astroluma",
  "main": "app.js",
  "dependencies": {
    "axios": "^1.6.0",
    "moment": "^2.29.4"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Manifest File Reference

| Field | Type | Description |
|-------|------|-------------|
| `appId` | String | Unique identifier for your app (format: com.domain) |
| `appName` | String | Display name of your integration |
| `version` | String | Semantic version number (major.minor.patch) |
| `appDescription` | String | Short description of what your integration does |
| `appIcon` | String | URL to icon image (SVG preferred) |
| `category` | String | Category for grouping (tools, media, monitoring, etc.) |
| `supportedThemes` | Array | List of themes the app supports (light, dark) |
| `supportedViewportSize` | String | Preferred viewport size (default, small, large) |
| `alwaysShowDetailedView` | Boolean | Whether to always show detailed view |
| `autoRefreshAfterSeconds` | Number | Auto-refresh interval in seconds (0 to disable) |
| `config` | Array | Configuration field definitions |

### App.js Structure

The app.js file is the heart of your integration. It must export two global functions:

#### connectionTest Function

```javascript
const connectionTest = async (testerInstance) => {
    try {
        // Test connection logic
        // If connection is successful:
        await testerInstance.connectionSuccess();
        
        // If connection fails:
        // await testerInstance.connectionFailed("Connection error message");
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}
```

#### initialize Function

```javascript
const initialize = async (application) => {
    try {
        // Read configuration
        const { apiKey } = application.config;
        
        // Make API requests
        const response = await application.axios.get('https://api.example.com/data', {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        
        // Process data
        const data = response.data;
        
        // Prepare template variables
        const variables = [
            { key: '{{title}}', value: data.title },
            { key: '{{count}}', value: data.count }
        ];
        
        // Send response
        await application.sendResponse('response.tpl', 200, variables);
    } catch (error) {
        await application.sendError(error);
    }
}
```

## Integration API Reference

### Available API Methods

The `application` object provides the following methods and properties:

| Method/Property | Description |
|-----------------|-------------|
| `application.config` | Object containing user-provided configuration |
| `application.payload` | The listing object this integration is attached to |
| `application.appUrl` | The URL of the application (from listing URL or overridden) |
| `application.axios` | Pre-configured axios instance with SSL verification disabled |
| `application.sendResponse(template, statusCode, variables, [background])` | Send a successful response |
| `application.sendError(error)` | Send an error response |

### Connection Testing API

The `testerInstance` provides these methods:

| Method | Description |
|--------|-------------|
| `testerInstance.connectionSuccess()` | Report successful connection |
| `testerInstance.connectionFailed(errorMessage)` | Report failed connection with reason |
| `testerInstance.config` | Access to user-provided configuration |
| `testerInstance.appUrl` | URL being tested |
| `testerInstance.axios` | Pre-configured axios instance |

## Using External Services

### Allowed Modules

For security reasons, Astroluma restricts the modules that can be imported. Currently, these modules are allowed:

- `axios` - HTTP client
- `lodash` - Utility library
- `moment` - Date manipulation
- `crypto-js` - Cryptographic functions

### Making API Requests

Always use the provided `axios` instance:

```javascript
const response = await application.axios.get('https://api.example.com/endpoint', {
    headers: {
        'Authorization': `Bearer ${apiToken}`
    }
});
```

### Authentication Patterns

Common authentication patterns:

1. **API Key Authentication**:
```javascript
const response = await application.axios.get('https://api.example.com/data', {
    headers: { 'X-API-Key': application.config.apiKey }
});
```

2. **Bearer Token Authentication**:
```javascript
const authResponse = await application.axios.post('https://api.example.com/auth', {
    username: application.config.username,
    password: application.config.password
});

const token = authResponse.data.token;

const dataResponse = await application.axios.get('https://api.example.com/data', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

3. **Basic Authentication**:
```javascript
const response = await application.axios.get('https://api.example.com/data', {
    auth: {
        username: application.config.username,
        password: application.config.password
    }
});
```

## User Configuration

### Config Schema

Configuration fields are defined in the manifest.json file:

```json
"config": [
  {
    "name": "username",
    "label": "Username",
    "type": "text",
    "required": true,
    "placeholder": "Enter your username",
    "scope": "user"
  }
]
```

### Field Types

Supported configuration field types:

| Type | Description |
|------|-------------|
| `text` | Single-line text input |
| `password` | Password field (masked) |
| `number` | Numeric input |
| `checkbox` | Boolean toggle |
| `select` | Dropdown selection (requires `options` array) |
| `radio` | Radio button selection (requires `options` array) |
| `html` | Rich text editor |

Example of a select field:

```json
{
  "name": "environment",
  "label": "Environment",
  "type": "select",
  "options": ["Production", "Staging", "Development"],
  "required": true
}
```

### Core Settings

When a configuration field has `"scope": "core"`, it indicates this setting is required for the app to function and must be configured by an admin before users can use the integration.

```json
{
  "name": "apiEndpoint",
  "label": "API Endpoint",
  "type": "text",
  "required": true,
  "scope": "core"
}
```

## Packaging & Distribution

To distribute your integration:

1. Create a ZIP file with all required files:
   - app.js
   - manifest.json
   - package.json
   - response.tpl
   - (Do not include node_modules)

2. The ZIP file name should match your appId.

3. Users can install the integration using one of these methods:
   - Upload the ZIP file through the Astroluma admin interface
   - Place the files in the server/storage/apps directory and use "Sync from Disk"

## Best Practices

1. **Error Handling**: Always wrap your code in try/catch blocks and provide meaningful error messages.

2. **Performance**: Keep initialization function efficient to avoid slowing down Astroluma.

3. **Resource Usage**: Minimize the number of API calls and amount of data processed.

4. **Security**: Never store sensitive credentials in code. Always use the configuration system.

5. **Validation**: Validate inputs before making external API calls.

6. **User Experience**: Use clear labels and descriptions for configuration fields.

7. **Scoped CSS**: If including styles in your template, use scoped CSS to avoid conflicts.

## Examples

### Simple HTML Integration

This example shows a basic HTML integration that doesn't require external services:

```javascript
// app.js
const connectionTest = async (testerInstance) => {
    await testerInstance.connectionSuccess();
}

const initialize = async (application) => {
    const htmlcode = application?.config?.htmlcode;
    
    try {
        const variables = [
            { key: '{{html}}', value: htmlcode }
        ];

        await application.sendResponse('response.tpl', 200, variables);
    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;
```

```json
// manifest.json
{
  "appId": "com.html",
  "appName": "HTML Integration",
  "version": "1.0.0",
  "appDescription": "Display custom HTML directly in your listings",
  "appIcon": "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/html5.svg",
  "config": [
    {
      "name": "htmlcode",
      "label": "HTML Content",
      "type": "html",
      "required": true,
      "placeholder": "Enter your HTML here"
    }
  ]
}
```

```html
<!-- response.tpl -->
<div class="html-integration">
  {{html}}
</div>
```

### API Integration with Authentication

```javascript
// app.js
const connectionTest = async (testerInstance) => {
    try {
        const { username, password } = testerInstance.config;
        const connectionUrl = testerInstance?.appUrl;

        if (!username || !password || !connectionUrl) {
            await testerInstance.connectionFailed("Please provide all the required configuration parameters");
            return;
        }

        const authUrl = `${connectionUrl}/api/auth`;
        const response = await testerInstance?.axios.post(authUrl, {
            username,
            password
        });

        if (response.data?.token) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed('Invalid response from API');
        }
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    try {
        const { username, password } = application.config;
        const apiUrl = application?.appUrl;

        if (!username || !password || !apiUrl) {
            return await application.sendError('Please provide all the required configuration parameters');
        }

        // Authenticate
        const authResponse = await application.axios.post(`${apiUrl}/api/auth`, {
            username,
            password
        });
        
        const token = authResponse.data.token;
        
        // Get data with token
        const dataResponse = await application.axios.get(`${apiUrl}/api/data`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = dataResponse.data;
        
        // Send response
        const variables = [
            { key: '{{totalItems}}', value: data.totalItems },
            { key: '{{activeItems}}', value: data.activeItems },
            { key: '{{lastUpdated}}', value: data.lastUpdated }
        ];
        
        await application.sendResponse('response.tpl', 200, variables);
    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;
```

## Troubleshooting

### Common Issues

1. **Connection Test Fails**:
   - Check that all required configuration fields are provided
   - Verify that the external API is reachable
   - Ensure authentication credentials are correct

2. **Integration Not Loading**:
   - Check server logs for JavaScript errors
   - Verify all required files are included in the package
   - Make sure npm dependencies are correctly specified

3. **Variables Not Showing in Template**:
   - Confirm that variable names in template match those in app.js
   - Check that variables are being correctly populated

4. **Permission Errors**:
   - Verify that the app folder has correct permissions
   - Make sure node_modules can be installed in the app directory

### Getting Help

If you need additional assistance with developing integrations for Astroluma:

1. Check the Astroluma GitHub repository for example integrations
2. Review existing integrations for reference implementations
3. Contact the Astroluma support team with your specific integration questions