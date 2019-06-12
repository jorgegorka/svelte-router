# Svelte Router 

## What is Svelte Router?

Svelte Router adds routing to your Svelte apps.  It's specially designed for Single Page Applications (SPA). If you need Server Side Rendering then consider using Sapper.

* Define your routes in a single interface
* Layouts global, per page or nested.
* Nested routes
* Named params

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

Start your development server in SPA mode.  Edit your package.json and change:
```
"start:dev": "sirv public -s --dev"
```

Add a routes.js file with your routes info.  Example:

```
import Login from './views/public/login.svelte'
import PublicIndex from './views/public/index.svelte'
import PublicLayout from './views/public/layout.svelte'
import AdminLayout from './views/admin/layout.svelte'
import AdminIndex from './views/admin/index.svelte'
import EmployeesIndex from './views/admin/employees/index.svelte'

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
        nestedRoutes: [{ name: 'show/:id', component: SchedulesIndex }]
      }
    ]
  }
]

export { routes }
```

Import the routes into main.js

```
import App from './App.svelte'
import { SpaRouter } from 'svelte-router-spa'
import { routes } from './routes'
import NotFound from './views/not_found.svelte'
import './middleware/users/auth'

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

```
<script>
  import { MainLayout } from 'svelte-router-spa'
</script>

<MainLayout />
```

You can add any number of layouts nested inside the MainLayout.  For instance assuming that I want two layous one for public pages and the other for private admin pages I would create theses two files:

Every Route file will receive a currentRoute prop with information about the current route, params, queries, etc.

public_layout.svelte

```
<script>
  import Route from '../../lib/router.svelte'
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

admin_layout.svelte
```
<script>
  import { onMount, onDestroy } from "svelte";
  import Route from "svelte-router-spa";
  import { currentUser } from "../../stores/current_user";

  export let currentRoute;
  let unsubscribe;
  let userInfo = {};

  onMount(() => {
    unsubscribe = currentUser.subscribe(user => (userInfo = user));
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div>
  <h1>Admin Layout</h1>
  <Route {currentRoute} {currentUser} />
</div>
```