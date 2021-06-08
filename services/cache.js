var redis = require('redis')
var {loadConfig, updateSavedData, getSavedData} = require('../config/config-reader')

var config = loadConfig()

// redis client
var client = redis.createClient({
    "host": config.REDIS_HOST,
    "port": config.REDIS_PORT,
})

client.on("error", (err) => {
    console.log(err)
})
client.on("ready", () => {
    console.log(">> SUCCESS: Redis connection up")
})

// We make use of the utils.promisify function to transform the client.hget function to return a promise instead of a callback. 
// client.hget = util.promisify(client.hget)

var checkCache = async (key) => {
    return new Promise((resolve, reject) => {
        console.log("checking cache...")
        client.get(key, (err, val) => {
            if (err) {
                console.log(err)
                return reject(err)
            }

            console.log("in cache.js: " + val)
            return resolve(val)
        })
    })
    // console.log("checking cache...")
    // client.get(key, (err, val) => {
    //     if (err) {
    //         return console.log(err)
    //     }

    //     console.log("from cache: " + val)

    //     return val
    // })
    
}

var setCache = (key, val) => {
    console.log("setting cache...")
    client.set(key, JSON.stringify(val))
    console.log("set " + key + " : " + JSON.stringify(val) + " in cache")
}

var deleteCacheById = (key) => {
    return new Promise((resolve, reject) => {
        console.log("deleting " + key + " from cache...")
        client.del(key, (err, res) => {
            if (err) {
                return reject()
            }
            return resolve()
        })
    })
}

var clearCache = () => {
    return new Promise((resolve, reject) => {
        console.log("clearing cache...")
        // client.del(config.DATABASE_COLLECTION_NAME)
        client.flushall((err, success) => {
            if (err) {
                return reject(err)
            }
            console.log(">> SUCCESS [cache]: cleared cache")
            return resolve()
        })
    })
}

module.exports = {
    clearCache: clearCache,
    setCache: setCache,
    checkCache: checkCache,
    deleteCacheById: deleteCacheById
}