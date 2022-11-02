import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiAssertionsResultServer } from "../model/trace.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class TraceService extends AssertapiClientService {
    getTrace(id?: number): Observable<Array<ApiAssertionsResultServer>> {
        let url: string = `${environment.server}/v1/assert/api/trace`;
        return this.get(url, id ? { 'id': [id.toString()] } : {});
    }
}