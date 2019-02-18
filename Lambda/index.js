const LOCAL = process.env.LOCAL
const express = require('express')
const app = express()
app.use(express.json())
const AWS = require('aws-sdk')
if (LOCAL) {
    AWS.config.update({region: "us-east-2"})
}
const docClient = new AWS.DynamoDB.DocumentClient()

const table = {
    readings: 'readings',
    devices: 'devices'
}

app.post('/readings', (req, res) => {
    const reading = req.body
    let params = {
        TableName: table.readings,
        Item: reading
    }
    
    console.log(`Trying to put reading in db`)
    docClient.put(params).promise()
        .then(() => {
            console.log("put reading in db")
            return res.sendStatus(201) 
        })
        .catch((err) => {
            console.log("Failed to put to DB. Error: ", err)
            return res.sendStatus(500)
        })
    // docClient.put(params).promise()
    //     .then(() => {
    //         console.log(`scanning readings for devices in reading`)
    //         // for each device:
    //             // check if device already recorded in table, if not add it 
    //             // if device already in devices
    //                 // update location
    //             // else 
    //                 // add device with current location
    //                 // update location
    //         request.devices.array.forEach(device => {
    //             params = {
    //                 TableName: table.devices,
    //                 KeyConditionExpression: "id = :id",
    //                 ExpressionAttributeValues: {
    //                     ":id": device.address
    //                 }
    //             }
    //             docClient.query(params, function(err, data) {
    //                 if (err) {
    //                     console.err(`Unable to query for device. Error:${err}`)
    //                     reject(err)
    //                 } else {
    //                     if (data.Items.length === 1) {
    //                         console.log(`Found device in table`)
    //                         // put latest location up with device
    //                         // should we check if name has changed?
    //                         params = {
    //                             TableName: table.devices,
    //                             Key: {
    //                                 "Id": device.address
    //                             },
    //                             UpdateExpression: "set location = :l",
    //                             ExpressionAttributeValues: {
    //                                 ":l": request.body.location
    //                             },
    //                             ReturnValues: "UPDATED_NEW"             
    //                         }
    //                         console.log(`Updating device ${device.address} with new location`)
    //                         docClient.update(params, function(err, data) {
    //                             if (err) {
    //                                 console.error("Unable to update device. Error: ", err)
    //                             } else {
    //                                 console.log("Updated device location")
    //                             }
    //                         })
    //                     } else if (data.Items.length === 0) {
    //                         console.log(`Device not found in table, adding`)
    //                         // put device in table with latest location
    //                         params = {
    //                             TableName: table.devices,
    //                             Item: {
    //                                 "id": device.address,
    //                                 "name": device.name,
    //                                 "location": device.location
    //                             }
    //                         }
    //                         docClient.put(params, function(err, data) {
    //                             if (err) {
    //                                 console.error("Unable to add item. Error:", err)
    //                             } else {
    //                                 console.log("Added new device ", device)
    //                             }
    //                         })
    //                     }
                    
    //                 }
    //             })
    //         }); 
    //         return res.sendStatus(201)
    //     })
    //     .then(() => {
    //         return res.sendStatus(201)
    //     })
    //     .catch( err => {
    //         // need more info
    //         console.error('failed to put req in db')
    //         res.sendStatus(500)
    //     })
})
// return list of devices or all details about specific device
// app.get('/devices', (req, res) => {
//     res.send('not yet implemented')
// })
// app.get('/devices/:id', (req, res) => {
//     console.log(req.params)
//     res.send('not yet implemented')
// })
// // return estimation of current location
// app.get('/devices:id/location', (req, res) => {
    
// })
app.get('/', (req, res) => {
    console.log(req.method)
    res.send('hello there')
})

// if running locally
if (LOCAL) {
    const port = 3000
    app.listen(port, () => console.log(`Listening on port ${port}`))
}

module.exports = app