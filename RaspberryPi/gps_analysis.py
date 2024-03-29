import json
import argparse
import statistics

##
# from json file of multiple gps readings compute mean, variance etc
# 
# run something along the lines of 
#   python3 gps_analysis.py gps_test_accuracy_output.txt >> gps_analysis_results.txt
##

description =  'from json file of multiple gps readings, compute mean, variance etc'
def main():
    filename = ''    
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('input_file', 
                        help='json file')
    args = parser.parse_args()
    filename = args.input_file
    
    with open(filename, 'r') as file:
        raw_data = json.load(file)
    
    lats = []
    longs = []
    sats = []
    for reading in raw_data:
        lats.append(reading['latitude'])
        longs.append(reading['longitude'])
        sats.append(reading['num_satellites'])
    
    mean_lat = statistics.mean(lats)
    mean_long = statistics.mean(longs)
    print('lat mean: ', mean_lat)
    print('long mean: ', mean_long)
    print('lat stdev: ', statistics.stdev(lats))
    print('long stdev: ', statistics.stdev(longs))
    print('lat variance: ', statistics.variance(lats))
    print('long variance: ', statistics.variance(longs))
    print('mean sats: ', statistics.mean(sats))
        
if __name__ == '__main__':
    main()