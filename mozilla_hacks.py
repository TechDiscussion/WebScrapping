import requests 
from bs4 import BeautifulSoup
from urllib.request import urlopen
import json
import os
import re
all_jobs = []
url = "https://hacks.mozilla.org/articles/"
html = urlopen(url)
#soup = BeautifulSoup(r.content,"lxml")
# #html = urlopen('https://developers.redhat.com/blog/')
bs = BeautifulSoup(html, 'html.parser')

post = bs.find_all('li',class_='list-item row listing')
#print(post)
for articles in post:
    title = articles.find('h3',class_='post__title').text 
    #print(title)
    abstract = articles.find('p',class_='post__tease').text 
    #print(abstract)
    date = articles.find('div',class_='post__meta').text 
    #print(date)
    l = articles.find('a')
    link =l.get('href')
    #print(link)
    #images = bs.find('img', {'src':re.compile('.jpg')}).text
    #print(images)
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    all_jobs.append(art)
    f = open('mozilla_hacks.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()

url = "https://hacks.mozilla.org/articles/page/2/"
html = urlopen(url)
#soup = BeautifulSoup(r.content,"lxml")
# #html = urlopen('https://developers.redhat.com/blog/')
bs = BeautifulSoup(html, 'html.parser')

post = bs.find_all('li',class_='list-item row listing')
#print(post)
for articles in post:
    title = articles.find('h3',class_='post__title').text 
    #print(title)
    abstract = articles.find('p',class_='post__tease').text 
    #print(abstract)
    date = articles.find('div',class_='post__meta').text 
    #print(date)
    l = articles.find('a')
    link =l.get('href')
    #print(link)
    #images = bs.find('img', {'src':re.compile('.jpg')}).text
    #print(images)
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    all_jobs.append(art)
    f = open('mozilla_hacks.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()


