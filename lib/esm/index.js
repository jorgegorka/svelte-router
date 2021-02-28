function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const { set, subscribe: subscribe$1 } = writable({});

const remove = () => {
  set({});
};

const activeRoute = {
  subscribe: subscribe$1,
  set,
  remove,
};

const UrlParser = (urlString, namedUrl = '') => {
  const urlBase = new URL(urlString);

  /**
   * Wrapper for URL.hash
   *
   **/
  function hash() {
    return urlBase.hash;
  }

  /**
   * Wrapper for URL.host
   *
   **/
  function host() {
    return urlBase.host;
  }

  /**
   * Wrapper for URL.hostname
   *
   **/
  function hostname() {
    return urlBase.hostname;
  }

  /**
   * Returns an object with all the named params and their values
   *
   **/
  function namedParams() {
    const allPathName = pathNames();
    const allNamedParamsKeys = namedParamsWithIndex();

    return allNamedParamsKeys.reduce((values, paramKey) => {
      values[paramKey.value] = allPathName[paramKey.index];
      return values;
    }, {});
  }

  /**
   * Returns an array with all the named param keys
   *
   **/
  function namedParamsKeys() {
    const allNamedParamsKeys = namedParamsWithIndex();

    return allNamedParamsKeys.reduce((values, paramKey) => {
      values.push(paramKey.value);
      return values;
    }, []);
  }

  /**
   * Returns an array with all the named param values
   *
   **/
  function namedParamsValues() {
    const allPathName = pathNames();
    const allNamedParamsKeys = namedParamsWithIndex();

    return allNamedParamsKeys.reduce((values, paramKey) => {
      values.push(allPathName[paramKey.index]);
      return values;
    }, []);
  }

  /**
   * Returns an array with all named param ids and their position in the path
   * Private
   **/
  function namedParamsWithIndex() {
    const namedUrlParams = getPathNames(namedUrl);

    return namedUrlParams.reduce((validParams, param, index) => {
      if (param[0] === ':') {
        validParams.push({ value: param.slice(1), index });
      }
      return validParams;
    }, []);
  }

  /**
   * Wrapper for URL.port
   *
   **/
  function port() {
    return urlBase.port;
  }

  /**
   * Wrapper for URL.pathname
   *
   **/
  function pathname() {
    return urlBase.pathname;
  }

  /**
   * Wrapper for URL.protocol
   *
   **/
  function protocol() {
    return urlBase.protocol;
  }

  /**
   * Wrapper for URL.search
   *
   **/
  function search() {
    return urlBase.search;
  }

  /**
   * Returns an object with all query params and their values
   *
   **/
  function queryParams() {
    const params = {};
    urlBase.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  /**
   * Returns an array with all the query param keys
   *
   **/
  function queryParamsKeys() {
    const params = [];
    urlBase.searchParams.forEach((_value, key) => {
      params.push(key);
    });

    return params;
  }

  /**
   * Returns an array with all the query param values
   *
   **/
  function queryParamsValues() {
    const params = [];
    urlBase.searchParams.forEach((value) => {
      params.push(value);
    });

    return params;
  }

  /**
   * Returns an array with all the elements of a pathname
   *
   **/
  function pathNames() {
    return getPathNames(urlBase.pathname);
  }

  /**
   * Returns an array with all the parts of a pathname
   * Private method
   **/
  function getPathNames(pathName) {
    if (pathName === '/' || pathName.trim().length === 0) return [pathName];
    if (pathName.slice(-1) === '/') {
      pathName = pathName.slice(0, -1);
    }
    if (pathName[0] === '/') {
      pathName = pathName.slice(1);
    }

    return pathName.split('/');
  }

  return Object.freeze({
    hash: hash(),
    host: host(),
    hostname: hostname(),
    namedParams: namedParams(),
    namedParamsKeys: namedParamsKeys(),
    namedParamsValues: namedParamsValues(),
    pathNames: pathNames(),
    port: port(),
    pathname: pathname(),
    protocol: protocol(),
    search: search(),
    queryParams: queryParams(),
    queryParamsKeys: queryParamsKeys(),
    queryParamsValues: queryParamsValues(),
  });
};

/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
const anyEmptyNestedRoutes = (routeObject) => {
  let result = false;
  if (Object.keys(routeObject).length === 0) {
    return true;
  }

  if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
    result = true;
  } else if (routeObject.childRoute) {
    result = anyEmptyNestedRoutes(routeObject.childRoute);
  }

  return result;
};

