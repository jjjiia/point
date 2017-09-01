var tables = []
function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(usePosition);
  } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function formatLocation(position){
    var lng = position.coords.longitude
    var lat = position.coords.latitude        
    var alt = position.coords.altitude 
    pub.coordinates = [lat,lng]
    d3.select("#coordinates").html("<strong>Lat:</strong> "+Math.round(lat*1000000)/1000000+" <strong>Lng:</strong> "+Math.round(lng*10000)/10000+" <strong>Alt:</strong> "+Math.round(alt*1000000)/1000000)//+"<br/>"+speed+"<br/>"+alt+"<br/>"+heading)
    
//  var testCoordinate = [33.949564, -91.198632]
//  pub.coordinates =testCoordinate
//  return testCoordinate
    return [lat,lng]
    
}

//var sampleLocation = [40.718914, -73.9547791]  
//var sampleUrl_fcc = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude=40.718914&longitude=-73.9547791"
//var smapleUrl_census = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=4600+Silver+Hill+Rd%2C+Suitland%2C+MD+20746&benchmark=9&format=json"

function usePosition(position) {
    var latLng = formatLocation(position)
    var lat = latLng[0]
    var lng = latLng[1]
    var fccUrl = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+lat+"&longitude="+lng       
    getCensusId(fccUrl,"jsonp","formatCensusIds")
    
//var censusUrl =" https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=4600+Silver+Hill+Rd%2C+Suitland%2C+MD+20746&benchmark=9&format=jsonp"
//getJson(censusUrl,"jsonp","censusGeography")
}
function getCensusId(url,type,callBack){
    $.ajax({
    url: url,
    dataType: type,
    jsonpCallback: callBack
    });
}
//employeement B23025
//income  B19001
//education B15002
//language B16007
//place of birth B05006
//mobility B07003
//realestate B25075
var t1 = "B01003,B01002,B25002,B02001,B25003,B07201,B15003"
var t2 = ",B08301,B08302,B08303"
var t3 = ",B25064,B15012,B16002,B19001,B27010,B19013"
var t4 = ",B19057"
var t5 = ",B23025"

var saveForLater = "C15010,B19055,B24080,B25004,B25006,B25034,B08134,B25035,B25041,B25065,B25069,B19053,B19059,B25061,C24030,B25081,B16004,"

allTables = t1+t2+t3+t4+t5
console.log("showing this many tables: "+allTables.split(",").length)

function makeParagraph(){
var paragraph = "<strong>You are at </strong> a place where the median age is "
+formatValues(getValue("B01002001","blockGroup"))+" "
+"and the population is "+formatValues(getTopRanked("B02001",4,"blockGroup"))+". "
+formatPercents(getPercent("B16002002","blockGroup"))+" of households speak only English, "
+formatPercents(getPercent("B16002003","blockGroup"))+" of households are Spanish speaking, "
+formatPercents(getPercent("B16002006","blockGroup"))+" speak other Indo-European languages, and "
+formatPercents(getPercent("B16002009","blockGroup"))+"speak Asian and Pacific Island languages. "
+"<br/>"
+"<br/>"
+formatPercents(getPercent("B07201002","blockGroup"))+ " lived in the same house last year, while "
+formatPercents(getPercent("B07201007","blockGroup"))+" moved from a different city(Metropolitan Statistical Area), and "
+formatPercents(getPercent("B07201014","blockGroup"))+" moved from a different country."
+"<br/>"
+"<br/>"

+formatPercents(getPercent("B08301010","blockGroup"))+" commute on public transportation, "
+formatPercents(getPercentSum(["B08302003","B08302002","B08302004"],"blockGroup"))+ " leave for work before 6am. "
+formatPercents(getPercentSum(["B08303002","B08303003","B08303004","B08303005","B08303006","B08303007"],"blockGroup"))
+" have commutes that are less than 30 minutes long."
    
+"<br/>"
+"<br/>"
    
+formatPercents(getPercentSum(["B15003022","B15003023","B15003024","B15003025"],"blockGroup"))+" hold a Bachelor's degree, "
+formatPercents(getPercentSum(["B15003023","B15003024","B15003025"],"blockGroup"))+" hold a Master's degree, and "
+getPercent("B15003025","blockGroup")+"% hold a  Doctorate. "
+"The most popular fields of undergraduate study were "+ formatValues(getTopRanked("B15012",5,"blockGroup"))+". "
+"<br/>"
+"<br/>"
    
+formatPercents(getPercent("B23025005","blockGroup"))+" are unemployed. "
+formatPercents(getPercentSum(["B27010017","B27010033","B27010050","B27010066"],"blockGroup"))+" have no insurance coverage. "
+getPercent("B19057002","blockGroup")+"% receive public assistance income. "
+"<br/>"
+"<br/>"
    
+ "The median household income is "+ formatMoney(getValue("B19013001","blockGroup"))+". "
+ formatPercents(getPercentSum(["B19001002","B19001003","B19001004","B19001005","B19001006"],"blockGroup"))+" of households make less than $30,000, and "
+ formatPercents(getPercentSum(["B19001014","B19001015","B19001016","B19001017"],"blockGroup"))+" of households make more than $100,000."
+"<br/>"
+"<br/>"

+formatPercents(getPercent("B25002002","blockGroup"))+" of residences are occupied. "
+formatPercents(getPercent("B25002002","blockGroup"))+" of occupied residences are rentals."
d3.select("#paragraph").html(paragraph)
}
var colors = ["#de4645","#4dbb31","#ea4a73","#45b865","#e64821","#87b733","#b3324f","#5b821d","#a5361a","#b1a930","#d77231","#d1902e"]


