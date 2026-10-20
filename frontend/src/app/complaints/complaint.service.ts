import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Complaint, PublicStats } from './complaint';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/complaints';
  getPublicStats(): Observable<PublicStats> {
    return this.http.get<PublicStats>('http://localhost:8080/api/public/stats').pipe(map(data => {
      if (!data || !['total', 'pending', 'inProgress', 'resolved'].every(key => Number.isFinite(data[key as keyof PublicStats]))) {
        throw new Error('Unexpected public statistics response.');
      }
      return data;
    }));
  }
  getMine(): Observable<Complaint[]> { return this.http.get<Complaint[]>(`${this.apiUrl}/mine`).pipe(map(validateComplaintList)); }
  getAll(): Observable<Complaint[]> { return this.http.get<Complaint[]>(this.apiUrl).pipe(map(validateComplaintList)); }
  getById(id: number): Observable<Complaint> { return this.http.get<Complaint>(`${this.apiUrl}/${id}`).pipe(map(validateComplaint)); }
  create(complaint: Complaint): Observable<Complaint> { return this.http.post<Complaint>(this.apiUrl, complaint).pipe(map(validateComplaint)); }
  update(id: number, complaint: Complaint): Observable<Complaint> { return this.http.put<Complaint>(`${this.apiUrl}/${id}`, complaint).pipe(map(validateComplaint)); }
  updateStatus(id: number, status: string): Observable<Complaint> { return this.http.put<Complaint>(`${this.apiUrl}/${id}/status`, { status }).pipe(map(validateComplaint)); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}

function validateComplaintList(value: unknown): Complaint[] {
  if (!Array.isArray(value)) throw new Error('Unexpected complaint list response.');
  return value.map(validateComplaint);
}

function validateComplaint(value: unknown): Complaint {
  if (!value || typeof value !== 'object') throw new Error('Unexpected complaint response.');
  const item = value as Record<string, unknown>;
  if (typeof item['id'] !== 'number' || !Number.isInteger(item['id']) || typeof item['title'] !== 'string'
      || typeof item['description'] !== 'string' || typeof item['category'] !== 'string'
      || typeof item['location'] !== 'string' || typeof item['status'] !== 'string') {
    throw new Error('Unexpected complaint response.');
  }
  if (item['submittedAt'] !== undefined && item['submittedAt'] !== null && typeof item['submittedAt'] !== 'string') {
    throw new Error('Unexpected complaint response.');
  }
  if (item['citizenName'] !== undefined && item['citizenName'] !== null && typeof item['citizenName'] !== 'string') {
    throw new Error('Unexpected complaint response.');
  }
  return value as Complaint;
}
