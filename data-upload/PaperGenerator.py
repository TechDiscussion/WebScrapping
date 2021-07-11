from uuid import uuid4
from pymongo import MongoClient
import requests
import json
import re
from xml.dom import minidom
import glob
# urls = ['http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=0&max_results=3000', 'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=3000&max_results=3000',
#         'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=6000&max_results=3000', 'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=9000&max_results=3000', 'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=12000&max_results=3000']

urls = ['https://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=0&max_results=5']


def load_urls(url):

    data = []
    response = requests.get(url)
    root = minidom.parseString(response._content)
    index = 0
    for entry in root.getElementsByTagName('entry'):
        paper_entities = {}
        paper_entities['link'] = entry.getElementsByTagName(
            'id')[0].firstChild.nodeValue.strip()
        paper_entities['title'] = entry.getElementsByTagName(
            'title')[0].firstChild.nodeValue.strip()
        paper_entities['abstract'] = entry.getElementsByTagName(
            'summary')[0].firstChild.nodeValue.strip()
        paper_entities['date'] = entry.getElementsByTagName(
            'published')[0].firstChild.nodeValue.strip()
        paper_entities['author'] = []
        for author in entry.getElementsByTagName('author'):
            paper_entities['author'].append(author.getElementsByTagName('name')[
                0].firstChild.nodeValue.strip())
        data.append(paper_entities)
        index += 1
    # with open('arXiv.json', 'a') as json_file:
    #     json.dump(data, json_file)
    return data


data = load_urls(urls[0])


# path = "arXiv.json"
# with open(path, encoding="utf8") as f:
#     #f.close()
#     #print(file)
#     json_data = json.load(f)


# Connect with database
client = MongoClient(
    "mongodb+srv://prateek:p@cluster0.kf3n4.mongodb.net/TechVault?retryWrites=true&w=majority")

DB_NAME = 'testing_upload'
COLLECTION_NAME = 'testing_upload'
db = client[DB_NAME]
collection = db[COLLECTION_NAME]


def clean_date(date):

    date = date.strip('Last updated on ')
    if re.match(".+\dT\d.+", date):
        # If date is in 2018-11-06T23:51:41Z format
        date = date.split('T')[0]
        return date
    if date.replace('-', '').isnumeric():
        # If date is in yy-mm-dd it returns directly
        return date
    date = date.replace(',', '')
    # replacing 1st,2nd 3rd kind of strings
    date = re.sub(r'(\d)(st|nd|rd|th)', r'\1', date)

    month, day, year = date.split()
    if day.isnumeric():
        pass
    else:
        day, month, year = date.split()

    month = month.capitalize()
    try:
        months = ('January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December')
        return '{}-{:02}-{:0>2}'.format(year, months.index(month) + 1, day)
    except:
        months = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')

        return '{}-{:02}-{:0>2}'.format(year, months.index(month) + 1, day)


# TODO: Generate Keywords


for i in data:
    i['totalComments'] = 0
    i['totalViews'] = 0
    i['totalLikes'] = 0
    i['type'] = 'paper'
    date = i['date']
    print(date)
    i['date'] = clean_date(date)
    i['author'] = (i['author'])
    i['abstract'] = i['abstract'][0:900]
    # i['keywords'] = keywordsFromBlog(i['full_content'], keywords)
    id = uuid4()
    i['uuid'] = id.hex
    print("Uploading ")
    collection.insert_one(i)
