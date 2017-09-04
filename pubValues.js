//pubValues.js

var pub = {
    censusId:null,
    direction:null,
    lat:null,
    lng:null,
    coordinates:[],
    coordinatesCounter:0,
    coordinateIds:[],
    coordinatesData:{},
    coordIndex:0,
    coordinatesList:null,
    ids:[],
    geoData:{},
    returnedData:{},
    midpoint:null,
    distance:3,
    increment:.5,
    zoom:21
}
pub.increment = pub.distance/5
var tableCodesToDraw = {
    
}
var allTables = ("B01003,B01002,B25002,B02001,B25003,B07201,B15003,B08301,B08302,B08303,B25064,B15012,B16002,B19001,B27010,B19013,B19057,B23025").split(",")