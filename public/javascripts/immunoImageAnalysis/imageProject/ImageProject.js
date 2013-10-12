var tasks = [{name:'Task',type:Task},
			 {name:'centroidSurfaceDistance',type:CentroidSurfaceTask},
			 {name:'IntensityByDistanceTask',type:IntensityByDistanceTask},
			 {name:'TailsTask',type:TailsTask}]

var ImageProject = klass(function(dir,fs){

	this.name     = escape(dir.name)
	this.dir 	  = dir
	this.fs       = fs

}).methods({
	
	open: function(){			
		
		var that = this;		
		var fs = this.fs;
		var dir = this.dir

		//reset project	
		$('#project').children().remove()		
		$('#project').append(this.Dom())		
		
		//load image project
		fs.readDirectory(dir,function(entries){				
			$.each(entries,function(entryIdx){ 
				// load all the image groups
				if(escape(entries[entryIdx].name) != "tasks")
					that.addImageGroup(entries[entryIdx])

				// load the tasks
				else{
					var taskdir = entries[entryIdx];
					fs.readDirectory(taskdir,function(taskfiles){
						$.each(taskfiles,function(taskIdx){
							var taskfile = taskfiles[taskIdx];
							taskfile.file(function(file){
								var reader = new FileReader();
								reader.onloadend = function(e){
									result = $.parseJSON(this.result)

									//need to find the right task object
									var taskType = null
									$.each(tasks,function(i){ if(tasks[i].name == result.type) taskType = tasks[i].type })
									
									var task = new taskType(result,taskdir)
									that.addTask(task)
								}

								reader.readAsText(file)
							})
						})
					})
				}
			})
		})
		
		//listen for user adding image groups
		$('#createGroup').click(function(){
			
			dir.getDirectory($('#groupName').val(),{create:true,exclusive:true},
				function(dir){ that.addImageGroup(dir) },
				function(){ console.log("there was an error")})
			
			// clear values after upload
			$('#groupName').val('')
			$('#files').val('')
		})

		//listen for user adding tasks 
		$('#createTask').click(function(){			
			var taskId = parseInt($('#taskType').val())
			var taskName = $('#taskName').val()
			that.dir.getDirectory("tasks",{create:false},function(taskdir){				
				var task = new tasks[taskId].type({name:taskName},taskdir);				
				task.save(function(task){that.addTask(task)});
			})
		})
	},

	emptyDiv: function(){		
		var emptyDiv = document.createElement('div')
		emptyDiv.className = 'empty'
		return emptyDiv
	},

	addTask: function(task){		
		var that = this;				
		var taskDom = task.Dom()
		var resultDom = task.results.Dom()		

		$('#project').append(that.emptyDiv())						
		$(taskDom).insertAfter($('#project .empty')[0])
		$(that.emptyDiv()).insertAfter($(taskDom))
		$(resultDom).insertAfter($('#project .empty')[1])
		$(that.emptyDiv()).insertAfter($(resultDom))
	},



	//load when a directory is added
	addImageGroup: function(dir){				
		var imageGroup = new ImageGroup(dir,this,this.fs)		
		
		var emptyDiv = document.createElement('div')
		emptyDiv.className = 'empty'
		$('#project').append(emptyDiv)
		$('#project').append(imageGroup.Dom())
	},

	setTaskImage: function(enrichedImage){
		var that = this;
		$.each(this.tasks,function(i){that.tasks[i].setImage(enrichedImage)})
	},

	delete: function(){
		var that = this;
		this.dir.removeRecursively( 
			function(){ console.log(that.name + "_removed") },
			function(){ console.log("there was an error in removing project")})
		$('#sidebar #'+this.name).remove()
	},

	NavDom: function(){		
		var that = this;
		
		var div = document.createElement('div')
		div.id = this.name; div.className = "navProject"

		var lbl = document.createElement("label")
		lbl.innerHTML = this.name

		$(lbl).click(function(){
			that.open()			
		})
		$(lbl).css("padding-right",'5px')

		var del = document.createElement("label")
		del.innerHTML = 'x'; $(del).css("cursor","pointer"); $(del).css("float","right"); $(del).css("padding-right",'5px')
		
		$(del).on("mouseover",function(e){ $(this).css("color","white")})
		$(del).on("mouseout",function(e){$(del).css('color','#33CC33')})

		$(del).on("click",function(){ that.delete() })

		var emptyDiv = document.createElement('div')
		emptyDiv.className = 'empty'


		$(div).append(lbl)
		$(div).append(del)
		$(emptyDiv).insertAfter($(div))

		return div
	},

	Dom: function(){		
		var projectDiv = document.createElement("div")

		// Task creation
		var taskType = document.createElement("select")
		taskType.id = "taskType";
		$.each(tasks,function(i){
			var option = document.createElement("option");
			option.text = tasks[i].name;
			option.value = i;
			taskType.appendChild(option);
		})

		var taskName = document.createElement("input")
		taskName.id = "taskName"; taskName.type = "text";		

		var createTask = document.createElement("input")
		createTask.id = "createTask"; createTask.type = "button"; createTask.value = "new task";

		$(projectDiv).append(taskType)
		$(projectDiv).append(taskName)
		$(projectDiv).append(createTask);
		
		// Group creation
		var groupName = document.createElement("input")
		groupName.id = "groupName"; groupName.type="text";
		var createGroup = document.createElement("input");
		createGroup.id = "createGroup"; createGroup.type = "button"; createGroup.value = "create group";

		$(projectDiv).append(groupName);
		$(projectDiv).append(createGroup);

		return projectDiv
	}
})

	