var Task = klass(function(params,dir){

	this.dir = dir;	
	this.type = "Task";

	this.name = params.name;
	this.id = this.name + "_task"
	this.filename = this.name + ".task"

	this.editor  = new Editor(this)
	this.results = new Results(this,params.results)

}).methods({	
		
	//an abstract method really
	analyseImage: function(enrichedImage,canvas){ },

	save: function(callback)
	{
		var that = this;		
		var writeFile = function(fileEntry){
			fileEntry.createWriter(function(fileWriter){				
				var blob = new Blob([JSON.stringify(that.parameters())],{type:"text/plain"})
				fileWriter.onwriteend = function(e){ callback(that)	}
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
	},

	parameters: function(){
		return {name:this.name,type:this.type,results:this.results.saveValues()}
	},

	delete: function(){			
		var that = this;
		this.dir.getFile(that.filename,{create:false},function(fileEntry){
			    fileEntry.remove(function() { 
			    	console.log('Task ' + that.name + ' removed.'); }, 
			    	function(){console.log("error removing")} );
			    }, function(){console.log("error finding file " + that.filename )});			
			
		$('#project #'+this.id).remove()	
		$('#project #'+this.results.id).remove()	
	},

	Dom: function(){
		var that = this;

		var taskDiv = document.createElement("div")
		taskDiv.className = 'task'; $(taskDiv).attr('id', this.id);
		$(taskDiv).data(that)
		

		var editorDom = this.editor.Dom()
		$(taskDiv).append(editorDom)

		var del = document.createElement("label")
		del.innerHTML = 'x'; $(del).css("cursor","pointer"); $(del).css("float","right"); $(del).css("padding-right","5px")
		$(del).on("mouseover",function(e){ $(this).css("color","white")})
		$(del).on("mouseout",function(e){$(del).css('color','rgb(200,200,200)')})
		$(del).on("click",function(){ that.delete() })
		$(taskDiv).append(del)

		// var runall = document.createElement("a")
		// runall.innerHTML = "RunAll";$(runall).css("cursor","pointer"); 
		// $(runall).css("float","right"); $(runall).css("padding-right","5px")
		// $(runall).on("mouseover",function(e){ $(this).css("color","white")})
		// $(runall).on("mouseout",function(e){$(runall).css('color','rgb(200,200,200)')})
		// $(runall).on("click",
		// 	function(){$('.imageGroup img').trigger('analyseImage',[{task:that}])})
		// $(taskDiv).append(runall)

		return taskDiv
	}
})
