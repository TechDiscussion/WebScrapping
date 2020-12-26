import requests 
from bs4 import BeautifulSoup
from urllib.request import urlopen
import json
import os
import re

all_jobs = []
url = "https://www.ververica.com/blog"
html = urlopen(url)
bs = BeautifulSoup(html, 'html.parser')
post = bs.find_all('div',class_='post-item')
#print(post)
for article in post:
    title = article.find('h2',class_='h4').text 
    #print(title)
    abstract = article.find('div',class_='post-body clearfix').text
    #print(abstract)
    author = article.find('a',class_='author-link').text 
    #print(author)

    date = article.find('span').text 
    #print(date)
    l = article.find('a',class_='more-link')
    link =l.get('href')
    #print(link)
    images = article.find('div', {'data-src':re.compile('.png')})
    art={}
    art['title']=title
    art['date']=date
    art['author']=author
    art['abstract']=abstract
    art['link']=link
    art['image']=images['data-src']
    all_jobs.append(art)
    f = open('ververica.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()
for i in range(2,21):    
    url = "https://www.ververica.com/blog"+"/page/"+str(i)
    html = urlopen(url)
    bs = BeautifulSoup(html, 'html.parser')
    
    post = bs.find_all('div',class_='post-item')
    #print(post)
    for article in post:
        title = article.find('h2',class_='h4').text 
        #print(title)
        abstract = article.find('div',class_='post-body clearfix').text
        #print(abstract)
        author = article.find('a',class_='author-link').text 
        #print(author)
        date = article.find('span').text 
        #print(date)
        l = article.find('a',class_='more-link')
        link =l.get('href')
        #print(link)
        images = article.find('div', {'data-src':re.compile('.png')})
    
        art={}
        art['title']=title
        art['date']=date
        art['abstract']=abstract
        art['author']=author
        art['link']=link
        #art['image']=images['data-src']

        all_jobs.append(art)
        f = open('ververica.json','w')
        f.write(json.dumps(all_jobs,indent=2))
        f.close()
   

