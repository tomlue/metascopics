// creates multiple histograms
// takes data of form [{name:name,values:[val,val,val] }]

function CentroidSurfaceDistanceVisualization(args){
	
	//MUNGE DATA INTO RIGHT SHAPE
	var el = args.el		
	var groupValues = args.groupValues	
	var numbins = 30;
	
	//get the names out of group values and the values out of group values
	var names = groupValues.map(function(d){return d.name})		
	groupValues = groupValues.map(function(d){return d.values})	
	var allValues = groupValues.reduce(function(acc,vals){return acc.concat(vals)})

	//LAYOUT ARGUMENTS
	var margin = {top: 20, right: 30, bottom: 30, left: 70},
	    width = 680 - margin.left - margin.right,
	    height = 290 - margin.top - margin.bottom;
	
	var x = d3.scale.linear()
	    .domain([0, d3.max(allValues)])
	    .range([0, width]);

	var z = d3.scale.ordinal().range(["#C71585", "#48D1CC","7B68EE","7B68EE"])

	//DATA VARIABLES	
	var hist = d3.layout.histogram()
				.frequency(false)
				.range([0,d3.max(allValues)])
				.bins(function(range,values){										
					var numValues = allValues.length
					var maxval = d3.max(allValues)
					var bins = [0]
					var binThresh = 0					
					for(var i=1; i<numbins; i++){
						binThresh += maxval/numbins
						bins.push(binThresh)
					}					
					return bins
				})

	var data = groupValues.map(function(vals){return hist(vals)})
	console.log("data is",data)
	var y = d3.scale.linear()
	    .domain([0, 1.0])
	    .range([height, 0]);	

	//MAKING THE GRAPHICS
	var svg = d3.select(el).append("svg")
		.style('background-color','rgb(255,255,255)')		
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
	
	var layer=-1;	
	groups.selectAll("rect")
				.data(Object)
	    		.enter().append("rect")
	      			.attr("x", function(d,i) {
						if(i==0)
							layer++	      					
	      				return x(d.x) + layer*(x(d.dx)-5)/names.length
	      			})
	      			.attr("width", function(d){ return (x(d.dx)-5)/names.length })   			
	      			.attr("y", function(d,i) { return y(d.y) })
	      			.attr("height", function(d,i){ return height-y(d.y); })

	function kernelDensityEstimator(kernel, x) {
	  	return function(sample) {
	    	return x.map(function(x) {
	      		return [x, d3.mean(sample, function(v) { return kernel(x - v); })];
	    	});
		};
	}

	function epanechnikovKernel(scale) {
 	 	return function(u) {
    		return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
  		};
	}

	var kde = kernelDensityEstimator(epanechnikovKernel(7), x.ticks(allValues.length));
	var areaVals = groupValues.map(kde)

	var area = d3.svg.area()
    			.x(function(d) { return x(d[0]); })    			    			
    			.y0(function(d,i){ 
    				var indexVals = data.map(function(vals){
      					if(vals[i]){return vals[i].y} else{return 0}}).sort()//.reverse()
      				var thisVal = indexVals.indexOf(d.y)
      				// if(thisVal === indexVals.length-1)
      					return y(d[1]) 
      				// else
      					// return y(d[1]-indexVals[thisVal+1]) 
    			})
    			.y1(function(d){ return y(d[1]) })
   	
   	// console.log(areaVals)
   	
	// for(var i=0; i<names.length;i++){		
	// 	svg.selectAll("path.area")
	// 		.data(areaVals)
	// 		.enter().append("path")
	// 		.attr("class","area")
	// 		.attr("d",area)
	// 		.style("fill",function(d,i){return z(i)})
	// 		.style("stroke",function(d,i){return z(i)})
	// 		.style("opacity","0.75")
	// }


	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")	    
	    .call(xAxis)

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    // .tickFormat(d3.format(""));

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	

	var legend = svg.selectAll("g.legend")
	var activatedNames = names.map(function(name){return {name:name,activated:true}})
	
	function drawStackedData(data){		
		var thisdata = data.filter(function(vals){return vals.length > 0})
		
		groups = svg.selectAll("g.group")		
			.data(data)
			.enter().append("g")
			.attr("class","group")
			.attr("id",function(d,i){return names[i]})
			.style("fill",function(d,i){return z(i);})
			.style("stroke",function(d,i){return d3.rgb(z(i)).darker();})
		
		groups.selectAll("rect")
				.data(Object)
	    		.enter().append("rect")
	      			.attr("x", function(d) { return x(d.x)})
	      			.attr("width", function(d){ return x(d.dx) })   			
	      			.attr("y", function(d,i) { return y(d.y) })
	      			.attr("height", function(d,i){ 	      				
	      				var indexVals = data.map(function(vals){
	      					if(vals[i]){return vals[i].y} else{return 0}}).sort().reverse()
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
	        	console.log("data is",data)     	
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
	        .text(function(d){ return d; });
	
	svg.selectAll("g.params").data(["numbins:"+numbins,"pix/bin:"+Math.round(x.domain()[1]/numbins)])
			.enter().
			append('text')
				.attr("class","params")
				.attr('x',function(d,i){ return width-100})
				.attr('y',function(d,i){ return names.length*20 + i*20 + 10})				
		        .attr('height', 10)	        
		        .text(function(d){return d;});
}