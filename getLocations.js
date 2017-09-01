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
    
    drawBaseMap(lat,lng)
    getDirection(lat,lng)
   // var points = returnPositions(lat,lng)
//    drawDirection(points,lat,lng)
}

function returnPositions(lat,lng,direction){
        console.log(direction)
    if(direction ==undefined){
        direction = 0
    }
    var coordinatesList = []
    
    for(var d = 0; d<2; d+=.1){
        var latLng = getPointsInDirection(lng,lat, d,direction)
        coordinatesList.push(latLng)
    }
    d3.select("#orientation").html("direction:"+direction+" coordinate 3"+coordinatesList[2].lat+" "+coordinatesList[2].lng)
    drawDirection(coordinatesList,lat,lng)
    console.log(coordinatesList)
    
    //return coordinatesList
    //console.log(pub.coordinates)
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
    return {lng:Math.round(lat2.toDeg()*1000000)/1000000,lat:Math.round(lon2.toDeg()*1000000)/1000000}
}

function formatPathData(json){
   // console.log(json)
    var blockGroupid = "15000US"+json.Block.FIPS.slice(0,12)
    d3.select("#censusLabelFCC").html("Block: "+json.Block.FIPS+"<br/>Block Group: "+blockGroupid ) 
   // console.log(blockGroupid)
    pub.coordinates.push(blockGroupid)

    //console.log(pub.coordinates)
    //pub.censusId = blockGroupid
   // getCensusData(pub.censusId,"B01002")
//    var tableName = "B01002"
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
  //  console.log([pub.coordinatesCounter,pub.coordinates.length-1])
    if(pub.coordinatesCounter==pub.coordinates.length-1){
        makeChart()
        return
    }
    
    var coordinate = pub.coordinates[pub.coordinatesCounter]
  //  console.log(coordinate)
    var url = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+coordinate[0]
        +"&longitude="+coordinate[1]
//    console.log(url)
    $.ajax({
    url: url,
    async:true,
    dataType:"jsonp",
    success:function(data){
            var blockGroupid = "15000US"+data.Block.FIPS.slice(0,12)
            console.log(blockGroupid)
            pub.coordinatesCounter=pub.coordinatesCounter+1
            if(pub.coordinatesCounter<pub.coordinates.length){
                pub.coordinateIds.push(blockGroupid)
                getData(blockGroupid,"B01002")
            }
        }
    });
}
function getData(geoid,tableCode){
    var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+tableCode+"&geo_ids="+geoid

    var finishedIds = Object.keys(pub.coordinatesData)
    if(finishedIds.indexOf(geoid)>-1){
        //console.log("already searched")
        getCensusIdList()
    }else{
        $.ajax({
            url:censusReporter,
            async:true,
            success:function(data){
               // console.log(data)
               // var formatted = formatCensusData(data,"B01002")
                //console.log(formatted)
                pub.coordinatesData[geoid]=data
                getCensusIdList()
            }
        })
    }   
}

getLocation()