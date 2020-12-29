const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageUber = "https://eng.uber.com/"
const Uberblogs = [
	"https://eng.uber.com/"
];
for(let i =2; i<=10; i++){
	Uberblogs.push("https://eng.uber.com/" + "page/" + i + "/");
}

(async () => {
	let data = {
		UBER: []
	};

	for(let Uberblog of Uberblogs){
		for(let i=1; i<=20; i++){

			const response = await request({
				uri: Uberblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					// "accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				}
			});

			let $ = cheerio.load(response);
			let title = $("body > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row > div.td-pb-span8.td-main-content > div > div:nth-child("+i+") > div.item-details > h3").text();
			let link = $("body > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row > div.td-pb-span8.td-main-content > div > div:nth-child("+i+") > div.item-details > h3 > a").prop('href');
			let abstract = $("body > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row > div.td-pb-span8.td-main-content > div > div:nth-child("+i+") > div.item-details > div[class='td-excerpt']").text().trim();
			let date = $("body > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row > div.td-pb-span8.td-main-content > div > div:nth-child("+i+") > div.item-details > div[class='td-module-meta-info'] > span[class='td-post-date']").text().trim();
			let author = $("body > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row > div.td-pb-span8.td-main-content > div > div:nth-child("+i+") > div.item-details > div[class='td-module-meta-info'] > div[class='coauthors coauthors--byline']").text().trim();
			let image = $("body > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row > div.td-pb-span8.td-main-content > div > div:nth-child("+i+") > div > div.td-module-thumb > a > img").prop("data-img-url");
			console.log(title);
			data.UBER.push({
				abstract,
				author,
				date,
				image,
				link,
				title
			});
		}
	}

	var json = JSON.stringify(data);
	fs.writeFileSync('../../json/json-data-js/uber.json', json, 'utf8');

})();