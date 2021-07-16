# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class AutoUpdateDataItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    website = scrapy.Field()
    title = scrapy.Field()
    author = scrapy.Field()
    link = scrapy.Field()
    abstract = scrapy.Field()
    date = scrapy.Field()
    totalComments = scrapy.Field()
    totalViews = scrapy.Field()
    totalLikes = scrapy.Field()
    company = scrapy.Field()
    full_content = scrapy.Field()
    type = scrapy.Field()
    keywords = scrapy.Field()
    uuid = scrapy.Field()
    pass
