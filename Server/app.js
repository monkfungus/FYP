const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.send('hello')
	console.log(req.method + req.url)
})

app.post('/', (req, res) => {
	console.log(req.method + req.url)
	console.log(req.body)
	res.sendStatus(200)
})

// do the listen!
app.listen(3000, () => {
	console.log('Listening on port 3000')
})
