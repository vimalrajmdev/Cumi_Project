import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilChevronRight } from '@coreui/icons'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <div className="flex items-center">
      <CBreadcrumb
        className="m-0 flex items-center text-sm font-medium"
        style={{
          '--cui-breadcrumb-divider': "'>'",
          '--cui-breadcrumb-divider-color': '#cdcfd1ff',
        }}
      >
        <CBreadcrumbItem className="text-decoration-none flex items-center">
          <Link to="/dashboard" className="text-dark flex items-center hover:text-primary transition">
            <CIcon icon={cilHome} size="sm" className="me-1" />
            Home
          </Link>
        </CBreadcrumbItem>

        {breadcrumbs.map((breadcrumb, index) => (
          <CBreadcrumbItem
            key={index}
            active={breadcrumb.active}
            className="text-dark flex items-center"
          >
            {!breadcrumb.active ? (
              <Link
                to={breadcrumb.pathname}
                className="text-dark hover:text-primary transition"
              >
                {breadcrumb.name}
              </Link>
            ) : (
              <span className="text-primary font-semibold">{breadcrumb.name}</span>
            )}
          </CBreadcrumbItem>
        ))}
      </CBreadcrumb>
    </div>
  )
}

export default React.memo(AppBreadcrumb)
