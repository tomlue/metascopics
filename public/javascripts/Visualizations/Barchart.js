var Barchart = function(args){
	var el = args.el;	
	var values = args.values
	var colors = ['maroon','steelblue','660066','6666FF']

	$('.results svg').remove()	
	

	var margin = {top: 20, right: 30, bottom: 30, left: 40},
	    width = 380 - margin.left - margin.right,
	    height = 250 - margin.top - margin.bottom;

	var x = d3.scale.linear()
	    .domain([0, values.length])
	    .range([0, width]);

	var y = d3.scale.linear()
	    .domain([0, d3.max(values)])
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(d3.format("%"));

	var svg = d3.select(el).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");  

	svg.selectAll("rect")
		.data(values)
		.enter().append("rect")
		.attr("x", function(v,i){ return i*5;})
		.attr("width",4)
		.attr("height",function(v){return height - y(v)})
		.attr("y",function(v){return y(v)})

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	  .append("text")
	    .attr("class", "label")
	    .attr("x", width)
	    .attr("y", -6)	    
	    .attr("fill","white")
	    .style("text-anchor", "end")
	    .text("Distance");

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)	
}