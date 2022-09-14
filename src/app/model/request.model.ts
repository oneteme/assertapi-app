class AssertionConfig {
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
    metadata: Map<String, String>;
}