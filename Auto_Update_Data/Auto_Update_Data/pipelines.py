# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from pymongo import MongoClient
import uuid
from .appendkeywords import keywordsFromBlog, keywords

class AutoUpdateDataPipeline:
    def clean_author(self, author):
        if (author != "Unknown"):
            author = [i.strip() for i in author if i]
        return author

    def __init__(self):
        self.conn = MongoClient(
            "mongodb+srv://chedvi:c@cluster0.kf3n4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")


        db = self.conn['TechVault']
        self.collection = db['contents']
        # db = self.conn['testing_upload']
        # self.collection = db['test']
    def process_item(self, item, spider):
        item['totalComments'] = 0
        item['totalViews'] = 0
        item['totalLikes'] = 0
        item['company'] = item['website']
        del item['website']
        item['full_content'] = item['abstract']
        item['type'] = 'blog'
        if(item['title']) :
            item['title'] = item['title'].strip()
        item['author'] = self.clean_author(item['author'])
        item['abstract'] = item['abstract'][0:900]
        item['keywords'] = keywordsFromBlog(item['full_content'], keywords)

        item['uuid'] = uuid.uuid4().hex
        self.collection.insert_one(dict(item))
        return item
