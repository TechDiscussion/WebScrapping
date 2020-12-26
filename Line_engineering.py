import requests 
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.request import urlopen
all_jobs=[]
url = "https://engineering.linecorp.com/en/blog/"
html_text = requests.get('https://engineering.linecorp.com/en/blog/').text
#print(html_text)
soup = BeautifulSoup(html_text,'lxml')
posts = soup.find_all('div',class_='ast-post-format- ast-no-thumb blog-layout-1')
#print(posts)



  
for article in posts:
    title = article.find('h2',class_='entry-title').text 
    #print(title)
    author = article.find('span',class_='author-name').text 
    #print(author)
    date = article.find('span',class_='published').text 
    #print(date)
    abstract = article.find('div',class_='entry-content clear').text 
    #print(abstract)
    l = article.find('a')
    link = l.get('href')
    #print(link)
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    art['author']=author
    all_jobs.append(art)
    f = open('capgeminLine_engineering.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()

for i in range(2,22):
    u = url+"page/"+str(i)+"/"
     
    r = requests.get(u) 
    soup = BeautifulSoup(r.content,"lxml")
    posts = soup.find_all('div',class_='ast-post-format- ast-no-thumb blog-layout-1')
    for article in posts:
        title = article.find('h2',class_='entry-title').text 
        #print(title)
        author = article.find('span',class_='author-name').text 
        #print(author)
        date = article.find('span',class_='published').text 
        #print(date)
        abstract = article.find('div',class_='entry-content clear').text 
        #print(abstract)
        l = article.find('a')
        link = l.get('href')
        #print(link)
        art={}
        art['title']=title
        art['date']=date
        art['abstract']=abstract
        art['link']=link
        art['author']=author
        all_jobs.append(art)
        f = open('Line_engineering.json','w')
        f.write(json.dumps(all_jobs,indent=2))
        f.close()

