var fs = require('fs')
var yaml = require('js-yaml')
var dotenv = require('dotenv')

dotenv.config()

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