/**
 * Compare two routes ignoring named params
 * @param pathName string
 * @param routeName string
 **/

const compareRoutes = (pathName, routeName) => {
  routeName = removeSlash(routeName);

  if (routeName.includes(':')) {
    return routeName.includes(pathName);
  } else {
    return routeName.startsWith(pathName);
  }
};

/**
 * Returns a boolean indicating if the name of path exists in the route based on the language parameter
 * @param pathName string
 * @param route object
 * @param language string
 **/

const findLocalisedRoute = (pathName, route, language) => {
  let exists = false;

  if (language) {
    return { exists: route.lang && route.lang[language] && route.lang[language].includes(pathName), language };
  }

  exists = compareRoutes(pathName, route.name);

  if (!exists && route.lang && typeof route.lang === 'object') {
    for (const [key, value] of Object.entries(route.lang)) {
      if (compareRoutes(pathName, value)) {
        exists = true;
        language = key;
      }
    }
  }

  return { exists, language };
};

/**
 * Return all the consecutive named param (placeholders) of a pathname
 * @param pathname
 **/
const getNamedParams = (pathName = '') => {
  if (pathName.trim().length === 0) return [];
  const namedUrlParams = getPathNames(pathName);
  return namedUrlParams.reduce((validParams, param) => {
    if (param[0] === ':') {
      validParams.push(param.slice(1));
    }

    return validParams;
  }, []);
};

/**
 * Split a pathname based on /
 * @param pathName
 * Private method
 **/
const getPathNames = (pathName) => {
  if (pathName === '/' || pathName.trim().length === 0) return [pathName];

  pathName = removeSlash(pathName, 'both');

  return pathName.split('/');
};

/**
 * Return the first part of a pathname until the first named param is found
 * @param name
 **/
const nameToPath = (name = '') => {
  let routeName;
  if (name === '/' || name.trim().length === 0) return name;
  name = removeSlash(name, 'lead');
  routeName = name.split(':')[0];
  routeName = removeSlash(routeName, 'trail');

  return routeName.toLowerCase();
};

/**
 * Return the path name excluding query params
 * @param name
 **/
const pathWithoutQueryParams = (currentRoute) => {
  const path = currentRoute.path.split('?');
  return path[0];
};

/**
 * Return the path name including query params
 * @param name
 **/
const pathWithQueryParams = (currentRoute) => {
  let queryParams = [];
  if (currentRoute.queryParams) {
    for (let [key, value] of Object.entries(currentRoute.queryParams)) {
      queryParams.push(`${key}=${value}`);
    }
  }

  const hash = currentRoute.hash ? currentRoute.hash : '';

  if (queryParams.length > 0) {
    return `${currentRoute.path}?${queryParams.join('&')}${hash}`;
  } else {
    return currentRoute.path + hash;
  }
};

/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/
const removeExtraPaths = (pathNames, basePathNames) => {
  const names = basePathNames.split('/');
  if (names.length > 1) {
    names.forEach(function (name, index) {
      if (name.length > 0 && index > 0) {
        pathNames.shift();
      }
    });
  }

  return pathNames;
};

/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/

const removeSlash = (pathName, position = 'lead') => {
  if (pathName.trim().length < 1) {
    return '';
  }

  if (position === 'trail' || position === 'both') {
    if (pathName.slice(-1) === '/') {
      pathName = pathName.slice(0, -1);
    }
  }

  if (position === 'lead' || position === 'both') {
    if (pathName[0] === '/') {
      pathName = pathName.slice(1);
    }
  }

  return pathName;
};

/**
 * Returns the name of the route based on the language parameter
 * @param route object
 * @param language string
 **/

const routeNameLocalised = (route, language = null) => {
  if (!language || !route.lang || !route.lang[language]) {
    return route.name;
  } else {
    return route.lang[language];
  }
};

/**
 * Return the path name excluding query params
 * @param name
 **/
const startsWithNamedParam = (currentRoute) => {
  const routeName = removeSlash(currentRoute);
  return routeName.startsWith(':');
};

