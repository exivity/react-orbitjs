import util = require('util')
import fs = require('fs')
import path = require('path')
import slash = require('slash')
import camelCase = require('camelcase')

export function toPascalCase (name: string) {
  return camelCase(name, { pascalCase: true })
}

export function getTemplate (name: string, params: string[] = []) {
  const template = readFile(
    path.resolve(__dirname, '..', '__templates__', `${name}.template`)
  )

  return util.format(template, ...params)
}

export function readFile (filePath: string) {
  return fs.readFileSync(filePath).toString()
}

export function pipe (...functions: Function[]) {
  return function pipeline<T> (args: T) {
    return functions.reduce<T>(function reducer (arg, fn) {
      return fn(arg)
    }, args)
  }
}

export function resolvePath (modulePath: string, basePath?: string) {
  return require.resolve(modulePath, { paths: [basePath] })
}

export function validatePath (pathToValidate: string) {
  if (!fs.existsSync(pathToValidate)) {
    throw new Error(`Not a valid path: ${pathToValidate}`)
  }

  return pathToValidate
}

export function toRelativePath (from: string, to: string) {
  return path.relative(from, to)
}

export function toForwardSlash (str: string) {
  return slash(str)
}

export function stripExtension (str: string) {
  const parsed = path.parse(str)

  return path.join(parsed.root, parsed.dir, parsed.name)
}

export function addDotSlash (str: string) {
  return str === '.' ? str : `./${str}`
}
