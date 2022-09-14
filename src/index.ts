import { exists } from './exists.js'

const rules = {
  exists,
}

const configs = {
  recommended: {
    plugins: ['import-css-path'],
    rules: {
      'import-css-path/exists': ['error'],
    },
  },
}

export { rules, configs }
