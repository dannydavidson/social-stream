import sys, zmq, os, datetime
import zmq.ssh as ssh

msg = {}
msg['name'] = sys.argv[1]
msg['text'] = sys.argv[2]
msg['posted'] = datetime.datetime.now().strftime('%m/%d/%Y @ %H:%M')

# define sockets
ctx = zmq.Context()
channel = ctx.socket(zmq.REQ)

# tunnel connections using ssh
ssh.tunnel_connection(channel,
                      "tcp://127.0.0.1:3003",
                      "root@d")

channel.send_json(msg)

while True:
	print(channel.recv())
	break



