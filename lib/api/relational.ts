import { ApiResponse, Balita, Penimbangan, IbuMenyusui, Lansia, VitaminVaksin } from '../types';
import { 
  delay, getCurrentDate, generateId,
  getFromStorage, setToStorage 
} from '../utils';

const STORAGE_KEYS = {
  balita: 'balita_data',
  penimbangan: 'penimbangan_data', 
  ibu_menyusui: 'ibu_menyusui_data',
  lansia: 'lansia_data',
  vitaminVaksin: 'vitamin_vaksin_data',
  activities: 'activities_data'
};

// Helper untuk mendapatkan data dari storage
const getData = <T>(key: string): T[] => {
  return getFromStorage<T[]>(key) || [];
};

// Helper untuk menyimpan data ke storage
const saveData = <T>(key: string, data: T[]): void => {
  setToStorage(key, data);
};

export const relationalService = {
  // Get recipient options untuk dropdown
  async getRecipientOptions(type: 'balita' | 'ibu_menyusui' | 'lansia'): Promise<{ id: string, name: string }[]> {
    console.log(`🔍 [GET] /api/relational/recipients/${type} - Fetching recipient options`);
    
    await delay(100);
    
    // Direct force load data from mock
    if (type === 'ibu_menyusui') {
      const { mockIbuMenyusui } = await import('../data/mockData');
      saveData(STORAGE_KEYS.ibu_menyusui, mockIbuMenyusui);
      console.log('Force loaded ibu menyusui mock data:', mockIbuMenyusui);
    } else if (type === 'balita') {
      const { mockBalita } = await import('../data/mockData');
      saveData(STORAGE_KEYS.balita, mockBalita);
    } else if (type === 'lansia') {
      const { mockLansia } = await import('../data/mockData');
      saveData(STORAGE_KEYS.lansia, mockLansia);
    }
    
    const storageKey = STORAGE_KEYS[type];
    const data = getData(storageKey);
    
    console.log(`✅ [GET] /api/relational/recipients/${type} - Success: ${data.length} options returned`);
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name || item.nama
    }));
  },

  // Create balita dengan default connections
  async createBalitaWithDefaults(balitaData: Omit<Balita, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Balita>> {
    await delay(300);
    
    const balitaList = getData<Balita>(STORAGE_KEYS.balita);
    
    // Check duplicate NIK
    const existingNik = balitaList.find(b => b.nik === balitaData.nik);
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
    
    // Save balita
    balitaList.push(newBalita);
    saveData(STORAGE_KEYS.balita, balitaList);
    
    // Add activity
    await this.addActivity({
      type: 'checkup',
      description: `Balita baru ${newBalita.name} telah didaftarkan`,
      date: getCurrentDate()
    });
    
    return {
      success: true,
      data: newBalita,
      message: 'Data balita berhasil ditambahkan'
    };
  },

  // Create penimbangan dengan update relasi
  async createPenimbanganWithActivity(penimbanganData: any): Promise<ApiResponse<Penimbangan>> {
    console.log('📊 [POST] /api/relational/penimbangan - Creating penimbangan with activity for balita:', penimbanganData.balitaId);
    
    await delay(300);
    
    const penimbanganList = getData<Penimbangan>(STORAGE_KEYS.penimbangan);
    const balitaList = getData<Balita>(STORAGE_KEYS.balita);
    
    // Find balita info
    const balita = balitaList.find(b => b.id === penimbanganData.balitaId);
    if (!balita) {
      console.log('❌ [POST] /api/relational/penimbangan - Balita not found:', penimbanganData.balitaId);
      return {
        success: false,
        message: 'Balita not found',
        error: 'Data balita tidak ditemukan'
      };
    }
    
    // Calculate age and status
    const birthDate = new Date(balita.birthDate);
    const recordDate = new Date(penimbanganData.date);
    const ageMonths = Math.floor((recordDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    // Simple nutrition status calculation
    const expectedWeight = ageMonths * 0.5 + 3; // Basic formula
    let nutritionStatus: 'normal' | 'kurang' | 'berlebih' | 'obesitas' = 'normal';
    const weightRatio = penimbanganData.weight / expectedWeight;
    
    if (weightRatio < 0.8) nutritionStatus = 'kurang';
    else if (weightRatio > 1.3) nutritionStatus = 'obesitas';
    else if (weightRatio > 1.2) nutritionStatus = 'berlebih';
    
    // Simple stunting status
    const expectedHeight = ageMonths * 1.5 + 50; // Basic formula
    let stuntingStatus: 'normal' | 'stunting' | 'severely_stunted' = 'normal';
    const heightRatio = penimbanganData.height / expectedHeight;
    
    if (heightRatio < 0.85) stuntingStatus = 'severely_stunted';
    else if (heightRatio < 0.95) stuntingStatus = 'stunting';
    
    const newPenimbangan: Penimbangan = {
      id: generateId(),
      balitaId: penimbanganData.balitaId,
      balitaName: balita.name,
      date: penimbanganData.date,
      weight: penimbanganData.weight,
      height: penimbanganData.height,
      age: ageMonths,
      nutritionStatus,
      stuntingStatus,
      notes: penimbanganData.notes || '',
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    // Save penimbangan
    penimbanganList.push(newPenimbangan);
    saveData(STORAGE_KEYS.penimbangan, penimbanganList);
    
    // Update balita's last weight/height (optional - add to balita if needed)
    const updatedBalita = { ...balita, updatedAt: getCurrentDate() };
    const balitaIndex = balitaList.findIndex(b => b.id === balita.id);
    balitaList[balitaIndex] = updatedBalita;
    saveData(STORAGE_KEYS.balita, balitaList);
    
    // Add activity
    const statusText = nutritionStatus === 'normal' ? 'Gizi Normal' : 
                     nutritionStatus === 'kurang' ? 'Gizi Kurang' :
                     nutritionStatus === 'berlebih' ? 'Gizi Berlebih' : 'Obesitas';
    
    await this.addActivity({
      type: 'penimbangan',
      description: `Penimbangan ${balita.name} - ${penimbanganData.weight}kg, ${penimbanganData.height}cm (${statusText})`,
      date: getCurrentDate()
    });
    
    console.log(`✅ [POST] /api/relational/penimbangan - Success: ${balita.name} - ${penimbanganData.weight}kg, ${penimbanganData.height}cm, Status: ${nutritionStatus}`);
    
    return {
      success: true,
      data: newPenimbangan,
      message: 'Data penimbangan berhasil ditambahkan'
    };
  },

  // Create vitamin/vaksin dengan update relasi
  async createVitaminVaksinWithActivity(data: any): Promise<ApiResponse<VitaminVaksin>> {
    await delay(300);
    
    const vitaminVaksinList = getData<VitaminVaksin>(STORAGE_KEYS.vitaminVaksin);
    const balitaList = getData<Balita>(STORAGE_KEYS.balita);
    const ibuMenyusuiList = getData<IbuMenyusui>(STORAGE_KEYS.ibuMenyusui);
    const lansiaList = getData<Lansia>(STORAGE_KEYS.lansia);
    
    // Find recipient info based on type
    let recipient: any = null;
    if (data.recipientType === 'balita') {
      recipient = balitaList.find(b => b.id === data.recipientId);
    } else if (data.recipientType === 'ibu_menyusui') {
      recipient = ibuMenyusuiList.find(i => i.id === data.recipientId);
    } else if (data.recipientType === 'lansia') {
      recipient = lansiaList.find(l => l.id === data.recipientId);
    }
    
    if (!recipient) {
      return {
        success: false,
        message: 'Recipient not found',
        error: 'Data penerima tidak ditemukan'
      };
    }
    
    const newVitaminVaksin: VitaminVaksin = {
      id: generateId(),
      recipientId: data.recipientId,
      recipientName: recipient.name,
      recipientType: data.recipientType,
      type: data.type,
      name: data.name,
      date: data.date,
      notes: data.notes || '',
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    
    // Save vitamin/vaksin
    vitaminVaksinList.push(newVitaminVaksin);
    saveData(STORAGE_KEYS.vitaminVaksin, vitaminVaksinList);
    
    // Add activity
    await this.addActivity({
      type: data.type as 'vitamin' | 'vaksin',
      description: `Pemberian ${data.name} untuk ${recipient.name} (${data.recipientType})`,
      date: getCurrentDate()
    });
    
    return {
      success: true,
      data: newVitaminVaksin,
      message: `${data.type === 'vitamin' ? 'Vitamin' : 'Vaksin'} berhasil diberikan`
    };
  },

  // Delete balita dengan semua data terkait
  async deleteBalitaWithRelatedData(balitaId: string): Promise<ApiResponse<null>> {
    await delay(400);
    
    const balitaList = getData<Balita>(STORAGE_KEYS.balita);
    const penimbanganList = getData<Penimbangan>(STORAGE_KEYS.penimbangan);
    const vitaminVaksinList = getData<VitaminVaksin>(STORAGE_KEYS.vitaminVaksin);
    
    // Find balita
    const balita = balitaList.find(b => b.id === balitaId);
    if (!balita) {
      return {
        success: false,
        message: 'Balita not found',
        error: 'Data balita tidak ditemukan'
      };
    }
    
    // Remove related data
    const filteredBalita = balitaList.filter(b => b.id !== balitaId);
    const filteredPenimbangan = penimbanganList.filter(p => p.balitaId !== balitaId);
    const filteredVitaminVaksin = vitaminVaksinList.filter(v => 
      !(v.recipientType === 'balita' && v.recipientId === balitaId)
    );
    
    // Save updated data
    saveData(STORAGE_KEYS.balita, filteredBalita);
    saveData(STORAGE_KEYS.penimbangan, filteredPenimbangan);
    saveData(STORAGE_KEYS.vitaminVaksin, filteredVitaminVaksin);
    
    // Add activity
    await this.addActivity({
      type: 'checkup',
      description: `Data balita ${balita.name} dan semua data terkait telah dihapus`,
      date: getCurrentDate()
    });
    
    return {
      success: true,
      data: null,
      message: 'Data balita dan semua data terkait berhasil dihapus'
    };
  },

  // Update balita name di semua data terkait
  async updateBalitaNameInRelatedData(balitaId: string, newName: string): Promise<void> {
    const penimbanganList = getData<Penimbangan>(STORAGE_KEYS.penimbangan);
    const vitaminVaksinList = getData<VitaminVaksin>(STORAGE_KEYS.vitaminVaksin);
    
    // Update penimbangan
    const updatedPenimbangan = penimbanganList.map(p => 
      p.balitaId === balitaId ? { ...p, balitaName: newName, updatedAt: getCurrentDate() } : p
    );
    
    // Update vitamin/vaksin
    const updatedVitaminVaksin = vitaminVaksinList.map(v => 
      (v.recipientType === 'balita' && v.recipientId === balitaId) 
        ? { ...v, recipientName: newName, updatedAt: getCurrentDate() } 
        : v
    );
    
    saveData(STORAGE_KEYS.penimbangan, updatedPenimbangan);
    saveData(STORAGE_KEYS.vitaminVaksin, updatedVitaminVaksin);
  },

  // Get statistik untuk dashboard
  async getDashboardStatistics(): Promise<{
    totalBalita: number;
    totalPenimbangan: number;
    totalVitaminVaksin: number;
    totalIbuMenyusui: number;
    totalLansia: number;
    stuntingCases: number;
    giziKurangCases: number;
  }> {
    const balitaList = getData<Balita>(STORAGE_KEYS.balita);
    const penimbanganList = getData<Penimbangan>(STORAGE_KEYS.penimbangan);
    const vitaminVaksinList = getData<VitaminVaksin>(STORAGE_KEYS.vitaminVaksin);
    const ibuMenyusuiList = getData<IbuMenyusui>(STORAGE_KEYS.ibuMenyusui);
    const lansiaList = getData<Lansia>(STORAGE_KEYS.lansia);
    
    const stuntingCases = penimbanganList.filter(p => p.stuntingStatus !== 'normal').length;
    const giziKurangCases = penimbanganList.filter(p => p.nutritionStatus === 'kurang').length;
    
    return {
      totalBalita: balitaList.length,
      totalPenimbangan: penimbanganList.length,
      totalVitaminVaksin: vitaminVaksinList.length,
      totalIbuMenyusui: ibuMenyusuiList.length,
      totalLansia: lansiaList.length,
      stuntingCases,
      giziKurangCases
    };
  },

  // Get penimbangan history untuk balita tertentu
  async getPenimbanganHistory(balitaId: string): Promise<Penimbangan[]> {
    const penimbanganList = getData<Penimbangan>(STORAGE_KEYS.penimbangan);
    return penimbanganList
      .filter(p => p.balitaId === balitaId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get vitamin/vaksin history untuk recipient tertentu
  async getVitaminVaksinHistory(recipientId: string, recipientType: 'balita' | 'ibu_menyusui' | 'lansia'): Promise<VitaminVaksin[]> {
    const vitaminVaksinList = getData<VitaminVaksin>(STORAGE_KEYS.vitaminVaksin);
    return vitaminVaksinList
      .filter(v => v.recipientId === recipientId && v.recipientType === recipientType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Add activity
  async addActivity(activity: { type: string; description: string; date: string }): Promise<void> {
    const activities = getData(STORAGE_KEYS.activities);
    const newActivity = {
      id: generateId(),
      ...activity
    };
    
    activities.unshift(newActivity); // Add to beginning
    
    // Keep only last 50 activities
    if (activities.length > 50) {
      activities.splice(50);
    }
    
    saveData(STORAGE_KEYS.activities, activities);
  },

  // Initialize all storage with mock data if empty
  async initializeStorage(): Promise<void> {
    const { balitaApi } = await import('./balita');
    const { penimbanganApi } = await import('./penimbangan');
    const { ibuMenyusuiApi } = await import('./ibuMenyusui');
    const { lansiaApi } = await import('./lansia');
    const { vitaminVaksinApi } = await import('./vitaminVaksin');
    
    // Initialize each API (they will auto-init with mock data if empty)
    balitaApi.init();
    penimbanganApi.init();
    ibuMenyusuiApi.init();
    lansiaApi.init();
    vitaminVaksinApi.init();
  }
};