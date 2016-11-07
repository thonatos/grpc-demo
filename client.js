var grpc = require('grpc')

var PROTO_PATH = './impl.proto'
var conf = require('./conf')
var place_list = require('./db')
var impl_proto = grpc.load(PROTO_PATH).impl

var client = new impl_proto.LBS(conf.ip.client + ':' + conf.port, grpc.credentials.createInsecure())

function callback() {
    console.log('end')
}

function locate() {
    client.locate({
        latitude: 401809022,
        longitude: -744157964
    }, function(err, response) {
        console.log(response.name)
    })
}

function list() {
    var call = client.list({
        size: 10
    })
    call.on('data', function(feature) {
        console.log(feature)
    });
    call.on('end', callback)
}

function query() {
    var call = client.query()
    call.on('data', function(place) {
        console.log(place.name)
    });
    call.on('end', callback)

    for (var index in place_list) {
        call.write(place_list[index].location)
    }
    call.end()
}

list()