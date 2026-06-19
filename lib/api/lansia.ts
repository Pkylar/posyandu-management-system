import { ApiResponse, Lansia } from '../types';
import { mockLansia } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError, generateId, getCurrentDate,
  getFromStorage, setToStorage, calculateBMI 
} from '../utils';

const STORAGE_KEY = 'lansia_data';

const getLansiaData = (): Lansia[] => {
  return getFromStorage<Lansia[]>(STORAGE_KEY) || mockLansia;
};

const saveLansiaData = (data: Lansia[]): void => {
  setToStorage(STORAGE_KEY, data);
};

export const lansiaApi = {
  // Force reload mock data to ensure latest data is loaded
  init() {
    saveLansiaData(mockLansia);
  },

  async getAll(): Promise<ApiResponse<Lansia[]>> {
    console.log('👴 [GET] /api/lansia - Fetching all lansia data');
    
    // Ensure data is initialized
    this.init();
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [GET] /api/lansia - Simulated error');
      return {
        success: false,
        message: 'Failed to fetch data',
        error: 'Gagal memuat data lansia'
      };
    }
    
    const data = getLansiaData();
    console.log(`✅ [GET] /api/lansia - Success: ${data.length} records returned`);
    
    return {
      success: true,
      data,
      message: `${data.length} data lansia ditemukan`
    };
  },

  async getById(id: string): Promise<ApiResponse<Lansia>> {
    await delay(300);
    
    const data = getLansiaData();
    const lansia = data.find(l => l.id === id);
    
    if (!lansia) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data lansia tidak ditemukan'
      };
    }
    
    return {
      success: true,
      data: lansia,
      message: 'Data lansia ditemukan'
    };
  },

  async create(lansiaData: Omit<Lansia, 'id' | 'bmi' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Lansia>> {
    console.log('📝 [POST] /api/lansia - Creating new lansia:', lansiaData.name);
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [POST] /api/lansia - Simulated error');
      return {
        success: false,
        message: 'Create failed',
        error: 'Gagal menambah data lansia'
      };
    }

    const data = getLansiaData();
    
    // Check duplicate NIK
    const existingNik = data.find(l => l.nik === lansiaData.nik);
    if (existingNik) {
      console.log('❌ [POST] /api/lansia - Duplicate NIK:', lansiaData.nik);
      return {
        success: false,
        message: 'Duplicate NIK',
        error: 'NIK sudah terdaftar'
      };
    }
    
    // Auto-calculate BMI
    const bmi = calculateBMI(lansiaData.weight, lansiaData.height);
    
    const newLansia: Lansia = {
      ...lansiaData,
      id: generateId(),
      bmi,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    const updatedData = [...data, newLansia];
    saveLansiaData(updatedData);
    
    console.log(`✅ [POST] /api/lansia - Success: ${newLansia.name} created with ID ${newLansia.id}, BMI: ${bmi}`);
    
    return {
      success: true,
      data: newLansia,
      message: 'Data lansia berhasil ditambahkan'
    };
  },

  async update(id: string, lansiaData: Partial<Lansia>): Promise<ApiResponse<Lansia>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Gagal memperbarui data lansia'
      };
    }

    const data = getLansiaData();
    const index = data.findIndex(l => l.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data lansia tidak ditemukan'
      };
    }

    // Check duplicate NIK if NIK is being updated
    if (lansiaData.nik && lansiaData.nik !== data[index].nik) {
      const existingNik = data.find(l => l.nik === lansiaData.nik && l.id !== id);
      if (existingNik) {
        return {
          success: false,
          message: 'Duplicate NIK',
          error: 'NIK sudah terdaftar'
        };
      }
    }
    
    let updatedLansia = {
      ...data[index],
      ...lansiaData,
      updatedAt: getCurrentDate()
    };
    
    // Recalculate BMI if weight or height changed
    if (lansiaData.weight || lansiaData.height) {
      updatedLansia.bmi = calculateBMI(updatedLansia.weight, updatedLansia.height);
    }
    
    data[index] = updatedLansia;
    saveLansiaData(data);
    
    return {
      success: true,
      data: updatedLansia,
      message: 'Data lansia berhasil diperbarui'
    };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Delete failed',
        error: 'Gagal menghapus data lansia'
      };
    }

    const data = getLansiaData();
    const index = data.findIndex(l => l.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data lansia tidak ditemukan'
      };
    }
    
    data.splice(index, 1);
    saveLansiaData(data);
    
    return {
      success: true,
      data: null,
      message: 'Data lansia berhasil dihapus'
    };
  },

  async search(query: string): Promise<ApiResponse<Lansia[]>> {
    await delay(400);
    
    const data = getLansiaData();
    const filtered = data.filter(lansia => 
      lansia.name.toLowerCase().includes(query.toLowerCase()) ||
      lansia.nik.includes(query) ||
      lansia.address.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      data: filtered,
      message: `${filtered.length} hasil pencarian ditemukan`
    };
  },

  async getStats(): Promise<ApiResponse<{ total: number; sehat: number; perluPerhatian: number }>> {
    await delay(300);
    
    const data = getLansiaData();
    const stats = {
      total: data.length,
      sehat: data.filter(l => l.healthStatus === 'sehat').length,
      perluPerhatian: data.filter(l => l.healthStatus === 'perlu_perhatian').length
    };
    
    return {
      success: true,
      data: stats,
      message: 'Statistik lansia berhasil dimuat'
    };
  }
};