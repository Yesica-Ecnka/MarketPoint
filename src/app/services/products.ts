import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/products';

  createProduct(product: any) {
    return this.http.post<any>(this.apiUrl, product);
  }

  getProducts() {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateProduct(id: number, data: any) {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  toggleProductStatus(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  adjustStock(id: number, payload: { quantity: number, reason: string, operation: 'add' | 'subtract' }) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/adjust-stock`, payload);
  }

  getProductMovements(id: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/movements`);
  }

  getGlobalMovements() {
    return this.http.get<any[]>(`${this.apiUrl}/movements/all`);
  }

  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/categories/list`);
  }

  createCategory(name: string) {
    return this.http.post<any>(`${this.apiUrl}/categories`, { name });
  }

  toggleCategoryStatus(id: number) {
    return this.http.patch<any>(`${this.apiUrl}/categories/${id}/toggle-status`, {});
  }
}