###############################################################################

##### All UseFul Imports #####

from datetime import datetime
from pymongo.errors import DuplicateKeyError
import dask.bag as db
import re
import plotly.express as px
from pymongo import MongoClient
import glob
import yake
import numpy as np
import pandas as pd
import gc
import os
import json
import pdfplumber
import io
import requests
import itertools
from uuid import uuid4
from collections import Counter, defaultdict
from tqdm.notebook import tqdm
import matplotlib.pyplot as plt
%matplotlib inline
year_pattern = r'([1-2][0-9]{3})'
###############################################################################

logFilename = f"PapersLog-{datetime.now():%Y-%m-%d %H:%M:%d}"


### List of Categories of Papers ###
cs_category_list = ['cs.AI', 'cs.AR', 'cs.CC', 'cs.CE', 'cs.CG', 'cs.CL', 'cs.CR', 'cs.CV', 'cs.CY', 'cs.DB', 'cs.DC', 'cs.DL', 'cs.DM', 'cs.DS', 'cs.ET', 'cs.FL', 'cs.GL', 'cs.GR', 'cs.GT', 'cs.HC', 'cs.IR',
                    'cs.IT', 'cs.LG', 'cs.LO', 'cs.MA', 'cs.MM', 'cs.MS', 'cs.NA', 'cs.NE', 'cs.NI', 'cs.OH', 'cs.OS', 'cs.PL', 'cs.PF', 'cs.RO', 'cs.SC', 'cs.SD', 'cs.SE', 'cs.SI', 'cs.SY', 'stats.ML', 'eess.AS', 'eess.IV']

### Read & Clean Data ###

records = db.read_text(
    "./arxiv-metadata-oai-snapshot.json").map(lambda x: json.loads(x))
cs_papers = (records.filter(lambda x: any(
    ele in x['categories'] for ele in cs_category_list) == True))

### Parse Data ###


def get_metadata(x): return {
    'title': x['title'],
    'abstract': x['abstract'],
    'link': "https://arxiv.org/abs/" + x['id'],
    'pdf_url': "https://arxiv.org/pdf/" + x['id'],
    'date': x['update_date'],
    'author': x['authors_parsed']
}


### Save Data ###
data = cs_papers.map(get_metadata).compute()

### Total Number of Papers ###
with open(logFilename, 'a') as f:
    print("Total Number of Papers Related to CS in arXiv official Dataset is : ", len(
        data), file=f)


### Connect with database ###

client = MongoClient(
    "mongodb+srv://prateek:p@cluster0.kf3n4.mongodb.net/TechVault?retryWrites=true&w=majority")

DB_NAME = 'TechVault'
COLLECTION_NAME = 'contents'
db = client[DB_NAME]
collection = db[COLLECTION_NAME]


### Clean Author's list ###

def clean_author(author):
    cleaned_author = list(itertools.chain(*author))
    cleaned_author = ' '.join(cleaned_author).split()
    return cleaned_author


##### Keywords Generation #####

# Dictionary of keywords
# Key: Searching words
# Value: Displayed words

