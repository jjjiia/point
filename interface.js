//  d3.select("#main").append("div").attr("class","title").attr("id","title").html("you are here - test, do not share")
//  d3.select("#main").append("div").attr("class","section jumbotron").attr("id","data").html("data")

  d3.select("#header").append("div").attr("class","section").attr("id","coordinates").html("coordinates")
 // d3.select("#main").append("div").attr("class","section").attr("id","orientation").html("orientation")
  d3.select("#header").append("div").attr("class","section").attr("id","censusLabelFCC").html("census geography from FCC")
 // d3.select("body").append("div").attr("class","section").attr("id","censusLabelCensus").html("census geography from Census")
  d3.select("#main").append("div").attr("class","section col-lg-4 col-md-4").attr("id","map")//.html("MAP")
 
//  d3.select("#main").append("div").attr("class","col-sm-4").attr("id","map2")//.html("MAP")
  d3.select("#main").append("div").attr("class","section col-lg-4 col-md-4").attr("id","paragraph").html("paragraph")
  d3.select("#main").append("div").attr("class","section col-lg-4 col-md-4").attr("id","key")//.html("MAP")

  d3.select("#main").append("div").attr("class","col-lg-4 col-md-4 col-sm-12").attr("id","barCharts")
//.html("charts")

//  d3.select("#main").append("div").attr("class","section charts col-sm-3").attr("id","charts")//.html("charts")


 // d3.select("#main").append("div").attr("class","section").attr("id","compass")
var geoColors = {
    county:"#d1902e",
    blockGroup:"#e64821",
    tract:"#45b865"
}