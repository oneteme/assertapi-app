import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Configuration } from "../model/request.model";
import { AssertionResult, ResponseComparator } from "../model/trace.model";
import { AssertapiClientService } from "./assertapi-client.service";

@Injectable({
    providedIn: 'root'
})
export class MainService extends AssertapiClientService {
    private configuration = new BehaviorSubject<Configuration>(null);
    public $configuration = this.configuration.asObservable();

    run(app: string,  latestRelease: string, stableRelease: string, ids: Array<number>, excluded: boolean, configuration: Configuration): Observable<number> {
        this.configuration.next(configuration);
        let url: string = `${environment.server}/v1/assert/api/run`;
        return this.post(url, configuration, {}, { 
            'id': ids?.map(id => id.toString()),
            'excluded': excluded,
            'latest_release': latestRelease,
            'stable_release': stableRelease,
            'app': app
        });
    }

    rerun(id: number, configuration: Configuration): Observable<ResponseComparator> {
        let url: string = `${environment.server}/v1/assert/api/run/${id}`;
        return this.post(url, configuration);
    }
}