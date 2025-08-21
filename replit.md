# Fire Detection and Emergency Response System

## Overview

This is a full-stack web application for wildfire detection and emergency response using AI-powered computer vision and real-time weather analysis. The system processes uploaded fire images, predicts fire spread patterns, and automatically notifies emergency agencies. It integrates with multiple AI systems including Google FireSat, ECMWF weather forecasting, and USC fire prediction models to provide comprehensive fire risk assessment and emergency coordination.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Structure**: Component-based architecture with shared UI components, custom hooks, and TypeScript types

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for fire detection, weather data, and emergency notifications
- **File Upload**: Multer middleware for handling image uploads with memory storage
- **Error Handling**: Centralized error handling with custom error responses
- **Development**: Hot module replacement via Vite integration in development mode

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Three main entities - fire detections, weather data, and emergency notifications
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Development Storage**: In-memory storage implementation for development/testing
- **Connection**: Neon serverless PostgreSQL for cloud database hosting

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple) configured but not actively used
- **Security**: Basic request validation using Zod schemas for input sanitization

### AI and Computer Vision Integration
- **Fire Detection**: Mock AI system simulating computer vision analysis of uploaded images
- **Risk Assessment**: Multi-factor risk calculation based on weather conditions (temperature, humidity, wind speed)
- **Fire Spread Prediction**: Algorithmic fire spread modeling using weather data and geographic coordinates
- **System Status Monitoring**: Real-time status tracking of external AI systems (FireSat, ECMWF, NOAA, USC)

### Weather Data Integration
- **Weather API**: Integration endpoints for fetching real-time weather data by coordinates
- **Risk Calculation**: Automated fire risk level determination (EXTREME, HIGH, MODERATE, LOW) based on environmental conditions
- **Data Persistence**: Weather data storage with timestamps for historical analysis

### Emergency Notification System
- **Multi-Agency Alerts**: Automatic notification system for 8+ emergency agencies including Ministry of Home Affairs, NDMA, NDRF
- **Notification Tracking**: Status monitoring (SENT, DELIVERED, FAILED) for each agency notification
- **Real-time Updates**: Live status updates for emergency response coordination

### Real-time Features
- **Live Data Updates**: Automatic refresh intervals for system status, weather data, and fire detections
- **Progress Tracking**: Real-time progress indicators for AI processing and file uploads
- **Status Monitoring**: Live system health monitoring for all integrated AI services

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

### AI and Machine Learning Services
- **Google FireSat Constellation**: Satellite-based fire detection system integration
- **ECMWF AI Forecasting**: European weather prediction model integration  
- **NOAA Next-Gen Fire System**: Real-time fire monitoring system
- **USC cWGAN Fire Prediction**: Fire spread modeling and prediction system

### UI and Design System
- **Radix UI**: Headless component primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Shadcn/ui**: Pre-built component library combining Radix and Tailwind

### Development and Build Tools
- **Vite**: Fast build tool and development server with HMR support
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### File Handling and Validation
- **Multer**: Multipart form data handling for image uploads
- **Zod**: TypeScript-first schema validation for API endpoints
- **React Hook Form**: Form state management with validation resolvers

### Utility Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: URL-safe unique ID generation
- **Class Variance Authority**: Utility for managing component variants
- **CLSX & Tailwind Merge**: Conditional CSS class name utilities