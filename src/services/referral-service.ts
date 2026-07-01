import api from '@/lib/api';

export async function getReferralByToken(token: string) {
  const response = await api.get(`/referral/${token}`);
  return response.data;
}

export async function submitReferral(
  token: string,
  payload: Record<string, unknown>
) {
  const response = await api.post(`/referral/${token}`, payload);
  return response.data;
}

export async function getCustomerReferrals(customerId: string | number) {
  const response = await api.get(`/customer/${customerId}/referrals`);
  return response.data;
}

export async function generateReferralToken(customerId: string | number) {
  const response = await api.post(`/customer/${customerId}/referral-token`);
  return response.data;
}

export async function deleteReferralToken(customerId: string | number) {
  const response = await api.delete(`/customer/${customerId}/referral-token`);
  return response.data;
}
