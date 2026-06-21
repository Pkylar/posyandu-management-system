import { ApiResponse, Penimbangan } from '../types';
import { mockPenimbangan } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError, generateId, getCurrentDate,
  getFromStorage, setToStorage, calculateAge, determineNutritionStatus, 
  determineStuntingStatus 
} from '../utils';

const STORAGE_KEY = 'penimbangan_data';

const getPenimbanganData = (): Penimbangan[] => {
  const stored = getFromStorage<Penimbangan[]>(STORAGE_KEY);
  if (!stored) {
    savePenimbanganData(mockPenimbangan);
    return mockPenimbangan;
  }
  return stored;
};

const savePenimbanganData = (data: Penimbangan[]): void => {
  setToStorage(STORAGE_KEY, data);
};

export const penimbanganApi = {
  init() {
    // Only load mock data if storage is empty
    const existing = getFromStorage<Penimbangan[]>(STORAGE_KEY);
    if (!existing || existing.length === 0) {
      savePenimbanganData(mockPenimbangan);
    }
  },
  async getAll(): Promise<ApiResponse<Penimbangan[]>> {
    console.log('📊 [GET] /api/penimbangan - Fetching all penimbangan data');
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [GET] /api/penimbangan - Simulated error');
      return {
        success: false,
        message: 'Failed to fetch data',
        error: 'Gagal memuat data penimbangan'
      };
    }
    
    const data = getPenimbanganData().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    console.log(`✅ [GET] /api/penimbangan - Success: ${data.length} records returned`);
    
    return {
      success: true,
      data,
      message: `${data.length} data penimbangan ditemukan`
    };
  },

  async getById(id: string): Promise<ApiResponse<Penimbangan>> {
    await delay(300);
    
    const data = getPenimbanganData();
    const penimbangan = data.find(p => p.id === id);
    
    if (!penimbangan) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data penimbangan tidak ditemukan'
      };
    }
    
    return {
      success: true,
      data: penimbangan,
      message: 'Data penimbangan ditemukan'
    };
  },

  async getByBalitaId(balitaId: string): Promise<ApiResponse<Penimbangan[]>> {
    await delay(400);
    
    const data = getPenimbanganData();
    const filtered = data.filter(p => p.balitaId === balitaId)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      success: true,
      data: filtered,
      message: `${filtered.length} riwayat penimbangan ditemukan`
    };
  },

  async create(penimbanganData: Omit<Penimbangan, 'id' | 'age' | 'nutritionStatus' | 'stuntingStatus' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Penimbangan>> {
    console.log('📝 [POST] /api/penimbangan - Creating new penimbangan for balita:', penimbanganData.balitaId);
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [POST] /api/penimbangan - Simulated error');
      return {
        success: false,
        message: 'Create failed',
        error: 'Gagal menambah data penimbangan'
      };
    }

    // Auto-calculate fields
    const age = Math.floor((new Date(penimbanganData.date).getTime() - new Date().getTime()) / (365 * 24 * 60 * 60 * 1000)) + 1;
    const nutritionStatus = determineNutritionStatus(penimbanganData.weight, age);
    const stuntingStatus = determineStuntingStatus(penimbanganData.height, age);
    
    const newPenimbangan: Penimbangan = {
      ...penimbanganData,
      id: generateId(),
      age: Math.abs(age),
      nutritionStatus: nutritionStatus as any,
      stuntingStatus: stuntingStatus as any,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    const data = getPenimbanganData();
    const updatedData = [...data, newPenimbangan];
    savePenimbanganData(updatedData);
    
    console.log(`✅ [POST] /api/penimbangan - Success: New record created with ID ${newPenimbangan.id}`);
    console.log(`📏 [INFO] Weight: ${penimbanganData.weight}kg, Height: ${penimbanganData.height}cm, Status: ${nutritionStatus}`);
    
    return {
      success: true,
      data: newPenimbangan,
      message: 'Data penimbangan berhasil ditambahkan'
    };
  },

  async update(id: string, penimbanganData: Partial<Penimbangan>): Promise<ApiResponse<Penimbangan>> {
    await randomDelay();
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Gagal memperbarui data penimbangan'
      };
    }

    const data = getPenimbanganData();
    const index = data.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data penimbangan tidak ditemukan'
      };
    }

    // Recalculate if weight/height/date changed
    let updatedData = { ...data[index], ...penimbanganData };
    
    if (penimbanganData.weight || penimbanganData.height || penimbanganData.date) {
      const age = Math.abs(Math.floor((new Date(updatedData.date).getTime() - new Date().getTime()) / (365 * 24 * 60 * 60 * 1000))) + 1;
      updatedData.age = age;
      updatedData.nutritionStatus = determineNutritionStatus(updatedData.weight, age) as any;
      updatedData.stuntingStatus = determineStuntingStatus(updatedData.height, age) as any;
    }
    
    updatedData.updatedAt = getCurrentDate();
    
    data[index] = updatedData;
    savePenimbanganData(data);
    
    return {
      success: true,
      data: updatedData,
      message: 'Data penimbangan berhasil diperbarui'
    };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Delete failed',
        error: 'Gagal menghapus data penimbangan'
      };
    }

    const data = getPenimbanganData();
    const index = data.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Data not found',
        error: 'Data penimbangan tidak ditemukan'
      };
    }
    
    data.splice(index, 1);
    savePenimbanganData(data);
    
    return {
      success: true,
      data: null,
      message: 'Data penimbangan berhasil dihapus'
    };
  },

  async getStats(): Promise<ApiResponse<{ total: number; stunting: number; kurangGizi: number }>> {
    await delay(300);
    
    const data = getPenimbanganData();
    const stats = {
      total: data.length,
      stunting: data.filter(p => p.stuntingStatus !== 'normal').length,
      kurangGizi: data.filter(p => p.nutritionStatus === 'kurang').length
    };
    
    return {
      success: true,
      data: stats,
      message: 'Statistik penimbangan berhasil dimuat'
    };
  }
};