
import { requestQueue } from './requestQueue';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  return requestQueue.add(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;
          await delay(delayMs);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await delay(Math.pow(2, i) * 1000);
      }
    }
    throw new Error('Max retries reached');
  });
};
