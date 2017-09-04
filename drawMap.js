function drawBaseMap(lat,lng){
    console.log("draw base map")
    
    var div = "map"
   // var width = Math.max(300, window.innerWidth)
   // var height = Math.max(300, window.innerWidth);
   var width = window.innerWidth
    var height = window.innerWidth
    var svg = d3.select("#map svg")
   
    var center = [lng, lat]
    
    var tiler = d3.geo.tile()
        .size([width, height]);

    var projection = d3.geo.mercator()
        .center(center)
        .scale((1 << pub.zoom) / 2 / Math.PI)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#"+div+" svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("g")
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append("g")
        .each(function(d) {
          var g = d3.select(this);
          d3.json("https://vector.mapzen.com/osm/roads/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key=vector-tiles-LM25tq4", function(error, json) {
            if (error) throw error;

            g.selectAll("path")
              .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
            .enter().append("path")
              .attr("class", function(d) { return d.properties.kind +" basemap"; })
              .attr("d", path);
          });
        });
}

function drawDirection(points,lat,lng){
    console.log("drawDirection")
    d3.selectAll(".location").remove()
    
    d3.select("#dotTest").html([points[2].lat,points[2].lng])
    //console.log(points)
    var center = [lng, lat]
    var width = window.innerWidth
    var height = window.innerWidth
    var projection = d3.geo.mercator()
        .center(center)
        .scale((1 << pub.zoom) / 2 / Math.PI)
        .translate([width / 2, height / 2]);
    var svg = d3.select("#map svg")
        
    var cross = d3.svg.symbol().type('cross')
    		.size(60);
    var startingPoint = points[0]
    svg.append("path").attr("class","location")
        .attr("d",cross)
    	.attr('transform',function(d,i){
            var projectedLng = projection([startingPoint.lng,startingPoint.lat])[0]
            var projectedLat = projection([startingPoint.lng,startingPoint.lat])[1]
             return "translate("+projectedLng+","+projectedLat+") rotate(-45)"; 
             });            
    
    svg.selectAll("circle").append("g").attr("class","dot")
            .data(points)
             .enter()
             .append("circle")
             .attr("r",2)
             .attr("fill","red")
             .attr("opacity",.5)
             .attr("cx",function(d){
                var projectedLng = projection([d.lng,d.lat])[0]
                 return projectedLng
             })  
             .attr("cy",function(d){
                var projectedLat = projection([d.lng,d.lat])[1]
                 
                 //console.log([projectedLat,projectedLng])
                 return projectedLat
             })     
 //   var lineFunction = d3.svg.line()
 //       .x(function(d){
 //           return projection([d.lng,d.lat])[0]
 //       })
 //       .y(function(d){
 //           return projection([d.lng,d.lat])[1]})
 //       .interpolate("linear");
        //push data, add path
        //[topojson.object(geoData, geoData.geometry)]   
     
    //svg.selectAll(".direction")
    //    .append("path")
    //	.attr("class","direction")
    //	.attr("d",lineFunction(points))
    //	.attr("stroke","red")
    //    .attr("stroke-width",5)    
}

function getTitle(code,geoId){
    var table = code.substr(0, code.length -3)
    var codeTitle = pub.returnedData[geoId].tables[table].columns[code].name
    return codeTitle   
}
function getValue(code,geoId){
    var table = code.substr(0, code.length -3)
    var codeValue = pub.returnedData[geoId].data[Object.keys(pub.returnedData[geoId].data)][table].estimate[code]
    return codeValue
}
function getPercent(code,geoId){
    var table = code.substr(0, code.length -3)
    var codeValue = pub.returnedData[geoId].data[Object.keys(pub.returnedData[geoId].data)][table].estimate[code]
    var totalCode = table+"001"
    var totalValue = pub.returnedData[geoId].data[Object.keys(pub.returnedData[geoId].data)][table].estimate[totalCode]
    var percent = codeValue/totalValue*100
    return percent
}
function returnColumnData(columnCode){
    var geoIds = Object.keys(pub.returnedData)
    var columnData = {}
    for(var g in geoIds){
        var geoId = geoIds[g]
        var title = getTitle(columnCode,geoId)
        var value = getValue(columnCode,geoId)
        var percent = getPercent(columnCode,geoId)
        if(value == 0){
            percent = 0
        }
        columnData[geoId]={title:title,value:value,percent:percent}
    }
    return columnData
}
function setupCensusGeoMaps(){
    var midpoint = pub.midpoint
    drawDirection(pub.coordinates,midpoint.lat,midpoint.lng)
    var chartsToDraw=["B07201002","B08301010","B25003003","B25002003","B19057002","B19001017","B19001002","B16002002","B16002003","B16002006","B16002009",  "B15012002"]
    for(var c in chartsToDraw){
        var chartCode = chartsToDraw[c]
        drawChart(chartCode)
    }
    //drawChartsForTable("B02001")
    //drawChartsForTable("B19013")
    //drawChartsForTable("B23025")

    
}

