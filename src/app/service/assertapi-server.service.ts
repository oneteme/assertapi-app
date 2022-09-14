import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, NEVER, Observable, throwError } from 'rxjs';
import { ApiRequestServer } from '../model/request.model';
import { environment } from 'src/environments/environment';
import { ApiAssertionsResultServer } from '../model/trace.model';

@Injectable({
  providedIn: 'root'
})
export class AssertapiServerService {
  constructor(private http: HttpClient) { }

  requests(): Observable<Array<ApiRequestServer>> {
    let url: string = `${environment.server}/v1/assert/api/ihm`;
    return this.get(url);   
  }

  traces(): Observable<Array<ApiAssertionsResultServer>> {
    let url: string = `${environment.server}/v1/assert/api/ihm/trace`;
    return this.get(url);   
  }

  remove(ids: number[]): Observable<void> {
    let url: string = `${environment.server}/v1/assert/api`;
    return this.delete(url, {'id': ids.map(id => id.toString())});
  }

  enable(ids: number[]): Observable<void> {
    let url: string = `${environment.server}/v1/assert/api/enable`;
    return this.patch(url, {'id': ids.map(id => id.toString())});   
  }

  disable(ids: number[]): Observable<void> {
    let url: string = `${environment.server}/v1/assert/api/disable`;
    return this.patch(url, {'id': ids.map(id => id.toString())});   
  }

  get(url: string): Observable<any> {
    return this.http
      .get(url);
  }

  delete(url: string, args?: { [param: string]: string | string[] }): Observable<any> {
    return this.http
      .delete(url, { params: filterArgs(args) });
  }
  
  patch(url: string, args?: { [param: string]: string | string[] }): Observable<any> {
    return this.http
      .patch(url, {}, { params: filterArgs(args) });
  }
}

function filterArgs(args) {
  let params = Object.assign({}, args);
  Object.keys(params).forEach(key => {
    if (params[key] == null || params[key] == undefined) {
      delete params[key];
    }
  });
  return params;
}

