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


from pyarxiv import query, download_entries
from pyarxiv.arxiv_categories import ArxivCategory, arxiv_category_map

import pandas as pd
import numpy as np

# Ask user for a topic and call it "topic"

topic = input("Enter the topic for which you want to search papers on arXiv: ")

# Generate API response based on "topic" and call it "entries"

entries = query(title=topic)

# Pull title, author, date, link to PDF of paper from "entries"
# and put each in its own list

titles = map(lambda x: x['title'], entries)
authors = map(lambda x: x['author'], entries)
updated = map(lambda x: x['updated'], entries)
links = map(lambda x: x['link'], entries)

# Create empty dataframe called "papers"

papers = pd.DataFrame()

# Insert columns into "papers" from the previously created lists

papers['Title'] = pd.Series(titles)
papers['Author'] = pd.Series(authors)
papers['Updated'] = pd.Series(updated)
papers['Link'] = pd.Series(links)

# Slice HH:MM:SS off of each row in date column

papers['Updated'] = papers['Updated'].str.slice(stop=10)

# Reformat URL string to take user to the PDF of the paper

papers['Link'] = papers['Link'].str.replace("abs", "pdf", case=True)

# Strip paper ID from Link URL and put it in its own column called "ID"

papers['ID'] = pd.Series(papers['Link'].str.rsplit("/", n=1, expand=True)[1])

# Uncomment line of code below to export result as a CSV file

# papers.to_csv(topic + ' arXiv papers.csv')

# Sort dataframe in descending order by date

papers = papers.sort_values(
    by='Updated', ascending=False).reset_index(drop=True)

# Show first 20 papers in dataframe

# papers.head(20)


# Loop through index, pull ID for each paper from dataframe,
# and use it to push the download from the API to your destination folder.

# Be sure that the folder has been created before running the loop.
# If you simply want the papers to download in the same location as your notebook,
# either remove the target_folder argument entirely, or enter '.' as the file path

for i in range(0, 5):

    download_entries(entries_or_ids_or_uris=[papers['ID'][i]],
                     target_folder='./papers')
