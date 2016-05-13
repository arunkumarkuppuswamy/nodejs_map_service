
REST API to obtiain route as a list of places as well as a static image.

Pre-requisites:
===============
  1. NodeJS
  2. npm
Modules:
 a. express           : npm install express
 b. request           : npm install request
 c. url               : npm install url
 d. q                 : npm install q
 e. node-base64-image : npm install node-base64-image
 
Execution:
==========
Compile the code using below command in console/terminal

  node main.js

Now Server starts and listening on the port 8083(http://localhost:8083/)

Send the GET Request to the URL: http://localhost:8083/api/map with the following query parameters:

origin      : Name of starting location
destination : Name of destination location
image       : Optional. Set to 1 to return map as an image binary stream

Example: http://localhost:8083/api/map?origin=chennai&destination=mumbai&image=1
