const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageYelp = "https://engineeringblog.yelp.com/"
const Yelpblogs = [
	"https://engineeringblog.yelp.com/"
];
for(let i =2; i<=15; i++){
	Yelpblogs.push("https://engineeringblog.yelp.com/page/" + i + "/");
}

(async () => {
	let data = {
		Yelp: []
	};

	for(let Yelpblog of Yelpblogs){
		for(let i=1; i<=8; i++){
			
			const response = await request({
				uri: Yelpblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding":"gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
				},
				gzip: true
			});
			// console.log(response);
			let $ = cheerio.load(response);
			let title = $('body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child('+i+') > div > div.column.column-alpha.column--responsive > h3 > a').text().trim();
			let link = "https://engineeringblog.yelp.com" + $("body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child("+i+") > div > div.column.column-alpha.column--responsive > h3 > a").prop('href');
			let abstract = $("body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child("+i+") > div > div.column.column-alpha.column--responsive > div.post-preview > p:nth-child(1)").text().trim();
			let date = $("body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child("+i+") > div > div.column.column-alpha.column--responsive > div.post-info > div > div.media-story > ul > li.post-date").text().trim();
			let author = $("body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child("+i+") > div > div.column.column-alpha.column--responsive > div.post-info > div > div.media-story > ul > li.user-name.user-display-name").text().trim();
			let image = "https://engineeringblog.yelp.com" + $("body > div.main-content-wrap--full > div:nth-child(2) > div.posts > article:nth-child("+i+") > div > div.column.column-beta.column--responsive > img").prop('src');
			// let categories = $("#content > div.grid.mxn16.ff-row-wrap > div:nth-child("+i+") > article:nth-child(1) > header > section > a").text().trim();

			console.log(title);
			// console.log(link);
			// console.log(abstract);
			// console.log(date);
			// console.log(author);
			// console.log(image);

			data.Yelp.push({
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
	fs.writeFileSync('../../json/json-data-js/Yelp.json', json, 'utf8');

})();