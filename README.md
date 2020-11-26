# eslint-plugin-import-css-path

A lightweight fork of [eslint-plugin-require-path-exists](https://github.com/BohdanTkachenko/eslint-plugin-require-path-exists) that only checks CSS files.

- Only checks CSS files
- Import path must include file extension
- Zero dependencies

## Usage

1. Install eslint-plugin-require-path-exists as a dev-dependency:

```bash
npm install --save-dev eslint-plugin-import-css-path
```

2. Enable the plugin by adding it to the plugins and start from default (recommended) configuration in extends in .eslintrc:

```json
{
  "extends": [
    "plugin:import-css-path/recommended"
  ]
}
```

## Rules

| Name                   | Description                                 | Default Configuration |
| ---                    | ---                                         | ---                   |
| import-css-path/exists | You should only import CSS paths that exist | `[ "error" ]`         |

## License

MIT
