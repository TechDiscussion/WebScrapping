import requests 
from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import os
import re
all_jobs = []
url = "https://developers.redhat.com/blog/"
html = urlopen(url)
#soup = BeautifulSoup(r.content,"lxml")
# #html = urlopen('https://developers.redhat.com/blog/')
bs = BeautifulSoup(html, 'html.parser')
post = bs.find_all('div',class_='entry-content archive-posts')
for article in post:
    title = article.find('h2').text 
    #print(title)
    abstract = article.find('p').text 
    #print(abstract)
    author = article.find('span',class_='author-line').text 
    #print(author)
    date = article.find('time',class_='entry-date published').text
    #print(date)
    l = article.find('a',class_='more-link')
    link =l.get('href')
    #print(link)
    images = article.find('img', {'src':re.compile('.png')})
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    art['image']=images['src']
    art['author']=author
    all_jobs.append(art)
    f = open('red_hat.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()
    #print(images['src'])
#print(url +'page'+ str(1)+ '/')
for i in range(2,30):    
    u = "/"
    #print('mansiha')
    u = url+ "page/"+str(i)+u
    #print(u)
    h = urlopen(u)
    #soup = BeautifulSoup(r.content,"lxml")
    #html = urlopen('https://developers.redhat.com/blog/')
    b = BeautifulSoup(h, 'html.parser')
    p = b.find_all('div',class_='entry-content archive-posts')
    for article in p:
        title = article.find('h2').text 
        #print(title)
        abstract = article.find('p').text 
        #print(abstract)
        date = article.find('time',class_='entry-date published').text 
        #print(date)
        l = article.find('a',class_='more-link')
        link =l.get('href')
        #print(link)
        images = article.find('img', {'src':re.compile('.png')})
        #print(images['src'])
        art={}
        art['title']=title
        art['date']=date
        art['abstract']=abstract
        art['link']=link
        art['img']=images['src']
        all_jobs.append(art)
        f = open('red_hat.json','w')
        f.write(json.dumps(all_jobs,indent=2))
        f.close()
    