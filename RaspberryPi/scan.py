import bluetooth
import requests
import json
from datetime import datetime
import pytz

url = 'https://5o6pmquqyi.execute-api.us-east-2.amazonaws.com/latest/readings'

# find nearby devices and save
print('Scanning...')
nearby_devices = bluetooth.discover_devices(
        duration=8, lookup_names=True, flush_cache=True)

print('Found %d devices' % len(nearby_devices))

devices = []
for addr, name in nearby_devices:
    newDevice = {}
    newDevice['address'] = addr
    newDevice['name'] = name
    devices.append(newDevice)
    
# mock location
location = {}
location['latitude'] = 83
location['longitude'] = -9

# mock timestamp
timestamp = datetime.now(pytz.utc).isoformat()

# build payload
payload = {}
payload['timestamp'] = timestamp
payload['location'] = location
payload['devices'] = devices

print(payload)

print('Sending to server..')
try:
    r = requests.post(url, json=payload)
except requests.exceptions.ConnectionError as e:
    print('ConnectionError: ', e)
else:
    print('Status: %s', r.status_code)

