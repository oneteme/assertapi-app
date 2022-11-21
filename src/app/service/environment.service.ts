import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, startWith, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiServerConfig } from "../model/environment.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class EnvironmentService extends AssertapiClientService {

    private _environments: BehaviorSubject<Array<ApiServerConfig>> = new BehaviorSubject([]);
    public readonly environments: Observable<Array<ApiServerConfig>> = this._environments.asObservable();

    getEnvironments(): Observable<void> {
        this._environments.next([]);
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.get(url).pipe(
            tap(e => this._environments.next(e)),
            map((_) => {})
        );
    }

    putEnvironment(apiServerConfig: ApiServerConfig): Observable<number> {
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.put(url, apiServerConfig);
    }

    updateEnvironment(apiServerConfig: ApiServerConfig): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.post(url, apiServerConfig);
    }

    deleteEnvironment(ids: number[]): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/environment`;
        return this.delete(url, { 'id': ids.map(id => id.toString()) });
    }
}