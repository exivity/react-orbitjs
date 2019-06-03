import ts = require('typescript')
import fs from 'fs'
import { ImportDeclaration } from './types'

let typeCache: ImportDeclaration[]

export function resolveType (type: string) {
  if (typeof typeCache === 'undefined') {
    buildTypeCache()
  }

  return typeCache.find(declaration => declaration.type === type)
}

function buildTypeCache () {
  const configPath = ts.findConfigFile(
    /*searchPath*/ './',
    ts.sys.fileExists,
    'tsconfig.json'
  )

  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.")
  }

  typeCache = []

  const configContents = JSON.parse(
    fs.readFileSync(configPath.toString()).toString()
  )
  const parseConfigHost = {
    fileExists: fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => fs.readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true
  }

  const commandLine = ts.parseJsonConfigFileContent(
    configContents,
    parseConfigHost,
    './'
  )

  const program = ts.createProgram(commandLine.fileNames, commandLine.options)

  // Get the checker, we will use it to find more about classes
  const checker = program.getTypeChecker()

  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // Walk the tree to search for classes
      ts.forEachChild(sourceFile, (nodes: ts.Declaration) =>
        visit(nodes, sourceFile)
      )
    }
  }

  /** visit nodes finding exported classes */
  function visit (node: ts.Declaration, sourceFile: ts.SourceFile) {
    // Only consider exported nodes
    if (!isNodeExported(node)) {
      return
    }

    if (isType(node) && node.name) {
      // This is a top level class, get its symbol
      let symbol = checker.getSymbolAtLocation(node.name)
      if (symbol) {
        typeCache.push({
          type: symbol.getName(),
          modulePath: sourceFile.fileName
        })
      }
      // No need to walk any further, class expressions/inner declarations
      // cannot be exported
    } else if (ts.isModuleDeclaration(node)) {
      // This is a namespace, visit its children
      ts.forEachChild(node, (nodes: ts.Declaration) => visit(nodes, sourceFile))
    }
  }
}

/** True if this is visible outside this file, false otherwise */
function isNodeExported (node: ts.Declaration): boolean {
  return (
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  )
}

function isType (
  node: ts.Declaration
): node is ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
  return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)
}
