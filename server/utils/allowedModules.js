module.exports = [
    // Node.js Built-in Modules (Safe Subset)
    'assert', 'buffer', 'crypto', 'dns', 'events', 'fs', 'http', 'https', 
    'os', 'path', 'querystring', 'stream', 'timers', 'url', 'util', 'zlib',
    'readline', 'string_decoder', 'perf_hooks',

    // Common Third-party Libraries
    'axios',         // HTTP requests
    'moment',        // Date/time manipulation
    'dayjs',         // Lightweight alternative to Moment.js
    'lodash',        // Utility library
    'uuid',          // Generate unique identifiers
    'date-fns',      // Modern date utility library
    'debug',         // Debugging utility
    'dotenv',        // Load environment variables
    'node-fetch',    // Fetch API for Node.js
    'form-data',     // Handling form data
    'xml2js',        // XML to JSON and vice versa
    'jsonschema',    // JSON schema validation
    'jsonwebtoken',  // JSON Web Token utilities
    'bcrypt',        // Password hashing
    'argon2',        // Modern password hashing
    'helmet',        // Security headers for HTTP responses
    'express-rate-limit', // API rate-limiting
    'validator',     // String validation and sanitization
    'qs',            // Query string parsing and formatting
    'bluebird',      // Promises with additional utilities
    'pino',          // Fast JSON logging
    'winston',       // Versatile logging library
    'sharp',         // Image processing
];