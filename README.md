# Svelte Router SPA

![version](https://img.shields.io/npm/v/svelte-router-spa.svg)
![license](https://img.shields.io/github/license/jorgegorka/svelte-router.svg)
![Code climate](https://img.shields.io/codeclimate/maintainability/jorgegorka/svelte-router.svg)

## What is Svelte Router

Svelte Router adds routing to your Svelte apps.

It keeps your routes organized in a single place.

It's specially designed for Single Page Applications (SPA). If you need Server Side Rendering then consider using [Sapper](https://sapper.svelte.dev/).

## Features

- Define your routes in a single interface
- Layouts global, per page or nested.
- Nested routes
- Named params

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
  //check if user is admin and return true or false
}

const routes = [
  {
    name: '/',
    component: PublicLayout
  },
  { name: 'login', component: Login, layout: PublicLayout },
  {
    name: 'admin',
    component: AdminLayout,
    onlyIf: { guard: userIsAdmin, failure: '/login' },
    nestedRoutes: [
      { name: 'index', component: AdminIndex },
      {
        name: 'employees',
        component: '',
        nestedRoutes: [{ name: 'index', component: EmployeesIndex }, { name: 'show/:id', component: EmployeesShow }]
      }
    ]
  }
]

export { routes }
```

Import the routes into main.js

```javascript
import App from './App.svelte'
import { SpaRouter } from 'svelte-router-spa'
import { routes } from './routes'

SpaRouter({
  routes,
  pathName: document.location.href
}).getActiveRoute

const app = new App({
  target: document.body
})

export default app
```

Edit App.svelte and add the main router.

```javascript
<script>
  import { Router } from 'svelte-router-spa'
</script>

<Router />
```

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

Each route is an object with the following elements:

```:javascript
{ name: 'about-us', component: About, layout: PublicLayout, redirectTo: 'https://tailwindcss.com' }
```

**name (required)**: The name that will be used in the url

**component (required if no layout is present)**: A component that will be rendered when this route is active. If the route has nestedRoutes the component should be a Layout.

**layout (required if no component is present)**: A component that acts as a layout (a container for other child components).

_Either a component or a layout should be specified. Both can not be empty._

**nestedRoutes**: An array of routes.

**redirectTo**: An external url or an internal pathname.

```:javascript

function userIsAdmin() {
  // do your checks here and return true or false
}

{ name: 'admin', component: Admin, layout: PrivateLayout, onlyIf: { guard: userIsAdmin, failure: '/login} }
```

**onlyIf**: An object to conditionally render a route. If guard returns true then route is rendered. If guard is false it redirects to _failure_.

Routes can contain as many nested routes as needed.

It can also contain as many layouts as needed. Layouts can be nested into other layouts.

In the following example both the home root ('/' and 'login' will use the same layout). Admin, employees and employeesShow will use the admin layout.

Example of routes:

```javascript
const routes = [
  {
    name: '/',
    component: PublicIndex,
    layout: PublicLayout
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
            nestedRoutes: [{ name: 'index', component: EmployeesShow }, { name: 'list', component: EmployeesShowList }]
          }
        ]
      }
    ]
  }
]
```

The routes that this file will parse successfully are:

```:javascript
/
/login
/admin
/admin/employees
/admin/employees/show
/admin/employees/show/{id}
/admin/employees/show/{id}/list
```

## API

### SpaRouter

`import { SpaRouter } from 'svelte-router-spa'`

SpaRouter receives an object as a param. It receives three params: routes, pathName and options.

**routes (required)** An array of routes.

**pathName (required)** The path name to evaluate. For instance '<https://www.mysite.com/admin/employees?show-all=false'.> It defaults to _document.location.href_

**gaPageviews** A boolean indicating if we want to track routes as page views into Google Analytics. Defaults to false.

SpaRouter exposes a single property called _currentRoute_ that will return the current active route and some additional information (see below.)

### Router

`import { Router } from 'svelte-router-spa'`

This is the main component that needs to be included before any other content as it holds information about which route should be rendered.

The best approach (although not required) is to have an App.svelte file like this:

```javascript
<script>
  import { Router } from 'svelte-router-spa'
</script>

<Router />
```

The layout and/or the component that matches the active route will be rendered inside _Router_.

## Route

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
    <p>Route params are: {currentRoute.namedParams} and {currentRoute.queryParams)
  </section>
  <FooterContent />
</div>
```

## currentRoute

This property is propagated from _Route_ to the components it renders. It contains information about the current route and the child routes.

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
        nestedRoutes: [{ name: 'company', component: CompanyPage }, { name: 'people', component: PeoplePage }]
      }
    ]
  }
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

## Navigate

`import { Navigate } from 'svelte-router-spa'`

Navigate is a wrapper around the < a href="" > element to help you generate links quickly and easily.

It adds an _active_ class if the generated route is the active one.

Example:

```javascript
<script>
  import { Navigate } from 'svelte-router-spa'
</script>

<div class="app">
  <h1>My content</h1>
  <p>Now I want to generate a <Navigate to="admin/employees">link to /admin/employees</Navigate>
</div>
```

### navigateTo

`import { navigateTo } from 'svelte-router-spa'`

navigateTo allows you to programatically navigate to a route from inside your app code.

navigateTo receives a path name as a param and will try to navigate to that route.

Example:

```javascript
if (loginSuccess) {
  navigateTo('admin')
} else {
  navigateTo('login')
}
```

### routeIsActive

`import { routeIsActive } from 'svelte-router-spa'`

Returns a boolean if the path is the current active route.

This is useful, for instance to set an _active_ class on a menu.

The [Navigate](https://github.com/jorgegorka/svelte-router/blob/master/README.md#navigate) component does this automatically and adds an _active_ class if the generated route is the active one.

Example:

```javascript
import { routeIsActive } from 'svelte-router-spa'
;<a href="/contact-us" class:active={routeIsActive('/contact-us')}>
  Say hello
</a>
```

## Not Found - 404

Svelte Router redirects to a 404.html page if a route is not found. You need to host and upload that page to your site. Most hosting providers support this configuration and will serve a 404.html page automatically for not found pages so chances are you already have one.

## Google Analytics

If you want to track route changes as pageviews in Google Analytics just add

```:javascript
SpaRouter({
  routes,
  pathName: document.location.href,
  gaPageviews: true
}).getActiveRoute
```

Check the documentation for SpaRouter for more info on the params supported.

## Credits

Svelte Router has been developed by [Jorge Alvarez](https://www.alvareznavarro.es).

### Contributors

[Mark Kopenga](https://github.com/mjarkk)
