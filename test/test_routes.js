const adminRoutes = {
  name: 'admin',
  component: 'AdminLayout',
  nestedRoutes: [
    { name: 'index', component: 'DashboardIndex' },
    {
      name: 'company',
      component: 'CompanyLayout',
      lang: { es: 'empresa' },
      nestedRoutes: [
        { name: 'index', component: 'CompanyIndex' },
        { name: 'edit', component: 'CompanyEdit' }
      ]
    },
    {
      name: 'employees',
      component: 'EmployeesLayout',
      lang: { es: 'empleados' },
      nestedRoutes: [
        { name: 'index', component: 'EmployeesIndex' },
        { name: 'new', component: 'EmployeesNew', lang: { es: 'nuevo' } },
        { name: 'show/:id', component: 'EmployeesShow', lang: { es: 'mostrar/:id' } },
        { name: 'edit/:id', component: 'EmployeesEdit', lang: { es: 'modificar/:id' } },
        { name: 'calendar/:id', component: 'EmployeeCalendar', lang: { es: 'calendario/:id' } },
        { name: 'list/:id', component: 'EmployeeActivityList', lang: { es: 'listado/:id' } }
      ]
    },
    {
      name: 'calendar/:teamId',
      component: 'CalendarIndex',
      lang: { es: 'calendario/:teamId' }
    },
    {
      name: 'schedules',
      component: 'SchedulesLayout',
      lang: { es: 'agenda' },
      nestedRoutes: [
        { name: 'index', component: 'SchedulesIndex' },
        { name: 'new', component: 'SchedulesNew', lang: { es: 'nuevo' } },
        {
          name: 'show/:id',
          layout: 'SchedulesShowLayout',
          lang: { es: 'mostrar/:id' },
          nestedRoutes: [
            { name: 'index', component: 'SchedulesShow' },
            { name: 'hours/new/:day', component: 'SchedulesHoursNew', lang: { es: 'horas/nuevo/:day' } }
          ]
        },
        { name: 'edit/:id', component: 'SchedulesEdit', lang: { es: 'modificar/:id' } }
      ]
    },
    {
      name: 'teams',
      lang: { es: 'equipos' },
      component: 'TeamsLayout',
      nestedRoutes: [
        { name: 'index', component: 'TeamsIndex' },
        { name: 'show/:id', component: 'TeamsShow', lang: { es: 'mostrar/:id' } },
      ]
    },
    {
      name: 'activities',
      component: 'ActivitiesLayout',
      lang: { es: 'actividades' },
      nestedRoutes: [
        { name: 'index', component: 'ActivitiesIndex' },
        { name: 'new', component: 'ActivitiesNew', lang: { es: 'nueva' } },
        { name: 'edit/:id', component: 'ActivitiesEdit', lang: { es: 'modificar/:id' } }
      ]
    },
    {
      name: 'reports',
      component: 'ReportsLayout',
      lang: { es: 'informes' },
      nestedRoutes: [
        { name: 'daily-absence', component: 'DailyAbsent', lang: { es: 'ausencias-diario' } },
        { name: 'pending', component: 'PendingActivities', lang: { es: 'pendientes' } },
        { name: 'activity-list', component: 'ActivityList', lang: { es: 'listado' } },
        { name: 'late-checkout', component: 'LateCheckoutActivities', lang: { es: 'entrada-tarde' } }
      ]
    }
  ]
}

export { adminRoutes }
