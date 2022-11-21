export class ServerAuth {
    type: LoginTypeEnum;
    'access-token-url'?: string;
    username?: string;
    password?: string;
    token?: string;
}

export class ServerConfig {
    host: string;
    port: number;
    auth: ServerAuth;
}

export class ApiServerConfig {
    id: number;
    serverConfig: ServerConfig;
    app: string;
    env: string;
    isProd: boolean;
}

export enum LoginTypeEnum {
    BASIC = 'BASIC',
    NOVA_BASIC = 'NOVA_BASIC', 
    NOVA_TOKEN = 'NOVA_TOKEN', 
    TOKEN = 'TOKEN'
}