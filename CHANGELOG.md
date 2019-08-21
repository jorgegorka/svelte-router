# Svelte Router changelog

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
