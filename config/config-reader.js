var fs = require('fs')
var yaml = require('js-yaml')

loadConfig = () => {
    try {
        var fileContents = fs.readFileSync(__dirname + '/config.yaml', 'utf8')
        config = yaml.load(fileContents)
        return config
    } catch (err) {
        console.log(">> ERROR [config-reader::loadConfig]: ", err)
    }
}

module.exports = loadConfig