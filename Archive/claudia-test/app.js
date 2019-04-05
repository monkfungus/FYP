const APIBuilder = require('claudia-api-builder'),
	api = new APIBuilder()

module.exports = api

api.get('/hello', function() {
	return 'hello there'
})

