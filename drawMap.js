function drawBaseMap(lat,lng){
    console.log("draw base map")
    
    var div = "map"
    var width = Math.max(500, window.innerWidth)
    var height = Math.max(500, window.innerWidth);
    var svg = d3.select("#map").append("svg").attr("width",width).attr("height",height)
    var center = [lng, lat]
    
    var tiler = d3.geo.tile()
        .size([width, height]);

    var projection = d3.geo.mercator()
        .center(center)
        .scale((1 << 21) / 2 / Math.PI)
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
              .attr("class", function(d) { return d.properties.kind; })
              .attr("d", path);
          });
        });
}

function drawDirection(points,lat,lng){
    console.log(points)
    var center = [lng, lat]
    var width = Math.max(500, window.innerWidth)
    var height = Math.max(500, window.innerWidth);
    var projection = d3.geo.mercator()
        .center(center)
        .scale((1 << 21) / 2 / Math.PI)
        .translate([width / 2, height / 2]);
    var svg = d3.select("#map svg")
        
    var cross = d3.svg.symbol().type('cross')
    		.size(40);
        
    svg.append("path").attr("class","location")
        .attr("d",cross)
    	.attr('transform',function(d,i){
            var projectedLng = projection([lng,lat])[0]
            var projectedLat = projection([lng,lat])[1]
             return "translate("+projectedLng+","+projectedLat+") rotate(-45)"; 
             });            
    
    svg.selectAll("circle").append("g").attr("class","dot")
            .data(points)
             .enter()
             .append("circle")
             .attr("r",2)
             .attr("fill","#000")
             .attr("cx",function(d){
                var projectedLng = projection([d.lat,d.lng])[0]
                 return projectedLng
             })  
             .attr("cy",function(d){
                var projectedLat = projection([d.lat,d.lng])[1]
                var projectedLng = projection([d.lat,d.lng])[0]
                 
                 console.log([projectedLat,projectedLng])
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
function drawMapLayer(geoData,width,height){
    
//    var width = 300
//    var height = 300
    
    var colors = geoColors
    var svg = d3.select("#map svg")
        
        //need to generalize projection into global var later
    var center = [pub.coordinates[1],pub.coordinates[0]]
    var lat = center[1]
    var lng = center[0]
    
    var projection = d3.geo.mercator()
        .scale((1 << 21) / 2 / Math.PI)
    .center(center)		    
        .translate([width/2,height/2])

        //d3 geo path uses projections, it is similar to regular paths in line graphs
    var path = d3.geo.path().projection(projection);
    var lineFunction = d3.svg.line()
        .x(function(d){
            return projection([d[0],d[1]])[0]
        })
        .y(function(d){
           // console.log(projection([d[0],d[1]])[1])
            return projection([d[0],d[1]])[1]})
        .interpolate("linear");
        //push data, add path
        //[topojson.object(geoData, geoData.geometry)]   
         
	svg.selectAll("path")
        .append("path")
		.attr("class","county")
		.attr("d",lineFunction(geoData["countyGeo"].geometry.coordinates[1]))
		.attr("stroke",colors.county)
        .attr("stroke-width",5)
        .attr("fill",colors.county) 
        .attr("opacity",1)    

	svg
        .append("path")
		.attr("class","tract")
		.attr("d",lineFunction(geoData["tractGeo"].geometry.coordinates[0]))
		.attr("stroke",colors.tract)
        .attr("fill",colors.tract)  
        .attr("stroke-width",4)
        .attr("opacity",1)        
        
	svg
        .append("path")
		.attr("class","blockGroup")
		.attr("d",lineFunction(geoData["blockGeo"].geometry.coordinates[0]))
		.attr("stroke",colors.blockGroup)
        .attr("stroke-width",2)
        .attr("fill",colors.blockGroup)
        .attr("opacity",1)

    var cross = d3.svg.symbol().type('cross')
			.size(20);
            
    svg.append("path").attr("class","location")
        .attr("d",cross)
		.attr('transform',function(d,i){
            var projectedLng = projection([lng,lat])[0]
            var projectedLat = projection([lng,lat])[1]
             return "translate("+projectedLng+","+projectedLat+") rotate(-45)"; 
             });
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