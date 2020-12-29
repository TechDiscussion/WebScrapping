const puppeteer = require(`puppeteer`)
const ora = require(`ora`)
const chalk = require(`chalk`)
const fs = require(`fs`)

class Scrapy {

    constructor(path = ``, host = `https://medium.com/medium-eng`) {
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
                // console.log(page);
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

                let loadMoreVisible = await isElementVisible(page, '#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div.ob.ct.z.ak > div.oc.hi.w.n.od.p.gj.ge.oe.of > button');
                console.log(loadMoreVisible)
                let i = 0;
                while (loadMoreVisible) {
                    if(i == 10)
                        break;
                    this.spinner.text = chalk.yellow(`Loading`)
                    console.log(loadMoreVisible)
                    await page
                        .click("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div.ob.ct.z.ak > div.oc.hi.w.n.od.p.gj.ge.oe.of > button")
                        .catch(() => {});
                    i++;
                    await page.waitFor(5000)
                    loadMoreVisible = await isElementVisible(page, "#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div.ob.ct.z.ak > div.oc.hi.w.n.od.p.gj.ge.oe.of > button");
                }

                const nodes = await page.evaluate( () => {
                    let titles = [];
                    for(let i=2; i<=250; i++){
                        // for(let j=1; j<=3; j++){
                            if(document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.o.n > div.w.n.ee > div > div > span > a > h4") != null && document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.hl.z > div > section > p") != null && document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.o.n > div.w.n.ee > span > a > h4") != null && document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.hl.z > div > section > div > h1") != null){
                                titles.push({
                                    title: document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.hl.z > div > section > div > h1").textContent,
                                    date: document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.o.n > div.w.n.ee > span > a > h4").textContent,
                                    abstract: document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.hl.z > div > section > p").textContent,
                                    link: document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.hl.z > div > section > div > h1 > a").href,
                                    author: document.querySelector("#root > div > div.t.n.u > div.z.av > div > div.n.p > div > div:nth-child("+i+") > div > div > div > div.mf.z.mg > div.o.n > div.w.n.ee > div > div > span > a > h4").textContent
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
        fs.writeFileSync('../../../json/json-data-js/medium.json', JSON.stringify(this.items));
    }
}

module.exports = Scrapy