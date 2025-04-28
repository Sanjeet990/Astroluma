# Astroluma Development Documentation

## Overview

Welcome to the Astroluma development documentation. This guide provides comprehensive information to help you get started with contributing to Astroluma, a powerful, self-hosted home lab dashboard built with React, Express, Node.js, and SQLite (using Sequelize ORM).

This documentation is intended for developers who want to understand the codebase, set up a development environment, and contribute features, fixes, or improvements to Astroluma.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
  - [Prerequisites](#prerequisites)
  - [Setting Up Local Development](#setting-up-local-development)
  - [Docker Development Environment](#docker-development-environment)
  - [IDE Configuration](#ide-configuration)
- [Project Architecture](#project-architecture)
  - [Directory Structure Overview](#directory-structure-overview)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Database Structure](#database-structure)
- [Development Workflow](#development-workflow)
  - [Version Control Guidelines](#version-control-guidelines)
  - [Branch Strategy](#branch-strategy)
  - [Pull Request Process](#pull-request-process)
  - [Code Review Standards](#code-review-standards)
- [Building and Deploying](#building-and-deploying)
  - [Build Process](#build-process)
  - [Deployment Options](#deployment-options)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Core API Endpoints](#core-api-endpoints)
  - [Error Handling](#error-handling)
- [Feature Development Guidelines](#feature-development-guidelines)
  - [Frontend Components](#frontend-components)
  - [Backend Services](#backend-services)
  - [Database Migrations](#database-migrations)
- [Common Development Tasks](#common-development-tasks)
  - [Adding a New API Endpoint](#adding-a-new-api-endpoint)
  - [Creating Frontend Components](#creating-frontend-components)
  - [Adding Database Models](#adding-database-models)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Development Environment Setup

### Prerequisites

To develop for Astroluma, you'll need:

- Node.js (v16.x or later)
- npm (v8.x or later) or yarn
- Git

Optional tools that will improve your development experience:
- Docker and Docker Compose (for containerized development)
- Visual Studio Code with extensions:
  - ESLint
  - Prettier
  - React Developer Tools
  - SQLite extension

### Setting Up Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sanjeet990/Astroluma.git
   cd Astroluma
   ```

2. **Set up the environment**

   ```bash
   npm install
   ```

   Create a `.env` file in the root directory with the following content:

   ```env
   PORT=8000
   CLIENT_PORT=3000
   NODE_ENV=development
   SECRET_KEY=your_secret_key_for_development
   ```

3. **Initialize the database**

   ```bash
   npm run migrate
   ```

4. **Start the development servers**

   Start both frontend and backend servers with a single command:
   ```bash
   npm run dev
   ```

   The development environment should now be running with:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Docker Development Environment

For a containerized development environment:

1. **Build and run the development containers**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will start the SQLite database, backend, and frontend services with hot-reloading enabled.

2. **Access the development environment**

   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - SQLite: /storage/development.sqlite

### IDE Configuration

#### Visual Studio Code

Recommended VSCode settings for the workspace:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

## Project Architecture

### Directory Structure Overview

The Astroluma project is organized into several key directories:

- `/client`: React frontend
- `/server`: Node.js/Express backend
- `/storage`: User data storage (uploads, app data, SQLite database)
- `/docker-compose.yml`: Production Docker setup
- `/Dockerfile`: Main Dockerfile for the application

### Frontend Architecture

The frontend is built with React, Vite, and follows a component-based architecture:

- `/client/src/components`: Reusable UI components
- `/client/src/hooks`: Custom React hooks
- `/client/src/assets`: Static assets including images and icons
- `/client/src/utils`: Helper functions and utilities
- `/client/src/App.jsx`: Main application component
- `/client/src/main.jsx`: Entry point

#### State Management

Astroluma uses Recoil for state management. The `atoms.js` file defines Recoil atoms and selectors used throughout the application.

Important patterns:
- Global configuration state in Recoil atoms
- Custom hooks for data fetching and state updates
- Event-driven architecture for real-time updates

### Backend Architecture

The backend follows the MVC (Model-View-Controller) pattern:

- `/server/models`: Sequelize models for SQLite database
- `/server/controllers`: Business logic implementation
- `/server/routes`: API route definitions
- `/server/middlewares`: Express middlewares
- `/server/config`: Configuration files
- `/server/utils`: Utility functions and helpers
- `/server/apps`: Integration applications
- `/server/migrations`: Database migration files
- `/server/seeders`: Data seeding scripts

Key architectural features:
- RESTful API design
- JWT-based authentication
- Route-specific middleware for authorization
- Sequelize ORM for database operations
- Modular application structure

### Database Structure

Astroluma uses SQLite with Sequelize ORM, with the database file located at `/storage/development.sqlite`. The main tables include:

- `Users`: User accounts and preferences
- `Listings`: Links, categories, and layout information
- `Apps`: Application integration configurations
- `Todos`: Todo items and lists
- `Snippets`: Code snippets
- `Authenticators`: TOTP configuration
- `NetworkDevices`: Network device information
- `Pages`: Custom pages
- `IconPacks`: Custom icon collections
- `GlobalSettings`: System-wide configuration

## Development Workflow

### Version Control Guidelines

- **Commit Messages**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for test additions or changes
  - `chore:` for build process or tooling changes

- **Commit Size**: Prefer smaller, focused commits that address a single issue or feature

### Branch Strategy

Astroluma follows a GitFlow-inspired branch strategy:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: For new features
- `fix/*`: For bug fixes
- `release/*`: For release preparation
- `hotfix/*`: For urgent fixes to production

### Pull Request Process

1. Create a branch from `develop` for your feature or fix
2. Make your changes following the code style guidelines
3. Write or update tests as needed
4. Update documentation if necessary
5. Submit a PR to the `develop` branch
6. Address reviewer feedback
7. Once approved, maintainers will merge the PR

### Code Review Standards

All code should be reviewed for:

- Functionality: Does the code work as intended?
- Code quality: Is the code maintainable and readable?
- Performance: Are there any potential performance issues?
- Security: Are there any security concerns?
- Testing: Is the code adequately tested?

## Building and Deploying

### Build Process

To build the production version:

```bash
# Build both frontend and backend
npm run build
```

### Deployment Options

Astroluma can be deployed in several ways:

1. **Docker (Recommended)**:
   ```bash
   docker-compose up -d
   ```

2. **Manual Deployment**:
   - Set up a SQLite database
   - Deploy the Node.js backend
   - Serve the built frontend using nginx or another web server

3. **Development Deployment**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

## API Documentation

### Authentication

Astroluma uses JWT-based authentication:

- `POST /api/auth/login`: Authenticate and receive a JWT
- `POST /api/auth/register`: Create a new user account
- `GET /api/auth/verify`: Verify token validity

All authenticated routes require a valid JWT in the Authorization header:
```
Authorization: Bearer <token>
```

### Core API Endpoints

#### User Management

- `GET /api/accounts`: Get all accounts (admin only)
- `GET /api/accounts/:id`: Get user details
- `PUT /api/accounts/:id`: Update user details
- `DELETE /api/accounts/:id`: Delete a user

#### Listings Management

- `GET /api/listing`: Get user listings
- `POST /api/listing`: Create a new listing
- `PUT /api/listing/:id`: Update a listing
- `DELETE /api/listing/:id`: Delete a listing

#### Todo Lists

- `GET /api/todo`: Get user todos
- `POST /api/todo`: Create a todo item
- `PUT /api/todo/:id`: Update a todo item
- `DELETE /api/todo/:id`: Delete a todo item

### Error Handling

API errors follow a standard format:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

Common error codes:
- `AUTH_FAILED`: Authentication failure
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `SERVER_ERROR`: Internal server error

## Feature Development Guidelines

### Frontend Components

When creating new frontend components:

1. Place components in the appropriate directory based on functionality
2. Use functional components with hooks
3. Follow the established styling patterns (Tailwind CSS)
4. Create unit tests for new components
5. Document props and usage

Example component structure:

```jsx
// Component file: client/src/components/MyComponent/MyComponent.jsx
import React from 'react';
import PropTypes from 'prop-types';

function MyComponent({ title, onClick }) {
  return (
    <div className="p-4 bg-white rounded shadow" onClick={onClick}>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default MyComponent;
```

### Backend Services

For backend service development:

1. Follow the MVC pattern
2. Create a controller for business logic
3. Define routes in a dedicated router file
4. Create or update models as needed
5. Implement validation for inputs
6. Write tests for new functionality

Example controller structure:

```javascript
// Controller file: server/controllers/myFeature.js
const MyModel = require('../models/MyModel');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await MyModel.find({ user: req.user.id });
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: 'Server error' });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ error: true, message: 'Name is required' });
    }
    
    const newItem = new MyModel({
      name,
      description,
      user: req.user.id
    });
    
    await newItem.save();
    return res.status(201).json({ item: newItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: 'Server error' });
  }
};
```

### Database Migrations

When making database schema changes:

1. Create a new migration file in `/server/migrations`
2. Define both `up` and `down` methods
3. Test migrations in development before committing

Example migration:

```javascript
// Migration file: server/migrations/YYYYMMDDHHMMSS-add-field-to-model.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TableName', 'newField', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TableName', 'newField');
  }
};
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create a controller function in the appropriate controller file
2. Add a route in the corresponding router file
3. Implement any necessary middleware
4. Add validation for inputs
5. Create tests for the new endpoint

### Creating Frontend Components

1. Create a new directory in `/client/src/components` if needed
2. Create the component file with a descriptive name
3. Add styles using Tailwind CSS classes
4. Create a test file for the component
5. Update any parent components to use the new component

### Adding Database Models

1. Create a new model file in `/server/models`
2. Use Sequelize's model definition syntax
3. Implement any hooks if needed
4. Create relations to other models if required
5. Update migrations to support the new model

Example model:

```javascript
// Model file: server/models/MyModel.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MyModel extends Model {
    static associate(models) {
      // Define associations here
      this.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  
  MyModel.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'MyModel',
    tableName: 'MyModels'
  });
  
  return MyModel;
};
```

## Troubleshooting

Common development issues and their solutions:

### SQLite Database Issues

If you encounter database issues:

1. Check if the database file exists at `/storage/development.sqlite`
2. Try running migrations again with `npm run migrate`
3. For a clean start, remove the database file and run migrations
4. Check Sequelize logs for detailed error messages

### Frontend Development Server Issues

If the Vite development server fails to start:

1. Check for port conflicts (default is 3000)
2. Verify all dependencies are installed (`npm install`)
3. Clear the node_modules and reinstall if needed
4. Check for syntax errors in your code

### Backend Development Server Issues

If the Node.js server fails to start:

1. Check for port conflicts (default is 8000)
2. Verify all dependencies are installed
3. Check your `.env` file configuration
4. Examine the error logs for specific issues

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Sequelize Documentation](https://sequelize.org/master/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Recoil Documentation](https://recoiljs.org/docs/introduction/getting-started)

## Getting Help

If you need assistance with Astroluma development:

1. Check existing [Issues on GitHub](https://github.com/Sanjeet990/Astroluma/issues) for similar problems
2. Join the community forums or chat
3. Create a detailed issue if you've found a bug or have a feature request
4. For questions about development, use the Discussion area on GitHub

---

This documentation is continuously evolving. If you find any errors or have suggestions for improvements, please submit a PR or create an issue.