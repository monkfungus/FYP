#import bluetooth
import requests
import json

url = 'http://localhost:3000'

# mock location
location = {}
location['latitude'] = 83
location['longitude'] = -9

# mock devices
device1 = {}
device1['address'] = 'some address'
device1['name'] = 'some name'
device2 = {}
device2['address'] = 'another address'
device2['name'] = 'another name'

devices = []
devices.append(device1)
devices.append(device2)

# mock payload 
payload = {}
payload['timestamp'] = '20181228T183643Z'
payload['location'] = location
payload['devices'] = devices

#print(payload)
print(json.JSONEncoder().encode(payload))
print('Sending to server..')

try:
    r = requests.post(url, json=payload)
except requests.exceptions.ConnectionError as e:
    print('ConnectionError: ', e)
else:
    print('Status: ', r.status_code)