keywords = {
    "Machine Learning": "Machine Learning",
    "Supervised Learning": "Supervised Learning",
    "Unsupervised Learning": "Unsupervised Learning",
    "Multilabel Classification": "Multilabel Classification",
    "Clustering": "Clustering",
    "K-Means": "K-Means",
    "DBSCAN": "DBSCAN",
    "Hierarchical Clustering": "Hierarchical Clustering",
    "Deep Learning": "Deep Learning",
    "Data Mining": "Data Mining",
    "Linear regression": "Linear regression",
    "Logistic regression": "Logistic regression",
    "SVM": "SVM",
    "Natural Language Processing": "Natural Language Processing",
    "Computer Vision": "Computer Vision",
    "KNN": "KNN",
    "Random forest": "Random forest",
    "Decision Tree": "Decision Tree",
    "Regularization": "Regularization",
    "Ensemble Learning": "Ensemble Learning",
    "Gradient Boosting": "Gradient Boosting",
    "Feature Selection": "Feature Selection",
    "Reinforcement Learning": "Reinforcement Learning",
    "Virtual Reality": "Virtual Reality",
    "Augmented reality": "Augmented reality",
    "Autonomous driving": "Autonomous driving",
    "Optics": "Optics",
    "Biology": "Biology",
    "C++": "C++",
    "Java": "Java",
            "Python": "Python",
            "React JS": "React JS",
            "Computer Network": "Computer Networks",  # remove s
            "Frontend": "Frontend",
            "Backend": "Backend",
            "High Scalability": "High Scalability",
            "Cloud computing": "Cloud computing",
            "Parallel Computing": "Parallel Computing",
            "CUDA": "CUDA",
            "Distributed System": "Distributed Systems",  # remove s
            "Apache ZooKeeper": "Apache ZooKeeper",
            "Streaming analytic": "Streaming analytics",
            "Model Selection": "Model Selection",
            "Model Evaluation": "Model Evaluation",
            "Apache Kafka": "Apache Kafka",
            "HDFS": "HDFS",
            "Amazon S3": "Amazon S3",
            "Pub-Sub": "Pub-Sub",
            "Leader Election": "Leader Election",
            "Clock Synchronization": "Clock Synchronization",
            "Graph": "Graphs",  # remove s
            "Information Retrieval": "Information Retrieval",
            "SQL": "SQL",
            "Graph Database": "Graph Database",
            "Database Management": "Database Management",
            "Storage": "Storage",
            "Memor": "Memory",
            "Garbage Collection": "Garbage Collection",
            "Map-Reduce": "Map-Reduce",
            "Network Protocol": "Network Protocols",  # remove s
            "Cyber Security": "Cyber Security",
            "Assembly Language": "Assembly Language",
            "Computational Complexity Theor": "Computational Complexity Theory",
            "Computer Architecture": "Computer Architecture",
            "Human-Computer Interface": "Human-Computer Interface",
            "Data Structure": "Data Structures",  # remove s
            "Discrete Mathematic": "Discrete Mathematics",
            "Hacking": "Hacking",
            "Quantum Computing": "Quantum Computing",
            "Robotic": "Robotics",  # remove s
            "Engineering Practice": "Engineering Practices",  # remove s
            "Software Tool": "Software Tools",  # remove s
            "Mathematical Logic": "Mathematical Logic",
            "Graph Theor": "Graph Theory",
            "Computational Geometr": "Computational Geometry",
            "Compiler": "Compilers",  # remove s
            "Distributed Computing": "Distributed Computing",
            "Software Engineering": "Software Engineering",
            "Bioinformatic": "Bioinformatics",  # remove s
            "Computational Chemistry": "Computational Chemistry",
            "Computational Neuroscience": "Computational Neuroscience",
            "Computational physics": "Computational physics",
            "Numerical algorithm": "Numerical algorithms",  # remove s
            "JavaScript": "JavaScript",
            "HTML": "HTML",
            "Web Development": "Web Development",
            "App Development": "App Development",
            "CSS": "CSS",
            "PHP": "PHP",
            "BlockChain": "BlockChain",
            "Hardware": "Hardware",
            "VLSI": "VLSI",
            "Cluster Computing": "Cluster Computing",
            "Kubernetes": "Kubernetes",
            "Go": "Go-Lang",
            "File System": "File Systems",  # remove s
            "Statistic": "Statistics",  # remove s
            "Optimization": "Optimization",
            "Knowledge Graph": "Knowledge Graph",
            "RNN": "RNN",
            "CNN": "CNN",
            "Physical Design": "Physical Design",
            "Memory management": "Memory management",
            "PCA": "PCA",
            "LDA": "LDA",
            "Feature Engineering": "Feature Engineering",
            "Data manipulation": "Data manipulation",
            "ACID": "ACID",
            "BASE": "BASE",
            "Consistency": "Consistency",
            "Disaster recovery": "Disaster recovery",
            "Replication": "Replication",
            "Fault tolerance": "Fault tolerance",
            "Deployment": "Deployment",
            "Processor": "Processors",  # remove s
            "Multi-Threading": "Multi-Threading",
            "Queue": "Queue",
            "Stack": "Stack",
            "Dynamic Programming": "Dynamic Programming",
            "Graph Traversal": "Graph Traversal",
            "Device": "Devices",  # remove s
            "Data analysis": "Data analysis",
            "Probability": "Probability",
            "Mathematic": "Mathematics",  # remove s
            "Genomic": "Genomics",  # remove s
            "Data Infrastructure": "Data Infrastructure",
            "Software Principles and Practices": "Software Principles and Practices",
            "Image Processing": "Image Processing",
            "Audio Processing": "Audio Processing",
            "Signal Processing": "Signal Processing",
            "Pattern Recognition": "Pattern Recognition",
            "Computation and Language": "Computation and Language",
            "Artificial Intelligence": "Artificial Intelligence",
            "Computation and Language": "Computation and Language",
            "Computational Complexit": "Computational Complexity",
            "Computational Engineering": "Computational Engineering",
            "Finance": "Finance",  # remove "and Science" from "Finance, and Science"
            "Computational Geometry": "Computational Geometry",
            # remove "Computer Science" from "Computer Science and Game Theory"
            "Game Theory": "Game Theory",
            # break down from "Computer Vision and Pattern Recognition"
            "Computer Vision": "Computer Vision",
            # break down from "Computer Vision and Pattern Recognition"
            "Pattern Recognition": "Pattern Recognition",
            "Computers and Society": "Computers and Society",
            "Cryptography and Security": "Cryptography and Security",
            # break down from "Data Structures and Algorithms"
            "Data Structure": "Data Structures",
            "Algorithm": "Algorithms",  # break down from "Data Structures and Algorithms"
            "Database": "Databases",  # break down from "Databases; Digital Libraries"
            # break down from "Databases; Digital Libraries"
            "Digital Librar": "Digital Libraries",
            # break down from "Distributed, Parallel, and Cluster Computing"
            "Distributed Computing": "Distributed Computing",
            # break down from "Distributed, Parallel, and Cluster Computing"
            "Parallel Computing": "Parallel Computing",
            # break down from "Distributed, Parallel, and Cluster Computing"
            "Cluster Computing": "Cluster Computing",
            "Emerging Technolog": "Emerging Technologies",
            # break down from "Formal Languages and Automata Theory"
            "Formal Language": "Formal Languages",
            # break down from "Formal Languages and Automata Theory"
            "Automata Theory": "Automata Theory",
            "General Literature": "General Literature",
            "Graphic": "Graphics",  # remove s
            "Human-Computer Interaction": "Human-Computer Interaction",
            "Information Theory": "Information Theory",
            "Logic in Computer Science": "Logic in Computer Science",
            "Mathematical Software": "Mathematical Software",
            "Multiagent System": "Multi-agent Systems",  # remove s from "Systems"
            "Multi-agent System": "Multi-agent Systems",  # remove s from "Systems" and add -
            "Multimedia": "Multimedia",
            "Networking and Internet Architecture": "Networking and Internet Architecture",
            "Neural and Evolutionary Computing": "Neural and Evolutionary Computing",
            "Numerical Analysis": "Numerical Analysis",
            "Operating System": "Operating Systems",  # remove s from "Systems"
            "Performance": "Performance",
            "Programming Language": "Programming Languages",  # remove s
            "Social and Information Networks": "Social and Information Networks",
            "Software Engineering": "Software Engineering",
            "Sound": "Sound",
            "Symbolic Computation": "Symbolic Computation",
            "Systems and Control": "Systems and Control"
}


