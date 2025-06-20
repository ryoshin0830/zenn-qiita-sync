export interface XCredentials {
    appKey: string;
    appSecret: string;
    accessToken: string;
    accessSecret: string;
}
export declare class XHelper {
    private client;
    constructor(credentials: XCredentials);
    postArticleSummary(title: string, topics: string[], qiitaUrl: string): Promise<{
        id: string;
        url: string;
    }>;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=x-helper.d.ts.map