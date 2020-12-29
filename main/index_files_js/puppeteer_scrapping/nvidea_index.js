const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://blogs.nvidia.com/`) {
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

                let loadMoreVisible = await isElementVisible(page, '#load-more');
                // console.log(loadMoreVisible)
                let i = 0;
                while (loadMoreVisible) {
                    if(i == 10)
                        break;
                    console.log(loadMoreVisible)
                    await page
                        .click("#load-more")
                        .catch(() => {});
                    i++;
                    await page.waitFor(5000)
                    loadMoreVisible = await isElementVisible(page, "#load-more");
                }

                const nodes = await page.evaluate( () => {
                    let titles = [];
                    for(let i=2; i<=250; i++){
                        // for(let j=1; j<=3; j++){
                            if( document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > header > div.header-text > h4 > a") != null){
                                titles.push({
                                    title: document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > header > div.header-text > h4 > a").textContent,
                                    category: document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > div > div > a > span").textContent,
                                    date: document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > header > div.publish-date > div").textContent,
                                    author: document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > header > div.publish-date > div > a").textContent,
                                    link: document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > header > div.header-text > h4 > a").href,
                                    abstract: document.querySelector("#main > div.more-stories-posts-area > div > div.js-content-grid.load-more-grid.load-more-tiles > article:nth-child("+i+") > header > div.entry-excerpt > p").textContent
                                    // image: document.querySelector("#main > div.article-grids.col-md-12.inner-container > div:nth-child("+i+") > div:nth-child("+j+")> article > a > img").src
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
        fs.writeFileSync('../../../json/json-data-js/nvidea.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy