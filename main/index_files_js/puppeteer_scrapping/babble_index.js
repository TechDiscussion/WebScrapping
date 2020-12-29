const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://www.babbel.com/en/magazine/category/babbel-bytes`) {
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
            'accept-encoding': "gzip, deflate, br",
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8        '
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

                // const cssSelector = await page.evaluate(() => document.querySelector('#wrapper-index > div.loadmore-container > button'));
                const isElementVisible = async (page, cssSelector) => {
                  let visible = true;
                  await page
                    .waitForSelector(cssSelector, { visible: true, timeout: 5000 })
                    .catch(() => {
                      visible = false;
                    });
                  return visible;
                };

                let loadMoreVisible = await isElementVisible(page, '#root > div > main > div > div > section > div > a > button > div');
                // console.log(loadMoreVisible)
                let i = 0;
                while (loadMoreVisible) {
                    if(i == 2)
                        break;
                    console.log(loadMoreVisible)
                    await page
                        .click("#root > div > main > div > div > section > div > a > button > div")
                        .catch(() => {});
                    i++;
                    await page.waitFor(10000)
                    loadMoreVisible = await isElementVisible(page, "#root > div > main > div > div > section > div > a > button > div");
                }

                const nodes = await page.evaluate( () => {
                    let titles = [];
                    for(let i=2; i<=100; i++){
                        // for(let j=1; j<=3; j++){
                            if( document.querySelector("#root > div > main > div > div > section > div > div > div:nth-child(2) > div > div:nth-child("+i+") > div > div > a > div:nth-child(2) > h3") != null){
                                titles.push({
                                    title: document.querySelector("#root > div > main > div > div > section > div > div > div:nth-child(2) > div > div:nth-child("+i+") > div > div > a > div:nth-child(2) > h3").textContent,
                                    author: document.querySelector("#root > div > main > div > div > section > div > div > div:nth-child(2) > div > div:nth-child("+i+") > div > div > div.listViewItem__author--gGXvx.typography__meta--3nuv_ > span > a").textContent,
                                    link: "https://www.babbel.com" + document.querySelector("#root > div > main > div > div > section > div > div > div:nth-child(2) > div > div:nth-child("+i+") > div > div > a").href,
                                    image: document.querySelector("#root > div > main > div > div > section > div > div > div:nth-child(2) > div > div:nth-child("+i+") > div > div > a > div.listViewItem__featuredImageWrapper--1MXuH > figure > div > img").src
                                })
                            }
                        // }
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

    buildJSON() {        
        fs.writeFileSync('../../../json/json-data-js/babble.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy