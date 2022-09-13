import path from "path"

type Node = {
  arguments: readonly {
    value: string
  }[]
  callee: {
    name: string
  }
  source: {
    value: string
  }
}

type Context = {
  getFilename: () => string
  report: (node: Node, message: string, options: {}) => void
  options: [Settings]
}

type Settings = {
  resolve?: {
    [key: string]: string
  }
}

const defaultSettings = {}

const getSettings = (context: Context): Context["options"][0] => {
  if (context && context.options && typeof context.options[0] === "object") {
    return { ...defaultSettings, ...context.options[0] }
  }

  return defaultSettings
}

const applyResolve = (
  resolve: NonNullable<Settings["resolve"]>,
  context: Context,
  absPath: string
) => {
  if (!absPath.includes("~")) {
    return absPath
  }
  const entries = Object.entries(resolve)
  for (const mapping of entries) {
    const [testRx, alias] = mapping
    const rx = new RegExp(testRx)
    if (rx.test(absPath)) {
      const replaced = absPath.replace(rx, alias)
      const resolved = path.relative(
        path.dirname(context.getFilename()),
        replaced
      )
      // path.relative doesn't add the ./ prefix for peers or descendants
      if (!resolved.startsWith(".")) {
        return `./${resolved}`
      }
      return resolved
    }
  }

  return absPath
}

const getCurrentDirectory = (context: Context, node: Node) => {
  let filename = context.getFilename()
  if (!path.isAbsolute(filename)) {
    filename = path.join(process.cwd(), filename)
  }

  return path.dirname(filename)
}

const testRequirePath = (fileName: string, node: Node, context: Context) => {
  if (fileName.endsWith(".css") === false) {
    return
  }
  let resolvedFile = fileName
  const currentDir = getCurrentDirectory(context, node)
  const settings = getSettings(context)
  if (settings.resolve) {
    resolvedFile = applyResolve(settings.resolve, context, resolvedFile)
  }

  try {
    require.resolve(resolvedFile, { paths: [currentDir] })
  } catch (e) {
    context.report(node, `Cannot find module: ${resolvedFile}`, {})
  }
}

const exists = (context: Context) => {
  return {
    ImportDeclaration(node: Node) {
      testRequirePath(node.source.value, node, context)
    },

    CallExpression(node: Node) {
      if (
        node.callee.name !== "require" ||
        !node.arguments.length ||
        typeof node.arguments[0].value !== "string" ||
        !node.arguments[0].value
      ) {
        return
      }

      testRequirePath(node.arguments[0].value, node, context)
    },
  }
}

export { exists }