def countKeywords(text, keywords):
    ''' Count occurence of keywords in the text, return a dict of words and its occurence'''
    d = {}
    text = ' ' + text + ' '
    # Abbreviations list
    abbreviations = ["SVM", "KNN", "CUDA", "HDFS", "SQL", "HTML", "CSS", "PHP",
                     "VLSI", "RNN", "CNN", "PCA", "LDA", "ACID", "BASE"]

    for search_word, display_word in keywords.items():
        # 'Go' can be a sub-string of many words, to be precise, we'll search for the word " Go "
        if search_word == "Go":
            search_word = ' ' + search_word + ' '

        # Lower the word if it's not an abbreviation
        elif search_word not in abbreviations:
            search_word = search_word.lower()

        # Count occurence of searching word (case sensitive)
        oc = text.count(search_word)

        # Append to the dictionary if the word occurs 1 or more time
        if oc > 0:
            d[display_word] = oc

    return d


def removeExtraWhitespaceEsc(text):
    # pattern = r'^\s+$|\s+$'
    pat = r'^\s*|\s\s*'
    return re.sub(pat, ' ', text).strip()


# Function to remove commas and periods
def removeCommasPeriods(text):
    pat = r'[.,]+'
    return re.sub(pat, '', text)


# Function to remove words that include special character
def removeSpecialCharacterWords(text):
    # define the pattern to keep only letters, numbers, dash and white spaces
    pat = r'[a-zA-Z0-9]*[^a-zA-Z0-9_\s]+[a-zA-Z0-9]*'
    return re.sub(pat, '', text)


def clean_data(text):
    '''
    Clean text
    '''
    # clean_text = removeHTMLTags(text)
    clean_text = removeExtraWhitespaceEsc(text)
    clean_text = removeCommasPeriods(clean_text)
    clean_text = removeSpecialCharacterWords(clean_text)

    return clean_text


