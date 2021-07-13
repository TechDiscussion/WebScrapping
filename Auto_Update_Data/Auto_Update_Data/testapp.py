from scrapy.crawler import Crawler
from scrapy.settings import Settings
from twisted.internet import reactor
from Auto_Update_Data.sp
from XXX.spiders.XXX import plaSpider (self-written crawler file path)
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
import os
spider = plaSpider()
settings = get_project_settings()
os.environ['SCRAPY_SETTINGS_MODULE'] = 'wcc_pla.settings'
settings_module_path = os.environ['SCRAPY_SETTINGS_MODULE']
settings.setmodule(settings_module_path, priority='project')
crawler = CrawlerProcess(settings)
crawler.signals.connect(reactor.stop, signal=signals.spider_closed)
crawler.configure()
crawler.crawl(plaSpider)
crawler.start()
reactor.run()