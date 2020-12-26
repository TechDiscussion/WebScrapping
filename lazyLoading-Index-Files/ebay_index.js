const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://tech.ebayinc.com/`) {
        this.path = path
        this.host = host
        this.spinner = ora().start()
    }

    get url() {
        return `${this.host}`
    }

    async start() {
        this.spinner.text = chalk.yellow(`Scraping url: ${this.url}`)
        this.browser = await puppeteer.launch()
        this.page = await this.browser.newPage()
        
        await this.page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
        })

        await this.page.goto(this.url, {
            waitUntil: `networkidle0`
        })

        if (await this.page.$(`.dialog-404`)) {
            this.spinner.fail(`The url you followed may be broken`);
            process.exit()
        }

        this.spinner.succeed(chalk.green(`Valid page found`))
        this.spinner.start()
        this.evaluate()
    }

    async evaluate() {
        try {
            this.items = await this.load(1000)
        } catch (error) {
            this.spinner.fail(`There was a problem parsing the page`)
            process.exit()
        }
        this.spinner.succeed(chalk.green(`Scraped ${this.items.size} posts`))
        this.buildJSON()
        await this.page.close()
        await this.browser.close()
    }

    async load(maxItemsSize) {
        this.maxItemsSize = maxItemsSize
        var page = this.page
        let previousHeight
        // var media = new Set()
        var media = [];
        var index = `.`
        // let i = 1;
        while (maxItemsSize == null || media.length < maxItemsSize) {
            try {
                // for(let m=0; m<2; m++){
                    previousHeight = await page.evaluate(`document.body.scrollHeight`)
                    await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`)
                    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`)
                    await page.waitFor(5000)
                    this.spinner.text = chalk.yellow(`Scrolling${index}`)
                // }
                

                const nodes = await page.evaluate( () => {
                    let titles = [];
                    for(let i=1; i<60; i++){
                        if(document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a > div.article-content > h3") != null){
                            titles.push({
                                title: document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a > div.article-content > h3").textContent,
                                abstract: document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a > div.article-content > div.article-intro > p").textContent,
                                author: document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a > div.article-content > div.article-intro > div").textContent,
                                // image: document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a > div.internal-article-media > picture > img").src,
                                date: document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a > div.article-content > div.date-tag.clear > time > span").textContent,
                                link: "https://tech.ebayinc.com" + document.querySelector("#main-content > main > div.main-col > div.article-listing.main-listing.js-main-listing > div:nth-child("+i+") > a").href
                            })
                        }
                    }
                    return titles;
                })
                for(let l = 0; l<nodes.length; l++){
                    console.log(nodes[l]);
                    media.push(nodes[l]);
                }
                if(index.length >= 10)
                    break;
                index = index + `.`
            }
            catch (error) {
                console.error(error)
                break
            }
        }
        return media
    }

    buildJSON() {        
        fs.writeFileSync('../ebay.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy