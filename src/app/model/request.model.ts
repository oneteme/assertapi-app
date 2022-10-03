import { ApiServerConfig, ServerConfig } from "./environment.model";

export class AssertionConfig {
    debug: boolean;
    enable: boolean;
    strict: boolean;
    parallel: boolean;
    excludePaths: string[];
}

export class ApiRequest {
    id: number;
    uri: string;
    method: string;
    headers: Map<string, string>;
    body: string;
    charset: string;
    name: string;
    description: string;
    configuration: AssertionConfig;
}

export class ApiRequestServer {
    request: ApiRequest;
    metadata: { [key: string]: string };
}

export class Configuration {
    refer: ServerConfig;
    target: ServerConfig;
}

export class Data {
    ids: Array<number>;
    environments: Array<ApiServerConfig>;
}