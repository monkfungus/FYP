const ApiBuilder = require('claudia-api-builder')
let api = new ApiBuilder()
const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
// TODO: move to env
const tablename = 'readings'

app.post('/readings', function (req, res) {
    const params = {
        TableName: tablename,
        Item: request.body
    }
    return docClient.put(params).promise()
}, { success: 201} )
// return all devices or specific devices
app.get('/devices', function (req, res) {
    if (request.queryString.name !== NaN) {
        
    }
})
app.get('/hello', (req, res) => {
    res.send('hello there')
})

// comment out for deployment to AWS Lambda
const port = 3000
app.listen(port, () => console.log(`Listening on port ${port}`))
module.exports = app