/**
 * Updates the base route path.
 * Route objects can have nested routes (childRoutes) or just a long name like "admin/employees/show/:id"
 *
 * @param basePath string
 * @param pathNames array
 * @param route object
 * @param language string
 **/

const updateRoutePath = (basePath, pathNames, route, language, convert = false) => {
  if (basePath === '/' || basePath.trim().length === 0) return { result: basePath, language: null };

  let basePathResult = basePath;
  let routeName = route.name;
  let currentLanguage = language;

  if (convert) {
    currentLanguage = '';
  }

  routeName = removeSlash(routeName);
  basePathResult = removeSlash(basePathResult);

  if (!route.childRoute) {
    let localisedRoute = findLocalisedRoute(basePathResult, route, currentLanguage);

    if (localisedRoute.exists && convert) {
      basePathResult = routeNameLocalised(route, language);
    }

    let routeNames = routeName.split(':')[0];
    routeNames = removeSlash(routeNames, 'trail');
    routeNames = routeNames.split('/');
    routeNames.shift();
    routeNames.forEach(() => {
      const currentPathName = pathNames[0];
      localisedRoute = findLocalisedRoute(`${basePathResult}/${currentPathName}`, route, currentLanguage);

      if (currentPathName && localisedRoute.exists) {
        if (convert) {
          basePathResult = routeNameLocalised(route, language);
        } else {
          basePathResult = `${basePathResult}/${currentPathName}`;
        }
        pathNames.shift();
      } else {
        return { result: basePathResult, language: localisedRoute.language };
      }
    });
    return { result: basePathResult, language: localisedRoute.language };
  } else {
    return { result: basePath, language: currentLanguage };
  }
};

const RouterCurrent = (trackPage) => {
  const trackPageview = trackPage || false;
  let activeRoute = '';

  const setActive = (newRoute, updateBrowserHistory) => {
    activeRoute = newRoute.path;
    pushActiveRoute(newRoute, updateBrowserHistory);
  };

  const active = () => {
    return activeRoute;
  };

  /**
   * Returns true if pathName is current active route
   * @param pathName String The path name to check against the current route.
   * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
   **/
  const isActive = (queryPath, includePath = false) => {
    if (queryPath[0] !== '/') {
      queryPath = '/' + queryPath;
    }

    // remove query params for comparison
    let pathName = UrlParser(`http://fake.com${queryPath}`).pathname;
    let activeRoutePath = UrlParser(`http://fake.com${activeRoute}`).pathname;

    pathName = removeSlash(pathName, 'trail');

    activeRoutePath = removeSlash(activeRoutePath, 'trail');

    if (includePath) {
      return activeRoutePath.includes(pathName);
    } else {
      return activeRoutePath === pathName;
    }
  };

  const pushActiveRoute = (newRoute, updateBrowserHistory) => {
    if (typeof window !== 'undefined') {
      const pathAndSearch = pathWithQueryParams(newRoute);

      if (updateBrowserHistory) {
        window.history.pushState({ page: pathAndSearch }, '', pathAndSearch);
      }
      // Moving back in history does not update browser history but does update tracking.
      if (trackPageview) {
        gaTracking(pathAndSearch);
      }
    }
  };

  const gaTracking = (newPage) => {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', newPage);
      ga('send', 'pageview');
    }
  };

  return Object.freeze({ active, isActive, setActive });
};

const RouterGuard = (onlyIf) => {
  const guardInfo = onlyIf;

  const valid = () => {
    return guardInfo && guardInfo.guard && typeof guardInfo.guard === 'function';
  };

  const redirect = () => {
    return !guardInfo.guard();
  };

  const redirectPath = () => {
    let destinationUrl = '/';
    if (guardInfo.redirect && guardInfo.redirect.length > 0) {
      destinationUrl = guardInfo.redirect;
    }

    return destinationUrl;
  };

  return Object.freeze({ valid, redirect, redirectPath });
};

const RouterRedirect = (route, currentPath) => {
  const guard = RouterGuard(route.onlyIf);

  const path = () => {
    let redirectTo = currentPath;
    if (route.redirectTo && route.redirectTo.length > 0) {
      redirectTo = route.redirectTo;
    }

    if (guard.valid() && guard.redirect()) {
      redirectTo = guard.redirectPath();
    }

    return redirectTo;
  };

  return Object.freeze({ path });
};

