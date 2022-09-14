import { ApiRequest } from "./request.model";

class ApiExecution {
    host: string;
    start: number;
    end: number;
}

export class ApiAssertionsResult {
    id: number;
    expExecution: ApiExecution;
    actExecution: ApiExecution;
    status: string;
    step: string;
}

export class ApiAssertionsResultServer {
    result: ApiAssertionsResult;
    request: ApiRequest;
}