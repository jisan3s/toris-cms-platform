import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

export interface ManagedUser {
    _id: string;
    id?: string;
    name: string;
    email: string;
    isBlocked?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserListResponse {
    users: ManagedUser[];
}

export interface UserMutationResponse {
    message?: string;
    user?: ManagedUser;
}

@Injectable({
    providedIn: 'root'
})
export class OwnerUserService {
    private readonly apiUrl = API_URLS.ownerUsers;

    constructor(private http: HttpClient) { }

    listUsers(token: string): Observable<ManagedUser[] | UserListResponse> {
        return this.http.get<ManagedUser[] | UserListResponse>(this.apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    setBlocked(id: string, isBlocked: boolean, token: string): Observable<UserMutationResponse> {
        return this.http.patch<UserMutationResponse>(`${this.apiUrl}/${id}/block`, { isBlocked }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    deleteUser(id: string, token: string): Observable<UserMutationResponse> {
        return this.http.delete<UserMutationResponse>(`${this.apiUrl}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}
