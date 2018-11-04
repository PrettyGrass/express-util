const YAML = require('yamljs')
const fs = require("fs")
// file为文件所在路径
var data = YAML.parse(fs.readFileSync('/Users/ylin/GitHub/DPIntlApp/Podfile.lock').toString())
// console.log('data', JSON.stringify(data))

for (let key in data) {
  console.log(key)
  let val = data[key]
  console.log('', typeof val)
  switch (key){
    case 'PODS':
      break
  }
}