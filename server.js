var PROTO_PATH = './impl.proto'

var grpc = require('grpc')
var impl_proto = grpc.load(PROTO_PATH).impl

var place_list = require('./db')

// Simple RPC
function locate(call, callback) {
    for (var index in place_list) {
        if (place_list[index].location.latitude === call.request.latitude && place_list[index].location.longitude === call.request.longitude) {
            callback(null, place_list[index])
            return
        }
    }
}


// A server-side streaming RPC
function list(call) {
    var size = call.request.size
    for (var index = 0; index < size; index++) {
        call.write(place_list[index].location)
    }
}

// A bidirectional streaming RPC
function query(call) {
    call.on('data', function(point) {
        console.log(point)

        for (var index in place_list) {
            if (place_list[index].location.latitude === point.latitude && place_list[index].location.longitude === point.longitude) {
                call.write(place_list[index])
                return
            }
        }
    })

    call.on('end', function() {
        call.end()
    })
}

var server = new grpc.Server()
server.addProtoService(impl_proto.LBS.service, {
    locate: locate,
    query: query,
    list: list
})
server.bind('0.0.0.0:50054', grpc.ServerCredentials.createInsecure())
server.start()