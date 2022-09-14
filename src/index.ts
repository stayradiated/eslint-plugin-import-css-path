import { exists } from "./exists"

const rules = {
  exists,
}

const configs = {
  recommended: {
    plugins: ["import-css-path"],
    rules: {
      "import-css-path/exists": [
        "error",
        {
          useTypescriptPaths: true,
        },
      ],
    },
  },
}

export { rules, configs }
