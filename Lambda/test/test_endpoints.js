const chai = require('chai')
const expect = chai.expect
const request = require('request')
const fs = require('fs')
const LOCAL = process.env.LOCAL
const endpoint = buildEndpoint(LOCAL)
const resources = {    
	'readings': '/readings',
	'devices': '/devices'
}

describe('simple tests', function(done) {
	it('Should have an endpoint', function(done) {
		console.log(`Endpoint: ${endpoint}`)
		done()
	})
})
describe('/', function(done) {
	it(`GET should return "hello world"`, function(done) {
		request
			.get(endpoint)
			.on('response', res => {
				expect(res.statusCode).to.be.equal(200)
				done()
			})
			.on('error', err => {
				console.log(`Endpoint: ${endpoint}`)
				done(err)
			})
	})
})

describe('/readings', function(done) {
    it('should accept valid POST', function(done) {
        const payload = generateMockReading()
        request
            .post({
				url: endpoint + resources.readings,
				body: payload,
				json: true
			})
            .on('response', function(res) {
                expect(res.statusCode).to.be.equal(201)
                done()
            })
            .on('error', function(err) {
                done(err)
			})
    })
})

describe('/devices', function(done) {
	it('GET should return a list of device ids', function(done) {
		request.
			get({
				url: endpoint + resources.devices
			})
			.on('response', function(res) {
				expect(res.statusCode).to.be.equal(200)
				done()
			})
			.on('error', function(err) {
				done(err)
			})
	})
})

function generateMockReading() {
    const now = new Date(Date.now())
    const timestamp = now.toISOString()
    let mockReading = {
        "devices": [
          {
            "address": "98:01:A7:B4:EF:50",
            "name": "dimitrim"
          }
        ],
        "location": {
          "latitude": 53.2836066,
          "longitude": -9.0649583
        },
        "timestamp": timestamp
      }
    return mockReading
}

function buildEndpoint(local) {
	if (local) {
		return `http://localhost:3000`
	}
	const claudiaConfig = JSON.parse(fs.readFileSync('claudia.json', 'utf8'))
	const region = claudiaConfig.lambda.region
	const id = claudiaConfig.api.id
	let endpoint = `https://${id}.execute-api.${region}.amazonaws.com/latest`
	return endpoint
}