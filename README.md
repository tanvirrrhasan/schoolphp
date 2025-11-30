# School Management System

A comprehensive school management system built with Next.js, PHP, and MySQL.

## Features

- **Student Management** - Manage student records, classes, and admissions
- **Teacher Management** - Teacher profiles and information
- **Support Staff** - Support staff management
- **Notices & Posts** - Publish notices and blog posts
- **Results** - Exam results management
- **Routines** - Class and exam routines
- **Gallery** - Image gallery
- **Alumni** - Alumni directory
- **Committee** - Management committee
- **Pages** - Custom web pages
- **Admin Panel** - Full admin dashboard

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** PHP 7.4+, MySQL
- **Build:** Static Export (for hosting)

## Quick Start

### Prerequisites

- Node.js 18+
- XAMPP (Apache + MySQL)
- PHP 7.4+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   - Start XAMPP (Apache + MySQL)
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Import `database/schema.sql`
   - Import `database/demo_data.sql` (optional, for demo data)

4. **Configure API**
   - Edit `api/config.php` with your database credentials
   - Update `BASE_URL` in `api/config.php`

5. **Environment Variables**
   - Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost/school-management/api
   ```

6. **Development**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000`

7. **Production Build**
   ```bash
   npm run build
   ```
   The `out/` folder contains all static files ready for hosting.

## Project Structure

```
school-management/
├── api/                 # PHP API endpoints
│   ├── config.php      # Database configuration
│   ├── crud.php        # CRUD operations
│   ├── auth.php        # Authentication
│   └── upload.php      # File uploads
├── app/                # Next.js app directory
├── components/         # React components
├── database/           # SQL files
│   ├── schema.sql     # Database schema
│   └── demo_data.sql  # Demo data
├── lib/               # Library files
│   ├── api/           # API client
│   └── firebase/      # Firebase compatibility layer
└── out/               # Build output (after npm run build)
```

## Default Login

- **Email:** admin@school.com
- **Password:** admin123

## Documentation

For detailed setup instructions in Bengali, see [XAMPP_SETUP_GUIDE.md](./XAMPP_SETUP_GUIDE.md)

## License

MIT

