# Super Admin App

Complete user management system with roles, audit logging, and analytics.

## Setup (Windows)

### 1. Install & Configure

```cmd
git clone https://github.com/AdityaMaddila/super-admin-app-2.git
cd super-admin-app-2
npm install
```

Create `.env` file:
```cmd
echo DB_HOST=localhost > .env
echo DB_USER=your_db_user >> .env
echo DB_PASSWORD=your_db_password >> .env
echo DB_NAME=superadmin_db >> .env
echo JWT_SECRET=super-secret-jwt-key-minimum-32-characters-long >> .env
echo PORT=3000 >> .env
```

### 2. Setup Frontend

```cmd
cd client
npm install
cd ..
```

### 3. Initialize Database

```cmd
npm run seed
```

This creates tables and adds superadmin user.

### 4. Start Application

Backend:
```cmd
npm start
```

Frontend (new terminal):
```cmd
cd client
npm start
```

## Login

Go to http://localhost:5173

- Email: `superadmin@example.com`
- Password: `Test1234!`

## Required Scripts (add to package.json)

```json
{
  "scripts": {
    "start": "node src/server.js",
    "seed": "node scripts/seed.js",
    "test": "jest"
  }
}
```

## Troubleshooting

**Database errors:** Update .env with correct database credentials

**Port conflicts:** Change PORT in .env

**Module errors:** Run `npm install` in both root and client folders

**Seed fails:** Check your database connection and credentials

## API Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import" button
3. Select `postman-collection.json` file
4. Collection will appear in your sidebar

### Test the APIs
1. **First, run "Login" request**
   - This automatically saves your auth token
2. **Then test any other endpoints**
   - Token is automatically added to requests

### Available Tests
- User CRUD operations
- Role management
- Audit log viewing
- Analytics data

## Unit Testing

```cmd
npm test
```

## Features

- User CRUD operations
- Role management and assignment
- Activity audit logging
- Basic analytics dashboard
- JWT authentication
- Responsive React UI
