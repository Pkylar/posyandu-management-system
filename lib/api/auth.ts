import { ApiResponse, User } from '../types';
import { mockUsers } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError, 
  getFromStorage, setToStorage 
} from '../utils';

export const authApi = {
  async login(username: string, password: string): Promise<ApiResponse<User & { token: string }>> {
    console.log('🔐 [POST] /api/auth/login - Login attempt for username:', username);
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [POST] /api/auth/login - Simulated network error');
      return {
        success: false,
        message: 'Network error',
        error: 'Koneksi bermasalah, coba lagi'
      };
    }

    // Accept any username/password for demo
    const user = mockUsers.find(u => u.username === username) || {
      ...mockUsers[0],
      username,
      name: username.charAt(0).toUpperCase() + username.slice(1)
    };
    
    const token = `fake_token_${Date.now()}`;
    
    // Save auth state
    setToStorage('auth_user', user);
    setToStorage('auth_token', token);
    
    console.log(`✅ [POST] /api/auth/login - Success: ${user.name} logged in`);
    
    return {
      success: true,
      data: { ...user, token },
      message: 'Login berhasil'
    };
  },

  async logout(): Promise<ApiResponse<null>> {
    console.log('🚪 [POST] /api/auth/logout - User logging out');
    
    await delay(300);
    
    setToStorage('auth_user', null);
    setToStorage('auth_token', null);
    
    console.log('✅ [POST] /api/auth/logout - Success: User logged out');
    
    return {
      success: true,
      data: null,
      message: 'Logout berhasil'
    };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(200);
    
    const user = getFromStorage<User>('auth_user');
    const token = getFromStorage<string>('auth_token');
    
    if (!user || !token) {
      return {
        success: false,
        message: 'Not authenticated',
        error: 'Sesi telah berakhir'
      };
    }
    
    return {
      success: true,
      data: user,
      message: 'User data retrieved'
    };
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Gagal memperbarui profil'
      };
    }

    const currentUser = getFromStorage<User>('auth_user');
    if (!currentUser) {
      return {
        success: false,
        message: 'Not authenticated',
        error: 'Sesi telah berakhir'
      };
    }

    const updatedUser = {
      ...currentUser,
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    setToStorage('auth_user', updatedUser);
    
    return {
      success: true,
      data: updatedUser,
      message: 'Profil berhasil diperbarui'
    };
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Password change failed',
        error: 'Gagal mengubah password'
      };
    }

    // Simulate password validation (accept any for demo)
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'Password too short',
        error: 'Password minimal 6 karakter'
      };
    }
    
    return {
      success: true,
      data: null,
      message: 'Password berhasil diubah'
    };
  }
};