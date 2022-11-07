import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Configuration } from "../model/request.model";
import { ApiAssertionsResult } from "../model/trace.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class MainService extends AssertapiClientService {
    
    run(guidValue: string, app: string,  actualEnv: string, expectedEnv: string, ids: Array<number>, disbaledIds: Array<number>, configuration: Configuration): Observable<number> {
        let url: string = `${environment.server}/v1/assert/api/run`;
        return this.post(url, configuration, {
            'GUI_ID': guidValue
        }, { 
            'id': ids?.map(id => id.toString()),
            'disabled_id': disbaledIds?.map(id => id.toString()),
            'actual_env': actualEnv,
            'expected_env': expectedEnv,
            'app': app
        });
    }
}