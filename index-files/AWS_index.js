const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageAWS = "https://aws.amazon.com/blogs/aws/"
const AWSblogs = [
	"https://aws.amazon.com/blogs/aws/"
];
for(let i =2; i<=10; i++){
	AWSblogs.push("https://aws.amazon.com/blogs/aws/" + "page/" + i + "/");
}

(async () => {
	let data = {
		AWS: []
	};

	for(let AWSblog of AWSblogs){
		for(let i=2; i<=15; i++){

			const response = await request({
				uri: AWSblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				},
				gzip: true
			});
			console.log(response)
			let $ = cheerio.load(response);
			let title = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-18.lb-tiny-24 > h2").text().trim();
			let link = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-18.lb-tiny-24 > h2 > a").prop('href');
			let abstract = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-18.lb-tiny-24 > section[class='blog-post-excerpt'] > p").text();
			let date = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-18.lb-tiny-24 > footer[class='blog-post-meta'] > time").text();
			let author = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-18.lb-tiny-24 > footer[class='blog-post-meta'] > span[property='author']").text();
			let categories = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-18.lb-tiny-24 > footer[class='blog-post-meta'] > span[class='blog-post-categories'] ").text();
			let image = $("#aws-page-content > div > main > article:nth-child(" + i + ") > div > div.lb-col.lb-mid-6.lb-tiny-24 > a").prop("href");


			data.AWS.push({
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
	fs.writeFileSync('./AWS.json', json, 'utf8');

	// const j2cp = new json2csv()
	// const json = j2cp.parse(imdbData);
	// console.log(csv);
	// fs.writeFileSync("./imdb.json", JSON, "utf-8");

})();