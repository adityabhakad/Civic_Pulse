export const COMPLAINT_CATEGORIES: readonly string[] = ['Roads', 'Garbage', 'Water Supply', 'Electricity', 'Drainage', 'Other'];

export interface Complaint { id?: number; title: string; description: string; category: string; location: string; status: string; submittedAt?: string | null; citizenName?: string | null; }
export interface PublicStats { total: number; pending: number; inProgress: number; resolved: number; }
export interface ApiError { message?: string; validationErrors?: Record<string, string>; }
