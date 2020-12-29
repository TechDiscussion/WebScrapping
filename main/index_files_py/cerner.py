import requests 
from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.request import urlopen


all_jobs = []
url = "https://engineering.cerner.com/"
u = "https://engineering.cerner.com"

html = urlopen(url)
#soup = BeautifulSoup(r.content,"lxml")
# #html = urlopen('https://developers.redhat.com/blog/')
soup = BeautifulSoup(html, 'html.parser')
posts = soup.find_all('div',class_='col mb-3')
#print(posts)
for article in posts:
    title = article.find('h4',class_='card-title').text 
    #print(title)
    date = article.find('p',class_='card-text text-muted text-uppercase').text 
    #print(date)
    abstract = article.find('div',class_='card-text').text 
    #print(abstract)
    l = article.find('a')
    link = u + l.get('href')
    images = article.find('img')
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    
    #art['author']=author
    all_jobs.append(art)
    f = open('cerner.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()

    #print(link)
    
    #print(u+images['data-src'])

for i in range(2,11):
    ur = url+"page/"+str(i)+"/"
    html = urlopen(ur)
    soup = BeautifulSoup(html, 'html.parser')
    posts = soup.find_all('div',class_='col mb-3')
    for article in posts:
        title = article.find('h4',class_='card-title').text 
        #print(title)
        date = article.find('p',class_='card-text text-muted text-uppercase').text 
        #print(date)
        abstract = article.find('div',class_='card-text').text 
        #print(abstract)
        l = article.find('a')
        link = u + l.get('href')
        art={}
        art['title']=title
        art['date']=date
        art['abstract']=abstract
        art['link']=link
        #art['image']=images['data-src']
        #art['author']=author
        all_jobs.append(art)
        f = open('cerner.json','w')
        f.write(json.dumps(all_jobs,indent=2))
        f.close()
        #images = article.find('img')
        #print(u+images['data-src'])



    
    
    






 
