const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://deepmind.com/blog`) {
        this.path = path
        this.host = host
        this.spinner = ora().start()
    }

    get url() {
        return `${this.host}`
    }

    async start() {
        // let items;
        // for(let i=1; i<=5; i++){
            let uri = this.url;
            // if(i > 1)
                uri = this.url + "?page=6";
            this.spinner.text = chalk.yellow(`Scraping url: ${uri}`)
            this.browser = await puppeteer.launch()
            this.page = await this.browser.newPage()
            
            await this.page.setExtraHTTPHeaders({
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-encoding":"gzip, deflate, br",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
            })

            await this.page.goto(uri, {
                waitUntil: `networkidle0`
            })

            if (await this.page.$(`.dialog-404`)) {
                this.spinner.fail(`The url you followed may be broken`);
                process.exit()
            }

            this.spinner.succeed(chalk.green(`Valid page found`))
            this.spinner.start()
            this.evaluate()  
        // }
        
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
                // previousHeight = await page.evaluate(`document.body.scrollHeight`)
                // await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`)
                // await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`)
                // await page.waitFor(5000)
                // this.spinner.text = chalk.yellow(`Scrolling${index}`)
                
                const nodes = await page.evaluate( () => {
                    let titles = [];
                    for(let i=1; i<=20; i++){
                        let j = i+1;
                        if(document.querySelector("#blog_list > section.list-section > div > ul > li:nth-child("+i+") > dm-component-factory > dm-article-card > div > dm-content-card > div > div.body.ng-tns-c21-"+j+" > h4 > a") == null)
                                continue;
                            titles.push({
                                title: document.querySelector("#blog_list > section.list-section > div > ul > li:nth-child("+i+") > dm-component-factory > dm-article-card > div > dm-content-card > div > div.body.ng-tns-c21-"+j+" > h4 > a").textContent,
                                abstract: document.querySelector("#blog_list > section.list-section > div > ul > li:nth-child("+i+") > dm-component-factory > dm-article-card > div > dm-content-card > div > div.body.ng-tns-c21-"+j+" > p").textContent,
                                image: document.querySelector("#blog_list > section.list-section > div > ul > li:nth-child("+i+") > dm-component-factory > dm-article-card > div > dm-content-card > dm-link > a > dm-media > div.image.ng-star-inserted > picture > source:nth-child(1)").srcset,
                                date: document.querySelector("#blog_list > section.list-section > div > ul > li:nth-child("+i+") > dm-component-factory > dm-article-card > div > dm-content-card > div > div.footer.ng-tns-c21-"+j+" > p").textContent,
                                link: document.querySelector("#blog_list > section.list-section > div > ul > li:nth-child("+i+") > dm-component-factory > dm-article-card > div > dm-content-card > div > div.body.ng-tns-c21-"+j+" > h4 > a").href
                            })
                    }
                    return titles;
                })
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

    buildJSON(i) {        
        fs.writeFileSync('../../../json/json-data-js/deepminds3.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy