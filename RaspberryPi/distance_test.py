from math import radians, sin, cos, atan2, sqrt

# means
lat1 = 53.27867289
lon1 = -6.144917466

# moving
lat2 = 53.27859
lon2 = -6.14496

earthRadiusM = 6371000

diffLatR = radians(lat1 - lat2)
diffLonR = radians(lon1 - lon2)

lat1R = radians(lat1)
lat2R = radians(lat2)

a = sin(diffLatR/2) * sin(diffLatR/2) + sin(diffLonR/2) * sin(diffLonR/2) * cos(lat1R) * cos(lat2R)
print("a ", a)
print('sqrt(a) ', sqrt(a))
print('sqrt(1-a) ', sqrt(1-a))
print("atan2 ", atan2(sqrt(a), sqrt(1-a)))
c = 2 * atan2(sqrt(a), sqrt(1-a))

print('c ', c)
d = earthRadiusM * c
print('d ', d)