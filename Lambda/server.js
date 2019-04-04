const util = require('util')
const express = require('express')
const app = express()
app.use(express.json())
const LOCAL = process.env.LOCAL
const AWS = require('aws-sdk')
if (LOCAL) {
    AWS.config.update({region: "us-east-2"})
}
const docClient = new AWS.DynamoDB.DocumentClient()

const table = {
    readings: 'readings',
    devices: 'devices'
}

const deviceMeasurementErr = {
    smart: 0.0000001,
    dumb: 0.00001
}

// upload a reading
app.post('/readings', (req, res) => {
    log(req)
    const reading = req.body
    let params = {
        TableName: table.readings,
        Item: reading
    }
    
    console.log('DB/readings.put: reading')
    docClient.put(params).promise()
        .then(() => {
            console.log('DB/readings.put: Success')
            // for each device:
                // if device already in devices
                    // update location
                // else 
                    // add device with current location
            let devices = reading.devices
            devices.push({deviceId: reading.deviceId})
            reading.devices.forEach(device => {
                console.log('Querying for device: ', device.deviceId)
                params = {
                    TableName: table.devices,
                    KeyConditionExpression: "deviceId = :id",
                    ExpressionAttributeValues: {
                        ":id": device.deviceId
                    },
                    ProjectionExpression: "lastKnownLocation"
                }
                docClient.query(params, function(err, data) {
                    if (err) {
                        console.error(`Unable to query for device. Error:${err}`)
                        throw err
                    } else {
                        if (data.Items.length === 1) {
                            console.log(`Found device in table`)
                            // calculate new location
                            const previousDeviceState = data.Items[0]
             
                            // decide what error to use
                            let measurementErr = deviceMeasurementErr.dumb // default
                            if (device.deviceId === reading.deviceId) { // on the device that took the reading
                                measurementErr = deviceMeasurementErr.smart
                            } 
                            const kalmanEstimation = estimateNewLocation(previousDeviceState, reading.location, measurementErr);
                            // put latest location up with device                                                            
                            params = {
                                TableName: table.devices,
                                Key: {
                                    "deviceId": device.deviceId
                                },
                                UpdateExpression: "set lastKnownLocation = :l, locationUpdateTimestamp = :t",
                                ExpressionAttributeValues: {
                                    ":l": kalmanEstimation,
                                    ":t": reading.timestamp
                                },
                                ReturnValues: "UPDATED_NEW"
                            }
                            console.log(`Updating device ${device.deviceId} location to: ${stringify(reading.location)}`)
                            docClient.update(params, function(err, data) {
                                if (err) {
                                    console.error("Unable to update device. Error: ", err)
                                    throw err
                                } else {
                                    console.log(`Updated device ${device.deviceId} location to: ${stringify(reading.location)}`)
                                }
                            })
                        } else if (data.Items.length === 0) {
                            console.log(`Device not found in table, adding`)
                            // put device in table with latest location
                            // need to fill out estimation error values for location
                            let location = reading.location
                            // decide what errors to use
                            location.latitudeEstimationError = 0.05 // defaults
                            location.longitudeEstimationError = 0.05
                            if (device.deviceId === reading.deviceId) { // if this is a smart device
                                location.latitudeEstimationError = 0.02
                                location.longitudeEstimationError = 0.02
                            } 
                            
                            params = {
                                TableName: table.devices,
                                Item: {
                                    "deviceId": device.deviceId,
                                    "name": device.name,
                                    "lastKnownLocation": location,
                                    "locationUpdateTimestamp": reading.timestamp
                                }
                            }
                            docClient.put(params, function(err, data) {
                                if (err) {                                    
                                    console.error("Unable to add item. Error:", err)
                                    throw err
                                } else {
                                    console.log("Added new device ", device)
                                }
                            })
                        } else {
                            console.log('Found more than one entry for device in table')
                        }
                    }
                })
            });         
        })
        .then(() => {
            res.sendStatus(201)
        })
        .catch(err => {
            console.log('DB/readings.put: Errror: ', err)
            res.sendStatus(500)
        })
})

