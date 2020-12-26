const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageStack = "https://stackoverflow.blog/engineering/"
const Stackblogs = [
	"https://stackoverflow.blog/engineering/"
];
for(let i =2; i<=6; i++){
	Stackblogs.push("https://stackoverflow.blog/engineering/page/" + i + "/");
}

(async () => {
	let data = {
		Stack: []
	};

	for(let Stackblog of Stackblogs){
		for(let i=1; i<=11; i++){

			const response = await request({
				uri: Stackblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				},
				gzip: true
			});

			let $ = cheerio.load(response);
			let title = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > h2 > a").text().trim();
			let link = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > h2 > a").prop('href');
			let abstract = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > div.fs-body3.mb24.lh-excerpt").text().trim();
			let date = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > section > span").text().trim();
			let author = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > div.mt-auto.bb.bc-black-1.pb16 > div > div.grid__cell.fc-black-350").text().trim();
			let image = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > a > img").prop('src');
			let categories = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > section > a").text().trim();

			console.log(title);
			// console.log(link);
			// console.log(abstract);
			// console.log(date);
			// console.log(author);
			// console.log(image);
			// console.log(categories);

			data.Stack.push({
				abstract,
				author,
				categories,
				date,
				image,
				link,
				title
			});
		}
	}

	var json = JSON.stringify(data);
	fs.writeFileSync('./stackoverflow.json', json, 'utf8');

})();