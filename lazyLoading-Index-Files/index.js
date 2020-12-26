const Scrapy = require('./ebay_index.js')

let path = process.argv[2]
let scrapy = new Scrapy(path)
scrapy.start().catch(error => console.error(error))