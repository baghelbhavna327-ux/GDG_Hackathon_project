import { SupplyRequest, CreateSupplyRequestPayload } from '../types';
import { triggerNotificationRefresh } from './notificationService';

const API_BASE_URL = 'http://localhost:5000/api/supply-requests';

// Initial fallback mock data for offline resilience and demonstration
let localSupplyRequests: SupplyRequest[] = [
  {
    _id: 'sr-1001',
    requestedBy: {
      _id: 'u-clinician-01',
      name: 'Dr. Rachel Vance',
      email: 'clinician@healthchain.ai',
      role: 'health_worker',
      facility: 'Guna PHC-04'
    },
    clinicianId: 'u-clinician-01',
    clinicianName: 'Dr. Rachel Vance',
    phcId: 'phc-01',
    phcName: 'Guna PHC-04',
    district: 'Guna',
    state: 'Madhya Pradesh',
    medicine: 'Paracetamol 500mg Tablets',
    currentStock: 180,
    predictedDailyDemand: 110,
    predicted7DayDemand: 770,
    daysRemaining: 1.6,
    shortageQuantity: 590,
    stockOutRisk: 'CRITICAL',
    requestedQuantity: 250,
    urgency: 'CRITICAL',
    reason: 'Acute OPD patient influx due to seasonal viral fever surge. Current stock will exhaust in under 36 hours.',
    status: 'PENDING',
    adminComment: '',
    approvedQuantity: null,
    transferredRecordId: null,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    _id: 'sr-1002',
    requestedBy: {
      _id: 'u-clinician-02',
      name: 'Dr. Alok Verma',
      email: 'alok.verma@healthchain.ai',
      role: 'health_worker',
      facility: 'Shivpuri PHC-03'
    },
    clinicianId: 'u-clinician-02',
    clinicianName: 'Dr. Alok Verma',
    phcId: 'phc-04',
    phcName: 'Shivpuri PHC-03',
    district: 'Shivpuri',
    state: 'Madhya Pradesh',
    medicine: 'Amoxicillin 500mg Capsules',
    currentStock: 120,
    predictedDailyDemand: 65,
    predicted7DayDemand: 455,
    daysRemaining: 1.8,
    shortageQuantity: 335,
    stockOutRisk: 'HIGH',
    requestedQuantity: 150,
    urgency: 'HIGH',
    reason: 'Pediatric and general respiratory tract infection clusters detected in rural outreach blocks.',
    status: 'PENDING',
    adminComment: '',
    approvedQuantity: null,
    transferredRecordId: null,
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString()
  },
  {
    _id: 'sr-1003',
    requestedBy: {
      _id: 'u-clinician-03',
      name: 'Dr. Sunita Patel',
      email: 'sunita.patel@healthchain.ai',
      role: 'health_worker',
      facility: 'Indore PHC-08'
    },
    clinicianId: 'u-clinician-03',
    clinicianName: 'Dr. Sunita Patel',
    phcId: 'phc-03',
    phcName: 'Indore PHC-08',
    district: 'Indore',
    state: 'Madhya Pradesh',
    medicine: 'Oral Rehydration Salts (ORS)',
    currentStock: 340,
    predictedDailyDemand: 80,
    predicted7DayDemand: 560,
    daysRemaining: 4.2,
    shortageQuantity: 220,
    stockOutRisk: 'WARNING',
    requestedQuantity: 200,
    urgency: 'HIGH',
    reason: 'Gastroenteritis cases reported in peri-urban ward cluster.',
    status: 'APPROVED',
    adminComment: 'Approved for regional depot dispatch. Transport assigned to Logistic Unit #4.',
    approvedQuantity: 200,
    transferredRecordId: 'trf-103',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Submit a new medicine supply request
 */
export async function createSupplyRequest(payload: CreateSupplyRequestPayload): Promise<SupplyRequest> {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Sync local cache
        localSupplyRequests = [json.data, ...localSupplyRequests];
        triggerNotificationRefresh();
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend API request failed, saving to local state fallback:', err);
  }

  // Fallback: create mock record
  const newRecord: SupplyRequest = {
    _id: `sr-${Date.now()}`,
    requestedBy: 'Current Clinician',
    clinicianName: 'Current Clinician',
    phcId: payload.phcId,
    phcName: payload.phcName,
    district: payload.district || 'Guna',
    state: payload.state || 'Madhya Pradesh',
    medicine: payload.medicine,
    currentStock: payload.currentStock,
    predictedDailyDemand: payload.predictedDailyDemand || 0,
    predicted7DayDemand: payload.predicted7DayDemand || 0,
    daysRemaining: payload.daysRemaining || 0,
    shortageQuantity: payload.shortageQuantity || 0,
    stockOutRisk: payload.stockOutRisk || 'HIGH',
    requestedQuantity: payload.requestedQuantity,
    urgency: payload.urgency,
    reason: payload.reason,
    status: 'PENDING',
    adminComment: '',
    approvedQuantity: null,
    transferredRecordId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  localSupplyRequests = [newRecord, ...localSupplyRequests];
  triggerNotificationRefresh();
  return newRecord;
}

/**
 * Get all requests submitted by the logged-in clinician
 */
export async function getMySupplyRequests(): Promise<SupplyRequest[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/my`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        localSupplyRequests = json.data;
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend API fetch failed, returning local fallback:', err);
  }

  return [...localSupplyRequests];
}

/**
 * Get all supply requests (Admin view)
 */
export async function getAllSupplyRequests(status?: string): Promise<{ requests: SupplyRequest[]; pendingCount: number }> {
  try {
    const url = status ? `${API_BASE_URL}?status=${status}` : API_BASE_URL;
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        localSupplyRequests = json.data;
        const pending = json.counts?.pending ?? json.data.filter((r: SupplyRequest) => r.status === 'PENDING').length;
        return { requests: json.data, pendingCount: pending };
      }
    }
  } catch (err) {
    console.warn('Backend API fetch all failed, returning local fallback:', err);
  }

  const filtered = status ? localSupplyRequests.filter(r => r.status === status.toUpperCase()) : localSupplyRequests;
  const pending = localSupplyRequests.filter(r => r.status === 'PENDING').length;
  return { requests: filtered, pendingCount: pending };
}

/**
 * Approve a supply request (Admin)
 */
export async function approveSupplyRequest(
  id: string,
  data: { approvedQuantity?: number; adminComment?: string }
): Promise<SupplyRequest> {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localSupplyRequests = localSupplyRequests.map(r => (r._id === id ? json.data : r));
        triggerNotificationRefresh();
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend API approve failed, updating local fallback:', err);
  }

  // Fallback update
  localSupplyRequests = localSupplyRequests.map(r => {
    if (r._id === id) {
      return {
        ...r,
        status: 'APPROVED',
        approvedQuantity: data.approvedQuantity || r.requestedQuantity,
        adminComment: data.adminComment || 'Approved for emergency replenishment.',
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });

  const updated = localSupplyRequests.find(r => r._id === id)!;
  triggerNotificationRefresh();
  return updated;
}

/**
 * Reject a supply request (Admin)
 */
export async function rejectSupplyRequest(
  id: string,
  data: { adminComment?: string }
): Promise<SupplyRequest> {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localSupplyRequests = localSupplyRequests.map(r => (r._id === id ? json.data : r));
        triggerNotificationRefresh();
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend API reject failed, updating local fallback:', err);
  }

  // Fallback update
  localSupplyRequests = localSupplyRequests.map(r => {
    if (r._id === id) {
      return {
        ...r,
        status: 'REJECTED',
        adminComment: data.adminComment || 'Request declined by administrator.',
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });

  const updated = localSupplyRequests.find(r => r._id === id)!;
  triggerNotificationRefresh();
  return updated;
}

/**
 * Fulfill / Dispatch a supply request (Admin)
 */
export async function fulfillSupplyRequest(id: string): Promise<SupplyRequest> {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/fulfill`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localSupplyRequests = localSupplyRequests.map(r => (r._id === id ? json.data : r));
        triggerNotificationRefresh();
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend API fulfill failed, updating local fallback:', err);
  }

  // Fallback update
  localSupplyRequests = localSupplyRequests.map(r => {
    if (r._id === id) {
      return {
        ...r,
        status: 'FULFILLED',
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });

  const updated = localSupplyRequests.find(r => r._id === id)!;
  triggerNotificationRefresh();
  return updated;
}

