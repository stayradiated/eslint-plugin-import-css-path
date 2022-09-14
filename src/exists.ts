import * as path from 'node:path'
import * as process from 'node:process'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import type { TsPathsResolverFn } from './tspaths.js'
import { createTsPathsResolver } from './tspaths.js'

type Node = TSESTree.Node
type ImportDeclarationNode = TSESTree.ImportDeclaration
type CallExpressionNode = TSESTree.CallExpression
type StringLiteralNode = TSESTree.StringLiteral

type Context = TSESLint.RuleContext<'errNotFound', unknown[]>
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
    context.report({
      node,
      messageId: 'errNotFound',
      data: {
        requestedModule
      }
    })
  }
}

const exists = {
  meta: {
    messages: {
      errNotFound: 'Cannot find module: {{requestedModule}}',
    }
  },
  create: (context: Context): unknown => {
    const resolveTsPathOrError = createTsPathsResolver()

    const resolveTsPath =
      resolveTsPathOrError instanceof Error ? undefined : resolveTsPathOrError

    return {
      ImportDeclaration(node: ImportDeclarationNode) {
        testRequirePath({
          requestedModule: node.source.value,
          node,
          context,
          resolveTsPath,
        })
      },

      CallExpression(node: CallExpressionNode) {
        const firstArg = node.arguments[0] as StringLiteralNode

        if (!firstArg) {
          return
        }

        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'require' ||
          typeof firstArg.value !== 'string'
        ) {
          return
        }

        testRequirePath({
          requestedModule: firstArg.value,
          node,
          context,
          resolveTsPath,
        })
      },
    }
  }
}

export { exists }
