const ApiBuilder = require('claudia-api-builder')
let api = new ApiBuilder()
const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
// TODO: move to env
const table = {
    readings: 'readings',
    devices: 'devices'
}

app.post('/readings', (req, res) => {
    let params = {
        TableName: table.readings,
        Item: request.body
    }
    // what happens here - when does response from docClient come back?
    docClient.put(params).promise()
        .then( value => {
            // for each device:
                // check if device already recorded in table, if not add it 
                // if device already in devices
                    // update location
                // else 
                    // add device with current location
                    // update location
            request.devices.array.forEach(element => {
                params = {
                    TableName: table.devices,
                    KeyConditionExpression: "id = :id",
                    ExpressionAttributeValues: {
                        ":id": element.address
                    }
                }
                docClient.query(params, function(err, data) {
                    if (err) {
                        console.err("Unable to get ")
                        reject(err)
                    } else {

                    }
                })
            }); 
            return res.sendStatus(201)
        })
        .then( value => {
            return res.sendStatus(201)
        })
        .catch( err => {
            // need more info
            console.error('failed to put req in db')
            res.sendStatus(500)
        })
})
// return list of devices or all details about specific device
app.get('/devices', (req, res) => {
    res.send('not yet implemented')
})
app.get('/devices/:id', (req, res) => {
    console.log(req.params)
    res.send('not yet implemented')
})
// // return estimation of current location
// app.get('/devices:id/location', (req, res) => {
    
// })
app.get('/', (req, res) => {
    res.send('hello there')
})

// comment out for deployment to AWS Lambda
const port = 3000
app.listen(port, () => console.log(`Listening on port ${port}`))
module.exports = app