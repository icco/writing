import App from "next/app";
import React from "react";
import withApollo from "../lib/with-apollo-client";
import { ApolloProvider } from "react-apollo";

// CSS is compiled into the style.css below
import "../style.css";

class Writing extends App {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(Writing);
