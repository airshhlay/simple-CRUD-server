var redis = require('redis')
var mongoose = require('mongoose')
var loadConfig = require('../config/config-reader')
var util = require('util')

var config = loadConfig()

// redis client
var client = redis.createClient({
    "host": config.REDIS_HOST,
    "port": config.REDIS_PORT,
    retry_strategy: () => 1000
})

client.on("error", (err) => {
    console.log(err)
})
client.on("ready", () => {
    console.log(">> SUCCESS: Redis connection up")
})


// We make use of the utils.promisify function to transform the client.hget function to return a promise instead of a callback. 
client.hget = util.promisify(client.hget)

// overwrite mongoose exec function
var exec = mongoose.Query.prototype.exec

var clearCache = async (collectionName, op) => {
    var allowedCacheOps = ["find", "findAll"]
    // if operation is insert / delete/ update for any collection that exists, delete its children
    if (!allowedCacheOps.includes(op) && await redis.EXISTS(collectionName)) {
        redis.DEL(collectionName)
    }
}

// mongoose.Query.prototype.cache = (options={}) => {
//     this.useCache = true
//     this.time = 60
//     // this.time = options.time
//     return this
// }

// mongoose.Query.prototype.exec = async () => {
//     if (this.useCache) {
//         var collectionName = this.mongooseCollection.name
//         // redis accepts a string, not a json object

//         var key = JSON.stringify({
//             ...this.getOptions(), // returns the query
//             collectionName: collectionName,
//             op: this.op // the method being called (eg. find, updateOne...)
//         })

//         var cachedResults = await redis.HGET(collectionName, key)

//         console.log("CACHE: " + cachedResults)

//         // cached results found
//         if (cachedResults) {
//             var res = JSON.parse(cachedResults)
//             return res
//         }

//         // no cached results found
//         // get results from database and cache them
//         var res = await exec.apply(this, arguments)
//         redis.HSET(collectionName, key, JSON.stringify(res), "EX", this.time)
        

//         clearCache(collectionName, this.op)

//         return exec.apply(this, arguments)
//     }
// }

mongoose.Query.prototype.cache = function(options = {}) {
    this.enableCache = true;
    this.hashKey = JSON.stringify(options.key || 'default');

    return this;
};

mongoose.Query.prototype.exec = async function() {
    //crate a unique and consistent key
    const key = JSON.stringify(
      Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
      })
    );
    //see if we have value for key in redis
    const cachedValue = await redis.get(key);
    //if we do return that as a mongoose model.
    //the exec function expects us to return mongoose documents
    if (cachedValue) {
      const doc = JSON.parse(cacheValue);
      return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
    }
    const result = await exec.apply(this, arguments); //now exec function's original task.
    client.set(key, JSON.stringify(result),"EX",6000);//it is saved to cache server make sure capital letters EX and time as seconds
  };

// mongoose.Query.prototype.exec = async function() {
//     if (!this.enableCache) {
//         console.log('Data Source: Database');
//         return exec.apply(this, arguments);
//     }

//     const key = JSON.stringify(Object.assign({}, this.getQuery(), {
//         collection: this.mongooseCollection.name,
//     }));

//     const cachedValue = await client.hget(this.hashKey, key);

//     if (cachedValue) {
//         const parsedCache = JSON.parse(cachedValue);

//         console.log('Data Source: Cache');

//         return Array.isArray(parsedCache) 
//                 ?  parsedCache.map(doc => new this.model(doc)) 
//                 :  new this.model(parsedCache);
//     }

//     const result = await exec.apply(this, arguments);
    
//     client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 300);

//     console.log('Data Source: Database');
//     return result;
// };