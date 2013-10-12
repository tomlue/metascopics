var CentroidSurfaceResults = Results.extend(function(task,saveValues){
	this.visualization = CentroidSurfaceDistanceVisualization
}).methods({

	visualize: function(){				
		var that = this;			
		var names = _.unique(this.data.map(function(d){return d.group}))
		var groupValues = names.map(function(name){		
			var groupData = that.data.filter(function(data){ return data.group === name})
			var values = groupData.map(function(val){return val.val})
			return {name:name,values:values}
		})
		
		CentroidSurfaceDistanceVisualization({el:$('#'+that.id).get(0),groupValues:groupValues})
	}

})