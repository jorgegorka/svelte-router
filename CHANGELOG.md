# Svelte Router changelog

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
