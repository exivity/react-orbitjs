import util = require('util')
import fs = require('fs')
import path = require('path')
import camelCase = require('camelcase')

export function toPascalCase (name: string) {
  return camelCase(name, { pascalCase: true })
}

export function getTemplate (name: string, params: string[] = []) {
  const template = readFile(
    path.resolve(__dirname, '..', 'templates', `${name}.ts`)
  )

  return util.format(template, ...params)
}

export function readFile (filePath: string) {
  return fs.readFileSync(filePath).toString()
}
