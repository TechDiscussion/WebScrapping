const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://netflixtechblog.com/`) {
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
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
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
        while (maxItemsSize == null || media.length < maxItemsSize) {
            try {
                for(let m=0; m<10; m++){
                previousHeight = await page.evaluate(`document.body.scrollHeight`)
                    await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`)
                    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`)
                    await page.waitFor(5000)
                    this.spinner.text = chalk.yellow(`Scrolling${index}`)
                }
                

                const nodes = await page.evaluate( () => {
                    let titles = [];
                    for(let i=4; i<14; i++){
                        for(let j=2; j<=9; j++){
                            for(let k=1; k<=3; k++){
                                if(document.querySelector("#container > div > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > div > div") != null && document.querySelector("#container > div > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > h3 > div") != null && document.querySelector("#container > div> div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > div > div > div.postMetaInline.postMetaInline-authorLockup.ui-captionStrong.u-flex1.u-noWrapWithEllipsis > div > time") != null && document.querySelector("#container > div > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.u-lineHeightBase.postItem > a") != null){
                                    titles.push({
                                        title: document.querySelector("#container > div > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > h3 > div").textContent,
                                        abstract: document.querySelector("#container > div > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > div > div").textContent,
                                        date: document.querySelector("#container > div> div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > div > div > div.postMetaInline.postMetaInline-authorLockup.ui-captionStrong.u-flex1.u-noWrapWithEllipsis > div > time").textContent,
                                        link: document.querySelector("#container > div > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.u-lineHeightBase.postItem > a").href
                                    })
                                }
                            }
                        }
                    }
                    return titles;
                })
                for(let l = 0; l<nodes.length; l++){
                    console.log(nodes[l]);
                    media.push(nodes[l]);
                }
                if(index.length == 10)
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
        fs.writeFileSync('../netflix.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy