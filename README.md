# Svelte Router SPA

![version](https://img.shields.io/npm/v/svelte-router-spa.svg)
![license](https://img.shields.io/github/license/jorgegorka/svelte-router.svg)
![Code climate](https://img.shields.io/codeclimate/maintainability/jorgegorka/svelte-router.svg)

## What is Svelte Router SPA

Svelte Router adds routing to your Svelte apps. It keeps your routes organized in a single place.

With Svelte Router SPA you have all the features you need to create modern web applications with minimal configuration.

It's designed for Single Page Applications (SPA). If you need Server Side Rendering then consider using [Sapper](https://sapper.svelte.dev/).

## Index

* [Features](#features)
* [Install](#install)
* [Usage](#usage)
  * [Layouts and route info](#layouts-and-route-info)
  * [Anatomy of a route](#anatomy-of-a-route)
  * [Using named params as first part of path name (not recommended)](#using-named-params-as-first-part-of-path-name-not-recommended)
* [Route prefix](#route-prefix)
* [Localisation](#localisation)
  * [Rendering a page in different languages](#rendering-a-page-in-different-languages)
* [Google Analytics](#google-analytics)
* [Not Found - 404](#not-found---404)
* [API](#api)
  * [Router](#router)
  * [Route](#route)
  * [currentRoute](#currentroute)
  * [Navigate](#navigate)
  * [navigateTo](#navigateto)
  * [routeIsActive](#routeisactive)
  * [localisedRoute](#localisedroute)
* [Example of use](#example-of-use)
* [Credits](#credits)

## Features

- Define your routes in a single interface
- Layouts global, per page or nested.
- Nested routes.
- Named params.
- Localisation.
- Guards to protect urls. Public and private urls.
- Route prefix.
- Track pageviews in Google Analytics (optional).
- Use standard `<a href="/about-us">About</a>` elements to navigate between pages (or use [`<Navigate />`](#navigate) for bonus features).

Svelte Router is smart enought to inject the corresponding params to each Route component. Every Route component has information about their named params, query params and child route.

You can use all that information (availabe in the currentRoute property) to help you implement your business logic and secure the app.

## Install

To install Svelte Router on your svelte app:

with npm

```bash
npm i svelte-router-spa
```

with Yarn

```bash
yarn add svelte-router-spa
```

## Usage

Ensure your local server is configured in SPA mode. In a default Svelte installation you need to edit your package.json and add _-s_ to `sirv public`.

```javascript
"start": "sirv public -s"
```

Instead of having your routes spread inside your code Svelte Router SPA lets you define them inside a file where you can easily identify all available routes.

Add a routes.js file with your routes info. Example:

```javascript
import Login from './views/public/login.svelte'
import PublicIndex from './views/public/index.svelte'
import PublicLayout from './views/public/layout.svelte'
import AdminLayout from './views/admin/layout.svelte'
import AdminIndex from './views/admin/index.svelte'
import EmployeesIndex from './views/admin/employees/index.svelte'

function userIsAdmin() {
  //check if user is admin and returns true or false
}

const routes = [
  {
    name: '/',
    component: PublicLayout,
  },
  { name: 'login', component: Login, layout: PublicLayout },
  {
    name: 'admin',
    component: AdminLayout,
    onlyIf: { guard: userIsAdmin, redirect: '/login' },
    nestedRoutes: [
      { name: 'index', component: AdminIndex },
      {
        name: 'employees',
        component: '',
        nestedRoutes: [
          { name: 'index', component: EmployeesIndex },
          { name: 'show/:id', component: EmployeesShow },
        ],
      },
    ],
  },
]

export { routes }
```

Import the routes into your main component (probably App.svelte)

```javascript
<script>
  import { Router } from 'svelte-router-spa'
  import { routes } from './routes'
</script>

<Router {routes} />
```

That's all

### Layouts and route info

Every Route file will receive a currentRoute property with information about the current route, params, queries, etc.

You can add any number of layouts nested inside Router. For instance assuming that I want two layouts one for public pages and the other for private admin pages I would create these two files:

Filename: _public_layout.svelte_

```javascript
<script>
  import { Route } from 'svelte-router-spa'
  import TopHeader from './top_header.svelte'
  export let currentRoute
  const params = {}
</script>

<div class="app">
  <TopHeader />
  <section class="section">
    <Route {currentRoute}  {params} />
  </section>
</div>
```

Filename: _admin_layout.svelte_

```javascript
<script>
  import { Route } from "svelte-router-spa";

  export let currentRoute;
  const params = {}
</script>

<div>
  <h1>Admin Layout</h1>
  <Route {currentRoute} {params} />
</div>
```

The route page will take care of rendering the appropriate component inside the layout. It will also pass a property called _currentRoute_ to the component with information about the route, nested and query params.

**Tip:** You can have any number of layouts and you can nest them into each other as much as you want. Just remember to add a _Route_ component where the content should be rendered inside the layout.

**Tip:** The _Route_ component will pass a property to the rendered component named _currentRoute_ with information about the current route, params, queries, etc.

### Anatomy of a route

Each route is an object that may have the following properties:

```javascript

function userIsAdmin() {
  // return true or false
}


{
  name: 'about-us',
  component: About,
  layout: PublicLayout,
  redirectTo: 'company',
  onlyIf: { guard: userIsAdmin, redirect: '/login' },
  lang: { es: 'acerca-de' },
  nestedRoutes: [
    { name: 'our-values', component: CompanyValues, lang: { es: 'nuestros-valores' } }
  ]
}

```

**name (required)**: The name that will be used in the url. This is the default name for the route if no localisation is defined or no language is set.

**component (required if no layout is present)**: A component that will be rendered when this route is active. If the route has nestedRoutes the component should be a Layout.

**layout (required if no component is present)**: A component that acts as a layout (a container for other child components).

_Either a component or a layout should be specified. Both can not be empty._

**nestedRoutes**: An array of routes.

**redirectTo**: A url or pathname (https://yourwebsite.com) or (/my-product).

**onlyIf**: An object to conditionally render a route. If guard returns true then route is rendered. If guard is false it redirects to _redirect_.

**lang**: An object with route names localised. Check [Localisation](#localisation)

Routes can contain as many nested routes as needed.

They can also contain as many layouts as needed. Layouts can be nested into other layouts.

In the following example both the home root ('/' and 'login' will use the same layout). Admin, employees and employeesShow will use the admin layout and employees will also use the employees layout, rendered inside the admin layout.

Example of routes:

```javascript
const routes = [
  {
    name: '/',
    component: PublicIndex,
    layout: PublicLayout,
  },
  { name: 'login', component: Login, layout: PublicLayout },
  {
    name: 'admin',
    component: AdminIndex,
    layout: AdminLayout,
    nestedRoutes: [
      {
        name: 'employees',
        component: EmployeesIndex,
        nestedRoutes: [
          {
            name: 'show/:id',
            component: EmployeesShowLayout,
            nestedRoutes: [
              { name: 'index', component: EmployeesShow },
              { name: 'list', component: EmployeesShowList },
            ],
          },
        ],
      },
    ],
  },
]
```

The routes that this file will parse successfully are:

```
/
/login
/admin
/admin/employees
/admin/employees/show
/admin/employees/show/{id}
/admin/employees/show/{id}/list
```

### Using named params as first part of path name (not recommended)

Svelte Router is usually smart enough to find the right route for you. It means that you don't need to care about the order in which you write your routes. There is an exception to this rule: If you define a named param as the very first part of the path like: /:user-name/edit

In this specific case order matters and you should add that route **after** all other routes.

This is not recommended and you should always start your routes with a static path name. You can add as many named params as you need after the first static name.

```javascript

function userIsAdmin() {
  // return true or false
}


{
  name: 'about-us',
  component: About,
  lang: { es: 'acerca-de' },
  nestedRoutes: [
    {
      name: 'our-values', component: CompanyValues, lang: { es: 'nuestros-valores' }
    }
  ]
},
{
  name: '/',
  component: HomeComponent
},
{
  name: '/project/:name',
  component: ProjectComponent
},
{
  name: '/:user-name/edit',
  component: EditUserComponent
}

```

## API

### Router

`import { Router } from 'svelte-router-spa'`

This is the main component that needs to be included before any other content as it holds information about your routes and which route should be rendered.

The simplest approach (although not required) is to have an App.svelte file like this:

```javascript
<script>
  import { Router } from 'svelte-router-spa'
  import { routes } from './routes'

  let options = { gaPageviews: true}
</script>

<Router {routes} {options} />
```

The layout and/or the component that matches the active route will be rendered inside _Router_.

Options is an object that supports three properties:

_gaPageviews_ that will record route changes as pageviews in Google Analytics. It's disabled by default.

_lang_ a string that sets the language that the router will use to match the active route. Check [Localisation](#localisation)

_defaultLanguage_ If no language is set the active route will return this value as the active language.

### Route

`import { Route } from 'svelte-router-spa'`

This component is only needed if you create a layout. It will take care of rendering the content for the child components or child layouts recursively. You can have as many nested layouts as you need.

The info about the current route will be received as a property so you need to define _currentRoute_ and export it.

It will also accept an object called named _params_ where you can send any aditional params to the rendered component. This is usefull if you add any logic in your template, to check user's permission for instance, and want to send extra info to the rendered component.

currentRoute has all the information about the current route and the child routes.

Route is smart enough to expose the named params in the route component where they will be rendered.

Example:

```javascript
<script>
  import { Route } from 'svelte-router-spa'
  import TopHeader from './top_header.svelte'
  import FooterContent from './footer_content.svelte'
  export let currentRoute

  const params = { validCheck: true }
</script>

<div class="app">
  <TopHeader />
  <section class="section">
    <Route {currentRoute} {params} />
    <p>Route params are: {currentRoute.namedParams} and {currentRoute.queryParams}</p>
  </section>
  <FooterContent />
</div>
```

### currentRoute

This object is propagated from _Route_ to the components it renders. It contains information about the current route and the child routes.

These are the properties available in this object:

- name
- component
- layout
- queryParams
- namedParams
- childRoute
- language

**Example:**

```javascript
const routes = [
  {
    name: '/public',
    component: PublicLayout,
    nestedRoutes: [
      {
        name: 'about-us',
        component: 'AboutUsLayout',
        nestedRoutes: [
          { name: 'company', component: CompanyPage },
          { name: 'people', component: PeoplePage },
        ],
      },
    ],
  },
]
```

That configuration will parse correctly the following routes:

```javascript
/public
/public/about-us
/public/about-us/company
/public/about-us/people/:name
```

If the user visits /public/about-us/people/jack the following components will be rendered:

```
Router -> PublicLayout(Route) -> AboutUsLayout(Route) -> PeoplePage
```

Inside PeoplePage you can get all the information about the current route like this:

```javascript
<script>
  export let currentRoute
</script>

<h1>Your name is: {currentRoute.namedParams.name}</h1>
```

This will render:

```html
<h1>Your name is: Jack</h1>
```

### Navigate

`import { Navigate } from 'svelte-router-spa'`

#### params

- **to** (Required) String A valid route to navigate to.
- **title** (Optional) String A title for the _a_ element.
- **styles** (Optional) String Class styles to be applied to the _a class_ element.
- **lang** (Optional) String A language to convert the route to.

Navigate is a wrapper around the < a href="" > element to help you generate links quick and easily.

It adds an _active_ class to the styles if the generated route is the active one.

Check **navigateTo** belown for more information about the language param.

Example:

```javascript
<script>
  import { Navigate } from 'svelte-router-spa'
</script>

<div class="app">
  <h1>My content</h1>
  <p>Now I want to generate a <Navigate to="admin/employees">link to /admin/employees</Navigate></p>
</div>
```

### navigateTo

`import { navigateTo } from 'svelte-router-spa'`

#### params

- **route name** (Required) String A valid route to navigate to.
- **language** (Optional) String A language to convert the route to.

navigateTo allows you to programatically navigate to a route from inside your app updating the browser url and history.

navigateTo receives a route name as a param and an optional language and will try to navigate to that route.

When a language is provided _navigateTo_ will try to convert the _route name_ to the localised version of the route.

```javascript
  // Example route
  {
    name: '/setup',
    component: 'SetupComponent',
    lang: { es: 'configuracion' }
  }
```

```javascript
navigateTo('setup') // Will redirect to /setup

navigateTo('setup', 'es') // Will redirect to /configuracion
```

### routeIsActive

`import { routeIsActive } from 'svelte-router-spa'`

Returns a boolean indicating if the path is the current active route.

This is useful, for instance to set an _active_ class on a menu.

#### Params

- **pathName** (required): A string with the path that you want to check.
- **includePath** (optional | default is _false_): A boolean indicating if pathName should match exactly the current route or if it should be included.

The [Navigate](https://github.com/jorgegorka/svelte-router/blob/master/README.md#navigate) component does this automatically and adds an _active_ class if the generated route is the active one. Navigate sets _includePath_ to false

Example:

```javascript
<script>
  import { routeIsActive } from 'svelte-router-spa'
</script>

<a href="/contact-us" class:active={routeIsActive('/contact-us')}>
  Say hello
</a>

// If current route is /admin/companies/show/my-company

routeIsActive('admin') // returns false
routeIsActive('show/my-company') // returns false
routeIsActive('admin/companies/show/my-company') // returns true
routeIsActive('admin', true) // returns true
routeIsActive('show/my-company', true) // returns true
routeIsActive('my-company', true) // returns true
routeIsActive('other-company', true) // returns false
```

If _includePath_ is true and the current route is `/admin/companies/show/my-company`

### localisedRoute

`import { localisedRoute } from 'svelte-router-spa'`

#### params

- **route name** (Required) String A valid route to navigate to.
- **language** (Required) String A language to convert the route to.

localisedRoute returns a string with the route localised to the specified language.

```javascript
  // Example route
  {
    name: '/setup',
    component: 'SetupComponent',
    lang: { es: 'configuracion', it: 'configurazione' }
  }
```

```javascript
localisedRoute('setup', 'es') // Will return the string "/configuracion"

localisedRoute('setup', 'it') // Will return the string "/configurazione"
```

### Not Found - 404

#### Default behaviour

Svelte Router redirects to a 404.html page if a route is not found. Most hosting providers support this configuration and will serve a 404.html page automatically for not found pages. Just add a 404.html page in the same directory where your index.html file is.

#### Custom behaviour

If you define a 404 route it will be rendered instead of the default behaviour.

```javascript
  // Example of a custom 404 route
  {
    name: '404',
    path: '404',
    component: MyCustomNotFoundcomponent
  }
```

## Route prefix

You can easily constrain all your routes to a specific path like _/blog_

```javascript
<Router { routes } options={ {prefix: 'blog'} } />
```

With this option you don't have to define all your routes starting with _blog_ they will be prefixed automatically.

Using prefix has two advantages:

- You don't need to create a top level route in your routes file and then add every route as a nested route.
- Routes that don't start with the prefix will not be returned as 404 since they are out of the scope of the prefixed routes so you can navigate to them.

## Google Analytics

If you want to track route changes as pageviews in Google Analytics just add

```javascript
<Router { routes } options={ {gaPageviews: true} } />
```

## Localisation

How localisation works depends on the _lang_ param being passed to the _Router_ component. If a language is specified the router will try to match a route in that language only. If no language is specified then the router will try to find a route in any language available.

```javascript
  const options = { lang: 'de' }

  <Router {routes} {options} />
```

Let's see some examples using the following routes.

```javascript
const routes = [
  {
    name: '/',
    component: PublicIndex,
  },
  { name: 'login', component: Login, lang: { es: 'iniciar-sesion' } },
  { name: 'signup', component: SignUp, lang: { es: 'registrarse' } },
  {
    name: 'admin',
    component: AdminIndex,
    lang: { es: 'administrador' },
    nestedRoutes: [
      {
        name: 'employees',
        component: EmployeesIndex,
        lang: { es: 'empleados' },
        nestedRoutes: [
          {
            name: 'show/:id',
            component: ShowEmployeeLayout,
            lang: { es: 'mostrar/:id' },
            nestedRoutes: [
              {
                name: 'index',
                component: ShowEmployee,
              },
              {
                name: 'calendar/:month',
                component: CalendarEmployee,
                lang: { es: 'calendario/:month', de: 'kalender/:month' },
              },
            ],
          },
        ],
      },
    ],
  },
]
```

If we don't specify a language the following routes are valid:

`/login`

`/setup`

`/admin/employees`

`/admin/employees/show/123`

`/admin/employees/show/123/calendar/june`

`/iniciar-sesion`

`/registrarse`

`/administrador/empleados`

`/administrador/empleados/mostrar/123`

`/administrador/empleados/mostrar/123/calendario/junio`

If we specify a language the router will try to find routes **only** in that language so if in our current example we set the _lang_ variable to _'es'_ these routes will be **invalid** and the router will return a 404 page:

`/login`

`/setup`

`/admin/employees`

`/admin/employees/show/123`

`/admin/employees/show/123/calendar/june`

However these other routes will be **valid**:

`/iniciar-sesion`

`/registrarse`

`/administrador/empleados`

`/administrador/empleados/mostrar/123`

`/administrador/empleados/mostrar/123/calendario/junio`

_currentRoute_ will return the language of the matched route.

Another example: In the routes above there is only one german localised route for _calendar_ so this url will be valid:

`/admin/employees/show/123/kalender/april`

The router will match the default route for all paths that are not localised and will match the german one for the one that specfies a localisation.

That route will set **'de'** as the language in _currentRoute_

### Rendering a page in different languages

If you use _Navigate_ and _navigateTo_ to generate links and navigate to different parts of your application an automatic language conversion will be done for you.

Both _Navigate_ and _navigateTo_ support an aditional parameter with a language. If a language is provided they will try to convert the default route into the corresponding one for that language.

Example:

```javascript
  // Example route
  {
    name: '/setup',
    component: 'SetupComponent',
    lang: { es: 'configuracion' }
  }
```

```javascript
navigateTo('setup') // Will redirect to /setup

navigateTo('setup', 'es') // Will redirect to /configuracion
```

There is also available a function called _localisedRoute_ that will return a string with the translated route, in case you want the translation but not navigating to the route.

The router options accept a property called _defaultLanguage_ This value will be returned by the activeRoute object if there is no language selected.

### Example of use

[Demanda](https://github.com/jorgegorka/demanda) is an open source e-commerce application made with Ruby on Rails for the backend and Svelte for the frontend.  It is a [very good example](https://github.com/jorgegorka/demanda/tree/master/frontend/src/lib/routes) of how to use Svelte Router SPA.

## Credits

Svelte Router has been developed by [Jorge Alvarez](https://www.alvareznavarro.es)

I would like to thank all the people that create issues and comment on [Github](https://github.com/jorgegorka/svelte-router/discussions). Your feedback is the best way of improving.

### Contributors

[Mark Kopenga](https://github.com/mjarkk)

[Fidel Ramos](https://github.com/haplo)

[Steve Phillips](https://github.com/elimisteve)

[David McCrea](https://github.com/davemccrea)

[Pascal Clanget](https://github.com/Gh05d)

[A J](https://github.com/aj-nk)

[David Kiss](https://github.com/xdavidkissx)

[Common Creator](https://github.com/CommonCreator)

[SianLoong](https://github.com/si3nloong)

[Frippertronics](https://github.com/frippertronics)
