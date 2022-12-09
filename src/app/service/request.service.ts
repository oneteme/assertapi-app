import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiServerConfig } from "../model/environment.model";
import { ApiRequestServer } from "../model/request.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class RequestService extends AssertapiClientService {
    private _requests: BehaviorSubject<Array<ApiRequestServer>> = new BehaviorSubject([]);
    public readonly requests: Observable<Array<ApiRequestServer>> = this._requests.asObservable();

    getRequests(): Observable<void> {
        this._requests.next([]);
        let url: string = `${environment.server}/v1/assert/api/request/all`;
        return this.get(url).pipe(
            tap(r => this._requests.next(r)),
            map((_) => {})
        );
    }

    putRequest(apiRequestServer: ApiRequestServer): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request`;
        return this.put(url, apiRequestServer).pipe(
            tap(id => {
                apiRequestServer.request.id = id;
                var requests = this._requests.value;
                requests.push(apiRequestServer);
                this._requests.next(requests);
            }),
            map((_) => {})
        );
    }

    updateRequest(apiRequestServer: ApiRequestServer): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request`;
        return this.post(url, apiRequestServer).pipe(
            tap(() => {
                var requests = this._requests.value;
                var index = requests.findIndex(d => d.request.id == apiRequestServer.request.id);
                requests.splice(index, 1, apiRequestServer);
                this._requests.next(requests);
            })
        );
    }

    deleteRequest(ids: number[]): Observable<void> {
        let url: string = `${environment.server}/v1/assert/api/request`;
        return this.delete(url, { 'id': ids.map(id => id.toString()) }).pipe(
            tap(() => {
                var requests = this._requests.value;
                ids.forEach(id => {
                    var index = requests.findIndex(d => d.request.id == id);
                    requests.splice(index, 1);
                })
                this._requests.next(requests);
            })
        );
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