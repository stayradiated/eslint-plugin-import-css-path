import path from 'path'

type Node = {
  arguments: readonly {
    value: string,
  }[],
  callee: {
    name: string,
  },
  source: {
    value: string,
  },
}

type Context = {
  getFilename: () => string,
  report: (node: Node, message: string, options: {}) => void,
}

const getCurrentDirectory = (context: Context) => {
  let filename = context.getFilename()
  if (!path.isAbsolute(filename)) {
    filename = path.join(process.cwd(), filename)
  }

  return path.dirname(filename)
}

const testRequirePath = (fileName: string, node: Node, context: Context) => {
  if (fileName.endsWith('.css') === false) {
    return
  }

  const currentDir = getCurrentDirectory(context)

  try {
    require.resolve(fileName, { paths: [currentDir] })
  } catch (e) {
    context.report(node, `Cannot find module: ${fileName}`, {})
  }
}

const exists = (context: Context) => {
  return {
    ImportDeclaration (node: Node) {
      testRequirePath(node.source.value, node, context)
    },

    CallExpression (node: Node) {
      if (
        node.callee.name !== 'require' ||
        !node.arguments.length ||
        typeof node.arguments[0].value !== 'string' ||
        !node.arguments[0].value
      ) {
        return
      }

      testRequirePath(node.arguments[0].value, node, context)
    },
  }
}

export { exists }
