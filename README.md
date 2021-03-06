# Universal React Apollo <a href='https://travis-ci.org/jimmy319/universal-react-apollo'><img src='https://travis-ci.org/jimmy319/universal-react-apollo.svg?branch=master' /></a>

Universal React Apollo is a lightweight wrapper library around [react-apollo](https://github.com/apollographql/react-apollo) and [apollo-server-express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) to make it easy to build an universal app and reduce boilerplate code.

## Installation

Install Universal React Apollo and related libraries

```
npm install -S universal-react-apollo react react-dom apollo-client apollo-cache-inmemory apollo-link-http apollo-link-schema react-apollo graphql-tag graphql-tools graphql apollo-server-express express
```
## Usage

### Step 1: Server side setup

- Define the route setting of your application

```js
// file: routes.js
import React from 'react'

import HomeApp from './pages/home/app'

export default [
  {
    method: 'get', // default is get if this field is not defined
    path: '/home',
    appElement: <HomeApp />,
    headElement: <title>Home</title>,
    bodyBottomElement: <script src="/static/bundle.js"></script>
  }
]
```

- Initialize the universal (isomorphic) app

```js
// file: server.js
import express from 'express'
import cookieParser from 'cookie-parser'
import { initServer } from 'universal-react-apollo'

import typeDefs from '/path/to/your/gqlSchema'
import resolvers from '/path/to/your/gqlResolvers'
import dataSources from '/path/to/your/gqlDataSources'
import routes from './routes'

// create express server instance
const app = express()
const apolloOptions = {
  typeDefs,
  resolvers,
  dataSources,
  contextCreator: ({ req }) => {
    return {
      cookies: req.cookies
    }
  }
}

// mount additional middleware so that you can get information from request context
app.use(cookieParser())

// mount application routes and apollo server middleware
initServer(app, routes, apolloOptions)

// mount generic server side error handler
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.send('Oops... something went wrong')
})

// start server
app.listen(3000, () => console.log('server is running'))

```

### Step 2: Client side setup

Render the universal app in application entry point

```js
// file: index.js

import React from 'react'
import clientRender from 'universal-react-apollo/clientRender'

import HomeApp from './pages/home/app'

clientRender(<HomeApp />)
```

That's it! You have finished building a gql-based universal application.

## Error handling

Server side rendering error will be passed to `next()` so that you can write your own `error middleware function` to handle it. See the [error-handling part](https://expressjs.com/en/guide/error-handling.html) of Express document for details.

## API

### initServer(app, routes, apolloOptions, [production])

This function will mount [apollo-server-express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) middleware to the express app instance you passed in and create the application routing handlers according to the route config.

*arguments:*

|      arg      |                                                                        description                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| app           | Express app instance                                                                                                                                                           |
| routes        | An array of route object (see data model section)                                                                                                                              | 
| apolloOptions | Apollo server related config options (see data model section)                                                                                                                  |
| production    | (optional) Flag indicates that the universal app is running in production mode or not. We use this flag to decide to turn on or off `GQL playground`. Default value is `false` |

### clientRender(appElement)

Hydrate the universal app container (reuse server-side generated HTML content and attach event listeners to existing markup).

*arguments:*

|     arg       |                                                      description                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appElement    | Main application react element                                                                                                                                      |

## Data Model

### route

*fields:*

|         field     |                                                    description                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path              | Same as Express middleware [path argument](https://expressjs.com/en/api.html#path-examples)                                                                         | 
| appElement        | The React element you want to render into the app container when given path is matched                                                                              |
| method            | (optional) The http method of the request. Express [app.METHOD](https://expressjs.com/en/api.html#app.METHOD) supported routing methods are all valid               |
| headElement       | (optional) The React element you want to render into the `<head>` tag when given path is matched                                                                    |
| bodyBottomElement | (optional) The React element you want to render into the bottom of `<body>` tag when given path is matched                                                          |
| middlewareChain   | (optional) An array of express middleware function                                                                                                                  |

### apolloOptions

*fields:*

|         field     |                                                         description                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| typeDefs          | GraphQL schema language string, array of GraphQL schema language strings or a function that return an array of GraphQL schema strings                               |
| resolvers         | GQL resolvers object                                                                                                                                                | 
| dataSources       | GQL data sources object                                                                                                                                             |
| contextCreator    | (optional) A function called with the current request that return a context object shared across all resolvers                                                      |

```js
// context creator example:

{
  contextCreator: function({ req }) {
    return {
      cookie: req.headers.cookie
    }
  }
}
```
