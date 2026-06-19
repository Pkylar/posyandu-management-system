export const delay = (ms: number = 800): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const randomDelay = (): Promise<void> => 
  delay(Math.random() * 1000 + 500);

export const shouldSimulateError = (): boolean => 
  Math.random() < 0.05; // 5% chance of error

export const generateId = (): string => 
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const getCurrentDate = (): string => 
  new Date().toISOString();

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID');
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const determineNutritionStatus = (weight: number, age: number): string => {
  // Simplified logic for demo
  const expectedWeight = age * 3 + 7; // Very basic formula
  const percentage = (weight / expectedWeight) * 100;
  
  if (percentage < 80) return 'kurang';
  if (percentage > 120) return 'berlebih';
  if (percentage > 130) return 'obesitas';
  return 'normal';
};

export const determineStuntingStatus = (height: number, age: number): string => {
  // Simplified logic for demo
  const expectedHeight = age * 6 + 50; // Very basic formula
  const percentage = (height / expectedHeight) * 100;
  
  if (percentage < 85) return 'severely_stunted';
  if (percentage < 95) return 'stunting';
  return 'normal';
};

export const getStorageKey = (key: string): string => `posyandu_${key}`;

export const getFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(getStorageKey(key));
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};