import { ApiServerConfig, ServerConfig } from "./environment.model";

export class AssertionConfig {
    debug: boolean;
    enable: boolean;
    strict: boolean;
    parallel: boolean;
    excludePaths: string[];
}

export class ApiRequestGroupServer {
    app: string;
    env: string;
}

export class ApiRequest {
    id: number;
    uri: string;
    method: string;
    headers: { [key: string]: string };
    body: string;
    name: string;
    description: string;
    configuration: AssertionConfig;
}

export class ApiRequestServer {
    request: ApiRequest;
    requestGroupList: Array<ApiRequestGroupServer>;
}

export class Configuration {
    refer: ServerConfig;
    target: ServerConfig;
}

export class Data {
    tableElements: Array<ApiRequestServer>;
    environments: Array<ApiServerConfig>;
}