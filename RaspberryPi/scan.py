import bluetooth
import requests
import json
from datetime import datetime, timezone
import time
import board
import busio
import adafruit_gps
import serial
import os, sys

##
# Runs continuously, scanning for devices at the current GPS location and
# uploading to the url below.
##

if('FYP_ENDPOINT' in os.environ): 
    # url = 'https://5o6pmquqyi.execute-api.us-east-2.amazonaws.com/latest/readings'
    url = os.environ['FYP_ENDPOINT']
else:
    print('FYP_ENDPOINT not set. Exiting')
    sys.exit(0)


RX = 10 # Pins for serial port
TX = 8
readFreq = 5.0

# create serial connection to GPS
uart = serial.Serial("/dev/ttyS0", baudrate=9600, timeout=3000)

# gps module instance
gps = adafruit_gps.GPS(uart, debug=False)
# Turn on the basic GGA and RMC info
gps.send_command(b'PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')
# Set update rate
gps.send_command(b'PMTK220,1000')

# run forever
last = time.monotonic()
while True:
    gps.update()
    current = time.monotonic()
    if current - last > readFreq:
        last = current
        if not gps.has_fix:
            print('gps has no fix')
            continue
        # have a fix
        # find nearby devices and save
        print('Scanning for Bluetooth devices...')
        nearby_devices = bluetooth.discover_devices(
                duration=8, lookup_names=True, flush_cache=True)

        print('Found %d devices' % len(nearby_devices))

        devices = []
        for addr, name in nearby_devices:
            newDevice = {}
            newDevice['id'] = addr
            newDevice['name'] = name
            devices.append(newDevice)
            
        location = {}
        location['latitude'] = gps.latitude
        location['longitude'] = gps.longitude

        timestamp = datetime.now(timezone.utc).isoformat()
        
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