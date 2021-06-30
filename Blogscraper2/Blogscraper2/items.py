# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class Blogscraper2Item(scrapy.Item):
    # define the fields for your item here like:
    website = scrapy.Field()
    title = scrapy.Field()
    author = scrapy.Field()
    link = scrapy.Field()
    abstract = scrapy.Field()
    date = scrapy.Field()

    pass
