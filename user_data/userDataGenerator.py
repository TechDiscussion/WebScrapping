import json
import random
import uuid
N = 20

userIds = random.sample(range(0,10000000), N)
likesCounts = [random.randint(1, 5) for _ in range(N)]
viewsCounts = [random.randint(1, 5) for _ in range(N)]
noBookMarks = [random.randint(1, 5) for _ in range(N)]

userData = []

def generate_random_UUIDs(n):
    randomUUIDS = []
    for i in range(n):
        randomUUIDS.append(str(uuid.uuid4()))
    return randomUUIDS

for i in range(N):
    userData.append(
        {
        "user Id" : userIds[i],
		"likesCount" : likesCounts[i],
		"viewsCounts" : viewsCounts[i],
		"book marks" : generate_random_UUIDs(noBookMarks[i]),
		"likes" : generate_random_UUIDs(likesCounts[i]),
		"views" : generate_random_UUIDs(viewsCounts[i])
        }
    )

with open('user_data.json', 'w') as outfile:
    json.dump(userData, outfile)
