var Editor = klass(function(task){	
	
	this.task = task;
	this.id   = task.name+"_editor";	
	this.defaultPars = {
		minRed   : 0.2,
		minGreen : 0.2,
		roi 	 : {left:0,top:0,width:0,height:0},
		sroi     : {left:0,top:0,width:0,height:0}
	};

}).methods({

	setImageValues: function(values){

		var atts = $("#" + this.id + ' #attributes')
		atts.children().remove()
		$(atts).css("width",200)

		var attLbl = document.createElement("label");
		attLbl.innerHTML = "Image Attributes";
		$(atts).append(attLbl);
		
		var resultsLBL = document.createElement("Label");
		if(values){ resultsLBL.innerHTML = "distance is: " + Math.round(values.RG) }
		else{ resultsLBL.innerHTML = "distance is unknown" }
		$(resultsLBL).css("width",200)
		
		$(atts).append(document.createElement("br"))
		$(atts).append(resultsLBL)		
	},

	//tells the editor what to do when it hears an editImageEvent
	// ideally you will be setting the paramaters for this enriched image on this task
	onImageSelect: function(p){				
		
		var that          = this;
		var enrichedImage = p.enrichedImage
		var el            = p.el
		var pars          = $.extend(true,{},this.defaultPars)

		if(enrichedImage.taskVals[this.task.name])
			this.setImageValues(enrichedImage.taskVals[this.task.name])
		else
			this.setImageValues(null)
		
		if(!enrichedImage.taskPars[this.task.name])			
			enrichedImage.taskPars[this.task.name] = pars				
		else pars = $.extend(true,{},enrichedImage.taskPars[this.task.name])		
			
				
		var canvas = document.createElement('canvas')
  		$(canvas).css('width','300')
  		$(canvas).css('height','300')

  		
  		$('#' + this.id + " canvas").remove()
  		$('#' + this.id + " .jcrop-holder").remove()  		
  		$('#' + this.id + " #editor").append(canvas)
  		
		// add image to editing panel  		  		
	  	var context = canvas.getContext('2d')  
	  	var editImage = new Image();
	  	var jcrop_api;

	  	// update update button handlers
	  	$('#' + this.id + ' #update').off('click')
	  	$('#' + this.id + ' #update').on('click',function(){ 
	  		pars.minRed = parseFloat($('#' + that.id + ' #redIntensityRange').val())
	  		pars.minGreen = parseFloat($('#' + that.id + ' #greenIntensityRange').val())
	  		enrichedImage.updateParameters(that.task, pars)	  		  		
	  		that.task.analyseImage(enrichedImage,canvas)
	  	})

	  	editImage.onload = function(){
	    	canvas.width = editImage.width
	    	canvas.height = editImage.height
	    	canvas.getContext('2d').drawImage(editImage,0,0)	   

	    	$(canvas).Jcrop({
	        	bgColor: 'gray', 	        
	        	onSelect: function (coords) {
	        		
			        // need to scale the crop appropriately			           
			        var xscale = editImage.width/$('canvas').width(), yscale = editImage.height/$('canvas').height()
			        
			    	$('#' + that.id + ' #redIntensityRange').val(pars.minRed)			    	
			    	$('#' + that.id + ' #greenIntensityRange').val(pars.minGreen)	

			    	$('#' + that.id + ' #redMinIntensity').html(pars.minRed)
			    	$('#' + that.id + ' #greenMinIntensity').html(pars.minGreen)

					pars.roi  = {left:coords.x,top:coords.y,width:coords.w,height:coords.h},
					pars.sroi = {left:Math.round(coords.x*xscale),top:Math.round(coords.y*yscale),width:Math.round(coords.w*xscale),height:Math.round(coords.h*yscale)}			        
		        }
	      	},function(){jcrop_api = this});
	    	
	    	var roi = enrichedImage.taskPars[that.task.name].roi	    	
	    	jcrop_api.setSelect([roi.left,roi.top,roi.left + roi.width,roi.top + roi.height])
	  	}
	  
	  editImage.src = $(el).attr('src')
	},

	Dom: function()
	{	
		var that = this;

		var editor = document.createElement("div")
		editor.id = this.id; editor.className ='editor'
		$(editor).on('editImage',function(e,p1){ that.onImageSelect(p1)})
		
		var editorCan = document.createElement("div")
		editorCan.id = "editor"; editorCan.className = 'editorCan'

		var label = document.createElement("label")
		label.innerHTML= this.task.name

		var nextImage = document.createElement("input")
		nextImage.id = "nextImage"; nextImage.type = "button"; nextImage.value = "next";
		
		$(editorCan).append(label);
		$(editorCan).append(nextImage);		
		$(editorCan).append(document.createElement("br"));		
		$(editor).append(editorCan); 

		var paramAtts = document.createElement("div")

		var paramDiv = document.createElement("div")

		var paramLbl = document.createElement("label")
		paramLbl.innerHTML="Parameters"

		var redLbl = document.createElement("label")
		redLbl.innerHTML = "min red"; redLbl.id = 'redlbl'

		var redRange = document.createElement("input")
		redRange.type = "range"; redRange.id = "redIntensityRange"
		redRange.max = 1.0; redRange.min = 0.0; redRange.step = 0.01

		var greenLbl = document.createElement("label")
		greenLbl.innerHTML = "min green"; greenLbl.id = 'greenlbl'
		
		var redRangeText = document.createElement("textarea")
		redRangeText.id= "redMinIntensity"; redRangeText.readOnly = true; redRangeText.rows=1; redRangeText.cols=5

		var greenRange = document.createElement("input")
		greenRange.type = "range"; greenRange.id = "greenIntensityRange"
		greenRange.max = 1.0; greenRange.min = 0.0; greenRange.step = 0.01

		var greenRangeText = document.createElement("textarea")
		greenRangeText.id="greenMinIntensity"; greenRangeText.readOnly = true; greenRangeText.rows=1; greenRangeText.cols=5

		var update = document.createElement("button");
		update.id = 'update'; update.innerHTML="update";

		$(paramDiv).append(paramLbl)
		$(paramDiv).append(document.createElement("br"))
		$(paramDiv).append(redLbl)
		$(paramDiv).append(redRange)
		$(paramDiv).append(redRangeText)
		$(paramDiv).append(document.createElement("br"))
		$(paramDiv).append(greenLbl)
		$(paramDiv).append(greenRange)
		$(paramDiv).append(greenRangeText)
		$(paramDiv).append(document.createElement("br"))
		$(paramDiv).append(update)
		$(paramDiv).append(document.createElement("br"))
		$(paramAtts).append(paramDiv)

		var imageAttributes = document.createElement("div");
		imageAttributes.id = 'attributes'; 
		
		var attLbl = document.createElement("label");
		attLbl.innerHTML = "Image Attributes";

		$(imageAttributes).append(attLbl);
		$(paramAtts).append(document.createElement("br"))
		$(paramAtts).append(imageAttributes)
		$(editor).append(document.createElement("div"))
		$(editor).append(paramAtts);

		//hook in the listeners

		//when next button is pressed the selected image should be incremented (probably a better way to implmement this)
		$(nextImage).click(function(){
			var next = $('.thumbSelected').next()
			if(next.length === 0)
				$('.thumb').get(0).click()
			else
				next.trigger('click')
		})

		$(redRange).on("change",function(){    			
			$('#' + that.id + ' #redMinIntensity').html(this.value)
			$('#' + that.id + ' #redMinIntensity').change()
		});          

		$(greenRange).on("change",function(){        			
			$('#' + that.id + ' #greenMinIntensity').html(this.value)
			$('#' + that.id + ' #greenMinIntensity').change()
		});          

		return editor
	}
})