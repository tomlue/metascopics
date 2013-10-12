function EnrichedImage(dir,imageGroup,onchange,vals)
{		
	this.group 	  = imageGroup
	this.dir 	  = dir
	this.onchange = onchange

	//vals after this point
	this.filename = vals.filename
	this.imgsrc   = vals.imgsrc
	this.taskPars = {}
	this.taskVals = {}

	if(vals.taskPars){ this.taskPars = vals.taskPars }
	if(vals.taskVals){ this.taskVals = vals.taskVals }
	
	this.attachThumbnail = function(el){
		var that = this;		
		var img = document.createElement('img')
		img.className = "thumb"; img.src = this.imgsrc; $(img).attr("title",escape(this.filename));		
		
		$(img).click(function(){that.thumbOnClick(this)})
		$(img).on("analyseImage",function(e,p1){p1.task.analyseImage(that)})
		el.append(img)
	}
	
	/**
	* When an image is clicked an editImageEvent is sent to all editors
	*/
  	this.thumbOnClick = function(el){
  		
  		var that = this	  		

  		//handle thumb selection class change
  		$('.thumbSelected').removeClass().addClass('thumb')  		
  		$(el).removeClass().addClass("thumbSelected")

  		//send an edit image event to the enrichedimage editors
  		$('.editor').trigger('editImage',[{enrichedImage:this,el:el}]);
	}

	this.updateParameters = function(task,pars){			
		this.taskPars[task.name] = $.extend(true,{},pars)
		// this.save(function(){console.log("saved")});				
	}

	this.updateValues = function(task,values){
		this.taskVals[task.name] = values		
		this.save(function(){console.log("saved")});				
	}

	//just saves parameters
	this.save = function(callback){		
		var that = this;

		var writeFile = function(fileEntry){
			fileEntry.createWriter(function(fileWriter){				
				var blob = new Blob([JSON.stringify(that.parameters())],{type:"text/plain"})
				fileWriter.onwriteend = function(e){ callback(this.results)	}
				fileWriter.write(blob);
			})
		}

		//try to create the file		
		this.dir.getFile(that.filename,{create:true,exclusive:true},
			//if the file doesn't exist then create it
			function(fileEntry){writeFile(fileEntry); }, 
			//if the file exists then delete it and create a new one to it
			function(err){			
				that.dir.getFile(that.filename,{create:false},					
					function(fileEntry){fileEntry.remove(
						function(){that.dir.getFile(that.filename,{create:true},
							function(fileEntry){writeFile(fileEntry);},
							function(){})},
						function(){})},
					function(err){console.log("fail",err)})
		})		
	}

	this.parameters = function(){		
		return {
			filename: this.filename, 
			imgsrc:   this.imgsrc,
			taskPars: this.taskPars,
			taskVals: this.taskVals
		}
	}

}