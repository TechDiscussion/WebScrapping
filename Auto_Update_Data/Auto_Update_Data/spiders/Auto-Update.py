
import scrapy
# import sys, os
# sys.path.append(os.path.abspath('..'))
import os
import sys

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
from items import AutoUpdateDataItem
from scrapy.utils.project import get_project_settings
import re
from bs4 import BeautifulSoup
import datetime
import json
from scrapy.crawler import CrawlerProcess
# Connect with TechVault's database
from pymongo import MongoClient


client = MongoClient("mongodb+srv://chedvi:c@cluster0.kf3n4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
DB_NAME = 'TechVault'
COLLECTION_NAME = 'contents'
# DB_NAME = 'testing_upload'
# COLLECTION_NAME = 'Blog_Testing'






db = client[DB_NAME]
collection = db[COLLECTION_NAME]
#sites = ["Chef", "Airbrake", "Facebook", "Deepmind", "Open-AI"]

# db_blogs = []

with open('Auto_Update_Data/spiders/companies','r') as f:
  sites = f.read().split()
  sites = [i.strip() for i in sites]

class blogs_spider(scrapy.Spider):
    with open(r'Auto_Update_Data/spiders/setup.json') as f:
        json_data = json.load(f)

    name = 'update'

    def start_requests(self):
        for i in sites:
            website = i
            db_blogs = []
            for obj in collection.find({"company": website}):
                db_blogs.append(obj['link'])
            start_url = self.json_data[website]['sitemap']
            yield scrapy.Request(url=start_url, callback=self.parse, meta={'website': website,"db_blogs":db_blogs})

    def parse(self, response):
        website = response.meta.get('website')
        db_blogs = response.meta.get('db_blogs')
        all_blogs = re.findall(r"<loc>(.*?)</loc>", response.text, re.DOTALL)

        all_blogs1 = all_blogs.copy()
        for i in all_blogs:
            for j in self.json_data[website]['deny_rules']:
                if re.match(j, i):
                    all_blogs1.remove(i)
                    break

        matched_blogs = []
        for i in all_blogs1:
            if re.match(self.json_data[website]['allow_rules'], i):
                matched_blogs.append(i)

        matched_blogs = list(set(matched_blogs) - set(db_blogs))
        dt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_file = 'log.txt'
        f = open(log_file, "a")
        f.write(dt)
        f.write('\t')
        f.write("Added {count} blogs from {company}'s website to the database".format(count=len(matched_blogs),
                                                                                      company=website))
        f.write('\n')

        for link in matched_blogs:
            yield response.follow(link, callback=self.get_data, meta={'link-item': link, 'website': website})

    def clean_abstract(self, text):

        # text = ' '.join(text)
        soup = BeautifulSoup(text, "html.parser")
        for data in soup(['style', 'script']):
            # Remove tags
            data.decompose()

        return ' '.join(soup.stripped_strings)

    def reformatDate(self, date):
        date = date.strip()

        #If the date is in "Thursday, May 6, 2021" format.
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if any(item in date for item in days):
            date = date.replace(',', '')
            date = ' '.join(date.split(' ')[1:])





        if(re.match(".+|.+",date)):
            # If date is in " May 21, 2021 | By Rahul Subramaniam format"(for Engine-Yard company)
            date = date.split('|')[0]
            date = date.strip()
        date = date.strip('Last updated on ')
        if re.match(".+\dT\d.+", date):
            # If date is in "2018-11-06T23:51:41Z" format
            date = date.split('T')[0]
            return date
        if date.replace('-', '').isnumeric():
            # If date is in yy-mm-dd it returns directly
            return date
        date = date.replace(',', '')
        # replacing 1st,2nd 3rd in "January 1st" kind of date formats
        date = re.sub(r'(\d)(st|nd|rd|th)', r'\1', date)

        month, day, year = date.split()
        if day.isnumeric():
            pass
        else:
            day, month, year = date.split()

        month = month.capitalize()
        try:
            months = ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
                      'November', 'December')
            return '{}-{:02}-{:0>2}'.format(year, months.index(month) + 1, day)
        except:
            months = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')

            return '{}-{:02}-{:0>2}'.format(year, months.index(month) + 1, day)

    def get_data(self, response):
        items = AutoUpdateDataItem()
        website = response.meta.get('website')

        link = response.meta.get('link-item')
        title = response.css(self.json_data[website]['title']).extract_first()
        author = response.css(self.json_data[website]['author']).extract()
        author = [i.strip() for i in author]
        abstract = self.clean_abstract(response.xpath(self.json_data[website]['abstract']).extract_first())
        date = response.css(self.json_data[website]['date']).extract_first()

        print(date)
        date = self.reformatDate(str(date))


        items['website'] = website
        items['title'] = title
        if (len(author) == 0):
            author = 'Unknown'
        items['author'] = author
        items['link'] = link.strip()
        items['abstract'] = abstract
        items['date'] = date
        yield items
if __name__ == "__main__":
    sys.path.append(os.path.abspath('..'))
    os.environ['SCRAPY_SETTINGS_MODULE'] = 'Auto_Update_Data.Auto_Update_Data.settings'
    scrapy_settings = get_project_settings()


    process = CrawlerProcess(get_project_settings())
    process.crawl(blogs_spider)
    process.start()
