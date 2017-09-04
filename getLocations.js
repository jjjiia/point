//http://www.movable-type.co.uk/scripts/latlong.html
Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
   return this * 180 / Math.PI;
}

function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(main);
  } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
function main(position){
    var lng = position.coords.longitude
    var lat = position.coords.latitude        
    var alt = position.coords.altitude 
    d3.select("#coordinates").html("<strong>Lat:</strong>"+Math.round(lat*1000000)/1000000
    +" <strong>Lng:</strong>"+Math.round(lng*1000000)/1000000
    +" <strong>Alt:</strong>"+Math.round(alt*1000000)/1000000)
    
    pub.lat = lat
    pub.lng = lng
    
    getDirection(lat,lng)
//    drawBaseMap(lat,lng)
//
}

function testNewGeocoder(coordinates){
    for(var c in coordinates){
        var lat = coordinates[c].lat
        var lng = coordinates[c].lng
        var url = "https://geoservices.tamu.edu/Services/CensusIntersection/WebService/v04_01/HTTP/default.aspx?lat="
        + lat
         +"&lon="
        +lng
        + "&censusYear=2010&apikey=fd17e30136de494ca87b12678979cbe9&format=json&notStore=false&version=4.10"
         $.getJSON(url, function( data ) {
            console.log(data)
         });
         }    
}

function returnPositions(lat,lng,direction){
     //   console.log(direction)
    if(direction ==undefined || direction ==0){
        direction = 30
    }
   // direction = 20
    var coordinatesList = []
    
    for(var d = 0; d<=pub.distance; d+=pub.increment){
        console.log(d)
        var latLng = getPointsInDirection(lng,lat, d,direction)
        console.log(latLng)
        coordinatesList.push(latLng)
    }
    var midpointIndex = 0//Math.round(coordinatesList.length/2)
    var midpoint = coordinatesList[midpointIndex] 
    pub.midpoint = midpoint
   // console.log(coordinatesList)
    drawBaseMap(midpoint.lat,midpoint.lng)
    
  //  d3.select("#orientation").html("direction:"+direction+" coordinate 3"+coordinatesList[2].lat+" "+coordinatesList[2].lng)
  //  drawDirection(coordinatesList,lat,lng)
    pub.coordinates = coordinatesList
   // testNewGeocoder(coordinatesList)
    
    getCensusIdList()
   // var coords = coordinatesList[pub.coordIndex]
   // var fccUrl = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+coords.lng+"&longitude="+coords.lat      
   // getCensusId(fccUrl,"jsonp","getId")      
}
function getId(json){
    //console.log(json)
    var id = json.Block.FIPS
    console.log(id)
    //pub.ids.push(json.block)
    if(pub.ids.indexOf(id)==-1){
        pub.ids.push(id)
    }
    pub.coordIndex+=1
   // console.log([pub.coordIndex,pub.coordinatesList.length])
    if(pub.coordIndex<pub.coordinatesList.length){
        var coords = pub.coordinatesList[pub.coordIndex]
        console.log(coords)
        var fccUrl = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+coords.lng+"&longitude="+coords.lat     
        getCensusId(fccUrl,"jsonp","getId")
    }else{
        console.log(pub.ids)
        
        return
    }
   
}


function getDirection(lat,lng){
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
                // console.log(event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
                var direction = Math.round(event.alpha)
                d3.select("#orientation").html("from north: "+direction)
                returnPositions(lat,lng,direction)
                return direction
        });
    }else{
        d3.select("#orientation").html("no orientation data from device")
        return undefined
    }
}


function getPointsInDirection(lng,lat, dist,brng){
    d3.select("#orientation").html("direction: "+brng)
    
    
    dist = dist/3959 //6371km;  
    brng = brng.toRad(); 
    
    var lat1 = lat.toRad()
    var lon1 = lng.toRad();

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

   var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                                Math.cos(lat1), 
                                Math.cos(dist) - Math.sin(lat1) *
                                Math.sin(lat2));
    //console.log([lat2.toDeg(),lon2.toDeg()])
    return {lat:Math.round(lat2.toDeg()*1000000)/1000000,lng:Math.round(lon2.toDeg()*1000000)/1000000}
}


