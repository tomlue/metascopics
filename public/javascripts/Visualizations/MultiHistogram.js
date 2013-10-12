// creates multiple histograms
// takes data of form [{name:name,values:[val,val,val] }]

function MultiHistogram(args){
	
	//MUNGE DATA INTO RIGHT SHAPE
	var el = args.el		
	var groupValues = args.groupValues
	var numBins = 100;	
	
	//get the names out of group values and the values out of group values
	var names = groupValues.map(function(d){return d.name})		
	groupValues = groupValues.map(function(d){return d.values})
	var xyGroupValues = groupValues.map(function(vals){
		var x = -1;
		return vals.map(function(y){ x++; return {x:x,y:y}})
	})		

	//LAYOUT ARGUMENTS
	var margin = {top: 20, right: 30, bottom: 30, left: 70},
	    width = 480 - margin.left - margin.right,
	    height = 290 - margin.top - margin.bottom;
	
	var x = d3.scale.linear()
	    .domain([0, groupValues[0].length])
	    .range([0, width]);

	
	var z = d3.scale.ordinal().range(["#C71585", "#48D1CC","steelblue","7B68EE"])

	//DATA VARIABLES
	var hist = d3.layout.histogram().value(function(val){return val.x}).bins(numBins)
	var data = xyGroupValues.map(function(xyValues){return hist(xyValues)})
	var cumData = data.map(function(arrObjArrays){ 
		return arrObjArrays.map(function(objArray){
			return {y:objArray.reduce(function(acc,obj){return acc+obj.y},0.0),x:objArray.x,dx:objArray.dx}
		})})
	
	var allCumValues = cumData.reduce(function(allval,val){return allval.concat(val)}).map(function(val){return val.y})
		
	var y = d3.scale.linear()
	    .domain([0, d3.max(allCumValues)])
	    .range([height, 0]);	

	//MAKING THE GRAPHICS
	var svg = d3.select(el).append("svg")
		.style('background-color','rgb(255,255,255)')		
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)	    
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var groups = svg.selectAll("g.group")		
		.data(cumData)
		.enter().append("g")
		.attr("class","group")
		.attr("id",function(d,i){return names[i]})
		.style("fill",function(d,i){return z(i);})
		.style("stroke",function(d,i){return d3.rgb(z(i)).darker();})

	var layeridx = -1
	groups.selectAll("rect")
				.data(Object)
	    		.enter().append("rect")
	      			.attr("x", function(d) { return x(d.x)})
	      			.attr("width", function(d){ return x(d.dx) })   			
	      			.attr("y", function(d,i) { return y(d.y) })
	      			.attr("height", function(d,i){ 	      				
	      				var indexVals = cumData.map(function(vals){return vals[i].y}).sort().reverse()
	      				var thisVal = indexVals.indexOf(d.y)
	      				if(i==1)
	      					console.log(indexVals,thisVal)

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
		var thisdata = data.filter(function(vals){return vals.length > 0})
		
		groups = svg.selectAll("g.group")		
			.data(data)
			.enter().append("g")
			.attr("class","group")
			.attr("id",function(d,i){return names[i]})
			.style("fill",function(d,i){return z(i);})
			.style("stroke",function(d,i){return d3.rgb(z(i)).darker();})

		var layeridx = -1
		groups.selectAll("rect")
				.data(Object)
	    		.enter().append("rect")
	      			.attr("x", function(d) { return x(d.x)})
	      			.attr("width", function(d){ return x(d.dx) })   			
	      			.attr("y", function(d,i) { return y(d.y) })
	      			.attr("height", function(d,i){ 	      				
	      				var indexVals = thisdata.map(function(vals){return vals[i].y}).sort().reverse()	      				
	      				var thisVal = indexVals.indexOf(d.y)
	      				if(i==1)
	      					console.log(indexVals,thisVal)

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
	        			newData.push(cumData[j])
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
	        .style('cusor','pointer')
	        .on("click",function(d,i){
	        	console.log("I got clicked!")
	        	groups.remove();
	        	activatedNames[i].activated = !activatedNames[i].activated	        	

	        	var newData = []
	        	for(var j=0; j<activatedNames.length; j++){
	        		if(activatedNames[j].activated)
	        			newData.push(cumData[j])
	        		else
	        			newData.push([])	        			
	        	}

	        	drawStackedData(newData)	    		
	        })
}