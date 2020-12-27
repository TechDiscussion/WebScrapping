import requests 
from bs4 import BeautifulSoup
import json
import os
import re

all_jobs=[]
for i in range(2,13):
    url = "https://product.canva.com/"+"page"+str(i)+"/"
    r = requests.get(url) 
    soup = BeautifulSoup(r.content,"lxml")
    
    post = soup.find_all('article',class_='hentry')
    #print(post)
    for article in post:
        abstract = article.find('div',class_='entry-content').text 
        #print(abstact)
        title = article.find('h1',class_='entry-title').text 
        #print(title)
        l = article.find('a')
        link = l.get('href')
        #print(link)
        date = article.find('time').text 
        #print(date)
        author = article.find('span',class_='fn').text 
        #print(author)
        art={}
        art['title']=title
        art['date']=date
        art['abstract']=abstract
        art['link']=link
        art['author']=author
        all_jobs.append(art)
        f = open('canva.json','w')
        f.write(json.dumps(all_jobs,indent=2))
        f.close()