function getCensusId(url,type,callBack){
    $.ajax({
    url: url,
    async:true,
    dataType: type,
    jsonpCallback: callBack
    });
}
function makeChart(){
    console.log(pub.coordinates)
    console.log(pub.coordinatesData)
    var formatted = formatDataForCharts(pub.coordinatesData,"B01002")
    console.log(formatted)
    var height = 300
    var width = 300
    var barHeight = 10
    var xScale = d3.scale.linear().domain([10,80]).range([0,width])
    var chart = d3.select("#chart").append("svg").attr("width",width).attr("height",height)
    chart.selectAll("rect")
        .data(Object.keys(formatted))
        .enter()
        .append("rect")
        .attr("x",10)
        .attr("y",function(d,i){console.log(i); return height - i*(barHeight+1)})
        .attr("width",function(d,i){
            console.log(formatted[d][0]["value"])
           // return 20;
            return xScale(formatted[d][0]["value"])
        })
        .attr("height",barHeight)
    chart.select("text")
        .data(Object.keys(formatted))
        .enter()
        .append("text")
        .text(function(d){
            return formatted[d][0]["value"]
        })
        .attr("x",0)
        .attr("y",function(d,i){return height - i*(barHeight+1)})
}

function formatDataForCharts(data,tableCode){
    var formattedData = {}
    
    for(var i in pub.coordinateIds){
        var gid = pub.coordinateIds[i]
        console.log(gid)
        var title = data[gid].tables[tableCode].title
        var estimates = data[gid].data[gid][tableCode].estimate
        var columnCodes = Object.keys(estimates)
        var columnNames = data[gid].tables[tableCode].columns
        var formattedEntry = []
        for( var c in columnCodes){
            var cCode = columnCodes[c]
            var cName = columnNames[cCode].name
            var cValue = estimates[cCode]
            formattedEntry.push({"code":cCode,"name":cName,"value":cValue})
            //console.log([cCode,cName,cValue])
        }
        formattedData[gid]=formattedEntry
    }
    //console.log(formattedData)
    return formattedData
}

function getCensusIdList(){
    if(pub.coordinatesCounter==pub.coordinates.length){
        console.log("loop return")
        setupCensusGeoMaps()
        return
    }
   // if(pub.coordinatesCounter==pub.coordinates.length){
   //     setupCensusGeoMaps()
   //     return
   // }
    var coordinate = pub.coordinates[pub.coordinatesCounter]
    var url = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+coordinate.lat+"&longitude="+coordinate.lng
    $.ajax({
    url: url,
    async:true,
    dataType:"jsonp",
    success:function(data){
            var blockGroupId = "15000US"+data.Block.FIPS.slice(0,12)
            console.log("id")
            pub.coordinates[pub.coordinatesCounter]["id"]=blockGroupId
            pub.coordinatesCounter=pub.coordinatesCounter+1
            var finishedIds = Object.keys(pub.returnedData)
                if(finishedIds.indexOf(blockGroupId)>-1){
                        getCensusIdList()
                }else{
                    getData(blockGroupId)
                }
        }
    });
}
function getData(geoid){
   
    var t1 = "B01003,B01002,B25002,B02001,B25003,B07201,B15003"
    var t2 = ",B08301,B08302,B08303"
    var t3 = ",B25064,B15012,B16002,B19001,B27010,B19013"
    var t4 = ",B19057"
    var t5 = ",B23025"
    allTables = t1+t2+t3+t4+t5
   var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+allTables+"&geo_ids="+geoid
    $.getJSON(censusReporter, function( data ) {
        pub.returnedData[geoid]=data
        getCensusIdList()
    });  
}

function getGeoData(geoid,tableCode){
    
    var censusReporter = "https://api.censusreporter.org/1.0/geo/tiger2015/"+geoid+"?geom=true"
    
    var finishedIds = Object.keys(pub.coordinatesData)
    if(finishedIds.indexOf(geoid)>-1){
        //console.log("already searched")
        getCensusIdList()
    }else{
        $.getJSON(censusReporter, function( geoData ) {
          //  console.log(geoData)
            pub.geoData[geoid]=geoData
            getData(geoid)
            
        });        
    }   
}

getLocation()