export function UrlParser(urlString: any, namedUrl?: string): Readonly<{
    hash: string;
    host: string;
    hostname: string;
    namedParams: any;
    namedParamsKeys: any;
    namedParamsValues: any;
    pathNames: any;
    port: string;
    pathname: string;
    protocol: string;
    search: string;
    queryParams: {};
    queryParamsKeys: any[];
    queryParamsValues: any[];
}>;
