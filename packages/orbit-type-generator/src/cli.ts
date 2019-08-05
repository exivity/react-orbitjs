const path = require('path')
const fs = require('fs')
const babel = require('@babel/core')
const generator = require('./generator')

const inputFile = process.argv[2]

if (!inputFile) {
  console.log('Usage: orbit-type-generator FILE')
  process.exit(1)
}

const absPath = path.resolve(process.cwd(), inputFile)
const transpiled = babel.transformFileSync(absPath, {
  plugins: ['@babel/plugin-transform-modules-commonjs']
}).code

// tslint:disable-next-line: no-eval
const schema = eval(transpiled)

console.log(generator.generateTypes(schema))
