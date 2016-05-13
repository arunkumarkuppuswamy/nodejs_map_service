/**
 * @file
 * 
 * REST API to obtiain route as a list of places as well as a static image.
 *
 * author : unimity
 */

// Modules includes
var express = require('express');
var app = express();
var Q = require("q");
var request = require('request');
var url = require('url');

// Global variables
GOOGLEIMAGEURL = 'http://maps.googleapis.com/maps/api/staticmap?size=700x500&maptype=roadmap&path=color:0x0000ff|weight:10|';
GOOGLEDIRECTIONURL = "http://maps.googleapis.com/maps/api/directions/json?sensor=false&mode=%22DRIVING%22&";

// Allow CROS for external form Callbacks.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET");
  next();
});

// Start Server.
var server = app.listen(8083, function () {
  var port = server.address().port
  console.log("Example app listening at %s Port", port)
})

// Create q promise
function routeGenerator() {
  var defer = Q.defer();
  process.nextTick(function () {
      defer.resolve();
  });
  return defer.promise;
}

/**
 * REST Service for user Request
 */

// GET Service for parse
app.get('/api/map', function (req, res){
  var queryString = url.parse(req.url,true).query;
  var origin = queryString.origin;
  var destination = queryString.destination;
  var image = queryString.image;
  // Checking orgin and destinations provided or not.
  if (origin == undefined || destination == undefined) {
    res.send({error: "Origin or Destination is missing"});
    res.end();
  } else {
    // Callback URL to route service
    var directionMapURL = GOOGLEDIRECTIONURL +'origin=' + origin + '&destination=' + destination;
    routeGenerator()
    .then(
      responseData = request(directionMapURL, function(error, directionResponse, directionBody) {
        if (error) {
          throw new Error("Error in processing your request.");
        } else if(directionResponse.statusCode != 200) {
          throw new Error("Can't connect to Google MAP API, Please try later.");
        }
        var responseObject = [];
        var map_path = '';
        var jsonObjDirection = JSON.parse(directionBody);
        if (jsonObjDirection.routes[0] == undefined || jsonObjDirection.routes[0].legs[0] == undefined) {
          var errorMsg = "Can't find road route between origin and destination."
          res.send({error: errorMsg});
          res.end();
        } else {
          myRoute = jsonObjDirection.routes[0].legs[0];
          for (var i = 0; i < myRoute.steps.length; i++) {
            map_path +=  JSON.stringify(myRoute.steps[i].start_location);
            responseObject.push({
              id: i,
              duration: myRoute.steps[i].duration.text,
              path: myRoute.steps[i].start_location,
              polyline: myRoute.steps[i].distance.text,
              instructions: myRoute.steps[i].html_instructions,
              duration: myRoute.steps[i].duration.text,
              turn_detail: myRoute.steps[i].maneuver
            });
          }
          // If image required.
          if (image == 1) {
            var base64 = require('node-base64-image'); // Initialize image to bytestream convert module.
            // Constructing path as defined by google map api.
            var parseString = map_path.replace(/\{"lat":/g, '');
            parseString = parseString.replace(/\"lng":/g, '');
            parseString = parseString.replace(/\}/g,'|');
            parseString = parseString.slice(0, -1);
            // Callback URL to static image.
            var staticImageURL = GOOGLEIMAGEURL + parseString;
            var options = {string: true};
            // Image to Byte stream convert callback.
            base64.base64encoder(staticImageURL, options, function (streamError, byteStreamImage) {
              if (streamError) {
                throw new Error("Can't generate byte stream for the Map.");
              }
              responseObject.push({image: byteStreamImage});
              res.send(responseObject);
              res.end();
            });
          } else {
            res.send(responseObject);
            res.end(); 
          }
        }
      })
    )
    .fail(function (error) {
      res.send({error: error});
      res.end();
    });
  }
});

/**
 * End of REST service.
 */
