import api from '@/lib/api';

export async function getCustomers(filters: Record<string, unknown>) {
  const response = await api.get('/customer', { params: filters });
  return response.data;
}

export async function createCustomer(payload: Record<string, unknown>) {
  const response = await api.post('/customer', payload);
  return response.data;
}

export async function getCustomer(id: number) {
  const response = await api.get(`/customer/${id}`);
  return response.data;
}

export async function updateCustomer(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/customer/${id}`, payload);
  return response.data;
}

export async function destroyCustomer(id: number) {
  const response = await api.delete(`/customer/${id}`);
  return response.data;
}

export async function getCustomersBySegmentId(segmentId: number) {
  const response = await api.get(`/customer/segment-filter/${segmentId}`);
  return response.data;
}

export async function getCustomerLogs(customerId: number) {
  const response = await api.get(`/customer/logs/${customerId}`);
  return response.data;
}

export async function getCustomerFiles(customerId: number) {
  const response = await api.get(`/customer/${customerId}/file`);
  return response.data;
}

export async function createCustomerFile(
  customerId: number,
  payload: FormData | Record<string, unknown>
) {
  const response = await api.post(`/customer/${customerId}/file`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function updateCustomerFile(
  customerId: number,
  fileId: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(
    `/customer/${customerId}/file/${fileId}`,
    payload
  );
  return response.data;
}

export async function destroyCustomerFile(customerId: number, fileId: number) {
  const response = await api.delete(`/customer/${customerId}/file/${fileId}`);
  return response.data;
}

export async function bulkDeleteCustomers(ids: number[]) {
  const response = await api.post('/customer/bulk-delete', { ids });
  return response.data;
}

export async function bulkUpdateStatus(ids: number[], statusId: number) {
  const response = await api.post('/customer/bulk-update-status', {
    ids,
    status_id: statusId,
  });
  return response.data;
}

export async function bulkUpdateCategory(ids: number[], categoryId: number) {
  const response = await api.post('/customer/bulk-update-category', {
    ids,
    category_id: categoryId,
  });
  return response.data;
}

export async function bulkUpdateUser(ids: number[], userId: number) {
  const response = await api.post('/customer/bulk-update-user', {
    ids,
    user_id: userId,
  });
  return response.data;
}
