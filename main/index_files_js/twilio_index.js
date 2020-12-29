const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const mainPageTwilio = "https://www.twilio.com/blog"
const Twilioblogs = [
	"https://www.twilio.com/blog"
];
for(let i =2; i<=15; i++){
	Twilioblogs.push("https://www.twilio.com/blog/" + "page/" + i);
}

(async () => {
	let data = {
		Twilio: []
	};

	for(let Twilioblog of Twilioblogs){
		for(let i=1; i<=10; i++){

			const response = await request({
				uri: Twilioblog,
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"cache-control": "max-age=0",
					"cookie": "_gcl_au=1.1.1816363506.1604767490; _ga=GA1.2.1586980004.1604767491; d-a8e6=52d05c00-f72d-47ea-aa7e-164a81df7958; bf_lead=2fbm336irujg00; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%2246cde342-a03f-479b-ab01-6cd4e08efe47%22; _mkto_trk=id:294-TKB-300&token:_mch-twilio.com-1604767511427-62782; _hjid=971b4b0c-3b49-4c0f-b2b6-aa3ca6681077; _fbp=fb.1.1604767516193.1842791379; __qca=P0-1153967902-1604767515461; __adroll_fpc=73547f356c9eecf69a0e204651d8e536-1604767529284; identity=; _gid=GA1.2.334146481.1608794798; _hjTLDTest=1; ki_r=; s-9da4=a8bb78f0-d64c-4d73-b987-f54c7d07f0e4; _hjIncludedInPageviewSample=1; _hjAbsoluteSessionInProgress=0; _hjIncludedInSessionSample=1; _hp2_ses_props.1541905715=%7B%22ts%22%3A1608833554962%2C%22d%22%3A%22www.twilio.com%22%2C%22h%22%3A%22%2Fblog%22%7D; bf_visit=281jvb8e30p000; mp_f71c19735fa6ecc5225ff563285e1794_mixpanel=%7B%22distinct_id%22%3A%20%22175a39896ed1a6-0747c8373806aa-c781f38-144000-175a39896ee16e%22%2C%22%24device_id%22%3A%20%22175a39896ed1a6-0747c8373806aa-c781f38-144000-175a39896ee16e%22%2C%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%7D; _hp2_id.1541905715=%7B%22userId%22%3A%225086735909320834%22%2C%22pageviewId%22%3A%226998906957860436%22%2C%22sessionId%22%3A%222069623782040445%22%2C%22identity%22%3A%22VI904df92edf25023d9c9272739be9ae8b%22%2C%22trackerVersion%22%3A%224.0%22%2C%22identityField%22%3A%22Visitor%20Id%22%2C%22isIdentified%22%3A1%7D; ki_t=1604767520951%3B1608794799374%3B1608833705310%3B2%3B6; __ar_v4=7I7WCA3TU5GNHMRSSMSON4%3A20210023%3A1%7CMB5EHMFDNZCAPIIQFNNCUZ%3A20210023%3A3%7CLVLQJOTNERDJZLBZYUYQ6X%3A20210023%3A4%7C5IACO76IQ5HCJNO2M2OF6M%3A20210023%3A4; tw-visitor=314201003f7a7ba4b9274383b33ec463af6e6d41b0008eba33f591acf12cf9bf59f4f220bc5931163b87ca8e8a12524cb659e420357afcd342818dbf4507c2289dd37adf8361633475a8e1f7e36b77337a5b65421c965c6e93a570e286ca607754b40b172fbbd86d142d7de879a12eccf5a433a3ff5298db4547f8d4a2dc",
					"sec-ch-ua": '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
					"sec-ch-ua-mobile": "?0",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "none",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
					"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
				}
			});

			let $ = cheerio.load(response);
			//body > main > section > div:nth-child(2) > li > a.article-list-title.h1
			//body > main > section > div:nth-child(1) > li > a.article-list-title.h1
			//body > main > section > div:nth-child(1) > li > div.article-list-subtitle > div > div > p:nth-child(1)
			let title = $("body > main > section > div:nth-child("+i+") > li > a.article-list-title.h1").text();
			let link = $("body > main > section > div:nth-child("+i+") > li > a.article-list-title.h1").prop('href');
			let abstract = $("body > main > section > div:nth-child("+i+") > li > div.article-list-subtitle > div > div").text().trim();
			let date = $("body > main > section > div:nth-child("+i+") > li > div.article-list-meta > span").text().trim();
			let author = $("body > main > section > div:nth-child("+i+") > li > div.article-list-meta > a").text().trim();
			let image = $("body > main > section > div:nth-child("+i+") > li > a.article-list-img-wrap > img").prop("src");
			
			console.log(title);
			// console.log(link);
			// console.log(abstract);
			// console.log(date);
			// console.log(author);
			// console.log(image);
			// console.log(categories);
			
			data.Twilio.push({
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
	fs.writeFileSync('../../json/json-data-js/twilio.json', json, 'utf8');

})();