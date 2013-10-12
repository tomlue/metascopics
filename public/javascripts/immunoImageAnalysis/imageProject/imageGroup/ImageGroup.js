function ImageGroup(dir,imageProject,fs){
	
	this.imageProject = imageProject;
	this.name     = escape(dir.name)
	this.fs       = fs
	this.dir      = dir
	this.rawDir   = null	

	var that = this

	dir.getDirectory("raw",{create:true,exclusive:true},
		function(res){that.initialize(res);}, 
		function(e){dir.getDirectory("raw",{create:false},function(res){that.initialize(res)})})

	this.initialize = function(rawDir){
		this.rawDir = rawDir
		fs.readDirectory(dir,function(results){		
			for(var i=0; i<results.length;i++){
				if(results[i].name != 'raw')					
					that.addImage(results[i])				
			}
  		})
	}

	this.Dom = function(){		
		
		//create the div!
		var div = document.createElement('div');
	  	div.id = this.name;
	  	div.className = "imageGroup";

		//controls go in their own div
		var controlDiv = document.createElement("div")
		$(controlDiv).css('float','left')
		$(controlDiv).css('width','100%')
		$(div).append(controlDiv)

	  	//add the label
	  	var lbl = document.createElement("label");
	  	lbl.innerHTML = this.name
	  	$(controlDiv).append(lbl)

	    //add the upload images button
	    var upload = document.createElement('input');
	    $(upload).css("float","right")
	    $(upload).css("width","200px")
	    $(upload).attr("type","file")
	    $(upload).attr("multiple","TRUE")
	    $(upload).on('change',function(e){that.upload(e)})
	    $(controlDiv).append(upload)

	    return div
	}

	//we'll write the raw image data to a subdirectory (raw)
	//we need to create EnrichedImage objects out of these and then save the created EnrichedImage to the FileSystem
	this.upload = function(e){		
		var files = e.target.files
		var that = this;

		for (var i = 0, file; file = files[i]; ++i){
			function writeFile(f){				
				that.fs.writeFile(file,that.rawDir,function(e){
					var filename = f.name
					
					//after the image is written we want to get it back to create an enriched image
					that.rawDir.getFile(filename,{create:false},function(fileEntry){
						//once we have the original image we want to create an enriched image and store the file as a string
						var enrichedImage = new EnrichedImage(that.dir,that,null,
							{filename:filename,imgsrc:fileEntry.toURL(),minRed:0.2,minGreen:0.2,roi:{left:0,top:0,width:0,height:0},sroi:{left:0,top:0,width:0,height:0}})
						enrichedImage.save(function(e){ that.dir.getFile(filename,{create:false},function(fileEntry){ that.addImage(fileEntry) })})						
					})
				})			
			}
			writeFile(file)
		}
	}

	//eif is an enriched image file entry
	this.addImage = function(eif){		
		var that = this;
		
		eif.file(function(file){
			var reader = new FileReader();
			reader.onloadend = function(e){				
				result = $.parseJSON(this.result)
				
				//tells the image to update its group when it changes
				var onChange = function(){
					var ei = this;
					that.onchange(ei,ei.values)					
				}

				var enrichedImage = new EnrichedImage(that.dir,that,onChange,result)
				enrichedImage.attachThumbnail($("#"+that.name))
			}
			reader.readAsText(file)
		})
	}

	this.remove = function(){
		$('#' + this.name).remove()
	}

	//onchange gets called whenever this image group experiences a change
	this.onchange = function(enrichedimg,values){
		globalData[this.name][enrichedimg.filename] = values
		$('#globalData').val(JSON.stringify(globalData))
		$('#globalData').change()		
	}
}