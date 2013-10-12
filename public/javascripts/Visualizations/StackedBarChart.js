
function StackedBarChart(args){
	var el = args.el	
	var groupValues = args.groupValues	
	var values = groupValues.map(function(d){return d.values})
	var allValues = values.reduce(function(allval,val){return allval.concat(val)})
	
	groupValues = groupValues.map(function(group){
		var i =0;
		var values =  group.values.map(function(val){
							var returnval = {x:i,y:val}
							i++;
							return returnval;
						})
						
		return {name:group.name,values:values}
	})

	var margin = {top: 20, right: 30, bottom: 30, left: 50},
	    width = 410 - margin.left - margin.right,
	    height = 310 - margin.top - margin.bottom;
	
	var x = d3.scale.linear()
	    .domain([0, values[0].length])
	    .range([0, width*2]);

	var y = d3.scale.linear()
	    .domain([0, d3.max(allValues)])
	    .range([height, 0]);	

	var z = d3.scale.ordinal().range(["#C71585", "#48D1CC","#7B68EE","white"])

	var stack = d3.layout.stack()

	var data = stack(groupValues.map(function(d){return d.values}))
	var names = groupValues.map(function(d){return d.name})		
	 
	var svg = d3.select(el).append("svg")
		.style('background-color','rgb(200,200,200)')		
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)	    
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var groups = svg.selectAll("g.group")		
		.data(data)
		.enter().append("g")
		.attr("class","group")
		.attr("id",function(d,i){return names[i]})
		.style("fill",function(d,i){return z(i);})
		.style("stroke",function(d,i){return d3.rgb(z(i)).darker();})
	
	var layeridx = -1
	groups.selectAll("rect")
				.data(Object)
	    		.enter().append("svg:rect")
	      			.attr("x", function(d,i) { return x(i); })
	      			.attr("width",x(1))   			
	      			.attr("y", function(d,i) { return y(d.y) })
	      			.attr("height", function(d,i){
	      				var indexVals = values.map(function(vals){return vals[i]}).sort().reverse()
	      				var thisVal = indexVals.indexOf(d.y)
	      				if(thisVal === indexVals.length-1)
	      					return height-y(d.y); 
	      				else
	      					return height-y(d.y-indexVals[thisVal+1])
	      			})


	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

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

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(d3.format(".1%"));

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	

	var legend = svg.selectAll("g.legend")
	var activatedNames = names.map(function(name){return {name:name,activated:true}})
	
	function drawStackedData(data){
		console.log("data is",data)
		var thisvalues = data.map(function(xyvals){return xyvals.map(function(val){ return val.y})})
		groups = svg.selectAll('g.group')
			.data(data).enter()
			.append("g")
				.attr("class","group")
				.attr("id",function(d,i){return names[i]})
				.style("fill",function(d,i){return z(i);})
				.style("stroke",function(d,i){return d3.rgb(z(i)).darker();})

		var layeridx = -1
		groups.selectAll("rect")
				.data(Object)
	    		.enter().append("svg:rect")
	      			.attr("x", function(d,i) { return i*5; })
	      			.attr("width",4)   			
	      			.attr("y", function(d,i) { return y(d.y) })
	      			.attr("height", function(d,i){
	      				var indexVals = thisvalues.map(function(vals){return vals[i]}).sort().reverse()
	      				var thisVal = indexVals.indexOf(d.y)
	      				if(thisVal === indexVals.length-1)
	      					return height-y(d.y); 
	      				else
	      					return height-y(d.y-indexVals[thisVal+1])
	      			})
	}	

	legend.data(names).enter()
		.append('rect')
			.attr('x', width-20)
			.attr('y', function(d, i){ return i *  20;})
	        .attr('width', 10)
	        .attr('height', 10)
	        .style('fill', function(d,i) { return z(i) })
	        .style('cursor','pointer')
	        .on("click",function(d,i){
	        	console.log("I got clicked!")
	        	groups.remove();
	        	activatedNames[i].activated = !activatedNames[i].activated	        	

	        	var newData = []
	        	for(var j=0; j<activatedNames.length; j++){
	        		if(activatedNames[j].activated)
	        			newData.push(data[j])
	        		else
	        			newData.push([])	        			
	        	}

	        	drawStackedData(newData)	    		
	        })

	legend.data(names).enter()
	    .append('text')
	        .attr('x', width - 8)
	        .attr('y', function(d, i){ return i*20 + 10;})
	        .text(function(d){ return d; })
	        .style('cursor','pointer')
}