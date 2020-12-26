const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageSlack = "https://slack.engineering/"
const Slackblogs = [
	"https://slack.engineering/"
];
for(let i =2; i<=13; i++){
	Slackblogs.push("https://slack.engineering/page/" + i + "/");
}

(async () => {
	let data = {
		Slack: []
	};

	for(let Slackblog of Slackblogs){
		for(let i=1; i<=8; i++){
			
			const response = await request({
				uri: Slackblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				},
				gzip: true
			});
			// console.log(response);
			let $ = cheerio.load(response);
			let title = $('#primary > div > article:nth-child('+i+') > div > h2 > a').text().trim();
			let link = $("#primary > div > article:nth-child("+i+") > div > h2 > a").prop('href');
			let abstract = $("#primary > div > article:nth-child("+i+") > div > div.post-card__content").text().trim();
			// let date = $("#grid > div:nth-child("+i+") > a:nth-child("+j+") > article > span.date").text().trim();
			let author = $("#primary > div > article:nth-child(7) > div > div.post-card__meta").text().trim();
			let image = $("#primary > div > article:nth-child("+i+") > a > img").prop('src');
			// let categories = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > section > a").text().trim();

			console.log(title);
			// console.log(link);
			// console.log(abstract);
			// // console.log(date);
			// console.log(author);
			// console.log(image);

			data.Slack.push({
				abstract,
				author,
				// date,
				image,
				link,
				title
			});
			
		}
	}

	var json = JSON.stringify(data);
	fs.writeFileSync('./slack.json', json, 'utf8');

})();