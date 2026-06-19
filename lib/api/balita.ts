import { ApiResponse, Balita } from '../types';
import { mockBalita } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError, generateId, getCurrentDate,
  getFromStorage, setToStorage 
} from '../utils';

const STORAGE_KEY = 'balita_data';

const getBalitaData = (): Balita[] => {
  const stored = getFromStorage<Balita[]>(STORAGE_KEY);
  
  // If no data in storage, initialize with mock data
  if (!stored) {
    saveBalitaData(mockBalita);
    return mockBalita;
  }
  
  return stored;
};

const saveBalitaData = (data: Balita[]): void => {
  setToStorage(STORAGE_KEY, data);
};

export const balitaApi = {
  // Force reload mock data to ensure latest data is loaded
  init() {
    saveBalitaData(mockBalita);
  },

  async getAll(): Promise<ApiResponse<Balita[]>> {
    // Ensure data is initialized
    this.init();
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Failed to fetch data',
        error: 'Gagal memuat data balita'
      };
    }
    
    const data = getBalitaData();
    
    return {
      success: true,
      data,
      message: `${data.length} data balita ditemukan`
    };
  },

  async getById(id: string): Promise<ApiResponse<Balita>> {
    // Ensure data is initialized
    this.init();
    
    await delay(300);
    
    const data = getBalitaData();
    const balita = data.find(b => b.id === id);
    
    if (!balita) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data balita tidak ditemukan'
      };
    }
    
    return {
      success: true,
      data: balita,
      message: 'Data balita ditemukan'
    };
  },

  async create(balitaData: Omit<Balita, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Balita>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Create failed',
        error: 'Gagal menambah data balita'
      };
    }

    const data = getBalitaData();
    
    // Check duplicate NIK
    const existingNik = data.find(b => b.nik === balitaData.nik);
    if (existingNik) {
      return {
        success: false,
        message: 'Duplicate NIK',
        error: 'NIK sudah terdaftar'
      };
    }
    
    const newBalita: Balita = {
      ...balitaData,
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    const updatedData = [...data, newBalita];
    saveBalitaData(updatedData);
    
    return {
      success: true,
      data: newBalita,
      message: 'Data balita berhasil ditambahkan'
    };
  },

  async update(id: string, balitaData: Partial<Balita>): Promise<ApiResponse<Balita>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Gagal memperbarui data balita'
      };
    }

    const data = getBalitaData();
    const index = data.findIndex(b => b.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data balita tidak ditemukan'
      };
    }

    // Check duplicate NIK if NIK is being updated
    if (balitaData.nik && balitaData.nik !== data[index].nik) {
      const existingNik = data.find(b => b.nik === balitaData.nik && b.id !== id);
      if (existingNik) {
        return {
          success: false,
          message: 'Duplicate NIK',
          error: 'NIK sudah terdaftar'
        };
      }
    }
    
    const updatedBalita = {
      ...data[index],
      ...balitaData,
      updatedAt: getCurrentDate()
    };
    
    data[index] = updatedBalita;
    saveBalitaData(data);
    
    return {
      success: true,
      data: updatedBalita,
      message: 'Data balita berhasil diperbarui'
    };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Delete failed',
        error: 'Gagal menghapus data balita'
      };
    }

    const data = getBalitaData();
    const index = data.findIndex(b => b.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data balita tidak ditemukan'
      };
    }
    
    data.splice(index, 1);
    saveBalitaData(data);
    
    return {
      success: true,
      data: null,
      message: 'Data balita berhasil dihapus'
    };
  },

  async search(query: string): Promise<ApiResponse<Balita[]>> {
    await delay(400);
    
    const data = getBalitaData();
    const filtered = data.filter(balita => 
      balita.name.toLowerCase().includes(query.toLowerCase()) ||
      balita.nik.includes(query) ||
      balita.parentName.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      data: filtered,
      message: `${filtered.length} hasil pencarian ditemukan`
    };
  }
};