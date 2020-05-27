const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

module.exports = class Webpack {
  constructor(options) {
    const { entry, output } = options
    this.entry = entry
    this.output = output
    this.modules = []
  }
  run() {
    const info = this.parse(this.entry)

    this.modules.push(info)
    for (let i = 0; i < this.modules.length; i++) {
      const dependences = this.modules[i].dependences
      if (dependences) {
        for (let key in dependences) {
          this.modules.push(this.parse(dependences[key]))
        }
      }
    }
    // this.modules.map((item,index) => {
    //   const { dependences } = item
    //   if (dependences) {
    //     for (const key in dependences) {
    //       this.modules.push(this.parse(dependences[key]))
    //     }
    //   }

    // })
    const obj = {}
    this.modules.forEach(item => {
      obj[item.entryFile] = {
        dependences: item.dependences,
        code: item.code,
      }
    })
    // this.modules.map((item,index) => {
    //   obj[item.entryFile] = {
    //     dependences: item.dependences,
    //     code: item.code
    //   }
    // })
    // console.log(obj)
    this.file(obj)
  }
  parse(entryFile) {
    const dependences = {}
    const content = fs.readFileSync(entryFile, 'utf-8')
    const ast = parser.parse(content, {
      sourceType: 'module',
    })
    traverse(ast, {
      ImportDeclaration({ node }) {
        const pathName = node.source.value
        const newPath = `./${path.join(path.dirname(entryFile), pathName)}`
        dependences[pathName] = newPath
        // console.log(dependences)
      },
    })
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env'],
    })

    return {
      entryFile,
      dependences,
      code,
    }
  }
  file(code) {
    const outPath = path.join(this.output.path, this.output.filename)
    const newCode = JSON.stringify(code)
    const bundle = `(function(graph){
      function require(module){
        function reRequire(relativePath){
          return require(graph[module].dependences[relativePath])
        }
        var exports = {}

        ;(function(require,exports,code){
          eval(code)
        })(reRequire,exports,graph[module].code)
        return exports
      }
      require('${this.entry}')
    })(${newCode})`
    // const bundle = `(function(graph){
    //   function require(module){
    //     function reRequire(relativePath){
    //       return require(graph[module].dependences[relativePath])
    //     }
    //     var exports = {};
    //     (function(require,exports,code){
    //       eval(code)
    //     })(reRequire,exports,graph[module].code)
    //     return exports;
    //   }
    //   require('${this.entry}')
    // })(${newCode})`;

    fs.writeFileSync(outPath, bundle, 'utf-8')
  }
}
