import * as SecureStore from 'expo-secure-store';
import api from './api';

export const bookService = {
  /**
   * Reads the cached purchasedBooks SKUs from SecureStore.
   * Returns an empty array if not yet claimed or no data.
   */
  async getPurchasedSkus(): Promise<string[]> {
    try {
      const raw = await SecureStore.getItemAsync('userData');
      if (raw) {
        const user = JSON.parse(raw);
        return Array.isArray(user.purchasedBooks) ? user.purchasedBooks : [];
      }
    } catch {
      // ignore parse errors
    }
    return [];
  },

  async submitAccessRequest(payload: {
    bookSku: string;
    bookTitle: string;
    requestEmail: string;
    note: string;
  }): Promise<void> {
    await api.post('/book-access-requests', payload);
  },

  async getMyAccessRequests(): Promise<any[]> {
    const response = await api.get('/book-access-requests/my');
    return response.data.data;
  },

  async dismissAccessRequest(id: string): Promise<void> {
    await api.patch(`/book-access-requests/${id}/dismiss`);
  },

  /**
   * Calls the backend which queries Shopify by the signed-in user's email.
   * Saves the returned SKUs to the backend DB and updates the local SecureStore cache.
   */
  async claimBooks(): Promise<string[]> {
    const response = await api.post('/auth/me/claim-books');
    const skus: string[] = response.data.data.purchasedBooks;

    // Keep SecureStore cache in sync
    const raw = await SecureStore.getItemAsync('userData');
    if (raw) {
      const user = JSON.parse(raw);
      await SecureStore.setItemAsync(
        'userData',
        JSON.stringify({ ...user, purchasedBooks: skus })
      );
    }

    return skus;
  },
};
