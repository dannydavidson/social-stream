import zmq, pymongo

c = pymongo.MongoReplicaSetClient('localhost:3001', replicaSet='meteor')

ctx = zmq.Context()
channel = ctx.socket(zmq.REP)
channel.bind('tcp://127.0.0.1:3003')

while True:
	try:
		msg = channel.recv_json()
		msg['media'] = c.meteor.media.find_one({'name': msg['media']})['_id']
		objId = c.meteor.messages.insert(msg)
		channel.send_json({
			'status': 'SUCCESS',
			'id': str(objId)
		})
	except Exception as e:
		print(e)
		channel.send_json({
			'status': 'FAIL'
		})

