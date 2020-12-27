import requests 
from bs4 import BeautifulSoup
import json
import os
import re
all_jobs = []

html_text = requests.get('https://getaround.tech/').text
#print(html_text)
soup = BeautifulSoup(html_text,'lxml')
posts = soup.find_all('div',class_='cobalt-Card cobalt-mb')
for article in posts:
    title = article.find('h2',class_='cobalt-text-title cobalt-mb-extraTight').text 
    #print(title)
    date = article.find('span',class_='cobalt-text-body cobalt-text--subdued').text 
    #print(date)
    abstract = article.find('p',class_='cobalt-text-body').text 
    #print(abstract)
    l = article.find('a',class_='cobalt-Card__Section')
    link ='https://getaround.tech'+l.get('href')
    #print(link)
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    all_jobs.append(art)
    f = open('getaround.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()



html_text = requests.get('https://getaround.tech/page2/').text
#print(html_text)
soup = BeautifulSoup(html_text,'lxml')
posts = soup.find_all('div',class_='cobalt-Card cobalt-mb')
for article in posts:
    title = article.find('h2',class_='cobalt-text-title cobalt-mb-extraTight').text 
    #print(title)
    date = article.find('span',class_='cobalt-text-body cobalt-text--subdued').text 
    #print(date)
    abstract = article.find('p',class_='cobalt-text-body').text 
    #print(abstract)
    l = article.find('a',class_='cobalt-Card__Section')
    link ='https://getaround.tech'+l.get('href')
    #print(link)
    art={}
    art['title']=title
    art['date']=date
    art['abstract']=abstract
    art['link']=link
    all_jobs.append(art)
    f = open('getaround.json','w')
    f.write(json.dumps(all_jobs,indent=2))
    f.close()


