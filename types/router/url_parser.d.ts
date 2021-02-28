export function UrlParser(
  urlString: string,
  namedUrl?: string
): Readonly<{
  hash: string;
  host: string;
  hostname: string;
  namedParams: Record<string, string>;
  namedParamsKeys: string[];
  namedParamsValues: string[];
  pathNames: string[];
  port: string;
  pathname: string;
  protocol: string;
  search: string;
  queryParams: Record<string, string>;
  queryParamsKeys: string[];
  queryParamsValues: string[];
}>;
