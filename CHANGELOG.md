# Svelte Router changelog

## 6.0.3

Fix bug when sitePrefix is under a subdomain.

## 6.0.2

Fix bug with named routes starting with a /.

## 6.0.1

Update type definitions.
Upgrade packages.

## 6.0.0

Use esm modules.

## 5.8.4

Use host instead of hostname to include port in url comparison.

## 5.8.3

Remove console log.

## 5.8.2

Fix issue with history when using browser's back button.

## 5.8.1

Improve handling of href links.

## 5.8.0

Added prefix param to constrain routes.

## 5.7.4

Fix bug with anchor tags.

## 5.7.3

Fix assignment to constat variable error.

## 5.7.2

Fix bug that prevented internal links to be open in a new tab.

## 5.7.1

Fix bug that removed anchor tags from url.

## 5.7.0

Support named params at the beginning of the path name.

## 5.6.0

Add custom 404 page.

## 5.5.0

Add a default language.

## 5.4.4

Fix bug that was duplicating query params on page reload.

## 5.4.3

Remove warining of assignment to undeclared variable redirectTo.

## 5.4.2

Fix wrong import routes. Now it's true.

## 5.4.1

Fix wrong import routes.

## 5.4.0

Refactor of code. Renaming router.js as spa_router.js.
Fix issue where namedParams get an undefined value if route name starts with a '/'.

## 5.3.3

Fix route generation when localised and multiple paths with named params in name. -> { name: 'complex/route/:param/other/stuff/:param2' }

A bit of refactoring.

## 5.3.2

Add missing code to Navigate component onMount.

## 5.3.1

Fix bug where navigateTo did not return the right localised route.

## 5.3.0

currentRoute.path returns the full path including query params.

## 5.2.1

Navigate and navigateTo support route generation for a language.

## 5.2.0

- Internationalisation. Translate the route names to as many languages as you need.

```javascript
const adminRoutes = [
  {
    name: 'employees',
    layout: EmployeesPage,
    lang: { es: 'empleados', fr: 'employes', de: 'angestellte', it: 'impiegati' },
  },
]
```

## 5.1.1

- Fix an error when a route has a redirectTo that leads to a guarded route that also redirects.

```javascript
const adminRoutes = [
  {
    name: '/admin',
    layout: AdminLayout,
    nestedRoutes: [
      { name: 'index', redirectTo: 'admin/dashboard' },
      {
        name: 'dashboard',
        component: DashboardIndex,
        onlyIf: {
          guard: isLoggedIn,
          redirect: '/login',
        },
      },
    ],
  },
]
```

## 5.1.0

- routeIsActive gets a second optional param to check if the path is included in the current active route.

## 5.0.0

- [Breaking change] Simplify configuration. SpaRouter and editing main.js no more needed. Add your routes directly to the Router component.

## 4.0.1

- Correct naming of redirect param used in guards.

## 4.0.0

- [Breaking change] SpaRouter params have changed. Please check the docs.

## 3.2.2

- Reorder SpaRouter object initial params

## 3.2.1

- Track pageviews in google analytics.

## 3.2.0

- Route guards

## 3.1.0

- Route redirection

## 3.0.0

- Improve handling of not found routes. No more custom not found logic use standard 404.html pages available in most of the hosting providers.

## 2.3.1

- Remove outdated config info.

## 2.3.0

- Add params to Route.

## 2.2.2

- Avoid full page reload when using a tags.

## 2.2.1

- Remove console log.

## 2.2.0

- Add named params to all child routes not just specific ones.

## 2.1.0

- Ensure nested routes with named params work.

## 2.0.15

- Remove ? when not needed.

## 2.0.14

- Get pathname and params from currentRoute

## 2.0.11

- Update onpopstate

## 2.0.10

- Do not remove query params from visible route.

## 2.0.9

- Add onpopstate handler.

## 2.0.8

- Fix docs to request a full url in pathName

## 2.0.7

- Eslint upgraded to version 6.

## 2.0.6

- Add Svelte as a peer dependency.

## 2.0.5

- Upgrade eslint and svelte

## 2.0.4

- Unlock Svelte

## 2.0.3

- Lock Svelte to 3.5.1

## 2.0.2

- Fix wrong result in routeIsActive

## 2.0.1

- Improve recognition of routes not nested.

## 2.0.0

- [Breaking Change] MainLayout has been renamed to Router. Please replace all references to MainLayout with Router.
- [Breaking Change] Replace nestedRoutes array in currentRoute with childRoute object.
- [Breaking Change] Renamed currentRoute method as routeIsActive.

- Refactor and cleanup code.

## 1.2.1

- Fix queryParams not generated in some type of routes.

## 1.2.0

- Improvements to nested routes and layouts

## 1.1.0

- New currentRoute method returns true/false if pathName is the active route.
- SpaRouter: If pathName is an empty string then navigate to home.

## 1.0.5

- Fix bug where external links where ignored.

## 1.0.4

- Update docs.

## 1.0.3

- Add Navigate component.

## 1.0.2

- Fix an error in navigateTo method.

## 1.0.1

- Docs updated.

## 1.0.0

- Initial version published.
