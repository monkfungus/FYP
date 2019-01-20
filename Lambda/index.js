const ApiBuilder = require('claudia-api-builder')
const AWS = require('aws-sdk')
let api = new ApiBuilder()
const docClient = new AWS.DynamoDB.DocumentClient()
// TODO: move to env
const tablename = 'readings'

api.post('/readings', function (request) {
    const params = {
        TableName: tablename,
        Item: request.body
    }
    return docClient.put(params).promise()
}, { success: 201} )
api.get('/hello', function (request) {
    return 'hello there'
})

module.exports = api