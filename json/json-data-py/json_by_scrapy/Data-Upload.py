from pymongo import MongoClient
import json

import glob
import uuid

path = r"C:\Users\Chedvihas\Desktop\All_blogs"
files = glob.glob(path+"\*.json")
print(files)
json_data = []
for file in files:
    with open(file, encoding="utf8") as f:
        print(file)
        json_data.append(json.load(f))
json_data = sum(json_data,[])
print(len(json_data))

# Connect with database
client = MongoClient("mongodb+srv://chedvi:c@cluster0.kf3n4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
DB_NAME = 'TechVault'
COLLECTION_NAME = 'contents'
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

for i in json_data:
    i['totalComments'] = 0
    i['totalViews'] = 0
    i['totalLikes'] = 0
    i['company'] = i['website']
    del i['website']
    i['full_content'] = i['abstract']
    i['type'] = 'blog'
    i['abstract'] = i['abstract'][0:900]
    i['keywords'] = []
    id = uuid.uuid4()
    i['uuid'] = id.hex
    print("Uploading ", i['company'])
    collection.insert_one(i)







