# CivicPulse

CivicPulse is an Angular and Spring Boot civic complaint application with public statistics, citizen accounts, and an admin review dashboard.

## Requirements

- Java 21 or newer
- MySQL with a `civicpulse_db` database. Set `DB_USERNAME` and `DB_PASSWORD` in the backend environment before starting it.
- Node.js and npm
- Git Bash on Windows for the Maven wrapper in this workspace

## Create a local admin account

Admin accounts cannot be registered from the public registration page. On the first backend start, set `CIVICPULSE_ADMIN_EMAIL` and `CIVICPULSE_ADMIN_PASSWORD` in the backend terminal. Use a password with at least 12 characters. The password is stored as a BCrypt hash. If the configured email already belongs to a citizen account, startup stops rather than promoting that account. The bootstrap does not reset the password of an existing admin.

Example in PowerShell (the secure prompt avoids echoing the password):

```powershell
$env:CIVICPULSE_ADMIN_EMAIL = "admin@civicpulse.local"
$securePassword = Read-Host "New admin password (12+ characters)" -AsSecureString
$env:CIVICPULSE_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
```

Set `CIVICPULSE_JWT_SECRET` to a stable random value of at least 32 characters when you want existing tokens to remain verifiable after restarting the backend. If it is unset, CivicPulse generates a temporary random key for local development, and tokens expire when the process restarts.

## Start the applications

Start MySQL first. Open two terminals from the project folder.

Backend (PowerShell):

```powershell
cd A:\Prep\MyProjects\CivicPulse\backend
bash.exe -lc './mvnw spring-boot:run'
```

Frontend (PowerShell):

```powershell
cd A:\Prep\MyProjects\CivicPulse\frontend
npm.cmd start
```

Open `http://localhost:4200`. Stop any older backend using port 8080 before launching this version.

## Roles and API behavior

- Public visitors can see aggregate statistics and register or log in.
- Registration always creates a `CITIZEN`; client-supplied roles are ignored.
- Citizens can access only their own complaints. They can edit or delete them only while `PENDING`.
- Admins can view all complaints, filter/search them in the dashboard, change status, and delete complaints.
- Complaint ownership and status changes are checked by the backend. Angular route guards are for navigation only.
- Passwords are BCrypt-encoded. Login returns a short-lived JWT; Angular sends it as a Bearer token.

## Database changes

Hibernate's existing `ddl-auto=update` adds a `civic_users` table and nullable `citizen_id` and `submitted_at` columns to `complaints`. Existing complaint rows are preserved and remain available to admins as legacy records; they have no citizen owner and cannot be edited by citizen accounts. No schema reset or record deletion is used.

## Quick start

1. Create a MySQL database named `civicpulse_db`.
2. Set `DB_USERNAME` and `DB_PASSWORD` in the environment used to run the backend.
3. Start the backend and frontend using the commands above.
4. Register a citizen account, or configure the admin bootstrap variables to create an admin account.

## Configuration and secrets

Keep database credentials, admin credentials, and JWT secrets in environment variables or a local `.env` file. Do not commit real credentials. The root `.gitignore` excludes environment files, local build output, dependencies, logs, and database exports.

## Tech stack

- Angular and TypeScript frontend
- Java 21+, Spring Boot, and Maven backend
- MySQL database
- JWT authentication with role-based authorization
