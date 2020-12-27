import requests 
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.request import urlopen
all_jobs=[]


html_text = requests.get('https://instagram-engineering.com/').text
#print(html_text)
soup = BeautifulSoup(html_text,'lxml')
posts = soup.find_all('div',class_='postArticle postArticle--short is-withAccentColors')
#print(posts)
for article in posts:
    title = article.find('h3').text 
    #print(title)
    date = article.find('a',class_='link link--darken').text 
    #print(date)
    l = article.find('a')
    link = l.get('href')
    #print(link)
    author = article.find('div',class_='postMetaInline postMetaInline-authorLockup ui-captionStrong u-flex1 u-noWrapWithEllipsis').text 
    #print(author)
    image = article.find_all('img')
    c=0
    ans =''
    for i in image:
        c=c+1
        if(c==2):
            ans = i['src']

    #print(ans)
    art={}
    art['title']=title
    art['date']=date
    #art['abstract']=abstract
    art['link']=link
    art['author']=author
    art['image']=ans
    all_jobs.append(art)
    f = open('instagram.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()