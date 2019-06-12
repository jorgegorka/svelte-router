/**
 * Returns the query params of a url into an object
 * @param queryParams
 **/
const parseQueryString = queryParams => {
  let searchParams = [];

  if (typeof document !== "undefined") {
    searchParams = new URLSearchParams(document.location.search);
  } else {
    searchParams = new URLSearchParams(queryParams);
  }
  const result = {};

  searchParams.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

/**
 * Split a pathname based on /
 * @param pathName
 **/
const getPathNames = pathName => {
  if (pathName === "/" || pathName.trim().length === 0) return [pathName];
  if (pathName[0] === "/") {
    pathName = pathName.slice(1);
  }

  return pathName.split("/");
};

/**
 * Return the named params (placeholders) of a pathname
 * @param pathname
 **/
const getNamedParams = (pathName = "") => {
  if (pathName.trim().length === "") return [];

  const names = pathName.split(":");
  names.shift();

  return names.map(name => (name.slice(-1) === "/" ? name.slice(0, -1) : name));
};

/**
 * Return the first part of a pathname
 * @param name
 **/
const nameToPath = (name = "") => {
  const routeName = getPathNames(name)[0];
  return routeName.toLowerCase();
};

module.exports = { parseQueryString, getPathNames, getNamedParams, nameToPath };
