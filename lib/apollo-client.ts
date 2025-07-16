import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Log more details about the network error
    if ('statusCode' in networkError) {
      console.error(`Status Code: ${networkError.statusCode}`);
      console.error(`Response:`, networkError.response);
      if ('result' in networkError) {
        console.error(`Result:`, networkError.result);
      }
    }
  }
});

// Logging link for debugging
const loggingLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();

  console.log(`[GraphQL Request]: ${operation.operationName}`);
  console.log('Variables:', operation.variables);
  console.log(
    'Endpoint:',
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
  );

  return forward(operation).map((response) => {
    const duration = Date.now() - startTime;
    console.log(`[GraphQL Response]: ${operation.operationName} (${duration}ms)`);
    return response;
  });
});

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  // Ensure we're using POST method
  fetchOptions: {
    method: 'POST',
  },
  // Add headers if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Combine links: logging -> error handling -> http
const link = ApolloLink.from([loggingLink, errorLink, httpLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;
