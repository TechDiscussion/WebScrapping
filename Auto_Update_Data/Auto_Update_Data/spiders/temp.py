import follow as follow
import scrapy
import json
from ..items import AutoUpdateDataItem
import re
from bs4 import BeautifulSoup
from scrapy.crawler import CrawlerProcess
from scrapy.spiders import CrawlSpider, Rule
from scrapy.spiders import SitemapSpider
from scrapy.linkextractors import LinkExtractor
import datetime


from pymongo import MongoClient
import json

# Connect with TechVault's database
from pymongo import MongoClient
# client = MongoClient("mongodb+srv://chedvi:c@cluster0.kf3n4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
# DB_NAME = 'TechVault'
#COLLECTION_NAME = 'contents'


client = MongoClient("mongodb+srv://Chedvi:4999@cluster0.u1rxa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
DB_NAME = 'Temp'
COLLECTION_NAME = 'blog_data'

db = client[DB_NAME]
collection = db[COLLECTION_NAME]
sites = ["Chef",  "Airbrake", "Facebook", "Deepmind", "Open-AI"]


db_blogs = []



class blogs_spider(scrapy.Spider):

    with open(r'C:\Users\Chedvihas\PycharmProjects\Scraping\Auto_Update_Data\Auto_Update_Data\spiders\setup.json') as f:
        json_data = json.load(f)



    name = 'update1'



    def start_requests(self):
        for i in sites:
            website = i
            for obj in collection.find({"company": website}):
                db_blogs.append(obj['link'])
            start_url = self.json_data[website]['sitemap']
            yield scrapy.Request(url=start_url, callback=self.parse, meta={'website': website})

    def parse(self, response):
        website = response.meta.get('website')

        all_blogs = re.findall(r"<loc>(.*?)</loc>", response.text, re.DOTALL)

        all_blogs1 = all_blogs.copy()
        for i in all_blogs:
            for j in self.json_data[website]['deny_rules']:
                if re.match(j, i):
                    all_blogs1.remove(i)
                    break

        matched_blogs = []
        for i in all_blogs1:
            if re.match(self.json_data[website]['allow_rules'],i):
                matched_blogs.append(i)
        print(len(matched_blogs),len(db_blogs))
        matched_blogs = list(set(matched_blogs) - set(db_blogs))
        print(matched_blogs,"Count")
        for link in matched_blogs:

            yield response.follow(link, callback=self.get_data, meta={'link-item': link, 'website': website})


    def clean_abstract(self, text):

        #text = ' '.join(text)
        soup = BeautifulSoup(text, "html.parser")
        for data in soup(['style', 'script']):
            # Remove tags
            data.decompose()

        return ' '.join(soup.stripped_strings)




    def reformatDate(self, date) :

        if re.match(".+\dT\d.+",date):
            #If date is in 2018-11-06T23:51:41Z format
            date = date.split('T')[0]
            return date
        if date.replace('-','').isnumeric():
            #If date is in yy-mm-dd it returns directly
            return date
        date = date.replace(',','')
        # replacing 1st,2nd 3rd kind of strings
        date = re.sub(r'(\d)(st|nd|rd|th)', r'\1', date)

        month, day, year = date.split()
        if day.isnumeric():
            pass
        else:
            day, month, year = date.split()

        month = month.capitalize()
        try:
            months = ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
            return '{}-{:02}-{:0>2}'.format(year, months.index(month) + 1, day)
        except:
            months = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')

            return '{}-{:02}-{:0>2}'.format(year, months.index(month) + 1, day)

    def get_data(self, response):
        items = AutoUpdateDataItem()
        website = response.meta.get('website')
        #print(website,"-----------------------------------------------------------------------------------")
        link = response.meta.get('link-item')
        title = response.css(self.json_data[website]['title']).extract_first()
        author = response.css(self.json_data[website]['author']).extract()
        author = [i.strip() for i in author]
        abstract = self.clean_abstract(response.xpath(self.json_data[website]['abstract']).extract_first())
        date = response.css(self.json_data[website]['date']).extract_first()
        print(author)

        date = self.reformatDate(str(date))

        items['website'] = website
        items['title'] = title
        if(len(author)==0):
            author = 'Unknown'
        items['author'] = author
        items['link'] = link.strip()
        items['abstract'] = abstract
        items['date'] = date
        yield items
