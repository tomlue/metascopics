var TailsTask = Task.extend(function(params,dir){
	
	this.editor  = new PaintObjectEditor(this);	
	this.results = new Results(this,params.results)
	this.type = "TailsTask"
	
}).methods({

	//need to overide analyseImage to analyse for intensity/distance averaging
	analyseImage: function(enrichedImage,canvas){ 		
			
		var that = this;
		var options = enrichedImage.taskPars[this.name]
		var tempImage = new Image()
				
		tempImage.onload = function(){			
			ImmunoEye.ObjectLength(				
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

