# KiotViet Integration Dashboard

## Overview

This is a full-stack web application that provides integration capabilities with KiotViet (a Vietnamese Point of Sale system). The application allows users to sync orders and inventory data from KiotViet's API, manage API credentials, and monitor synchronization status through a modern dashboard interface.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React SPA with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: Client-side routing with Wouter
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for monorepo setup
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Native fetch with TanStack Query for caching and synchronization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Database Schema
The application uses 5 main tables:
- `api_credentials` - Stores KiotViet API credentials and connection status
- `orders` - Synchronized order data from KiotViet
- `products` - Product catalog information
- `inventory` - Stock levels by branch and product
- `sync_logs` - Audit trail for synchronization operations

### UI Components Structure
- **Dashboard Layout**: Tabbed interface with header and navigation
- **Connection Settings**: API credential management and testing
- **Order Sync**: Order data display and manual synchronization
- **Inventory Sync**: Inventory management with branch filtering

## Data Flow

1. **API Credential Setup**: Users input KiotViet API credentials which are validated and stored
2. **Connection Testing**: Credentials are tested against KiotViet API for validation
3. **Data Synchronization**: Manual or scheduled sync pulls data from KiotViet API
4. **Data Display**: Synchronized data is displayed in structured tables with filtering options
5. **Status Monitoring**: Sync logs track all operations for audit purposes

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle with PostgreSQL dialect
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod schema validation
- **Date Handling**: date-fns utility library

### Development Dependencies
- **TypeScript**: Full type safety across the stack
- **Vite**: Development server and build tool
- **PostCSS**: CSS processing with Tailwind
- **ESBuild**: Production server bundling

### Third-Party Integrations
- **KiotViet API**: External POS system integration (credentials-based authentication)
- **Replit**: Development environment with custom plugins and runtime error handling

## Deployment Strategy

The application is configured for deployment on Replit's autoscale infrastructure:

- **Development**: `npm run dev` starts both client and server in development mode
- **Build Process**: 
  1. Vite builds the client application to `dist/public`
  2. esbuild bundles the server code to `dist/index.js`
- **Production**: `npm run start` runs the production server
- **Database**: Uses environment variable `DATABASE_URL` for connection
- **Port Configuration**: Server runs on port 5000, exposed as port 80

The deployment uses a monorepo structure where the server serves both API endpoints and static client files in production.

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.