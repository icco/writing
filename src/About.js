import React, { Component } from 'react';
import { Helmet } from "react-helmet";

class About extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: true
    };
  }

  render() {
    if (this.state.loaded) {
      return (
        <div>
          <Helmet>
          <title>{`Nat? Nat. Nat! #About`}</title>
          </Helmet>

          <div className="vat mt3 mb0 dib w-100 mh0">
            <h1 className="mtn">About</h1>
            <p><strong>Nat? Nat. Nat!</strong> is a blog by <a href="http://natwelch.com">Nat Welch</a> on topics of life, programming and popular culture. </p>
            <p>Nat has been blogging since 2003 (discovered by looking at the whois records for the first website he built and wrote content for, <a href="http://lydiadehn.com">lydiadehn.com</a>), and has continuously brought forward his favorite posts. This domain, <a href="https://writing.natwelch.com">writing.natwelch.com</a>, is the fifth iteration of his blog technology. The previous domains, in chronological order, were:</p>
            <ul>
              <li><a href="http://icco.lydiadehn.com">icco.lydiadehn.com</a></li>
              <li><a href="http://pseudoweb.net">pseudoweb.net</a></li>
              <li><a href="http://natwelch.com">natwelch.com</a></li>
              <li><a href="http://tumble.io">tumble.io</a></li>
            </ul>
            <p>This blog is an artisanal <a href="https://golang.org/">Go</a> application hosted on <a href="https://cloud.google.com/appengine/">Google App Engine</a>. The source code can be found at <a href="https://github.com/icco/natnatnat">github.com/icco/natnatnat</a>.</p>
            <p>For commentary on the content of this blog, please either tweet at <a href="https://twitter.com/icco">@icco</a> or email <a href="mailto:nat@natwelch.com">nat@natwelch.com</a>.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          Loading...
        </div>
      );
    }
  }
}

export default About;
