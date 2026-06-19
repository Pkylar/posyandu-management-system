import { ApiResponse, DashboardStats, Activity, ChartData } from '../types';
import { mockActivities } from '../data/mockData';
import { 
  delay, randomDelay, shouldSimulateError,
  getFromStorage 
} from '../utils';

const getActivitiesData = (): Activity[] => {
  return getFromStorage<Activity[]>('activities_data') || mockActivities;
};

const generateChartData = (): ChartData[] => {
  const balitaData = getFromStorage('balita_data') || [];
  const ibuMenyusuiData = getFromStorage('ibu_menyusui_data') || [];
  const lansiaData = getFromStorage('lansia_data') || [];
  const penimbanganData = getFromStorage('penimbangan_data') || [];

  return [
    {
      name: 'Balita',
      value: balitaData.length,
      color: '#10B981'
    },
    {
      name: 'Ibu Menyusui', 
      value: ibuMenyusuiData.length,
      color: '#3B82F6'
    },
    {
      name: 'Lansia',
      value: lansiaData.length,
      color: '#8B5CF6'
    },
    {
      name: 'Penimbangan',
      value: penimbanganData.length,
      color: '#F59E0B'
    }
  ];
};

export const dashboardApi = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    console.log('📊 [GET] /api/dashboard/stats - Fetching dashboard statistics');
    
    await randomDelay();
    
    if (shouldSimulateError()) {
      console.log('❌ [GET] /api/dashboard/stats - Simulated error');
      return {
        success: false,
        message: 'Failed to fetch dashboard data',
        error: 'Gagal memuat data dashboard'
      };
    }

    // Get real data from localStorage
    const balitaData = getFromStorage('balita_data') || [];
    const ibuMenyusuiData = getFromStorage('ibu_menyusui_data') || [];
    const lansiaData = getFromStorage('lansia_data') || [];
    const penimbanganData = getFromStorage('penimbangan_data') || [];
    const activitiesData = getActivitiesData();

    // Calculate stunting cases
    const stuntingCases = penimbanganData.filter((p: any) => 
      p.stuntingStatus && p.stuntingStatus !== 'normal'
    ).length;

    // Get recent activities (last 10)
    const recentActivities = activitiesData
      .sort((a: Activity, b: Activity) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 10);

    const stats: DashboardStats = {
      totalBalita: balitaData.length,
      totalIbuMenyusui: ibuMenyusuiData.length,
      totalLansia: lansiaData.length,
      totalStunting: stuntingCases,
      recentActivities,
      chartData: generateChartData()
    };
    
    console.log('✅ [GET] /api/dashboard/stats - Success: Statistics calculated');
    console.log(`📏 [STATS] Balita: ${stats.totalBalita}, Ibu Menyusui: ${stats.totalIbuMenyusui}, Lansia: ${stats.totalLansia}, Stunting: ${stats.totalStunting}`);
    
    return {
      success: true,
      data: stats,
      message: 'Data dashboard berhasil dimuat'
    };
  },

  async addActivity(activity: Omit<Activity, 'id'>): Promise<ApiResponse<Activity>> {
    await delay(200);
    
    const activitiesData = getActivitiesData();
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString()
    };
    
    const updatedActivities = [newActivity, ...activitiesData];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('posyandu_activities_data', JSON.stringify(updatedActivities));
    }
    
    return {
      success: true,
      data: newActivity,
      message: 'Aktivitas berhasil ditambahkan'
    };
  },

  async getMonthlyReport(month: number, year: number): Promise<ApiResponse<any>> {
    await delay(600);
    
    if (shouldSimulateError()) {
      return {
        success: false,
        message: 'Failed to generate report',
        error: 'Gagal membuat laporan bulanan'
      };
    }

    const balitaData = getFromStorage('balita_data') || [];
    const ibuMenyusuiData = getFromStorage('ibu_menyusui_data') || [];
    const lansiaData = getFromStorage('lansia_data') || [];
    const penimbanganData = getFromStorage('penimbangan_data') || [];
    const vitaminVaksinData = getFromStorage('vitamin_vaksin_data') || [];

    // Filter data by month/year
    const monthlyPenimbangan = penimbanganData.filter((p: any) => {
      const date = new Date(p.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const monthlyVitaminVaksin = vitaminVaksinData.filter((v: any) => {
      const date = new Date(v.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const report = {
      period: `${month + 1}/${year}`,
      summary: {
        totalBalita: balitaData.length,
        totalIbuMenyusui: ibuMenyusuiData.length,
        totalLansia: lansiaData.length,
        penimbanganThisMonth: monthlyPenimbangan.length,
        vitaminVaksinThisMonth: monthlyVitaminVaksin.length,
        stuntingCases: monthlyPenimbangan.filter((p: any) => p.stuntingStatus !== 'normal').length
      },
      details: {
        penimbangan: monthlyPenimbangan,
        vitaminVaksin: monthlyVitaminVaksin
      }
    };
    
    return {
      success: true,
      data: report,
      message: 'Laporan bulanan berhasil dibuat'
    };
  }
};