import json
import argparse
import csv

##
# from json file of multiple gps readings conver to csv output
# 
# run something along the lines of 
#   python3 write_gps_accuracy_to_csv.py gps_test_accuracy_output.txt >> gps_test_accuracy_output.csv
##

description =  'convert json array to csv'
def main():

    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('input_file', help='json file')
    parser.add_argument('output_file', help='json file')
    args = parser.parse_args()
    
    with open(args.input_file, 'r') as file:
        readings = json.load(file)

    output = open(args.output_file, 'w')
    csvwriter = csv.writer(output)

    count = 0
    for reading in readings:
        if count == 0:
            header = reading.keys()
            csvwriter.writerow(header)
            count += 1
        csvwriter.writerow(reading.values())

    output.close()
#       "latitude": 53.27859,
#   "speed(knots)": 0.31,
#   "height_geo_id(m)": 54.7,
#   "num_satellites": 6,
#   "longitude": -6.144959999999999,
#   "fix_quality": 1,
#   "timestamp_gps": "2019-1-26T22:10:8+00:00",
#   "has_gps": true,
#   "timestamp_pi": "2019-01-26T22:10:08.321887+00:00",
#   "track_angle(degrees)": 345.51,
#   "altitude(m)": 42.2,
#   "horizontal_dilution": 1.48
# },
    

if __name__ == '__main__':
    main()