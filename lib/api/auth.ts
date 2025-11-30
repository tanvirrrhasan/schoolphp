// Authentication API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/school-management/api';

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  permissions?: string[];
  createdAt: Date;
}

export async function login(email: string, password: string): Promise<{ user: any; userData: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }

    return {
      user: data.user,
      userData: {
        id: data.user.id.toString(),
        email: data.user.email,
        role: data.user.role,
        createdAt: new Date(),
      },
    };
  } catch (error: any) {
    if (error.message.includes('Invalid') || error.message.includes('password')) {
      throw new Error('ইমেইল বা পাসওয়ার্ড ভুল');
    }
    throw new Error(error.message || 'লগইন ব্যর্থ হয়েছে');
  }
}

export async function logout(): Promise<void> {
  try {
    localStorage.removeItem('auth_token');
    await fetch(`${API_BASE_URL}/auth.php?action=logout`, {
      method: 'POST',
    });
  } catch (error) {
    // Ignore errors on logout
  }
}

export async function changePassword(newPassword: string): Promise<boolean> {
  // This would need a separate endpoint
  throw new Error('Password change not implemented yet');
}

export async function getCurrentUser(): Promise<any> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=check`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token, // Use custom header instead of Authorization
      },
    });

    if (!response.ok) {
      localStorage.removeItem('auth_token');
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    localStorage.removeItem('auth_token');
    return null;
  }
}

export async function getUserData(uid: string): Promise<User | null> {
  try {
    // This would need a separate endpoint or use the check endpoint
    const user = await getCurrentUser();
    if (user && user.id.toString() === uid) {
      return {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        createdAt: new Date(),
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