function RouterRoute({ routeInfo, path, routeNamedParams, urlParser, namedPath, language }) {
  const namedParams = () => {
    const parsedParams = UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams;

    return { ...routeNamedParams, ...parsedParams };
  };

  const get = () => {
    return {
      name: path,
      component: routeInfo.component,
      hash: urlParser.hash,
      layout: routeInfo.layout,
      queryParams: urlParser.queryParams,
      namedParams: namedParams(),
      path,
      language,
    };
  };

  return Object.freeze({ get, namedParams });
}

function RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage }) {
  let updatedPathRoute;
  let route;
  let routePathLanguage = currentLanguage;

  function updatedPath(currentRoute) {
    route = currentRoute;
    updatedPathRoute = updateRoutePath(basePathName, pathNames, route, routePathLanguage, convert);
    routePathLanguage = convert ? currentLanguage : updatedPathRoute.language;

    return updatedPathRoute;
  }

  function localisedPathName() {
    return routeNameLocalised(route, routePathLanguage);
  }

  function localisedRouteWithoutNamedParams() {
    return nameToPath(localisedPathName());
  }

  function basePathNameWithoutNamedParams() {
    return nameToPath(updatedPathRoute.result);
  }

  function namedPath() {
    const localisedPath = localisedPathName();

    return basePath ? `${basePath}/${localisedPath}` : localisedPath;
  }

  function routePath() {
    let routePathValue = `${basePath}/${basePathNameWithoutNamedParams()}`;
    if (routePathValue === '//') {
      routePathValue = '/';
    }

    if (routePathLanguage) {
      pathNames = removeExtraPaths(pathNames, localisedRouteWithoutNamedParams());
    }

    const namedParams = getNamedParams(localisedPathName());
    if (namedParams && namedParams.length > 0) {
      namedParams.forEach(function () {
        if (pathNames.length > 0) {
          routePathValue += `/${pathNames.shift()}`;
        }
      });
    }

    return routePathValue;
  }

  function routeLanguage() {
    return routePathLanguage;
  }

  function basePathSameAsLocalised() {
    return basePathNameWithoutNamedParams() === localisedRouteWithoutNamedParams();
  }

  return Object.freeze({
    basePathSameAsLocalised,
    updatedPath,
    basePathNameWithoutNamedParams,
    localisedPathName,
    localisedRouteWithoutNamedParams,
    namedPath,
    pathNames,
    routeLanguage,
    routePath,
  });
}

const NotFoundPage = '/404.html';

