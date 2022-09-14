import { loadConfig, createMatchPath } from 'tsconfig-paths'

type TsconfigCompilerOptions = {
  baseUrl: string
  paths: Record<string, string[]>
}

type ResolveOptions = {
  compilerOptions?: TsconfigCompilerOptions
  // Useful for testing
  fileExists?: (filepath: string) => boolean
}

type TsPathsResolverFn = (requestedModule: string) => boolean

const readCompilerOptions = (): TsconfigCompilerOptions | Error => {
  const result = loadConfig()
  if (result.resultType === 'failed') {
    return new Error(result.message)
  }

  const { absoluteBaseUrl: baseUrl, paths } = result

  return {
    baseUrl,
    paths,
  }
}

const createTsPathsResolver = (
  options: ResolveOptions = {},
): TsPathsResolverFn | Error => {
  const { compilerOptions = readCompilerOptions(), fileExists } = options

  if (!compilerOptions) {
    return new Error('Could not read tsconfig.json')
  }

  if (compilerOptions instanceof Error) {
    return compilerOptions
  }

  const { baseUrl, paths } = compilerOptions

  const matchPath = createMatchPath(baseUrl, paths, ['main'], false)

  const readJson = () => undefined

  return (requestedModule: string) => {
    const path = matchPath(requestedModule, readJson, fileExists, ['.css'])
    return typeof path === 'string'
  }
}

export { readCompilerOptions, createTsPathsResolver }
export type { TsPathsResolverFn }
