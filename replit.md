# Manuchar Peru Corporate Volunteering Platform

## Overview

This is a full-stack web platform for Manuchar Peru's corporate volunteering program. The platform enables comprehensive management of corporate volunteering activities, including user management via Excel upload, AI-powered activity matching, training modules, gamification features, and certificate generation. The system supports different types of activities: ONG volunteering, Labs, Micro-missions, and training modules.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS with custom Manuchar brand colors
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Supabase Auth for user management
- **File Processing**: Multer for file uploads, XLSX for Excel processing
- **AI Integration**: OpenAI GPT-4o for activity recommendations

### Data Flow
1. **User Creation**: Admins upload Excel files → Server processes and creates Supabase Auth users → Credentials sent via email
2. **Onboarding**: New users complete profile setup → AI matching data collected → User preferences stored
3. **Activity Matching**: AI analyzes user profile → Generates personalized recommendations → Users can participate in activities
4. **Progress Tracking**: Activities completed → Points and badges awarded → Certificates generated → Analytics updated

## Key Components

### User Management System
- Role-based access control (admin/employee)
- Bulk user creation via Excel upload with validation
- Automated credential distribution via email/SMS
- Mandatory onboarding flow with personality tests (Gallup Strengths, Eysenck)

### Activity Management
- **ONG Volunteering**: External partnerships with NGOs, AI-powered matching
- **Labs**: Short internal research/survey activities (0.5-2 hours)
- **Micro-missions**: Longer community service projects (2-8 hours)
- **Training Modules**: Internal leadership development courses

### AI Recommendation Engine
- Analyzes user personality traits, interests, availability, and past activities
- Generates personalized activity recommendations with scoring and reasoning
- Considers practical constraints (location, schedule, team size)

### Gamification System
- Points-based progression system
- Badge achievements for milestones
- Level progression (Voluntario Novato → Líder Social)
- SDG (Sustainable Development Goals) tracking

### Certificate Generation
- Quarterly POAP (Proof of Attendance Protocol) certificates
- PDF certificates with digital signatures
- Activity completion certificates
- Integration-ready for blockchain verification

## External Dependencies

### Authentication & Database
- **Supabase**: User authentication and authorization
- **Neon**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect

### AI & Processing
- **OpenAI API**: GPT-4o model for activity recommendations and matching
- **XLSX Library**: Excel file parsing and validation
- **Nodemailer**: Email delivery for user credentials

### UI & Development
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **TanStack Query**: Server state management and caching
- **Replit Integrations**: Development environment plugins

## Deployment Strategy

### Development Environment
- Vite dev server with HMR (Hot Module Replacement)
- TypeScript compilation with strict mode
- ESLint and path mapping for clean imports
- Replit-specific development tooling integration

### Production Build
- **Frontend**: Vite build → Static assets in `dist/public`
- **Backend**: ESBuild bundle → Node.js server in `dist/index.js`
- **Database**: Drizzle migrations applied via `drizzle-kit push`
- **Environment**: All sensitive keys via environment variables

### Database Schema
- Users table with Supabase integration and extended profile data
- Organizations table for NGO partnerships
- Activities table with type-specific metadata
- Participations table for tracking user engagement
- Gamification tables (badges, certificates, training progress)
- AI matching data for recommendation optimization

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 30, 2025. Initial setup