function RouterFinder({ routes, currentUrl, routerOptions, convert }) {
  const defaultLanguage = routerOptions.defaultLanguage;
  const sitePrefix = routerOptions.prefix ? routerOptions.prefix.toLowerCase() : '';
  const urlParser = parseCurrentUrl(currentUrl, sitePrefix);
  let redirectTo = '';
  let routeNamedParams = {};
  let staticParamMatch = false;

  function findActiveRoute() {
    let searchActiveRoute = searchActiveRoutes(routes, '', urlParser.pathNames, routerOptions.lang, convert);

    if (!searchActiveRoute || !Object.keys(searchActiveRoute).length || anyEmptyNestedRoutes(searchActiveRoute)) {
      if (typeof window !== 'undefined') {
        searchActiveRoute = routeNotFound(routerOptions.lang);
      }
    } else {
      searchActiveRoute.path = pathWithoutQueryParams(searchActiveRoute);
      if (sitePrefix) {
        searchActiveRoute.path = `/${sitePrefix}${searchActiveRoute.path}`;
      }
    }

    return searchActiveRoute;
  }

  /**
   * Gets an array of routes and the browser pathname and return the active route
   * @param routes
   * @param basePath
   * @param pathNames
   **/
  function searchActiveRoutes(routes, basePath, pathNames, currentLanguage, convert) {
    let currentRoute = {};
    let basePathName = pathNames.shift().toLowerCase();
    const routerPath = RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage });
    staticParamMatch = false;

    routes.forEach(function (route) {
      routerPath.updatedPath(route);
      if (matchRoute(routerPath, route.name)) {
        let routePath = routerPath.routePath();
        redirectTo = RouterRedirect(route, redirectTo).path();

        if (currentRoute.name !== routePath) {
          currentRoute = setCurrentRoute({
            route,
            routePath,
            routeLanguage: routerPath.routeLanguage(),
            urlParser,
            namedPath: routerPath.namedPath(),
          });
        }

        if (route.nestedRoutes && route.nestedRoutes.length > 0 && routerPath.pathNames.length > 0) {
          currentRoute.childRoute = searchActiveRoutes(
            route.nestedRoutes,
            routePath,
            routerPath.pathNames,
            routerPath.routeLanguage(),
            convert
          );
          currentRoute.path = currentRoute.childRoute.path;
          currentRoute.language = currentRoute.childRoute.language;
        } else if (nestedRoutesAndNoPath(route, routerPath.pathNames)) {
          const indexRoute = searchActiveRoutes(
            route.nestedRoutes,
            routePath,
            ['index'],
            routerPath.routeLanguage(),
            convert
          );
          if (indexRoute && Object.keys(indexRoute).length > 0) {
            currentRoute.childRoute = indexRoute;
            currentRoute.language = currentRoute.childRoute.language;
          }
        }
      }
    });

    if (redirectTo) {
      currentRoute.redirectTo = redirectTo;
    }

    return currentRoute;
  }

  function matchRoute(routerPath, routeName) {
    const basePathSameAsLocalised = routerPath.basePathSameAsLocalised();
    if (basePathSameAsLocalised) {
      staticParamMatch = true;
    }

    return basePathSameAsLocalised || (!staticParamMatch && startsWithNamedParam(routeName));
  }

  function nestedRoutesAndNoPath(route, pathNames) {
    return route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0;
  }

  function parseCurrentUrl(currentUrl, sitePrefix) {
    if (sitePrefix && sitePrefix.trim().length > 0) {
      const noPrefixUrl = currentUrl.replace(sitePrefix + '/', '');
      return UrlParser(noPrefixUrl);
    } else {
      return UrlParser(currentUrl);
    }
  }

  function setCurrentRoute({ route, routePath, routeLanguage, urlParser, namedPath }) {
    const routerRoute = RouterRoute({
      routeInfo: route,
      urlParser,
      path: routePath,
      routeNamedParams,
      namedPath,
      language: routeLanguage || defaultLanguage,
    });
    routeNamedParams = routerRoute.namedParams();

    return routerRoute.get();
  }

  const routeNotFound = (customLanguage) => {
    const custom404Page = routes.find((route) => route.name == '404');
    const language = customLanguage || defaultLanguage || '';
    if (custom404Page) {
      return { ...custom404Page, language, path: '404' };
    } else {
      return { name: '404', component: '', path: '404', redirectTo: NotFoundPage };
    }
  };

  return Object.freeze({ findActiveRoute });
}

const NotFoundPage$1 = '/404.html';

let userDefinedRoutes = [];
let routerOptions = {};
let routerCurrent;

/**
 * Object exposes one single property: activeRoute
 * @param routes  Array of routes
 * @param currentUrl current url
 * @param options configuration options
 **/
const SpaRouter = (routes, currentUrl, options = {}) => {
  routerOptions = { ...options };
  if (typeof currentUrl === 'undefined' || currentUrl === '') {
    currentUrl = document.location.href;
  }

  routerCurrent = RouterCurrent(routerOptions.gaPageviews);

  currentUrl = removeSlash(currentUrl, 'trail');
  userDefinedRoutes = routes;

  const findActiveRoute = () => {
    let convert = false;

    if (routerOptions.langConvertTo) {
      routerOptions.lang = routerOptions.langConvertTo;
      convert = true;
    }

    return RouterFinder({ routes, currentUrl, routerOptions, convert }).findActiveRoute();
  };

  /**
   * Redirect current route to another
   * @param destinationUrl
   **/
  const navigateNow = (destinationUrl, updateBrowserHistory) => {
    if (typeof window !== 'undefined') {
      if (destinationUrl === NotFoundPage$1) {
        routerCurrent.setActive({ path: NotFoundPage$1 }, updateBrowserHistory);
      } else {
        navigateTo(destinationUrl);
      }
    }

    return destinationUrl;
  };

  const setActiveRoute = (updateBrowserHistory = true) => {
    const currentRoute = findActiveRoute();
    if (currentRoute.redirectTo) {
      return navigateNow(currentRoute.redirectTo, updateBrowserHistory);
    }

    routerCurrent.setActive(currentRoute, updateBrowserHistory);
    activeRoute.set(currentRoute);

    return currentRoute;
  };

  return Object.freeze({
    setActiveRoute,
    findActiveRoute,
  });
};

