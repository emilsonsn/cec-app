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

  public getCertificates(credentials): any {
    let params = Utils.mountPageControl(credentials);

    return this._http.get<ApiResponsePageable<any>>(`${environment.api}/vault-id/certificates?${params}`);
  }

  public patch(limit : number): Observable<ApiResponse<any>> {
    return this._http.patch<ApiResponse<any>>(`${environment.api}/${this.endpoint}/`, {limit});
  }

}



