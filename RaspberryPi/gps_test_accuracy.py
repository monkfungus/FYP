import time
import board
import busio
import adafruit_gps
import serial
from datetime import datetime, timezone
import json

RX = 10
TX = 8
readFreq = 1.0
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
        # Print out details about the fix like location, date, etc.
        # print('=' * 40)  # Print a separator line.
        # print('Fix timestamp: {}/{}/{} {:02}:{:02}:{:02}'.format(
        #     gps.timestamp_utc.tm_mon,   # Grab parts of the time from the
        #     gps.timestamp_utc.tm_mday,  # struct_time object that holds
        #     gps.timestamp_utc.tm_year,  # the fix time.  Note you might
        #     gps.timestamp_utc.tm_hour,  # not get all data like year, day,
        #     gps.timestamp_utc.tm_min,   # month!
        #     gps.timestamp_utc.tm_sec))
        gps_timestamp = '{}-{}-{}T{}:{}:{}+00:00'.format(
            gps.timestamp_utc.tm_year,
            gps.timestamp_utc.tm_mon,
            gps.timestamp_utc.tm_mday,
            gps.timestamp_utc.tm_hour,
            gps.timestamp_utc.tm_min,
            gps.timestamp_utc.tm_sec
        )
        reading['timestamp_gps'] = gps_timestamp
        # print('Latitude: {0:.6f} degrees'.format(gps.latitude))
        # print('Longitude: {0:.6f} degrees'.format(gps.longitude))
        # print('Fix quality: {}'.format(gps.fix_quality))
        reading['latitude'] = gps.latitude
        reading['longitude'] = gps.longitude
        reading['fix_quality'] = gps.fix_quality
        # Some attributes beyond latitude, longitude and timestamp are optional
        # and might not be present.  Check if they're None before trying to use!
        if gps.satellites is not None:
            # print('# satellites: {}'.format(gps.satellites))
            reading['num_satellites'] = gps.satellites
        if gps.altitude_m is not None:
            # print('Altitude: {} meters'.format(gps.altitude_m))
            reading['altitude(m)'] = gps.altitude_m
        if gps.track_angle_deg is not None:
            # print('Speed: {} knots'.format(gps.speed_knots))
            reading['speed(knots)'] = gps.speed_knots
        if gps.track_angle_deg is not None:
            # print('Track angle: {} degrees'.format(gps.track_angle_deg))
            reading['track_angle(degrees)'] = gps.track_angle_deg
        if gps.horizontal_dilution is not None:
            # print('Horizontal dilution: {}'.format(gps.horizontal_dilution))
            reading['horizontal_dilution'] = gps.horizontal_dilution
        if gps.height_geoid is not None:
            # print('Height geo ID: {} meters'.format(gps.height_geoid))
            reading['height_geo_id(m)'] = gps.height_geoid
        readings.append(reading)
        print(json.dumps(reading, indent=2))
