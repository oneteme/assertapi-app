import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiRequestServer } from "../model/request.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class RequestService extends AssertapiClientService {
    getRequest(): Observable<Array<ApiRequestServer>> {
        let url: string = `${environment.server}/v1/assert/api/request/all`;
        return this.get(url);
    }

    putRequest(apiRequestServer: ApiRequestServer): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request`;
        return this.put(url, apiRequestServer.request, { app: apiRequestServer.metadata['app'], env: apiRequestServer.metadata['env'] });
    }

    deleteRequest(ids: number[]): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request`;
        return this.delete(url, { 'id': ids.map(id => id.toString()) });
    }

    enableRequest(ids: number[]): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request/enable`;
        return this.patch(url, { 'id': ids.map(id => id.toString()) });
    }

    disableRequest(ids: number[]): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request/disable`;
        return this.patch(url, { 'id': ids.map(id => id.toString()) });
    }
}