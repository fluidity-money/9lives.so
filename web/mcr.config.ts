const mrc = {
  // logging: 'debug',
  name: "Next.js V8 Coverage Report",

  entryFilter: {
    // client side

    node_modules: false,
    turbopack: false,

    "/static/chunks/src": false,
    "/static/chunks/": true,

    // server side
    "[root-of-the-server]": false,
    "/server/chunks/": true,
  },

  sourceFilter: {
    node_modules: false,
    turbopack: false,
    ".next-internal": false,
    "/proxy.mjs": false,
    "*": true,
  },

  reports: ["v8", "console-details"],
};

export default mrc;
