# https://github.com/lukasschwab/arxiv.py

import arxiv

search = arxiv.Search(
    query="Machine Learning",
    max_results=10,
    sort_by=arxiv.SortCriterion.SubmittedDate
)

for result in search.get():
    print(result.title + '\n')
