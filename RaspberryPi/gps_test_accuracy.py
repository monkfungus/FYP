import time
import board
import busio
import adafruit_gps
import serial
from datetime import datetime, timezone
import json

###
# Read GPS updates from the GPS module and print to screen
# 
# To run while saving the output, run something like
#   ./gps_test_accuracy >> output.txt 2>&1
# which redirects stdout and stderr to output.txt so if Pi crashes 
# we still have some results!
###

RX = 10 # RX Pin on Pi
TX = 8 # TX Pin on Pi
readFreq = 1.0 # how often to read (Hz)
iter = 0
readings = []

# create serial connection to GPS
uart = serial.Serial("/dev/ttyS0", baudrate=9600, timeout=3000)

# gps module instance
gps = adafruit_gps.GPS(uart, debug=False)
# turn on basic GGA and RMC info
gps.send_command(b'PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')
# Set update rate
gps.send_command(b'PMTK220,1000')

last = time.monotonic()
while True:
    reading = {} # current reading
    gps.update()
    current = time.monotonic()
    if current - last > readFreq:
        last = current
        reading['timestamp_pi'] = datetime.now(timezone.utc).isoformat()
        if not gps.has_fix:
            reading['has_gps'] = False
            continue
        reading['has_gps'] = True
        gps_timestamp = '{}-{}-{}T{}:{}:{}+00:00'.format(
            gps.timestamp_utc.tm_year,
            gps.timestamp_utc.tm_mon,
            gps.timestamp_utc.tm_mday,
            gps.timestamp_utc.tm_hour,
            gps.timestamp_utc.tm_min,
            gps.timestamp_utc.tm_sec
        )
        reading['timestamp_gps'] = gps_timestamp
        reading['latitude'] = gps.latitude
        reading['longitude'] = gps.longitude
        reading['fix_quality'] = gps.fix_quality
        # Some attributes beyond latitude, longitude and timestamp are optional
        # and might not be present.  Check if they're None before trying to use!
        if gps.satellites is not None:
            reading['num_satellites'] = gps.satellites
        if gps.altitude_m is not None:
            reading['altitude(m)'] = gps.altitude_m
        if gps.track_angle_deg is not None:
            reading['speed(knots)'] = gps.speed_knots
        if gps.track_angle_deg is not None:
            reading['track_angle(degrees)'] = gps.track_angle_deg
        if gps.horizontal_dilution is not None:
            reading['horizontal_dilution'] = gps.horizontal_dilution
        if gps.height_geoid is not None:
            reading['height_geo_id(m)'] = gps.height_geoid
        readings.append(reading)
        # Print reading to screen in pretty JSON format
        print(json.dumps(reading, indent=2)) 
