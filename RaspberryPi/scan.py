import bluetooth
import requests
import json

print('Scanning...')

nearby_devices = bluetooth.discover_devices(
        duration=8, lookup_names=True, flush_cache=True)

print('Found %d devices' % len(nearby_devices))

payload = '{'
for addr, name in nearby_devices:
    payload += '\"' + addr + '\":\"' + name + '\",'
    try:
        print('\t%s - %s' % (addr, name))
    except UnicodeEncodeError:
        print('\t%s - %s' % (addr, name.encode('utf-8', 'replace')))
payload = payload.strip(',')
payload += '}'
print(payload)
print(json.loads(payload))
print('Sending to server..')
url = 'http://ec2-3-16-131-147.us-east-2.compute.amazonaws.com:3000/'
try:
    r = requests.post(url, json=json.loads(payload))
except requests.exceptions.ConnectionError as e:
    print('ConnectionError: ', e)
else:
    print('Status: %s', r.status_code)

