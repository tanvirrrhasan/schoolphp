# Login সমস্যা সমাধান (Troubleshooting)

## সমস্যা: Admin Panel-এ Login করা যাচ্ছে না

### ধাপ ১: API Test Script Run করুন

1. Browser-এ যান:
   ```
   http://localhost/school-management/api/test_auth.php
   ```
   (অথবা আপনার XAMPP folder path অনুযায়ী)

2. Script সব test করবে এবং সমস্যা দেখাবে

### ধাপ ২: Password Reset করুন

1. Browser-এ যান:
   ```
   http://localhost/school-management/api/reset_password.php
   ```

2. Script password reset করবে

3. Login করুন:
   - Email: `admin@school.com`
   - Password: `admin123`

### ধাপ ৩: API URL Check করুন

**সমস্যা:** Project folder name এবং API URL match করছে না

**সমাধান:**

1. আপনার project folder path check করুন:
   - যদি: `C:\xampp\htdocs\school with php`
   - তাহলে API URL হবে: `http://localhost/school%20with%20php/api`
   - অথবা folder rename করুন: `school-management`

2. `.env.local` file তৈরি করুন (project root-এ):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost/school-management/api
   ```
   (আপনার folder name অনুযায়ী change করুন)

3. `api/config.php` file-এ BASE_URL check করুন:
   ```php
   define('BASE_URL', 'http://localhost/school-management/api/uploads/');
   ```
   (আপনার folder name অনুযায়ী change করুন)

4. `lib/api/auth.ts` এবং `lib/api/client.ts` file-এ default URL check করুন:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/school-management/api';
   ```

### ধাপ ৪: Browser Console Check করুন

1. Browser-এ F12 press করুন (Developer Tools)
2. Console tab-এ যান
3. Login করার সময় error message দেখুন
4. Network tab-এ API request check করুন:
   - Request URL সঠিক আছে কিনা
   - Response কি আসছে
   - Status code কি (200, 401, 404, etc.)

### ধাপ ৫: XAMPP Check করুন

1. XAMPP Control Panel-এ:
   - ✅ Apache running আছে কিনা
   - ✅ MySQL running আছে কিনা

2. phpMyAdmin-এ:
   - Database `school_management` আছে কিনা
   - `users` table-এ data আছে কিনা
   - Password hash সঠিক আছে কিনা

### ধাপ ৬: CORS Issue Check করুন

Browser console-এ CORS error দেখলে:

1. `api/config.php` file-এ CORS headers check করুন:
   ```php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

### ধাপ ৭: Database Password Check করুন

phpMyAdmin-এ SQL query run করুন:

```sql
SELECT id, email, role, 
       SUBSTRING(password, 1, 20) as password_hash_preview
FROM users 
WHERE email = 'admin@school.com';
```

Password hash দেখুন এবং `reset_password.php` script run করুন।

### ধাপ ৮: Manual SQL Update করুন

phpMyAdmin-এ এই query run করুন:

```sql
USE school_management;

UPDATE users 
SET password = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
WHERE email = 'admin@school.com';
```

এই hash-টি `admin123` password-এর জন্য।

### Common Errors এবং Solutions

#### Error 1: "Invalid email or password"
- **কারণ:** Password hash match করছে না
- **সমাধান:** `reset_password.php` run করুন

#### Error 2: "Network Error" বা "Failed to fetch"
- **কারণ:** API URL সঠিক নেই বা Apache running নেই
- **সমাধান:** 
  - XAMPP Apache check করুন
  - API URL check করুন
  - Browser-এ `http://localhost/school-management/api/test_auth.php` open করুন

#### Error 3: "404 Not Found"
- **কারণ:** API path সঠিক নেই
- **সমাধান:** Project folder name এবং API URL match করুন

#### Error 4: "CORS policy"
- **কারণ:** CORS headers সঠিক নেই
- **সমাধান:** `api/config.php` file-এ CORS headers check করুন

### Quick Fix Checklist

- [ ] XAMPP Apache running আছে
- [ ] XAMPP MySQL running আছে
- [ ] Database `school_management` আছে
- [ ] `users` table-এ data আছে
- [ ] `reset_password.php` run করেছেন
- [ ] API URL project folder name-এর সাথে match করছে
- [ ] `.env.local` file তৈরি করেছেন
- [ ] Browser console-এ error check করেছেন
- [ ] Network tab-এ API request check করেছেন

### Still Not Working?

1. Browser console-এর exact error message share করুন
2. Network tab-এর API request details share করুন
3. `test_auth.php` script-এর output share করুন