/**
 * Converts a route to its localised version
 * @param pathName
 **/
const localisedRoute = (pathName, language) => {
  pathName = removeSlash(pathName, 'lead');
  routerOptions.langConvertTo = language;

  return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).findActiveRoute();
};

/**
 * Updates the current active route and updates the browser pathname
 * @param pathName String
 * @param language String
 * @param updateBrowserHistory Boolean
 **/
const navigateTo = (pathName, language = null, updateBrowserHistory = true) => {
  pathName = removeSlash(pathName, 'lead');

  if (language) {
    routerOptions.langConvertTo = language;
  }

  return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).setActiveRoute(
    updateBrowserHistory
  );
};

/**
 * Returns true if pathName is current active route
 * @param pathName String The path name to check against the current route.
 * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
 **/
const routeIsActive = (queryPath, includePath = false) => {
  return routerCurrent.isActive(queryPath, includePath);
};

if (typeof window !== 'undefined') {
  // Avoid full page reload on local routes
  window.addEventListener('click', (event) => {
    if (event.target.localName.toLowerCase() !== 'a') return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;

    const sitePrefix = routerOptions.prefix ? `/${routerOptions.prefix.toLowerCase()}` : '';
    const targetHostNameInternal = event.target.pathname && event.target.host === window.location.host;
    const prefixMatchPath = sitePrefix.length > 1 ? event.target.pathname.startsWith(sitePrefix) : true;

    if (targetHostNameInternal && prefixMatchPath) {
      event.preventDefault();
      let navigatePathname = event.target.pathname + event.target.search;

      const destinationUrl = navigatePathname + event.target.search + event.target.hash;
      if (event.target.target === '_blank') {
        window.open(destinationUrl, 'newTab');
      } else {
        navigateTo(destinationUrl);
      }
    }
  });

  window.onpopstate = function (_event) {
    let navigatePathname = window.location.pathname + window.location.search + window.location.hash;

    navigateTo(navigatePathname, null, false);
  };
}

/* src/components/route.svelte generated by Svelte v3.32.3 */

