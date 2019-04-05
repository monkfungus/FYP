const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
const AWS = require('aws-sdk')

AWS.config.update({
    endpoint: 'https://dynamodb.us-east-2.amazonaws.com',
    region: 'us-east-2'
})
const docClient= new AWS.DynamoDB.DocumentClient()
const tablename = 'readings'

app.get('/', (req, res) => {
	res.send('hello')
	console.log(req.method + req.url)
})

app.post('/', (req, res) => {
	console.log(req.method + req.url)
	console.log(req.body)
	const params = {
		TableName: tablename,
		Item: req.body
	}
	docClient.put(params, function(err, data) {
		if (err) {
			console.error('Unable to add item. Error JSON: ', JSON.stringify(err, null, 2))
			res.sendStatus(500)
		} else {
			console.log('Added item:', JSON.stringify(data, null, 2))
			res.sendStatus(201)
		}
	})
})

// do the listen!
app.listen(3000, () => {
	console.log('Listening on port 3000')
})
