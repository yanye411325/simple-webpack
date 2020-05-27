(function(graph){
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
      require('./src/index.js')
    })({"./src/index.js":{"dependences":{},"code":"\"use strict\";\n\n// import { add } from './add.js'\n// import {my} from './my.js'\n// console.log(add(1,4))\n// console.log(my)\nconsole.log(111);"}})