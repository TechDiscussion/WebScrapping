const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageConfluent = "https://www.confluent.io/blog/"
const Confluentblogs = [
	"https://www.confluent.io/blog/"
];
for(let i =2; i<=10; i++){
	Confluentblogs.push("https://www.confluent.io/blog/" + i + "/");
}

(async () => {
	let data = {
		confluent: []
	};

	for(let Confluentblog of Confluentblogs){
		for(let i=2; i<=11; i++){

			const response = await request({
				uri: Confluentblog,
				// headers: {
				// 	"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				// 	"accept-encoding": "gzip, deflate, br",
				// 	"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				// },
				// br: true
			});
			console.log(response);
			let $ = cheerio.load(response);
			let title = $("#gatsby-focus-wrapper > div:nth-child(2) > section.style-module--sectionContent--3CzBg.style-module--mainSection--3uX12 > div > article:nth-child("+i+") > div.style-module--content--2cWa9 > h2 > a").text();
			let link = "https://www.confluent.io/" + $("#gatsby-focus-wrapper > div:nth-child(2) > section.style-module--sectionContent--3CzBg.style-module--mainSection--3uX12 > div > article:nth-child("+i+") > div.style-module--content--2cWa9 > h2 > a").prop('href');
			let abstract = $("#gatsby-focus-wrapper > div:nth-child(2) > section.style-module--sectionContent--3CzBg.style-module--mainSection--3uX12 > div > article:nth-child("+i+") > div.style-module--content--2cWa9 > div.style-module--summary--2CPjk > p").text().trim();
			let date = $("#gatsby-focus-wrapper > div:nth-child(2) > section.style-module--sectionContent--3CzBg.style-module--mainSection--3uX12 > div > article:nth-child("+i+") > div.style-module--content--2cWa9 > div.style-module--metadata--dt9Hb > time").text().trim();
			let author = $("#gatsby-focus-wrapper > div:nth-child(2) > section.style-module--sectionContent--3CzBg.style-module--mainSection--3uX12 > div > article:nth-child("+i+") > div.style-module--content--2cWa9 > ul > li > a").text().trim();
			// let image = $("#gatsby-focus-wrapper > div:nth-child(2) > section.style-module--sectionContent--3CzBg.style-module--mainSection--3uX12 > div > article:nth-child(2) > div.style-module--imageContainer--1coFo > img").prop('src');
			console.log(title);
			data.confluent.push({
				abstract,
				author,
				date,
				// image,
				link,
				title
			});
		}
	}

	var json = JSON.stringify(data);
	fs.writeFileSync('../../json/json-data-js/confluent.json', json, 'utf8');

})();