import sys, os, pymongo, datetime

message = {}
message['name'] = sys.argv[1]
message['text'] = sys.argv[2]
message['posted'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
c = pymongo.MongoReplicaSetClient('localhost:3001', replicaSet='meteor')
c.meteor.messages.insert(message)

