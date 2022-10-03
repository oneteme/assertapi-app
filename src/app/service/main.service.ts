import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Configuration } from "../model/request.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class MainService extends AssertapiClientService {
    run(ids: Array<number>, configuration: Configuration): Observable<number> {
        let url: string = `${environment.server}/v1/assert/api/run`;
        return this.post(url, configuration, { 'id': ids.map(id => id.toString()) });
    }
}