import path from "path";
import express from "express";
import webpack from "webpack";
import createWebpackMiddleware from "webpack-dev-middleware";
import createWebpackHotMiddleware from "webpack-hot-middleware";

export default ({ service, srcFolder }) => {
  const app = express();

  const webpackConfig = require(path.resolve(
    srcFolder,
    service,
    "webpack.dev.config.js"
  ));

  const compiler = webpack(webpackConfig);

  app.use(
    createWebpackMiddleware(compiler, {
      publicPath: compiler.options.output.publicPath,
      logLevel: "warn",
      stats: {
        colors: true,
        reasons: false,
      },
    })
  );

  app.use(
    createWebpackHotMiddleware(compiler, {
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000,
    })
  );

  app.listen(3001);

  compiler.hooks.compile.tap("HmrServer", () => {
    console.log("🚧 Compiling new bundle");
  });

  compiler.hooks.done.tap("HmrServer", stats => {
    if (stats.hasErrors()) {
      console.log(
        "❌ Build failed, please check the console for more information."
      );
    } else {
      console.log("✅ Client bundle ready");
    }
  });
};
