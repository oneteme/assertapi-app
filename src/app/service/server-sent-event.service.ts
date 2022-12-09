import { Injectable } from "@angular/core";
import { Observable, Observer } from "rxjs";
import { environment } from "src/environments/environment";
import { Configuration } from "../model/request.model";
import { AssertionContext } from "../model/trace.model";

@Injectable({
    providedIn: 'root'
})
export class ServerSentEventService {
    private observable: Observable<Result>;

    watch(): Observable<Result> {
        return this.observable;
    }

    process(result: Result) {
        this.observable = new Observable(obs => obs.next(result));
    }
}

class Result {
    evntSource: EventSource;
    context: AssertionContext;
    app: string;
    actualEnv: string;
    expectedEnv: string;
    disabledIds: number[];
    configuration: Configuration;
}