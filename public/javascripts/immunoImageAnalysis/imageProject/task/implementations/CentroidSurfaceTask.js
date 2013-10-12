var CentroidSurfaceTask = Task.extend(function(params,dir){
	
	this.editor  = new Editor(this);	
	this.results = new CentroidSurfaceResults(this,params.results)
	this.type = "centroidSurfaceDistance"
	
}).methods({

	//need to overide analyseImage to analyse for intensity/distance averaging
	analyseImage: function(enrichedImage,canvas){ 		
			
		var that = this;
		var pars = enrichedImage.taskPars[this.name]
		if(!pars)
			pars = $.extend(true,{},that.editor.defaultPars)
						
		var options   = {
			minRed  : pars.minRed, 
			minGreen: pars.minGreen, 
			minBlue : 0.0, 
			roi     : pars.sroi
		}
		
		var tempImage = new Image();	
		
		tempImage.onload = function(){			
			ImmunoEye.centroidSurfaceDistances(				
				tempImage, options, function(results){					
					if(canvas){ that.editor.setImageValues(results) }	
					enrichedImage.updateValues(that,results);
					that.results.addData(enrichedImage.group.name,enrichedImage.filename,results)	
					that.save(function(){console.log("task is saved")});				
				}, canvas)
		}
		tempImage.src = enrichedImage.imgsrc	
	}

})

