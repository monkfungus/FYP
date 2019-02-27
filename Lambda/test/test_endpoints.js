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
	this.timeout(5000) // 5 seconds
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
		this.timeout(5000) // 5 seconds
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
	this.timeout(5000) // 5 seconds
	it('GET /devices should return a list of devices', function(done) {
		const url = endpoint + resources.devices
		request
			.get({
				url: endpoint + resources.devices
			})
			.on('response', function(res) {
				res.setEncoding('utf8')
				let body = []
				res
					.on('data', function(chunk) {
						body += chunk
					})
					.on('end', function() {
						body = JSON.parse(body)
						expect(body.devices).to.not.be.equal(undefined)
						expect(body.devices[0].deviceId).to.not.be.equal(undefined)
						expect(body.devices[0].name).to.not.be.equal(undefined)
						expect(res.statusCode).to.be.equal(200)
						done()
					})	
					.on('error', function(err) {
						done(err)
					})			
			})
			.on('error', function(err) {
				done(err)
			})
	})
	it('GET /devices/:deviceId should return a specific device', function(done) {
		// note this uses the first device returned from GET /devices
		request
			// get list of devices
			.get({url: endpoint + resources.devices})
			.on('response', function(outerRes) {
				let body = []
				outerRes
					.on('data', function(chunk) {body += chunk})
					.on('end', function() {
						body = JSON.parse(body) // convert body to JSON
						const device = body.devices[0] // get first device
						expect(device.deviceId).to.not.equal(undefined) // table/:devices likely empty
						const deviceId = device.deviceId // get first deviceId
						body = [] // clear body
						request
							.get({url: `${endpoint}${resources.devices}/${deviceId}`})
							.on('response', function(innerRes) {
								innerRes
									.on('data', function(chunk) {body += chunk})
									.on('end', function() {
										expect(innerRes.statusCode).to.be.equal(200)
										body = JSON.parse(body)
										const device = body.device
										expect(device).to.not.be.equal(undefined)
										done()
									})
							})							
					})
			})
	})
	it('GET /devices/:deviceId/location should return the estimated location for a specific device', function(done) {
		// Gets a list of devices and queries the location for the first device found
		request
			// get list of devices
			.get({url: endpoint + resources.devices})
			.on('response', function(outerRes) {
				let body = []
				outerRes
					.on('data', function(chunk) {body += chunk})
					.on('end', function() {
						body = JSON.parse(body) // convert body to JSON
						// if (body.devices.length)
						const device = body.devices[0] // get first device
						expect(device.deviceId).to.not.equal(undefined) // table/:devices likely empty
						const deviceId = device.deviceId // get first deviceId
						body = [] // clear body
						request
							.get({url: `${endpoint}${resources.devices}/${deviceId}/location`})
							.on('response', function(innerRes) {
								innerRes
									.on('data', function(chunk) {body += chunk})
									.on('end', function() {
										expect(innerRes.statusCode).to.be.equal(200)
										body = JSON.parse(body)
										const location = body.location
										expect(location).to.not.be.equal(undefined)
										done()
									})
							})							
					})
			})
	})
})

function generateMockReading() {
    const now = new Date(Date.now())
    const timestamp = now.toISOString()
    let mockReading = {
				"deviceId": "test_endpoint",
        "devices": [
          {
            "deviceId": "98:01:A7:B4:EF:50",
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