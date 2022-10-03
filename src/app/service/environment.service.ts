import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiServerConfig } from "../model/environment.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class EnvironmentService extends AssertapiClientService {

    getEnvironment(): Observable<Array<ApiServerConfig>> {
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.get(url);
    }

    putEnvironment(apiServerConfig: ApiServerConfig): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.put(url, apiServerConfig);
    }

    deleteEnvironment(ids: number[]): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.delete(url, { 'id': ids.map(id => id.toString()) });
    }
}