function create_if_block_2(ctx) {
	let route;
	let current;

	route = new Route({
			props: {
				currentRoute: /*currentRoute*/ ctx[0].childRoute,
				params: /*params*/ ctx[1]
			}
		});

	return {
		c() {
			create_component(route.$$.fragment);
		},
		m(target, anchor) {
			mount_component(route, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const route_changes = {};
			if (dirty & /*currentRoute*/ 1) route_changes.currentRoute = /*currentRoute*/ ctx[0].childRoute;
			if (dirty & /*params*/ 2) route_changes.params = /*params*/ ctx[1];
			route.$set(route_changes);
		},
		i(local) {
			if (current) return;
			transition_in(route.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(route.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(route, detaching);
		}
	};
}

// (8:33) 
function create_if_block_1(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	var switch_value = /*currentRoute*/ ctx[0].component;

	function switch_props(ctx) {
		return {
			props: {
				currentRoute: {
					.../*currentRoute*/ ctx[0],
					component: ""
				},
				params: /*params*/ ctx[1]
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};

			if (dirty & /*currentRoute*/ 1) switch_instance_changes.currentRoute = {
				.../*currentRoute*/ ctx[0],
				component: ""
			};

			if (dirty & /*params*/ 2) switch_instance_changes.params = /*params*/ ctx[1];

			if (switch_value !== (switch_value = /*currentRoute*/ ctx[0].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (6:0) {#if currentRoute.layout}
function create_if_block(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	var switch_value = /*currentRoute*/ ctx[0].layout;

	function switch_props(ctx) {
		return {
			props: {
				currentRoute: { .../*currentRoute*/ ctx[0], layout: "" },
				params: /*params*/ ctx[1]
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty & /*currentRoute*/ 1) switch_instance_changes.currentRoute = { .../*currentRoute*/ ctx[0], layout: "" };
			if (dirty & /*params*/ 2) switch_instance_changes.params = /*params*/ ctx[1];

			if (switch_value !== (switch_value = /*currentRoute*/ ctx[0].layout)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function create_fragment(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*currentRoute*/ ctx[0].layout) return 0;
		if (/*currentRoute*/ ctx[0].component) return 1;
		if (/*currentRoute*/ ctx[0].childRoute) return 2;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { currentRoute = {} } = $$props;
	let { params = {} } = $$props;

	$$self.$$set = $$props => {
		if ("currentRoute" in $$props) $$invalidate(0, currentRoute = $$props.currentRoute);
		if ("params" in $$props) $$invalidate(1, params = $$props.params);
	};

	return [currentRoute, params];
}

class Route extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { currentRoute: 0, params: 1 });
	}
}

/* src/components/router.svelte generated by Svelte v3.32.3 */

function create_fragment$1(ctx) {
	let route;
	let current;

	route = new Route({
			props: { currentRoute: /*$activeRoute*/ ctx[0] }
		});

	return {
		c() {
			create_component(route.$$.fragment);
		},
		m(target, anchor) {
			mount_component(route, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const route_changes = {};
			if (dirty & /*$activeRoute*/ 1) route_changes.currentRoute = /*$activeRoute*/ ctx[0];
			route.$set(route_changes);
		},
		i(local) {
			if (current) return;
			transition_in(route.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(route.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(route, detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $activeRoute;
	component_subscribe($$self, activeRoute, $$value => $$invalidate(0, $activeRoute = $$value));
	let { routes = [] } = $$props;
	let { options = {} } = $$props;

	onMount(() => {
		SpaRouter(routes, document.location.href, options).setActiveRoute();
	});

	$$self.$$set = $$props => {
		if ("routes" in $$props) $$invalidate(1, routes = $$props.routes);
		if ("options" in $$props) $$invalidate(2, options = $$props.options);
	};

	return [$activeRoute, routes, options];
}

class Router extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { routes: 1, options: 2 });
	}
}

/* src/components/navigate.svelte generated by Svelte v3.32.3 */

function create_fragment$2(ctx) {
	let a;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			a = element("a");
			if (default_slot) default_slot.c();
			attr(a, "href", /*to*/ ctx[0]);
			attr(a, "title", /*title*/ ctx[1]);
			attr(a, "class", /*styles*/ ctx[2]);
			toggle_class(a, "active", routeIsActive(/*to*/ ctx[0]));
		},
		m(target, anchor) {
			insert(target, a, anchor);

			if (default_slot) {
				default_slot.m(a, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(a, "click", /*navigate*/ ctx[3]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 32) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
				}
			}

			if (!current || dirty & /*to*/ 1) {
				attr(a, "href", /*to*/ ctx[0]);
			}

			if (!current || dirty & /*title*/ 2) {
				attr(a, "title", /*title*/ ctx[1]);
			}

			if (!current || dirty & /*styles*/ 4) {
				attr(a, "class", /*styles*/ ctx[2]);
			}

			if (dirty & /*styles, routeIsActive, to*/ 5) {
				toggle_class(a, "active", routeIsActive(/*to*/ ctx[0]));
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(a);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { to = "/" } = $$props;
	let { title = "" } = $$props;
	let { styles = "" } = $$props;
	let { lang = null } = $$props;

	onMount(() => {
		if (lang) {
			const route = localisedRoute(to, lang);

			if (route) {
				$$invalidate(0, to = route.path);
			}
		}
	});

	const navigate = event => {
		if (event.metaKey || event.ctrlKey || event.shiftKey) return;
		event.preventDefault();
		event.stopPropagation();
		navigateTo(to);
	};

	$$self.$$set = $$props => {
		if ("to" in $$props) $$invalidate(0, to = $$props.to);
		if ("title" in $$props) $$invalidate(1, title = $$props.title);
		if ("styles" in $$props) $$invalidate(2, styles = $$props.styles);
		if ("lang" in $$props) $$invalidate(4, lang = $$props.lang);
		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [to, title, styles, navigate, lang, $$scope, slots];
}

class Navigate extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 0, title: 1, styles: 2, lang: 4 });
	}
}

export { Navigate, Route, Router, SpaRouter, localisedRoute, navigateTo, routeIsActive };