function getPercent(code,geoGroup){
    var table = code.substr(0, code.length -3)
    var codeValue = returnedData[geoGroup].data[Object.keys(returnedData[geoGroup].data)][table].estimate[code]
    var totalCode = table+"001"
    var totalValue = returnedData[geoGroup].data[Object.keys(returnedData[geoGroup].data)][table].estimate[totalCode]
    var percent = codeValue/totalValue*100
    return percent
}

function formatPercents(percent){
    var color = colors[Math.round(Math.random()*colors.length)]
    return "<span style=\"color:"+color+"\"><strong>"+Math.round(percent)+"%</strong></span>"
}
function formatMoney(money){
    var color = colors[Math.round(Math.random()*colors.length)]
    money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "<span style=\"color:"+color+"; font-size = 24px\"><strong>$"+money+"</strong></span>"
}
function formatValues(value){
    var color = colors[Math.round(Math.random()*colors.length)]
    return "<span style=\"color:"+color+"\"><strong>"+value+"</strong></span>"
}

function getPercentSum(codes,geoGroup){
    var sum = 0
    for(var c in codes){
        var code = codes[c]
        sum+=getPercent(code,geoGroup)
    }
    return sum
}
function getTitle(code){
    var table = code.substr(0, code.length -3)
    var codeTitle = returnedData["blockGroup"].tables[table].columns[code].name    
    return codeTitle
}
function getTableData(tableCode){
    var formattedGData = {}
    for(var i in returnedData){
        formattedGData[i] = []
        var gData = returnedData[i]
        var codes = Object.keys(gData.data[Object.keys(gData.data)][tableCode].estimate)
        var totalCode = tableCode+"001"
        var tableCodeIndex = codes.indexOf(totalCode)
        codes.splice(tableCodeIndex,1)
        for(var c in codes){
            var code = codes[c]
            var codeValue = gData.data[Object.keys(gData.data)][tableCode].estimate[code]
            formattedGData[i].push([code,codeValue])
        }
      //  var sorted = formattedGData.sort(function(a,b){
      //      return b[1]-a[1];
      //  });
     
    }
    return formattedGData
}

