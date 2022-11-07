import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssertapiClientService {
  constructor(private http: HttpClient) { }

  get(url: string, args?: { [param: string]: string | string[] }): Observable<any> {
    return this.http
      .get(url, { params: filterArgs(args) });
  }

  delete(url: string, args?: { [param: string]: string | string[] }): Observable<any> {
    return this.http
      .delete(url, { params: filterArgs(args) });
  }
  
  patch(url: string, args?: { [param: string]: string | string[] }): Observable<any> {
    return this.http
      .patch(url, {}, { params: filterArgs(args) });
  }

  put(url: string, body?: any,  args?: { [param: string]: string | string[] }): Observable<any> {
    console.log(JSON.stringify(body));
    return this.http
      .put(url, body, { params: filterArgs(args) });
  }

  post(url: string, body?: any, headers?: { [param: string]: string | string[]} , args?: { [param: string]: string | string[] }): Observable<any> {
    return this.http
      .post(url, body, { headers: filterArgs(headers), params: filterArgs(args) });
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

