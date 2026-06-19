export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'petugas';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Balita {
  id: string;
  name: string;
  nik: string;
  gender: 'L' | 'P';
  birthDate: string;
  birthPlace?: string;
  parentName: string;
  fatherName?: string;
  motherName?: string;
  address: string;
  rt?: string;
  rw?: string;
  phone: string;
  bloodType?: string;
  birthWeight?: number;
  birthHeight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Penimbangan {
  id: string;
  balitaId: string;
  balitaName: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  nutritionStatus: 'normal' | 'kurang' | 'berlebih' | 'obesitas';
  stuntingStatus: 'normal' | 'stunting' | 'severely_stunted';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IbuMenyusui {
  id: string;
  name: string;
  nik: string;
  birthDate: string;
  address: string;
  phone: string;
  childBirthDate: string;
  breastfeedingStatus: 'eksklusif' | 'campuran' | 'formula';
  healthStatus: 'sehat' | 'perlu_perhatian' | 'rujukan';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lansia {
  id: string;
  name: string;
  nik: string;
  gender: 'L' | 'P';
  birthDate: string;
  address: string;
  phone: string;
  weight: number;
  height: number;
  bmi: number;
  bloodPressure: string;
  healthStatus: 'sehat' | 'perlu_perhatian' | 'rujukan';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitaminVaksin {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'balita' | 'ibu_menyusui' | 'lansia';
  type: 'vitamin' | 'vaksin';
  name: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface DashboardStats {
  totalBalita: number;
  totalIbuMenyusui: number;
  totalLansia: number;
  totalStunting: number;
  recentActivities: Activity[];
  chartData: ChartData[];
}

export interface Activity {
  id: string;
  type: 'penimbangan' | 'vitamin' | 'vaksin' | 'checkup';
  description: string;
  date: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}