// return list of device ids
app.get('/devices', (req, res) => {
    log(req)
    /**
     * Scan for all devices
     * Return list of all device IDs 
     */
    const params = {
        TableName: table.devices,
        ProjectionExpression: 'deviceId, #n', // attributes we want in result
        ExpressionAttributeNames: {'#n': 'name'}
    }
    console.log('Scanning table:/devices for all deviceIds')
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error('Scanning table:/devices failed. Error: ', err.message)
            res.sendStatus(500)
        } else {
            let devices = []
            data.Items.forEach(function(device) {
                devices.push(device)
            })
            console.log(`Found ${devices.length} devices`)
            res.status(200).send({'devices': devices})
        }
    })
})

// return info stored about invidual device
app.get('/devices/:deviceId', (req, res) => {
    log(req)
    const deviceId = req.params.deviceId
    const params = {
        TableName: table.devices,
        KeyConditionExpression: "deviceId = :deviceId",
        ExpressionAttributeValues: {
            ":deviceId": deviceId
        }
    }
    console.log(`Querying table:/${table.devices} for deviceId ${deviceId}`)
    docClient.query(params, function(err, data) {
        if (err) {
            const errMsg = `Unable to find deviceId ${deviceId} Error: ${stringify(err)}`
            console.error(errMsg)
            res.status(500).send(errMsg)
        } else {
            console.log(`Found device id ${deviceId}`)
            const device = data.Items[0]
            res.status(200).send({device: device})
        } 
    })
})

// return estimation of current location for device
app.get('/devices/:deviceId/location', (req, res) => { 
    log(req)
    const deviceId = req.params.deviceId
    const params = {
        TableName: table.devices,
        KeyConditionExpression: "deviceId = :deviceId",
        ExpressionAttributeValues: {
            ":deviceId": deviceId
        }
    }
    console.log(`Querying table:/${table.devices} for deviceId ${deviceId}`)
    docClient.query(params, function(err, data) {
        if (err) {
            const errMsg = `Unable to find deviceId ${deviceId} Error: ${stringify(err)}`
            console.error(errMsg)
            res.status(500).send(errMsg)
        } else {
            console.log(`Found deviceId ${deviceId}`)
            const device = data.Items[0]
            res.status(200).send({location: device.lastKnownLocation})
        } 
    })
})

// root endpoint, mainly used to show up status
app.get('/', (req, res) => {
    log(req)
    res.send('hello there')
})

// logs request to console
function log(req) {
    const now = new Date(Date.now())
    const timestamp = now.toISOString()
    console.log(`${timestamp} ${req.method} ${req.url} ${stringify(req.body)}`)
}

// convert JSON obj to string
function stringify(obj) {
    const str = util.inspect(obj)
    return str
}

// returns an object with location estimation and error
// measurement is the location measurement for the devices
function estimateNewLocation(device, measurement, measurementErr) {
    let estimation = {}
    // latitude estimation
    const latKG = kalmanGain(device.lastKnownLocation.latitudeEstimationError, measurementErr)
    const latEst = kalmanEstimate(device.lastKnownLocation.latitude, latKG, measurement.latitude)
    const latEstErr = kalmanEstimationError(latKG, device.lastKnownLocation.latitudeEstimationError)  
    
    // longitude estimation
    const lonKG = kalmanGain(device.lastKnownLocation.longitudeEstimationError, measurementErr)
    const lonEst = kalmanEstimate(device.lastKnownLocation.longitude, lonKG, measurement.longitude)
    const lonEstErr = kalmanEstimationError(lonKG, device.lastKnownLocation.longitudeEstimationError)

    // compile estimation
    estimation.latitude = latEst
    estimation.latitudeEstimationError = latEstErr
    estimation.longitude = lonEst
    estimation.longitudeEstimationError = lonEstErr
    return estimation
}

// Kalman gain
function kalmanGain(estimationError, measurementError) {
    return estimationError / (estimationError + measurementError)
}

function kalmanEstimate(prevEst, KG, measurement) {
    let a = measurement - prevEst
    let b = KG * a
    let c = prevEst + b
    return parseFloat(prevEst) + parseFloat((KG * (measurement - prevEst)))
}

function kalmanEstimationError(KG, estimationError) {
    return (1 - KG) * estimationError
}

// if running locally listen on port 3000
if (LOCAL) {
    const port = 3000
    app.listen(port, () => console.log(`Listening on port ${port}`))
}

module.exports = app
