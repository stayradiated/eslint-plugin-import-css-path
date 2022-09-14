import { loadConfig, createMatchPath } from 'tsconfig-paths'

type TsconfigCompilerOptions = {
  baseUrl: string
  paths: Record<string, string[]>
}

type ResolveOptions = {
  compilerOptions?: TsconfigCompilerOptions,
  // useful for testing
  fileExists?: (filepath: string) => boolean
}

type TsPathsResolverFn = (requestedModule: string) => boolean

const readCompilerOptions = (): TsconfigCompilerOptions => {
  const result = loadConfig()
  if (result.resultType === 'failed') {
    throw new Error(result.message)
  }

  const { absoluteBaseUrl: baseUrl, paths } = result

  return {
    baseUrl,
    paths,
  }
}

const createTsPathsResolver = (options: ResolveOptions = {}): TsPathsResolverFn => {
  const { compilerOptions = readCompilerOptions(), fileExists } = options
  const { baseUrl, paths } = compilerOptions

  const matchPath = createMatchPath(baseUrl, paths, ['main'], false)

  const readJSON = () => undefined

  return (requestedModule: string) => {
    const path = matchPath(requestedModule, readJSON, fileExists, ['.css'])
    return typeof path === 'string'
  }
}

export {
  readCompilerOptions,
  createTsPathsResolver,
}
export type { TsPathsResolverFn }
