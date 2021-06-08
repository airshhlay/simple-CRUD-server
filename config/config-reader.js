var fs = require('fs')
var yaml = require('js-yaml')
var dotenv = require('dotenv')

const TEST_CONFIG_FILE = '/test-config.yaml'
const DEV_CONFIG_FILE = '/dev-config.yaml'

const TEST_SAVED_DATA_FILE = '/test-saved-data.json'
const DEV_SAVED_DATA_FILE = '/dev-saved-data.json'

dotenv.config()

var loadConfig = () => {
    try {
        var filePath = process.env.NODE_ENV === 'TEST' ? TEST_CONFIG_FILE : DEV_CONFIG_FILE
        var fileContents = fs.readFileSync(__dirname + filePath, 'utf8')
        var config = yaml.load(fileContents)
        console.log(">> SUCCESS: loaded config file at: " + filePath)
        return config
    } catch (err) {
        console.log(">> ERROR [config-reader::loadConfig]: ", err)
    }
}

var getSavedData = () => {
    try {
        var filePath = process.env.NODE_ENV === 'TEST' ? TEST_SAVED_DATA_FILE : DEV_SAVED_DATA_FILE
        var fileContents = fs.readFileSync(__dirname + filePath, 'utf8')
        var data = JSON.parse(fileContents)
        console.log(">> SUCCESS: retrieved saved data at: " + filePath)
        
        return data
    } catch(err) {
        console.log(">> ERROR [config-reader::getSavedData]", err)
    }
}

var updateSavedData = (update) => {
    try {
        var filePath = process.env.NODE_ENV === 'TEST' ? TEST_SAVED_DATA_FILE : DEV_SAVED_DATA_FILE
        fs.writeFileSync(__dirname + filePath, JSON.stringify(update))
        console.log(">> SUCCESS: updated saved data at: " + filePath)
    } catch(err) {
        console.log(">> ERROR [config-reader::updateSavedData]", err)
    }
}

module.exports = {
    loadConfig: loadConfig,
    getSavedData: getSavedData,
    updateSavedData: updateSavedData,
}