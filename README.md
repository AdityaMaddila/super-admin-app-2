# Super Admin Backend & UI

A complete Super Admin system with user management, role-based access control, audit logging, and analytics.

## Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL/MySQL database
- npm or yarn

### Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd super-admin-project
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=superadmin_db
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
```

3. **Database setup:**
```bash
# Create database and run migrations
npm run db:setup

# Seed superadmin user
npm run seed
```

4. **Start the application:**
```bash
# Backend
npm start

# Frontend (separate terminal)
cd client
npm start
```

### Default Credentials
- **Email:** `superadmin@example.com`
- **Password:** `Test1234!`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with email/password

### Users Management
- `GET /api/v1/superadmin/users` - List users (pagination, search)
- `GET /api/v1/superadmin/users/:id` - Get user details
- `POST /api/v1/superadmin/users` - Create new user
- `PUT /api/v1/superadmin/users/:id` - Update user
- `DELETE /api/v1/superadmin/users/:id` - Delete user

### Roles Management  
- `GET /api/v1/superadmin/roles` - List all roles
- `POST /api/v1/superadmin/roles` - Create new role
- `PUT /api/v1/superadmin/roles/:id` - Update role
- `POST /api/v1/superadmin/assign-role` - Assign role to user

### Audit & Analytics
- `GET /api/v1/superadmin/audit-logs` - Get audit logs (filterable)
- `GET /api/v1/superadmin/analytics/summary` - Basic analytics

## Scripts

```bash
npm start          # Start backend server
npm test           # Run unit tests  
npm run seed       # Seed database with superadmin user
npm run db:setup   # Setup database (run migrations)
```

## Project Structure

```
├── src/
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Helper utilities
│   └── app.js          # Express app setup
├── client/             # React frontend
├── scripts/            # Database seeds
├── tests/              # Unit tests
└── postman/            # Postman collection
```

## Frontend Features

- **Dashboard:** Analytics overview with user/role counts
- **User Management:** Create, edit, delete, and view user details
- **Role Management:** Assign/remove roles from users
- **Audit Logs:** Track all system activities
- **Responsive Design:** Works on desktop and mobile

## Testing

The project includes unit tests for core functionality:

```bash
npm test
```

Import `postman-collection.json` into Postman for API testing.

## Database Schema

**Users:** `id, name, email, hashedPassword, lastLogin, createdAt, updatedAt`  
**Roles:** `id, name, permissions[], createdAt`  
**AuditLogs:** `id, actorUserId, action, targetType, targetId, details, createdAt`

## Security Features

- JWT authentication with role-based access control
- Password hashing with bcrypt
- Audit logging for all admin actions
- Input validation and sanitization