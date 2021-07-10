# https://github.com/lukasschwab/arxiv.py

# https://nbviewer.jupyter.org/github/nickmccarty/Tutorials/blob/master/arXiv%20API%20Test.ipynb

# import arxiv

# search = arxiv.Search(
#     query="all: Computer Science (cs)",
#     max_results=700,
#     sort_by=arxiv.SortCriterion.SubmittedDate,
# )

# for result in search.get():
#     print(result.title + '\n')

# """
# from pyarxiv import query, download_entries
# from pyarxiv.arxiv_categories import ArxivCategory, arxiv_category_map

# import pandas as pd
# import numpy as np
#  """
# Ask user for a topic and call it "topic"

# topic = input("Enter the topic for which you want to search papers on arXiv: ")

# Generate API response based on "topic" and call it "entries"

# entries = query(title=topic)

# Pull title, author, date, link to PDF of paper from "entries"
# and put each in its own list
# """
# titles = map(lambda x: x['title'], entries)
# authors = map(lambda x: x['author'], entries)
# updated = map(lambda x: x['updated'], entries)
# links = map(lambda x: x['link'], entries)
# abstract = map(lambda x: x['summary'], entries)
#  """
# Create empty dataframe called "papers"

# papers = pd.DataFrame()

# Insert columns into "papers" from the previously created lists
# """
# papers['Title'] = pd.Series(titles)
# papers['Author'] = pd.Series(authors)
# papers['Updated'] = pd.Series(updated)
# papers['Link'] = pd.Series(links)
# papers['Abstract'] = pd.Series(abstract)
#  """
# Slice HH:MM:SS off of each row in date column

# papers['Updated'] = papers['Updated'].str.slice(stop=10)

# papers['Abstract'] = papers['Abstract'].str.slice(stop=100)

# Reformat URL string to take user to the PDF of the paper

# papers['Link'] = papers['Link'].str.replace("abs", "pdf", case=True)

# Strip paper ID from Link URL and put it in its own column called "ID"

# papers['ID'] = pd.Series(papers['Link'].str.rsplit("/", n=1, expand=True)[1])

# Uncomment line of code below to export result as a CSV file

# papers.to_csv(topic + ' arXiv papers.csv')

# Sort dataframe in descending order by date

# """ papers = papers.sort_values(
#     by='Updated', ascending=False).reset_index(drop=True)

# # Show first 20 papers in dataframe

# print(papers.head(1)) """


# Loop through index, pull ID for each paper from dataframe,
# and use it to push the download from the API to your destination folder.

# Be sure that the folder has been created before running the loop.
# If you simply want the papers to download in the same location as your notebook,
# either remove the target_folder argument entirely, or enter '.' as the file path

# for i in range(0, 5):

#     download_entries(entries_or_ids_or_uris=[papers['ID'][i]],
#                      target_folder='./papers')

# """ import urllib
# import urllib.request
# url = 'http://export.arxiv.org/api/query?search_query=all:cs&order=-submitted_date'
# data = urllib.request.urlopen(url)
# print(data.read().decode('utf-8'))
# """

''' MAIN SCRIPT '''


"""
- Covers all SubCategories under CS
- Sort By Last Updated Date in descending order => Latest Published First
- Sliced by 3000 papers => To prevent API request limit
"""
from xml.dom import minidom
import json
import requests
urls = ['http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=0&max_results=3000', 'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=3000&max_results=3000',
        'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=6000&max_results=3000', 'http://export.arxiv.org/api/query?search_query=cat:CS.*&sortBy=lastUpdatedDate&sortOrder=descending&start=9000&max_results=3000']


def load_urls(url):

    data = []
    response = requests.get(url)
    root = minidom.parseString(response._content)
    index = 0
    for entry in root.getElementsByTagName('entry'):
        paper_entities = {}
        paper_entities['link'] = entry.getElementsByTagName(
            'id')[0].firstChild.nodeValue.strip()
        paper_entities['title'] = entry.getElementsByTagName(
            'title')[0].firstChild.nodeValue.strip()
        paper_entities['abstract'] = entry.getElementsByTagName(
            'summary')[0].firstChild.nodeValue.strip()
        paper_entities['date'] = entry.getElementsByTagName(
            'published')[0].firstChild.nodeValue.strip()
        paper_entities['author'] = entry.getElementsByTagName(
            'author')[0].getElementsByTagName('name')[0].firstChild.nodeValue.strip()
        paper_entities['authors'] = []
        for author in entry.getElementsByTagName('author'):
            paper_entities['authors'].append(author.getElementsByTagName('name')[
                0].firstChild.nodeValue.strip())
        data.append(paper_entities)
        index += 1
    with open('arXiv.json', 'a') as json_file:
        json.dump(data, json_file)


load_urls(urls[0])
