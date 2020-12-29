const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://medium.com/criteo-labs`) {
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
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'cache-control': 'max-age=0',
            'cookie': '_ga=GA1.2.1824007638.1561579151; optimizelyEndUserId=13ee1c8a8219; g_state={"i_l":0}; uid=13ee1c8a8219; sid=1:XaczxwJ5WTi6WRtjaK2gEiODuvNJH5Lz7k5N+dxgKh9Ek12r9tVgCkxnBIhVWPo/; __cfduid=df387fd312317d116a5a6e69aed5f7c521607973754; lightstep_guid/lite-web=1ccfc9ae280b16e5; lightstep_session_id=182be6594b06ecf8; __cfruid=2d969248cefa4997021f4c0d666ceab98a573c6c-1608794749; lightstep_guid/medium-web=7afbd487269ad18f; tz=-330; pr=1.375; xsrf=079613caa156; _parsely_session={%22sid%22:117%2C%22surl%22:%22https://medium.com/airbnb-engineering%22%2C%22sref%22:%22https://github.com/kilimchoi/engineering-blogs%22%2C%22sts%22:1609083993209%2C%22slts%22:1608970990033}; _parsely_visitor={%22id%22:%22pid=2fc6ea754d49b22e975ba6be0b8f4983%22%2C%22session_count%22:117%2C%22last_session_ts%22:1609083993209}; _gid=GA1.2.1731786413.1609083994; sz=786',
            'sec-ch-ua': '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
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
                for(let m=0; m<3; m++){
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
                                if(document.querySelector("#container > div:nth-child(2) > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > h3 > div") != null){
                                    titles.push({
                                        title: document.querySelector("#container > div:nth-child(2) > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > h3 > div").textContent,
                                        abstract: document.querySelector("#container > div:nth-child(2) > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a > div > div").textContent,
                                        author: document.querySelector("#container > div:nth-child(2) > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > div > div > div.postMetaInline.postMetaInline-authorLockup.ui-captionStrong.u-flex1.u-noWrapWithEllipsis > a").textContent,
                                        date: document.querySelector("#container > div:nth-child(2) > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > div > div > div.postMetaInline.postMetaInline-authorLockup.ui-captionStrong.u-flex1.u-noWrapWithEllipsis > div > time").textContent,
                                        link: document.querySelector("#container > div:nth-child(2) > div > div.u-marginBottom40.js-collectionStream > div:nth-child("+i+") > section > div:nth-child("+j+") > div:nth-child("+k+") > div.col.u-xs-marginBottom10.u-paddingLeft0.u-paddingRight0.u-paddingTop15.u-marginBottom30 > a").href
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
        fs.writeFileSync('../../../json/json-data-js/criteo.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy