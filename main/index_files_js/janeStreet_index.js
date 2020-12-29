const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageJane = "https://blog.janestreet.com/"
const Janeblogs = [
	"https://blog.janestreet.com/"
];
for(let i =2; i<=10; i++){
	Janeblogs.push("https://blog.janestreet.com/page/" + i + "/");
}

(async () => {
	let data = {
		Jane: []
	};

	for(let Janeblog of Janeblogs){
		for(let i=1; i<=3; i++){
			for(let j=1; j<=4; j++){
				const response = await request({
					uri: Janeblog,
					headers: {
						"sec-ch-ua": '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
						"sec-ch-ua-mobile": "?0",
						"Upgrade-Insecure-Requests": 1,
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
					},
					gzip: true
				});
				// console.log(response);
				let $ = cheerio.load(response);
				let title = $('body > div.main.container > div.content > div.articles > div:nth-child(1) > a:nth-child(1) > article > h1').text().trim();
				let link = "https://blog.janestreet.com/" + $("#grid > div:nth-child("+i+") > a:nth-child("+j+")").prop('href');
				let abstract = $("#grid > div:nth-child("+i+") > a:nth-child("+j+") > article > p").text().trim();
				let date = $("#grid > div:nth-child("+i+") > a:nth-child("+j+") > article > span.date").text().trim();
				let author = $("#grid > div:nth-child("+i+") > a:nth-child("+j+") > article > div.author > span").text().trim();
				let image = "https://blog.janestreet.com/" + $("#grid > div:nth-child("+i+") > a:nth-child("+j+") > article > div.featured-img > img").prop('src');
				// let categories = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > section > a").text().trim();

				console.log(title);
				console.log(link);
				console.log(abstract);
				console.log(date);
				console.log(author);
				console.log(image);

				data.Jane.push({
					abstract,
					author,
					date,
					image,
					link,
					title
				});
			}
		}
	}

	var json = JSON.stringify(data);
	fs.writeFileSync('../../json/json-data-js/Jane.json', json, 'utf8');

})();