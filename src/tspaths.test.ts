import test from 'ava'
import process from 'node:process'

import { readCompilerOptions, createTsPathsResolver } from './tspaths.js'

const pwd = process.env['PWD']!

const compilerOptions = {
  baseUrl: pwd,
  paths: {
    '~/*': ['./src/*']
  }
}

test('readCompilerOptions', (t) => {
  const actualCompilerOptions = readCompilerOptions()
  if (actualCompilerOptions instanceof Error) {
    t.fail(actualCompilerOptions.message)
    return
  }
  t.deepEqual(actualCompilerOptions, compilerOptions)
})

test('should return false for relative paths', (t) => {
  const resolve = createTsPathsResolver({
    compilerOptions,
    fileExists: () => true,
  })

  const result = resolve('./styles.css')

  t.false(result)
})

test('match css path', (t) => {
  const resolve = createTsPathsResolver({
    compilerOptions,
    fileExists: (filepath) => {
      return filepath === `${pwd}/src/styles.css`
    }
  })

  const result = resolve('~/styles.css')

  t.true(result)
})
