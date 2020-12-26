import requests
import httplib2
from bs4 import BeautifulSoup,SoupStrainer
import json
import os
import re
import httplib2
from urllib.request import urlopen
all_jobs = []
#print(html_text)
url = "https://capgemini.github.io/"
r = requests.get(url) 
soup = BeautifulSoup(r.content,"lxml")
posts = soup.find_all('article', class_='notepad-index-post post row')
    #print(posts)
for article in posts:
    title = article.find('h3',class_='notepad-post-title').text
    #print(title)
    author = article.find('p',class_='post-author').text
    #print(author)
    abstract = article.find('section',class_='notepad-post-excerpt').text
    #print(abstract)
    day = article.find('span',class_='day').text 
    d = article.find('span',class_='month-year').text 
    date = day + " "+d
    #print(day+" "+date)
    l= article.find('a')
    link = "https://capgemini.github.io/" + l.get('href')
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    all_jobs.append(art)
    f = open('capgemini.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()
for i in range(2,21):
    url = "https://capgemini.github.io/"+"page"+str(i)+"/"
    r = requests.get(url) 
    soup = BeautifulSoup(r.content,"lxml")
    posts = soup.find_all('article', class_='notepad-index-post post row')
    #print(posts)
    for article in posts:
        title = article.find('h3',class_='notepad-post-title').text
        #print(title)
        author = article.find('p',class_='post-author').text
        #print(author)
        abstract = article.find('section',class_='notepad-post-excerpt').text
        #print(abstract)
        day = article.find('span',class_='day').text 
        d = article.find('span',class_='month-year').text 
        date = day + " "+d
        #print(day+" "+date)
        l= article.find('a')
        link = "https://capgemini.github.io/" + l.get('href')
       
        #print(links)
        ##data = ["DisneyPlus", "Netflix", "Peacock"]
        
        #print(json_string)
        art={}
        art['title']=title
        art['date']=date
        art['abstract']=abstract
        art['link']=link

        all_jobs.append(art)
        f = open('capgemini.json','w')
        f.write(json.dumps(all_jobs,indent=2))
        f.close()


  
