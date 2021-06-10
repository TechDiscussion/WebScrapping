# https://github.com/lukasschwab/arxiv.py

import arxiv

search = arxiv.Search(
    query="all: Computer Science (cs)",
    max_results=700,
    sort_by=arxiv.SortCriterion.SubmittedDate,
)

for result in search.get():
    print(result.title + '\n')
