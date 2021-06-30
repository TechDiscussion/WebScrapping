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
    website = 'SongKick'
    name = 'blog'
    start_url = [json_data[website]['sitemap']]

    def start_requests(self):
        yield scrapy.Request(url=self.start_url[0], callback=self.parse)

    def parse(self, response):
        #all_blogs = response.xpath(self.json_data[self.website]['all_blogs']).extract()
        all_blogs = re.findall(r"<loc>(.*?)</loc>", response.text, re.DOTALL)
        dates = re.findall(r"<lastmod>(.*?)</lastmod>", response.text, re.DOTALL)
        blogs_dict = {}
        count = 0
        for i in all_blogs:
            blogs_dict[i] = dates[count]
            count += 1
        all_blogs1 = all_blogs.copy()
        for i in all_blogs:
            for j in self.json_data[self.website]['deny_rules']:
                if re.match(j,i):
                    all_blogs1.remove(i)
                    blogs_dict.pop(i)
                    break

        matched_blogs = []
        for i in all_blogs1:
            if re.match(self.json_data[self.website]['allow_rules'],i):
                #matched_blogs.append(i)
                pass
            else:
                blogs_dict.pop(i)
        for link,date in blogs_dict.items():
            yield response.follow(link, callback=self.get_data, meta={'link-item': link,"date-item":date})

    def clean_abstract(self, text):

        text = ' '.join(text)
        soup = BeautifulSoup(text, "html.parser")
        for data in soup(['style', 'script']):
            # Remove tags
            data.decompose()

        return ' '.join(soup.stripped_strings)

    def get_data(self, response):
        items = Blogscraper2Item()
        #link = response.url
        link = response.meta.get('link-item')
        date = response.meta.get('date-item') #for medium-type
        date = date.split('T')[0]
        title = ' '.join(link.split('/')[-1].split('-')[0:-1])   # for medium type
        #title = link.split('/')[-1]   # for medium type
        #title = link.split('/blog/post/')[1].strip('/')
        #title = ' '.join(link.split('-')[3:]).strip('/')  # for medium type
        #title = response.css(self.json_data[self.website]['title']).extract_first()
        author = response.css(self.json_data[self.website]['author']).extract()
        abstract = self.clean_abstract(response.xpath(self.json_data[self.website]['abstract']).extract())
        #date = response.css(self.json_data[self.website]['date']).extract_first()
        #date = str(date.strip())
        #date = datetime.datetime.strptime(date, '%d %b %Y') #for deep mind
        #date = date.date() #for deep mind
        items['website'] = self.website
        items['title'] = title
        if(len(author)==0):
            author = 'Unknown'
        items['author'] = author
        items['link'] = link.strip()
        items['abstract'] = abstract
        items['date'] = date
        yield items


