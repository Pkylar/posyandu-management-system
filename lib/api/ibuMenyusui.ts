import { ApiResponse, IbuMenyusui } from '../types';
import { mockIbuMenyusui } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError, generateId, getCurrentDate,
  getFromStorage, setToStorage 
} from '../utils';

const STORAGE_KEY = 'ibu_menyusui_data';

const getIbuMenyusuiData = (): IbuMenyusui[] => {
  return getFromStorage<IbuMenyusui[]>(STORAGE_KEY) || mockIbuMenyusui;
};

const saveIbuMenyusuiData = (data: IbuMenyusui[]): void => {
  setToStorage(STORAGE_KEY, data);
};

export const ibuMenyusuiApi = {
  // Only load mock data if storage is empty
  init() {
    const existing = getFromStorage<IbuMenyusui[]>(STORAGE_KEY);
    if (!existing || existing.length === 0) {
      saveIbuMenyusuiData(mockIbuMenyusui);
    }
  },

  async getAll(): Promise<ApiResponse<IbuMenyusui[]>> {
    console.log('🤱 [GET] /api/ibu-menyusui - Fetching all ibu menyusui data');
    
    // Ensure data is initialized
    this.init();
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [GET] /api/ibu-menyusui - Simulated error');
      return {
        success: false,
        message: 'Failed to fetch data',
        error: 'Gagal memuat data ibu menyusui'
      };
    }
    
    const data = getIbuMenyusuiData();
    console.log(`✅ [GET] /api/ibu-menyusui - Success: ${data.length} records returned`);
    
    return {
      success: true,
      data,
      message: `${data.length} data ibu menyusui ditemukan`
    };
  },

  async getById(id: string): Promise<ApiResponse<IbuMenyusui>> {
    await delay(300);
    
    const data = getIbuMenyusuiData();
    const ibu = data.find(i => i.id === id);
    
    if (!ibu) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data ibu menyusui tidak ditemukan'
      };
    }
    
    return {
      success: true,
      data: ibu,
      message: 'Data ibu menyusui ditemukan'
    };
  },

  async create(ibuData: Omit<IbuMenyusui, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<IbuMenyusui>> {
    console.log('📝 [POST] /api/ibu-menyusui - Creating new ibu menyusui:', ibuData.name);
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [POST] /api/ibu-menyusui - Simulated error');
      return {
        success: false,
        message: 'Create failed',
        error: 'Gagal menambah data ibu menyusui'
      };
    }

    const data = getIbuMenyusuiData();
    
    // Check duplicate NIK
    const existingNik = data.find(i => i.nik === ibuData.nik);
    if (existingNik) {
      console.log('❌ [POST] /api/ibu-menyusui - Duplicate NIK:', ibuData.nik);
      return {
        success: false,
        message: 'Duplicate NIK',
        error: 'NIK sudah terdaftar'
      };
    }
    
    const newIbu: IbuMenyusui = {
      ...ibuData,
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    const updatedData = [...data, newIbu];
    saveIbuMenyusuiData(updatedData);
    
    console.log(`✅ [POST] /api/ibu-menyusui - Success: ${newIbu.name} created with ID ${newIbu.id}`);
    
    return {
      success: true,
      data: newIbu,
      message: 'Data ibu menyusui berhasil ditambahkan'
    };
  },

  async update(id: string, ibuData: Partial<IbuMenyusui>): Promise<ApiResponse<IbuMenyusui>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Gagal memperbarui data ibu menyusui'
      };
    }

    const data = getIbuMenyusuiData();
    const index = data.findIndex(i => i.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data ibu menyusui tidak ditemukan'
      };
    }

    // Check duplicate NIK if NIK is being updated
    if (ibuData.nik && ibuData.nik !== data[index].nik) {
      const existingNik = data.find(i => i.nik === ibuData.nik && i.id !== id);
      if (existingNik) {
        return {
          success: false,
          message: 'Duplicate NIK',
          error: 'NIK sudah terdaftar'
        };
      }
    }
    
    const updatedIbu = {
      ...data[index],
      ...ibuData,
      updatedAt: getCurrentDate()
    };
    
    data[index] = updatedIbu;
    saveIbuMenyusuiData(data);
    
    return {
      success: true,
      data: updatedIbu,
      message: 'Data ibu menyusui berhasil diperbarui'
    };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Delete failed',
        error: 'Gagal menghapus data ibu menyusui'
      };
    }

    const data = getIbuMenyusuiData();
    const index = data.findIndex(i => i.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data ibu menyusui tidak ditemukan'
      };
    }
    
    data.splice(index, 1);
    saveIbuMenyusuiData(data);
    
    return {
      success: true,
      data: null,
      message: 'Data ibu menyusui berhasil dihapus'
    };
  },

  async search(query: string): Promise<ApiResponse<IbuMenyusui[]>> {
    await delay(400);
    
    const data = getIbuMenyusuiData();
    const filtered = data.filter(ibu => 
      ibu.name.toLowerCase().includes(query.toLowerCase()) ||
      ibu.nik.includes(query) ||
      ibu.address.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      data: filtered,
      message: `${filtered.length} hasil pencarian ditemukan`
    };
  },

  async getStats(): Promise<ApiResponse<{ total: number; eksklusif: number; perluPerhatian: number }>> {
    await delay(300);
    
    const data = getIbuMenyusuiData();
    const stats = {
      total: data.length,
      eksklusif: data.filter(i => i.breastfeedingStatus === 'eksklusif').length,
      perluPerhatian: data.filter(i => i.healthStatus === 'perlu_perhatian').length
    };
    
    return {
      success: true,
      data: stats,
      message: 'Statistik ibu menyusui berhasil dimuat'
    };
  }
};