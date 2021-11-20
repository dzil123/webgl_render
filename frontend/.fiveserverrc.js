module.exports = {
  root: "dist",
  mount: {
    // "/": "/dist",
    src: "src",
  },
  watch: "dist",
  remoteLogs: "magenta",
  injectCss: false,
  logLevel: 3,
  ignore: /\.map$/i,
};
