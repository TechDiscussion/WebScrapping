import follow as follow
import scrapy
import json
from ..items import Blogscraper2Item
import re
from bs4 import BeautifulSoup
from scrapy.spiders import CrawlSpider, Rule
from scrapy.spiders import SitemapSpider
from scrapy.linkextractors import LinkExtractor
import datetime


class blogs_spider(scrapy.Spider):

    with open(r'C:\Users\Chedvihas\PycharmProjects\Scraping\BlogScraper2\BlogScraper2\spiders\setup.json') as f:
        json_data = json.load(f)
    website = 'Speedledger'
    name = 'blog1'
    start_url = [json_data[website]['sitemap']]


    def start_requests(self):
        yield scrapy.Request(url=self.start_url[0], callback=self.parse)

    def parse(self, response):

        all_blogs = re.findall(r"<loc>(.*?)</loc>", response.text, re.DOTALL)

        all_blogs1 = all_blogs.copy()
        for i in all_blogs:
            for j in self.json_data[self.website]['deny_rules']:
                if re.match(j,i):
                    all_blogs1.remove(i)
                    break

        matched_blogs = []
        for i in all_blogs1:
            if re.match(self.json_data[self.website]['allow_rules'],i):
                matched_blogs.append(i)
        print(len(matched_blogs),"Count")
        for link in matched_blogs:

            yield response.follow(link, callback=self.get_data, meta={'link-item': link})


    def clean_abstract(self, text):

        #text = ' '.join(text)
        soup = BeautifulSoup(text, "html.parser")
        for data in soup(['style', 'script']):
            # Remove tags
            data.decompose()

        return ' '.join(soup.stripped_strings)




    def reformatDate(self, date) :

        date = date.replace(',','')
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
        items = Blogscraper2Item()
        link = response.meta.get('link-item')
        title = response.css(self.json_data[self.website]['title']).extract_first()
        author = response.css(self.json_data[self.website]['author']).extract()
        author = [i.strip() for i in author]
        abstract = self.clean_abstract(response.xpath(self.json_data[self.website]['abstract']).extract_first())
        date = response.css(self.json_data[self.website]['date']).extract_first()
        print(author)
        #author = [author.split('•')[0].strip()]
        print(date)
        #date = date.split('T')[0]
        try:
            if self.json_data[self.website]['dateFormatted']=='True':
                pass
        except KeyError:
            date = self.reformatDate(date)
        print(date, 'hi')
        items['website'] = self.website
        items['title'] = title
        if(len(author)==0):
            author = 'Unknown'
        items['author'] = author
        items['link'] = link.strip()
        items['abstract'] = abstract
        items['date'] = date
        yield items