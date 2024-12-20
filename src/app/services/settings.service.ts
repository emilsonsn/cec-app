import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { PageControl, ApiResponsePageable, ApiResponse, DeleteApiResponse } from '@models/application';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private readonly _http: HttpClient
  ) { }

  public get(pageControl?: PageControl, filters?: any): any {
    return this._http.get<ApiResponsePageable<any>>(`${environment.api}/setting/search`);
  }

  public patch(formData): Observable<ApiResponse<any>> {
    return this._http.post<ApiResponse<any>>(`${environment.api}/setting?_method=PATCH`, formData);
  }

}



