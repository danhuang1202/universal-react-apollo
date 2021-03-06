import React from "react";
import ReactDOMServer from "react-dom/server";
import { ApolloClient } from "apollo-client";
import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider, renderToStringWithData } from "react-apollo";

import Html from "./Html";

/**
 * Fetch all required states via graphql operations and render application with them in server side
 * @param {Object} options server side rendering options
 * @param {ReactElement} options.appElement: Application main React Element
 * @param {String} options.typeDefs GraphQL schema language string, array of GraphQL schema language strings or a function that return an array of GraphQL schema strings
 * @param {Object} options.resolvers GQL resolvers object - optional
 * @param {Object} options.dataSources GQL data sources object
 * @param {Object} options.context context object which will be shared across all resolvers
 * @param {ReactElement} options.headElement React Element which will be placed in the HTML <head>
 * @param {ReactElement} options.bodyBottomElement React Element which will be placed in the bottom of the HTML <body>
 */
export default function serverRender({
  appElement,
  typeDefs,
  resolvers,
  dataSources,
  context,
  headElement,
  bodyBottomElement
}) {
  // create Apollo client
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const client = new ApolloClient({
    ssrMode: true,
    link: new SchemaLink({
      schema,
      context: {
        ...context,
        dataSources
      }
    }),
    cache: new InMemoryCache()
  });

  // wrapping main component with Apollo Provider
  const app = <ApolloProvider client={client}>{appElement}</ApolloProvider>;

  return renderToStringWithData(app).then(content => {
    const initialState = client.extract();
    const html = (
      <Html
        content={content}
        initialState={initialState}
        headElement={headElement}
        bodyBottomElement={bodyBottomElement}
      />
    );

    return `<!doctype html>\n${ReactDOMServer.renderToStaticMarkup(html)}`;
  });
}
