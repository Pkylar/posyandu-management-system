// Helper to call server API routes (logs will appear in terminal)
export const serverLog = {
  async get(endpoint: string) {
    try {
      await fetch(`/api/${endpoint}`, { method: 'GET' });
    } catch (e) {}
  },
  
  async post(endpoint: string, data?: any) {
    try {
      await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      });
    } catch (e) {}
  }
};
