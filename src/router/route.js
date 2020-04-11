import { UrlParser } from 'url-params-parser';

export function RouterRoute({ routeInfo, path, routeNamedParams, urlParser, namedPath, language }) {
  function namedParams() {
    const parsedParams = UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams

    return { ...routeNamedParams, ...parsedParams }
  }

  function get() {
    return {
      name: path,
      component: routeInfo.component,
      layout: routeInfo.layout,
      queryParams: urlParser.queryParams,
      namedParams: namedParams(),
      path,
      language
    }
  }

  return Object.freeze({ get, namedParams })
}
