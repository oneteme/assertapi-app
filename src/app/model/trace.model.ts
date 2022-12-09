import { ApiServerConfig } from "./environment.model";
import { ApiRequest } from "./request.model";

export class ApiExecution {
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

export class AssertionContext {
    user: string;
	os: string;
	address: string;
}

export class ApiTraceGroup {
    id: number;
    user: string;
    os: string;
    address: string;
    app: string;
    actualEnv: string;
    expectedEnv: string;
    status: string;
    nbTest: number;
    nbTestOk: number;
    nbTestDisable: number;
}

export class ResponseComparator {
    exp: ApiResponseServer;
    act: ApiResponseServer;
    status: string;
    step: string;
}

export class ApiResponseServer {
    statusCode: number;
	contentType: string;
	response: string;
}

export class ComparatorData {
    request: ApiRequest;
    responseComparator: ResponseComparator;
}

export class Data {
    tableElements: Array<ApiAssertionsResultServer>;
    environments: Array<ApiServerConfig>;
}