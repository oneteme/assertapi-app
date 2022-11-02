import { ApiServerConfig } from "./environment.model";
import { ApiRequest } from "./request.model";

export class ApiExecution {
    host: string;
    start: number;
    end: number;
    statusCode: number;
	contentType: string;
	response: string;
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

export class Data {
    tableElements: Array<ApiAssertionsResultServer>;
    environments: Array<ApiServerConfig>;
}