def keywordsFromYAKE(text, numOfKeywords):
    '''
    Extracts keywords from text by using YAKE
    '''

    kw_extractor = yake.KeywordExtractor()
    language = "en"
    max_ngram_size = 2  # max number of words in generated keywords
    deduplication_threshold = 0.1
    numOfKeywords = numOfKeywords
    custom_kw_extractor = yake.KeywordExtractor(
        lan=language, n=max_ngram_size, dedupLim=deduplication_threshold, top=numOfKeywords, features=None)
    kws = custom_kw_extractor.extract_keywords(text)
    result = [x for x, y in kws]

    return result


def keywordsFromAbstract(paper, keywords):
    '''
    Extracts keywords from a paper.
      Dict paper: a dictionary of paper content
      Dict keywords: a dictionary of searched word and displayed word
    Return
      A list of five words
    '''

    text = paper

    N_KEYWORDS = 5

    # Keywords from performing keywords matching
    occ = countKeywords(text, keywords)

    # get a list of top 5 words
    result = list(dict(sorted(occ.items(), key=lambda x: x[1], reverse=True)).keys())[
        :N_KEYWORDS]
    # print('kwm: {}'.format(result))

    # If the result has less than 5 keywords then use YAKE
    if len(result) < N_KEYWORDS:
        n_left = N_KEYWORDS - len(result)
        yake_kws = keywordsFromYAKE(clean_data(text), n_left)
        # print('yake_kws: {}'.format(yake_kws))
        result += [x for x in yake_kws if x not in result]

    return result


# def readPDF(url):
#     '''
#     Read PDF file from a URL
#     Return a text string
#     '''
#     r = requests.get(url, timeout = 5)
#     f = io.BytesIO(r.content)
#     text = "" # returned text
#     try:
#         # Open pdf file
#         with pdfplumber.open(f) as pdf:
#             pages = pdf.pages
#             # Iterate through pdf document pages
#             for page in pages:
#                 # Concat page content to text if there are any
#                 if page.extract_text():
#                     text += '\n' + page.extract_text()

#         return text
#     except:
#         # print("PDF file is not found!", url)
#         # return ""
#         keywordsFromAbstract(i['abstract'], keywords)
#         # return


# def keywordsFromPaper(url, keywords):
#     '''
#     Extracts keywords from a pdf document
#       String url: a url of a pdf file
#       Dict keywords: a dictionary of searched word and displayed word
#     Return
#       A list of five words that have highest occurences
#     '''
#     try:
#       text = readPDF(url).lower()

#       # if not text:
#       #     global n_pdf_unavil
#       #     n_pdf_unavil += 1

#       occ = countKeywords(text, keywords)

#       # get a list of top 5 words
#       result = list(dict(sorted(occ.items(), key=lambda x: x[1], reverse=True)).keys())[:5]
#       return result
#     except:
#         print("PDF file is not found!", url)
#         # return ""


### Paper Uploading to MongoDB with Some Additional Parameters ###

PaperUploadedCounter = 0
PaperAlreadyExistsCounter = 0

for i in data:
    i['totalComments'] = 0
    i['totalViews'] = 0
    i['totalLikes'] = 0
    i['type'] = 'paper'
    i['company'] = 'arxiv'
    # pdfUrl = i['pdf_url']
    # i['keywords'] = keywordsFromPaper(pdfUrl, keywords) # costly method, improvement needed
    abstractData = i['abstract']
    i['keywords'] = keywordsFromAbstract(abstractData, keywords)
    i['link'] = i['link']
    i['pdf_url'] = i['pdf_url']
    i['title'] = i['title']
    i['abstract'] = i['abstract'][0:900]
    i['date'] = i['date']
    i['author'] = clean_author(i['author'])
    id = uuid4()
    i['uuid'] = id.hex
    try:
        collection.insert_one(i)
        PaperUploadedCounter += 1
        with open('listOfPaperUploaded-{datetime.now():%Y-%m-%d %H:%M:%d}', 'a') as f:
            print(i['pdf_url'], "\n", file=f)
    except DuplicateKeyError:
        PaperAlreadyExistsCounter += 1
        continue

with open(logFilename, 'a') as f:
    print('\n\nTotal Number of New Papers Uploaded : ',
          PaperUploadedCounter, file=f)
    print('\n\nTotal Number of Paper that was Already Uploaded before : ',
          PaperAlreadyExistsCounter, file=f)
