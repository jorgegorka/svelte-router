# Svelte Router

## What is Svelte Router?

Svelte Router adds routing to your Svelte apps.

It keeps your routes organized in a single place.

It's specially designed for Single Page Applications (SPA). If you need Server Side Rendering then consider using [Sapper](https://sapper.svelte.dev/).

## Features

- Define your routes in a single interface
- Layouts global, per page or nested.
- Nested routes
- Named params

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

Start your development server in SPA mode. Edit your package.json and change:

```javascript
"start:dev": "sirv public -s --dev"
```

Add a routes.js file with your routes info. Example:

```javascript
import Login from './views/public/login.svelte'
import PublicIndex from './views/public/index.svelte'
import PublicLayout from './views/public/layout.svelte'
import AdminLayout from './views/admin/layout.svelte'
import AdminIndex from './views/admin/index.svelte'
import EmployeesIndex from './views/admin/employees/index.svelte'

const routes = [
  {
    name: '/',
    component: PublicLayout
  },
  { name: 'login', component: Login, layout: PublicLayout },
  {
    name: 'admin',
    component: AdminLayout,
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
import NotFound from './views/not_found.svelte'

SpaRouter({
  routes,
  pathName: document.location.pathname,
  notFound: NotFound
}).getActiveRoute

const app = new App({
  target: document.body
})

export default app
```

Edit App.svelte and add the main layout.

```javascript
<script>
  import { MainLayout } from 'svelte-router-spa'
</script>

<MainLayout />
```

You can add any number of layouts nested inside the MainLayout. For instance assuming that I want two layouts one for public pages and the other for private admin pages I would create these two files:

Every Route file will receive a currentRoute prop with information about the current route, params, queries, etc.

Filename: _public_layout.svelte_

```javascript
<script>
  import { Route } from '../../lib/router.svelte'
  import TopHeader from './top_header.svelte'
  export let currentRoute
</script>

<div class="app">
  <TopHeader />
  <section class="section">
    <Route {currentRoute} />
  </section>
</div>
```

Filename: _admin_layout.svelte_

```javascript
<script>
  import { Route } from "svelte-router-spa";
  import { currentUser } from "../../stores/current_user";

  export let currentRoute;
</script>

<div>
  <h1>Admin Layout</h1>
  <Route {currentRoute} {$currentUser} />
</div>
```

## API

### SpaRouter

`import { SpaRouter } from 'svelte-router-app'`

This object receives three params: routes, pathName and notFound.

**routes** An array of routes.

**pathName** The path name to evaluate. For instance '/admin/employees?show-all=false'. It defaults to _document.location.pathname_

**notFound** A svelte component that will be rendered if the route can not be found.

It exposes a single property called _activeRoute_ that will return the current active route and some additional information (see below.)

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
        nestedRoutes: [{ name: 'show/:id', component: EmployeesShow }]
      }
    ]
  }
]
```

The routes that this file will generate are:

```
/
/login
/admin
/admin/employees
/admin/employees/show
/admin/employees/show/23432
```

**activeRoute** It returns an object with the current route, any named params and all query params sent in the url.

### navigateTo

`import { navigateTo } from 'svelte-router-app'`

navigateTo allows you to programatically navigate to a route from inside your app code.

navigateTo receives a path name as a param and will try to navigate to that route.

Example:

```javascript
if (loginSuccess) {
  navigateTo('admin')
} else {
  alert('Incorrect credentials')
}
```

### currentRoute

`import { currentRoute } from 'svelte-router-app'`

Returns a boolean if the path is the current active route.

This is useful, for instance to set an _active_ class on a menu.

The Navigate component does this automatically and adds an _is-active_ class if the generated route is the active one.

Example:

```javascript
import { currentRoute } from 'svelte-router-spa'
;<a href="/contact-us" class:is-active={currentRoute('/contact-us')}>
  Say hello
</a>
```

### MainLayout

`import { MainLayout } from 'svelte-router-spa'`

This is the main component that needs to be included before any other content as it holds information about which route should be rendered.

The best approach (although not required) is to have an App.svelte file like this:

```javascript
<script>
  import { MainLayout } from 'svelte-router-spa'
</script>

<MainLayout />
```

The layout and/or the component that matches the active route will be rendered inside _MainLayout_.

## Route

`import { Route } from 'svelte-router-spa'`

This component is only needed if you create a layout. It will take care of rendering the content for the child components or child layouts recursively. You can have as many nested layouts as you need.

The info about the current route will be received as a prop so you need to define _currentRoute_ and export it.

CurrentRoute has two props: An object with the named params called **namedParams** and an object with the query params called **queryParams**. Route is smart enough to expose the named params in the route component where they will be rendered.

Example:

```javascript
<script>
  import { Route } from 'svelte-router-spa'
  import TopHeader from './top_header.svelte'
  import FooterContent from './footer_content.svelte'
  export let currentRoute
</script>

<div class="app">
  <TopHeader />
  <section class="section">
    <Route {currentRoute} />
    <p>Current params are: {currentRoute.namedParams} and {currentRoute.queryParams)
  </section>
  <FooterContent />
</div>
```

## Navigate

`import { Navigate } from 'svelte-router-spa'`

Navigate is a wrapper around the < a href="" > element to help you generate links quickly and easily.

It adds an _is-active_ class if the generated route is the active one.

Example:

```javascript
<script>
  import { Navigate } from 'svelte-router-spa'
</script>

<div class="app">
  <h1>My content</h1>
  <p>Now I want to generate a <Navigate to="admin/employees">Link</Navigate>
</div>
```

## Credits

Svelte Router SPA has been developed by [Jorge Alvarez](https://www.alvareznavarro.es).
