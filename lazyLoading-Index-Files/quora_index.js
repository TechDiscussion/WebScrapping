const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://www.quora.com/q/quoraengineering`) {
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
            this.items = await this.load(100)
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
                for(let m=0; m<4; m++){
                previousHeight = await page.evaluate(`document.body.scrollHeight`)
                    await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`)
                    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`)
                    await page.waitFor(5000)
                    this.spinner.text = chalk.yellow(`Scrolling${index}`)
                }
                

                const nodes = await page.evaluate( () => {
                    let titles = [];
                    let j = 3;
                    for(let i=2; i<43; i++){
                        if(document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div.q-box.qu-mb--small > div > span > a > span") == null){
                            if(j == 5)
                                j = 4;
                            else
                                j = 5;
                        }
                        if(document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div.q-box.qu-mb--small > div > span > a > span") != null){
                            let abs = document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div:nth-child(3) > div > div > div.q-box.qu-mb--small > div > div > span");
                            if(abs == null){
                                abs = document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div:nth-child(3) > div > div > div.q-box.qu-mb--small > div > div > span")
                            }
                            if(abs == null)
                                continue;
                            titles.push({
                                title: document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div.q-box.qu-mb--small > div > span > a > span").textContent,
                                abstract: abs.textContent,
                                author: document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div.q-flex > div > div > div.q-box.qu-flex--auto > div:nth-child(1) > div.q-box > div > div > div > div > div > a > span").textContent,
                                date: document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div.q-flex > div > div > div.q-box.qu-flex--auto > div:nth-child(1) > div.q-text.qu-color--gray.qu-fontSize--small.qu-passColorToLinks.qu-truncateLines--1 > a").textContent,
                                link: document.querySelector("#root > div > div > div:nth-child("+j+") > div > div:nth-child(1) > div.q-box.qu-pb--medium > div > div:nth-child("+i+") > div > div > div > div > div > div > div > div > div > div > div.q-box.qu-mb--small > div > span > a").href
                            })
                        }
                            
                    }
                    return titles;
                })
                console.log(nodes.length);
                for(let l = 0; l<nodes.length; l++){
                    console.log(nodes[l]);
                    media.push(nodes[l]);
                }
                if(index.length >= 1)
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
        fs.writeFileSync('../quora.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy