// inline-text.js
export const inlineTextPlugin = {
    name: "inline-text",
    setup(build) {
      const fs = require("fs");
      build.onLoad({ filter: /\.txt$/ }, async (args) => {
        const contents = await fs.promises.readFile(args.path, "utf8");
        return {
          contents: `export default ${JSON.stringify(contents)}`,
          loader: "js",
        };
      });
    },
  };
  