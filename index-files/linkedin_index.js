const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageLinkedin = "https://engineering.linkedin.com/blog"
const Linkedinblogs = [
	"https://engineering.linkedin.com/blog"
];
for(let i =2; i<=18; i++){
	Linkedinblogs.push("https://engineering.linkedin.com/blog?page=" + i);
}

(async () => {
	let data = {
		Linkedin: []
	};

	for(let Linkedinblog of Linkedinblogs){
		for(let i=1; i<=6; i++){

			const response = await request({
				uri: Linkedinblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				},
				gzip: true
			});

			let $ = cheerio.load(response);
			let title = $("#post-list-component > ul > li:nth-child("+i+") > div.post-wrapper > div.post > div.header > h2 > a").text().trim();
			let link = "https://engineering.linkedin.com/" + $("#post-list-component > ul > li:nth-child("+i+") > div.post-wrapper > div.post > div.header > h2 > a").prop('href');
			let abstract = $("#post-list-component > ul > li:nth-child("+i+") > div.post-wrapper > div.post > div.content").text().trim();
			let date = $("#post-list-component > ul > li:nth-child("+i+") > div.post-wrapper > div.post > div.header > h3 > span.timestamp").text().trim();
			let author = $("#post-list-component > ul > li:nth-child("+i+") > div.post-wrapper > div.post > div.header > h3 > span.author > a").text().trim();
			let image = "https://engineering.linkedin.com/" + $("#post-list-component > ul > li:nth-child("+i+") > div.post-thumb > a > img").prop('data-src');
			let categories = $("#post-list-component > ul > li:nth-child("+i+") > div.post-wrapper > div.category-list-container > ul").text().trim();

			console.log(title);
			// console.log(link);
			// console.log(abstract);
			// console.log(date);
			// console.log(author);
			// console.log(image);
			// console.log(categories);

			data.Linkedin.push({
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
	fs.writeFileSync('./linkedin.json', json, 'utf8');

})();