function drawChartsForTable(tableCode){
    var columnCodes = Object.keys(pub.returnedData[Object.keys(pub.returnedData)[0]].tables[tableCode].columns)
    for(var i in columnCodes){
        if(i!=0){
            var columnCode = columnCodes[i]
            drawChart(columnCode)
        }
    }
}

function drawChart(columnCode){
    var width = window.innerWidth
    var margin = 35
    var height = 100
    var chartSvg = d3.select("#charts").append("div").attr("class",columnCode)
        .append("svg").attr("width",width).attr("height",height)
    var barWidth = (width)/pub.coordinates.length
    var title = getTitle(columnCode,pub.coordinates[0].id)
    var yScale = d3.scale.linear().domain([0,100]).range([height-margin,margin])
    var xScale = d3.scale.linear().domain([0,pub.distance]).range([0, width-margin*2]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5)
        .tickSize(3);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(function(d){return d+"%"})
        .ticks(3);
        
    chartSvg.append('text').text(title).attr("x",10).attr("y",20).attr("font-size",12)
    chartSvg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin + ",0 )")
        .call(yAxis)
        
    chartSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin + ","+(height-margin)+")")
        .call(xAxis)
        
    var data = returnColumnData(columnCode)
    chartSvg.selectAll("."+columnCode)
            .data(pub.coordinates)
            .enter()
            .append("circle")
            .attr("class",columnCode)
            .attr("r",2)
            .attr("fill","red")
            .attr("cx",function(d,i){return xScale(i*pub.increment)})
            .attr("cy",function(d){
                var gid = d.id
                return yScale(data[gid]["percent"])
            })
            .attr("transform","translate("+margin+","+0+")")
    var lineFunction = d3.svg.line()
            .x(function(d,i){ return xScale(i*pub.increment)})
            .y(function(d){
                var gid = d.id
                return yScale(data[gid]["percent"])
            })
            .interpolate("linear");
	chartSvg.append("path")
    		.attr("class","intersected2")
    		.attr("d",lineFunction(pub.coordinates))
    		//.attr("stroke","red")
            .attr("stroke",function(){
                return "red"
            })
            .attr("fill","none")
            .attr("stroke-width",1)
            .attr("stroke-opacity",.5) 
            .attr("transform","translate("+margin+","+0+")")
            
}

function drawCensusGeoMap(geoData,columnData){
    console.log(geoData)
    var geoId = geoData.properties["full_geoid"]   
    var width = window.innerWidth
    var height = window.innerWidth
    var fillScale = d3.scale.linear().domain([0,100]).range(["green","red"])
    var colors = geoColors
    var svg = d3.select("#map svg")//.append("g").attr("class","intersect")
    var center =pub.coordinates[0]
    var lat = center.lng
    var lng = center.lat
    var projection = d3.geo.mercator()
        .scale((1 << 21) / 2 / Math.PI)
        .center([lng,lat])		    
        .translate([width/2,height/2])

    var lineFunction = d3.svg.line()
        .x(function(d){ return projection([d[0],d[1]])[0]})
        .y(function(d){return projection([d[0],d[1]])[1]})
        .interpolate("linear");
         
	svg.append("path")
		.attr("class","intersected2")
		.attr("d",lineFunction(geoData.geometry.coordinates[0]))
		//.attr("stroke","red")
        .attr("stroke",function(){
            return "none"
            console.log(fillScale(columnData[geoId].percent))
            return fillScale(columnData[geoId].percent)
        })
        .attr("fill",function(){
            return fillScale(columnData[geoId].percent)
        })
        .attr("stroke-width",5)
        .attr("fill-opacity",.5)    

}
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}