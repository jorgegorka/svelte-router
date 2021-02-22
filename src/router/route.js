import { UrlParser } from './url_parser'

function RouterRoute({ routeInfo, path, routeNamedParams, urlParser, namedPath, language }) {
  function namedParams() {
    const parsedParams = UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams

    return { ...routeNamedParams, ...parsedParams }
  }

  function get() {
    return {
      name: path,
      component: routeInfo.component,
      hash: urlParser.hash,
      layout: routeInfo.layout,
      queryParams: urlParser.queryParams,
      namedParams: namedParams(),
      path,
      language
    }
  }

  return Object.freeze({ get, namedParams })
}

export { RouterRoute }
