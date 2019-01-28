import json
import argparse
import sys
# from json file of multiple gps readings, 
# compute mean, variance etc
description =  'from json file of multiple gps readings, compute mean, variance etc'
def main(argv):
    filename = ''    
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('input_file', 
                        help='json file')
    args = parser.parse_args()
    filename = args.input_file
    
    with open(filename, 'r') as file:
        raw_data = json.load(file)
    
    total = len(raw_data)
    total_lat = 0
    total_long = 0
    for reading in raw_data:
        total_lat += reading['latitude']
        total_long += reading['longitude']

    print(total_lat/total)
    print(total_long/total)
        
        

if __name__ == '__main__':
    main(sys.argv)