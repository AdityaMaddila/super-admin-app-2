# Architecture Documentation

## System Overview

This Super Admin application follows a traditional 3-tier architecture with a React frontend, Express.js backend, and SQL database.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   SQL Database  │
│   (Port 5173)   │    │   (Port 3001)   │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Backend Architecture

### Core Components

**Models (Sequelize ORM)**
- `User` - System users with authentication
- `Role` - Permission groups
- `AuditLog` - Activity tracking
- `UserRole` - Many-to-many junction table

**Routes Structure**
```
/api/v1/
├── auth/
│   └── login               # JWT authentication
└── superadmin/            # Protected admin routes
    ├── users/             # User CRUD
    ├── roles/             # Role management
    ├── audit-logs/        # Activity logs
    └── analytics/         # System metrics
```

**Middleware Stack**
1. Express JSON parser
2. CORS handler
3. JWT authentication (`requireAuth`)
4. Role validation (`requireSuperAdmin`)
5. Route handlers
6. Error handling

### Authentication Flow

```
Login Request → Validate Credentials → Generate JWT → Return Token
                                           ↓
Protected Request → Extract JWT → Verify Token → Check Role → Allow/Deny
```

### Database Schema

**Relationships:**
- User ↔ Role (Many-to-Many via UserRole)
- AuditLog → User (Many-to-One, actor relationship)

**Key Fields:**
```sql
Users: id, name, email, hashedPassword, lastLogin, timestamps
Roles: id, name, permissions (JSON array), timestamps  
AuditLogs: id, actorUserId, action, targetType, targetId, details (JSON), timestamp
UserRoles: userId, roleId (junction table)
```

## Frontend Architecture

### Component Structure

```
App
├── Login Component
└── Dashboard Component
    ├── Analytics Tab
    ├── Users Tab (with modals)
    │   ├── CreateUser Modal
    │   ├── EditUser Modal
    │   └── UserDetail Modal
    └── AuditLogs Tab
```

### State Management

Uses React hooks for state management:
- `useState` for component state
- `useEffect` for data fetching
- No external state management library

### API Integration

Single API service layer (`services/api.js`) with:
- Axios HTTP client
- JWT token injection
- Error handling
- RESTful endpoint mapping

## Security Architecture

### Authentication & Authorization

**JWT Implementation:**
- RS256 algorithm (or HS256 with shared secret)
- Token includes user ID and role
- Middleware validates on every protected request

**Role-Based Access Control:**
- Only `superadmin` role can access admin endpoints
- Role checking happens at middleware level
- Frontend hides/shows UI based on roles

### Data Protection

**Password Security:**
- bcrypt hashing with salt rounds
- Never store plain text passwords
- No password return in API responses

**Input Validation:**
- Email format validation
- Required field validation
- SQL injection protection via ORM

### Audit Trail

**Comprehensive Logging:**
- All CRUD operations logged
- Actor identification (who did what)
- Timestamp and details tracking
- Immutable log entries

## Technology Choices

### Backend Stack Rationale

**Express.js:** Mature, well-documented, extensive middleware ecosystem

**Sequelize ORM:** 
- SQL database abstraction
- Migration support
- Model relationships
- Query builder with SQL injection protection

**JWT Authentication:**
- Stateless authentication
- Scalable across multiple servers
- Standard industry practice

### Frontend Stack Rationale

**React:**
- Component-based architecture
- Large ecosystem and community
- Efficient virtual DOM
- Hooks for state management

**Tailwind CSS:**
- Utility-first approach
- Consistent design system
- Small bundle size
- Rapid development

## Data Flow

### User Creation Flow
```
Frontend Form → API Request → Input Validation → Password Hashing → 
Database Insert → Role Assignment → Audit Log → Response → UI Update
```

### User Update Flow
```
Edit Modal → API Request → User Lookup → Update Fields → 
Role Sync → Audit Log → Response → UI Refresh
```

## Scalability Considerations

### Current Limitations
- Single server deployment
- In-memory session storage
- No caching layer
- Direct database queries

### Future Improvements
- Redis for session storage
- Database connection pooling
- API rate limiting
- Horizontal scaling with load balancer
- Database indexing optimization

## Error Handling

### Backend Error Strategy
- Try-catch blocks in all async operations
- Specific error messages for different failure types
- HTTP status codes following REST conventions
- Error logging for debugging

### Frontend Error Strategy  
- Alert dialogs for user-facing errors
- Console logging for development
- Graceful fallbacks for failed requests
- Loading states during async operations

## Testing Strategy

### Unit Tests
- API endpoint testing with Supertest
- Model validation testing
- Authentication middleware testing
- Database operation testing

### Integration Tests
- End-to-end user workflows
- Role assignment flows
- Audit log generation
- Authentication flows

## Deployment Considerations

### Environment Variables
- Database credentials
- JWT secrets
- Port configurations
- Environment-specific settings

### Database Migration
- Sequelize migrations for schema changes
- Seed scripts for initial data
- Backup strategies for production

### Security Hardening
- Environment variable validation
- CORS configuration
- Rate limiting implementation
- HTTPS enforcement in production
