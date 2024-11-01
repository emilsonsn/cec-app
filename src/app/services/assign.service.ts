import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { PageControl, ApiResponsePageable, ApiResponse, DeleteApiResponse } from '@models/application';
import { Utils } from '@shared/utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignService {

  protected endpoint : string = 'assign';

  constructor(
    private readonly _http: HttpClient
  ) { }

  public getFiles(pageControl?: PageControl, filters?: any): any {
    const paginate = Utils.mountPageControl(pageControl);
    const filterParams = Utils.mountPageControl(filters);

    return this._http.get<ApiResponsePageable<any>>(`${environment.api}/file/search?${paginate}${filterParams}`);
  }

  public postFile(file): Observable<ApiResponse<any>> {
    return this._http.post<ApiResponse<any>>(`${environment.api}/file/create`, file);
  }

  // Vault-ID (Certificados)
  public getCertificates(credentials): any {
    let params = Utils.mountPageControl(credentials);

    return this._http.get<ApiResponsePageable<any>>(`${environment.api}/vault-id/certificates?${params}`);
  }

}



