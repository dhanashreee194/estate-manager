# Estate Manager - Knowledge Transfer Document

## Project Overview

Estate Manager is a full-stack property/project management application with a React + Vite frontend and a NestJS backend. It supports company-level and project-level operations for real estate and construction management.

## Core Technologies

- Frontend: React, TypeScript, Vite, React Router, Redux Toolkit, React Query, Recharts
- Backend: NestJS, TypeScript, Prisma, PostgreSQL/MySQL-compatible ORM
- Authentication: JWT-based login/signup with protected routes
- Export utilities: CSV, JSON, Excel-compatible exports, PDF generation

## Authentication

- Login page
- Signup page
- Protected dashboard routes
- Token storage and user session management

## Dashboard Features

- Admin dashboard overview page
- Company inventory overview
- Company reports page
- Comprehensive reports page
- Lead Kanban board for company leads
- User management page

## Project Management

- Project list page
- Project dashboard
- Project overview and analytics
- Project units management
- Project leads management
- Project reports
- Project expenses management

## Inventory Management

- Company inventory dashboard
- Project inventory sub-sections:
  - Stock
  - Inward
  - Outward
  - Requirements
- Inventory analytics and reporting

## Labour Management

- Project labour management page
- Backend module for labour data

## Leads & Sales

- Company-level Kanban lead board
- Project-level lead pages
- Lead data management and status tracking

## Bookings & Payments

- Booking page and booking management
- Booking payment modal
- Payment and installments backend modules
- Customer and booking lifecycle support

## Expenses & Budget

- Project expenses tracking
- Budget module for cost control
- Expense module for recording materials and labour

## Reporting & Analytics

- Dashboard overview analytics
- Company reports
- Comprehensive reports across projects
- Project financial reporting
- Export-friendly data utilities for reports

## Backend Modules

The backend project includes the following functional modules:

- Auth
- Project
- Inventory
- Labour
- Expense
- Unit / Building / Wing
- Customer
- Booking
- Payment
- Dashboard
- Ledger
- Budget
- Daily reports
- Task
- Lead
- Company reports
- Installments
- Prisma ORM integration

## API & Data Flow

- Frontend API client layer under `frontend/src/api/`
- Authentication API under `frontend/src/auth/`
- Unit and project endpoints exposed through backend modules
- Export utilities under `frontend/src/utils/exportUtils.ts`

## Notable Frontend Pages

- `frontend/src/router/AppRouter.tsx` defines main app routes
- `frontend/src/auth/Login.tsx` and `frontend/src/auth/Signup.tsx`
- `frontend/src/pages/bookings/BookingsPage.tsx`
- `frontend/src/pages/leads/LeadKanban.tsx`
- `frontend/src/pages/projects/ProjectDashboard.tsx`
- `frontend/src/pages/inventory/CompanyInventory.tsx`
- `frontend/src/pages/projects/Overview/ProjectOverview.tsx`
- `frontend/src/pages/projects/units/ProjectUnits.tsx`

## Working with the Codebase

- Backend entrypoint: `backend/estate-manager-api/src/main.ts`
- NestJS module registry: `backend/estate-manager-api/src/app.module.ts`
- Frontend app entrypoint: `frontend/src/App.tsx`
- Routing: `frontend/src/router/AppRouter.tsx`
- Store configuration: `frontend/src/store/store.ts`

## Build & Run Commands

### Frontend

- `yarn dev` to run Vite dev server
- `yarn build` to build frontend
- `yarn lint` for frontend linting

### Backend

- `yarn start:dev` to run NestJS in watch mode
- `yarn build` to compile backend
- `yarn test` to run Jest tests
- `yarn lint` to lint backend code

## Summary

The project delivers a comprehensive estate/project management experience with:

- user authentication and role-protected dashboard access
- project lifecycle management
- inventory, labour, and expense tracking
- lead follow-up and booking workflows
- analytics, company reports, and exports
- modular backend architecture for extensibility
