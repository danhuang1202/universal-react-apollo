import express from 'express'
import React from 'react'
import { initServer }  from '../../../lib/'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'

import HomeApp from './App'
import typeDefs from './gql/schema'
import resolvers from './gql/resolvers'
import messageApi  from './gql/dataSources/messageApi'
import webpackConfig from '../webpack.config'


const app = express()
const compiler = webpack(webpackConfig)

const routes = [
  {
    path: '/greeting/:userName',
    appElement: <HomeApp />,
    bodyBottomElement: <script src="/home.js"></script>
  }
]

const apolloOptions = {
  typeDefs,
  resolvers,
  dataSources: {
    messageApi
  },
  contextCreator: ({ req }) => {
    return {
      userName: req.params.userName
    }
  }
}

app.use(webpackDevMiddleware(compiler))

initServer(app, routes, apolloOptions)

// mount generic server side error handler
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.send('Oops... something went wrong')
})

app.listen(3000, () => console.log('Now that your universal app is ready to serve user'))
