import { ApiResponse, VitaminVaksin } from '../types';
import { mockVitaminVaksin } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError, generateId, getCurrentDate,
  getFromStorage, setToStorage 
} from '../utils';

const STORAGE_KEY = 'vitamin_vaksin_data';

const getVitaminVaksinData = (): VitaminVaksin[] => {
  return getFromStorage<VitaminVaksin[]>(STORAGE_KEY) || mockVitaminVaksin;
};

const saveVitaminVaksinData = (data: VitaminVaksin[]): void => {
  setToStorage(STORAGE_KEY, data);
};

export const vitaminVaksinApi = {
  // Force reload mock data to ensure latest data is loaded
  init() {
    saveVitaminVaksinData(mockVitaminVaksin);
  },

  async getAll(): Promise<ApiResponse<VitaminVaksin[]>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Failed to fetch data',
        error: 'Gagal memuat data vitamin/vaksin'
      };
    }
    
    const data = getVitaminVaksinData().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      success: true,
      data,
      message: `${data.length} data vitamin/vaksin ditemukan`
    };
  },

  async getById(id: string): Promise<ApiResponse<VitaminVaksin>> {
    await delay(300);
    
    const data = getVitaminVaksinData();
    const record = data.find(v => v.id === id);
    
    if (!record) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data vitamin/vaksin tidak ditemukan'
      };
    }
    
    return {
      success: true,
      data: record,
      message: 'Data vitamin/vaksin ditemukan'
    };
  },

  async getByRecipient(recipientId: string): Promise<ApiResponse<VitaminVaksin[]>> {
    await delay(400);
    
    const data = getVitaminVaksinData();
    const filtered = data.filter(v => v.recipientId === recipientId)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      success: true,
      data: filtered,
      message: `${filtered.length} riwayat vitamin/vaksin ditemukan`
    };
  },

  async create(vitaminVaksinData: Omit<VitaminVaksin, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<VitaminVaksin>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Create failed',
        error: 'Gagal menambah data vitamin/vaksin'
      };
    }
    
    const newRecord: VitaminVaksin = {
      ...vitaminVaksinData,
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    const data = getVitaminVaksinData();
    const updatedData = [...data, newRecord];
    saveVitaminVaksinData(updatedData);
    
    return {
      success: true,
      data: newRecord,
      message: 'Data vitamin/vaksin berhasil ditambahkan'
    };
  },

  async update(id: string, vitaminVaksinData: Partial<VitaminVaksin>): Promise<ApiResponse<VitaminVaksin>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Gagal memperbarui data vitamin/vaksin'
      };
    }

    const data = getVitaminVaksinData();
    const index = data.findIndex(v => v.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data vitamin/vaksin tidak ditemukan'
      };
    }
    
    const updatedRecord = {
      ...data[index],
      ...vitaminVaksinData,
      updatedAt: getCurrentDate()
    };
    
    data[index] = updatedRecord;
    saveVitaminVaksinData(data);
    
    return {
      success: true,
      data: updatedRecord,
      message: 'Data vitamin/vaksin berhasil diperbarui'
    };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Delete failed',
        error: 'Gagal menghapus data vitamin/vaksin'
      };
    }

    const data = getVitaminVaksinData();
    const index = data.findIndex(v => v.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data vitamin/vaksin tidak ditemukan'
      };
    }
    
    data.splice(index, 1);
    saveVitaminVaksinData(data);
    
    return {
      success: true,
      data: null,
      message: 'Data vitamin/vaksin berhasil dihapus'
    };
  },

  async search(query: string): Promise<ApiResponse<VitaminVaksin[]>> {
    await delay(400);
    
    const data = getVitaminVaksinData();
    const filtered = data.filter(record => 
      record.recipientName.toLowerCase().includes(query.toLowerCase()) ||
      record.name.toLowerCase().includes(query.toLowerCase()) ||
      record.type.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      data: filtered,
      message: `${filtered.length} hasil pencarian ditemukan`
    };
  },

  async getStats(): Promise<ApiResponse<{ total: number; vitamin: number; vaksin: number; thisMonth: number }>> {
    await delay(300);
    
    const data = getVitaminVaksinData();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const stats = {
      total: data.length,
      vitamin: data.filter(v => v.type === 'vitamin').length,
      vaksin: data.filter(v => v.type === 'vaksin').length,
      thisMonth: data.filter(v => {
        const recordDate = new Date(v.date);
        return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
      }).length
    };
    
    return {
      success: true,
      data: stats,
      message: 'Statistik vitamin/vaksin berhasil dimuat'
    };
  }
};