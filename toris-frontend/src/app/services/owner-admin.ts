import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

export interface ManagedAdmin {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role?: string;
    isBlocked?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminPayload {
    name: string;
    email: string;
    password?: string;
}

export interface AdminListResponse {
    admins: ManagedAdmin[];
}

export interface AdminMutationResponse {
    message?: string;
    admin?: ManagedAdmin;
}

@Injectable({
    providedIn: 'root'
})
export class OwnerAdminService {
    private readonly apiUrl = API_URLS.ownerAdmins;

    constructor(private http: HttpClient) { }

    listAdmins(token: string): Observable<ManagedAdmin[] | AdminListResponse> {
        return this.http.get<ManagedAdmin[] | AdminListResponse>(this.apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    createAdmin(payload: AdminPayload, token: string): Observable<AdminMutationResponse> {
        return this.http.post<AdminMutationResponse>(this.apiUrl, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    updateAdmin(id: string, payload: Partial<AdminPayload>, token: string): Observable<AdminMutationResponse> {
        return this.http.put<AdminMutationResponse>(`${this.apiUrl}/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    setBlocked(id: string, isBlocked: boolean, token: string): Observable<AdminMutationResponse> {
        return this.http.patch<AdminMutationResponse>(`${this.apiUrl}/${id}/block`, { isBlocked }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    deleteAdmin(id: string, token: string): Observable<AdminMutationResponse> {
        return this.http.delete<AdminMutationResponse>(`${this.apiUrl}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}
