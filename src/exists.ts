import * as path from 'node:path'
import * as process from 'node:process'

import type { TsPathsResolverFn } from './tspaths.js'
import { createTsPathsResolver } from './tspaths.js'

type Node = {
  arguments: ReadonlyArray<{
    value: string
  }>
  callee: {
    name: string
  }
  source: {
    value: string
  }
}

type Context = {
  getFilename: () => string
  report: (
    node: Node,
    message: string,
    options: Record<string, unknown>,
  ) => void
}

const getCurrentDirectory = (context: Context) => {
  let filename = context.getFilename()
  if (!path.isAbsolute(filename)) {
    filename = path.join(process.cwd(), filename)
  }

  return path.dirname(filename)
}

type TestRequirePathOptions = {
  requestedModule: string
  node: Node
  context: Context
  resolveTsPath?: TsPathsResolverFn
}

const testRequirePath = (options: TestRequirePathOptions) => {
  const { requestedModule, node, context, resolveTsPath } = options

  if (!requestedModule.endsWith('.css')) {
    return
  }

  const currentDir = getCurrentDirectory(context)

  let exists: boolean

  try {
    /* eslint-disable-next-line unicorn/prefer-module */
    void require.resolve(requestedModule, { paths: [currentDir] })
    exists = true
  } catch {
    exists = false
  }

  if (!exists && resolveTsPath) {
    exists = resolveTsPath(requestedModule)
  }

  if (!exists) {
    context.report(node, `Cannot find module: ${requestedModule}`, {})
  }
}

const exists = (context: Context) => {
  let resolveTsPath: TsPathsResolverFn | undefined
  const resolveTsPathOrError = createTsPathsResolver()

  if (resolveTsPathOrError instanceof Error) {
    console.error(resolveTsPathOrError.message)
  } else {
    resolveTsPath = resolveTsPathOrError
  }

  return {
    ImportDeclaration(node: Node) {
      testRequirePath({
        requestedModule: node.source.value,
        node,
        context,
        resolveTsPath,
      })
    },

    CallExpression(node: Node) {
      if (
        node.callee.name !== 'require' ||
        typeof node.arguments[0]?.value !== 'string'
      ) {
        return
      }

      testRequirePath({
        requestedModule: node.arguments[0].value,
        node,
        context,
        resolveTsPath,
      })
    },
  }
}

export { exists }
