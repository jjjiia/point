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
    distance:1,
    increment:0.05,
    points:30,
    zoom:23,
    uniqueIds:[],
    uniqueIdsCounter:0
}
pub.increment = pub.distance/pub.points
var tableCodesToDraw = {
    
}
var allTables = ("B01003,B01002,B25002,B02001,B25003,B07201,B15003,B08301,B08302,B08303,B25064,B15012,B16002,B19001,B27010,B19013,B19057,B23025")
.split(",")

var tempIds = ["15000US360470143001","15000US360470141002","15000US360470141003","15000US360470139002","15000US360470139003","15000US360470139004","15000US360470137003","15000US360470137002","15000US360470137001","15000US360470135002","15000US360470135003","15000US360470133004","15000US360470133002","15000US360470133001"]
var tempCounter = 0