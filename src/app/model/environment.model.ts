export class ServerAuth {
    type: 'BASIC' | 'NOVA_BASIC' | 'NOVA_TOKEN' | 'TOKEN';
    'access-token-url'?: string;
    username?: string;
    password?: string;
    token?: string;
}

export class ServerConfig {
    host: string;
    port: string;
    auth: ServerAuth;
}

export class ApiServerConfig {
    id: number;
    serverConfig: ServerConfig;
    app: string;
    env: string;
    isProd: boolean;
}