const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageDeepmind = "https://deepmind.com/blog"
const Deepmindblogs = [
	"https://deepmind.com/blog"
];
for(let i =2; i<=11; i++){
	Deepmindblogs.push("https://deepmind.com/blog?page=" + i);
}

(async () => {
	let data = {
		deepmind: []
	};

	for(let Deepmindblog of Deepmindblogs){
		for(let i=1; i<=20; i++){
			
			const response = await request({
				uri: Deepmindblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding":"gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				},
				gzip: true
			});
			// console.log(response);
			let $ = cheerio.load(response);
			let title = $("#blog_list > section.list-section > div > ul > li:nth-child(2) > dm-component-factory > dm-article-card > div > dm-content-card > div > div.body.ng-tns-c21-3 > h4 > a").text();
			// let link = $("#main > div.posts > article:nth-child("+i+")> header > h2 > a").prop('href');
			// let abstract = $("#main > div.posts > article:nth-child("+i+")> section > blockquote > p:nth-child(1)").text().trim() + " " +  $("#main > div.posts > article:nth-child("+i+")> section > blockquote > p:nth-child(2)").text().trim();
			// let date = $("#main > div.posts > article:nth-child("+i+")> footer > ul.meta > li.time > a").text().trim();
			// let author = $("#main > div.posts > article:nth-child("+i+")> footer > ul.credit > li.author").text().trim();
			// // let image = "https://engineeringblog.yelp.com" + $("body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child("+i+") > div > div.column.column-beta.column--responsive > img").prop('src');
			// let categories = $("#main > div.posts > article:nth-child("+i+")> footer > ul.tags").text().trim();


			console.log(title);
			// console.log(link);
			// console.log(abstract);
			// console.log(date);
			// console.log(author);
			// console.log(categories);

			data.deepmind.push({
				// abstract,
				// author,
				// categories,
				// date,
				// link,
				title
			});
			
		}
	}

	var json = JSON.stringify(data);
	fs.writeFileSync('./deepmind.json', json, 'utf8');

})();