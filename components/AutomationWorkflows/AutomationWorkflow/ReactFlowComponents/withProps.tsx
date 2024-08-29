import React, { createElement } from 'react'

const withProps = (WrappedComponent, additionalProps = {}) => {
  const WithProps = React.memo((props) => {
    return createElement(WrappedComponent, {
      ...props,
      ...additionalProps,
    })
  })

  WithProps.displayName = `WithProps(${getDisplayName(WrappedComponent)})`

  return WithProps
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default withProps
