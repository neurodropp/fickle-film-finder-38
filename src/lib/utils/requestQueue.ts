
export class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private activeConnections = 0;
  private readonly MAX_CONNECTIONS = 20;
  private readonly DELAY_BETWEEN_REQUESTS = 50;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeConnections >= this.MAX_CONNECTIONS) {
      return;
    }

    this.processing = true;
    while (this.queue.length > 0 && this.activeConnections < this.MAX_CONNECTIONS) {
      const request = this.queue.shift();
      if (request) {
        this.activeConnections++;
        try {
          await request();
        } finally {
          this.activeConnections--;
          await this.delay(this.DELAY_BETWEEN_REQUESTS);
        }
      }
    }
    this.processing = false;

    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const requestQueue = new RequestQueue();
