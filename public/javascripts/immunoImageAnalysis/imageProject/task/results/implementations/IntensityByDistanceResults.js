var IntensityByDistanceResults = Results.extend(function(task,saveValues){

	this.visualization = IntensityByDistanceVisualization

}).methods({

	addData: function(group,name,vals){		
		var found = -1
		for(var i=0; i<this.data.length; i++){
			if(this.data[i].group === group && this.data[i].name === name){
				found = i;
				break;
			}				
		}

		if(found === -1)
			this.data.push({group:group,name:name,vals:vals})
		else
			this.data[found] = {group:group,name:name,vals:vals}

		$('#'+this.id + ' svg').remove()
		this.visualize()
	},

	visualize: function(){
		var that = this;

		var groups = _.unique(that.data.map(function(d){return d.group}))

		var initVector = new Array(200); for(var i=0; i<200; i++){ initVector[i] = 0.0}

		var groupValues = groups.map(function(group){
			var groupData = that.data.filter(function(datum){return datum.group===group})

			//map each group to {name:groupname,values:avg_groupvalues}
			function valsReduce(acc,picData){
				for(var i=0; i< 200; i++){
					if(picData.vals[i] != undefined)
						acc[i] = acc[i] + picData.vals[i]/groupData.length
				}
				return acc
			}

			return {name:group, values:groupData.reduce(valsReduce,initVector.slice(0))}					
		})		
		
		this.visualization({el:$('#'+that.id).get(0),groupValues:groupValues,colors:that.colors})
	},

	dataCSVStr: function() {
		var that = this;
		var groups = _.unique(that.data.map(function(d){return d.group}))
		var initVector = new Array(200); for(var i=0; i<200; i++){ initVector[i] = 0.0}		

		var groupValues = groups.map(function(group){
			var groupData = that.data.filter(function(datum){return datum.group===group})

			//map each group to {name:groupname,values:avg_groupvalues}
			function valsReduce(acc,picData){
				for(var i=0; i< 200; i++){
					if(picData.vals[i] != undefined)
						acc[i] = acc[i] + picData.vals[i]/groupData.length
				}
				return acc
			}
			var averages = groupData.reduce(valsReduce,initVector.slice(0))

			function varReduce(acc,picData){
				for(var i=0; i< 200; i++){
					if(picData.vals[i] != undefined)
						acc[i] = acc[i] + Math.pow(picData.vals[i]-averages[i],2)/groupData.length
				}
				return acc				
			}
			
			var variances = groupData.reduce(varReduce,initVector.slice(0))

			return {name:group, values:averages, variances: variances}					
		})	

		console.log(groups.length,groupValues.length,groupValues[0].values.length)
		//include group,distance,avg,variance columns	    	    
		var str = 'group,distance,average,variance\n' 
		for(var j=0; j<groupValues.length;j++){
			var group = groupValues[j]
			console.log("group",group)
			for(var i=0; i<group.values.length; i++){
				str += group.name + "," + i + "," + group.values[i] +"," + group.variances[i] + "\n"
			}
		}
		return str;    
	},
})