function getTopRanked(tableCode,ranks,geoGroup){
    
   var unsorted = getTableData(tableCode,geoGroup)["blockGroup"]

    var sorted = unsorted.sort(function(a,b){
            return b[1]-a[1];
        });
    var tops = sorted.slice(0,ranks)
    
    var s =""
    for(var t in tops){
       // console.log(t)
        var code = tops[t][0]
        var codeValue = Math.round(getPercent(code,geoGroup))
        var codeTitle = getTitle(code,geoGroup)
    var color = colors[Math.round(Math.random()*colors.length)]
     s+="<span style=\"color:"+color+"\">"+codeTitle+"("+codeValue+"%), "+"</span>"
    }
    
    s = s.slice(0,s.lastIndexOf(", "))
    s = s.substring(0,s.lastIndexOf(","))+", and "+s.substring(s.lastIndexOf(",")+1)
    return s
}
function getValue(code,geoGroup){
    var table = code.substr(0, code.length -3)
    var codeValue = returnedData[geoGroup].data[Object.keys(returnedData[geoGroup].data)][table].estimate[code]
    return codeValue
}
var returnedData = null
var returnedGeoData = null
function formatCensusIds(json){
    var blockGroupid = "15000US"+json.Block.FIPS.slice(0,12)
    var county = "050|04000US"+json.County.FIPS
    var tractId = "14000US"+json.Block.FIPS.slice(0,11)
    
    d3.select("#censusLabelFCC").html("<strong>Block Group:</strong> "+blockGroupid)
    pub.censusId = blockGroupid
    getCensusData(pub.censusId,tractId,county,allTables,json)
//    var tableName = "B01002"
}

//https://api.censusreporter.org/1.0/data/show/latest?table_ids=B01001&geo_ids=16000US5367000

function getCensusData(geoid,tractId,county,tableCode,json){
    var allData = []
    var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+tableCode+"&geo_ids="+geoid
    $.getJSON( censusReporter, function( blockGroupData ) {
        allData["blockGroup"]=blockGroupData
        var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+tableCode+"&geo_ids="+tractId
        $.getJSON( censusReporter, function( tractData ) {
            allData["tract"]=tractData
            var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+tableCode+"&geo_ids="+county           
            $.getJSON( censusReporter, function( countyData ) {
                allData["county"]=countyData
                returnedData = allData
                formatCensusData(countyData)                
            });    
        });
    });
    
    var allGeoData = {}
    var blockGeoRequest = "https://api.censusreporter.org/1.0/geo/tiger2015/"+geoid+"?geom=true"
    var tractGeoRequest = "https://api.censusreporter.org/1.0/geo/tiger2015/"+tractId+"?geom=true"
    var countyGeoRequest = "https://api.censusreporter.org/1.0/geo/tiger2015/"+"05000US"+json.County.FIPS+"?geom=true"
    $.getJSON( blockGeoRequest, function( blockGeoData ) {
        allGeoData["blockGeo"]=blockGeoData
        $.getJSON( tractGeoRequest, function( tractGeoData ) {
            allGeoData["tractGeo"]=tractGeoData
            $.getJSON( countyGeoRequest, function( countyGeoData ) {
                allGeoData["countyGeo"]=countyGeoData
                returnedGeoData = allGeoData
                drawMap(allGeoData)
            });
        });
    });
}

var columnsToDisplay = []


function displayDataText(data){
    var dt = ""
    
    var tables = Object.keys(data["blockGroup"].tables)
    
    for(var i in tables){
        var table = tables[i]
        var tableName = getTableName(table)
        var tableData = getTableData(table)
        var color = colors[Math.round(Math.random()*colors.length)]
        dt+="</br><span style=\"color:"+color+"; font-size = 24px\"><strong>"+tableName+"</strong></span></br>"
        
        for(var g in tableData){
            var geoLabel = g
            var geoData = tableData[g]
            dt+="<strong>"+geoLabel+"</strong><br/>"
            
            for(c in geoData){
                var code = geoData[c][0]
                var value = geoData[c][1]
                var percent = getPercent(code,geoLabel)
                var title = getTitle(code)
                dt+=code+" "+title+": "+value+"("+Math.round(percent)+"%)"+"<br/>"
            }
            break
        }
    }
    
    d3.select("#data").html(dt)
}
function formatCensusData(data){
    //returnedData = data
	
//Call function to draw the Radar chart
  //  RadarChart(".charts", "B02001");
 //   RadarChart(".charts", "B08301");
//RadarChart(".charts", formatDataRadar("B08301"), radarChartOptions);
//RadarChart(".charts", formatDataRadar("B08303"), radarChartOptions);
//RadarChart(".charts", formatDataRadar("B15003"), radarChartOptions);

   displayDataText(returnedData)
    makeParagraph()
    makeCharts()
}
//var url = "https://api.censusreporter.org/1.0/geo/tiger2013/16000US5367000/parents"



getLocation()