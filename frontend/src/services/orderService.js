import { api } from './apiClient';

export const orderService = {
  getPublicProduct: async (slug = 'soora-samhara-pooja-box-2026') => {
    return api.get(`/products/${slug}`);
  },

  createOrder: async ({ productSlug = 'soora-samhara-pooja-box-2026', quantity, customer, sankalpamDetails = [] }) => {
    return api.post('/orders', { productSlug, quantity, customer, sankalpamDetails });
  },

  getOrderStatus: async (orderNumber) => {
    return api.get(`/orders/${orderNumber}/status`);
  },

  submitInquiry: async (data) => {
    return api.post('/inquiries', data);
  }
};
