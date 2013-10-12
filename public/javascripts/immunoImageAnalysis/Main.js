
$(function(){
	//create File System
	var FS = new FileSystem(onFSInitialization)

	//load when file system is loaded
	function onFSInitialization(){

		//load image groups (read through each file system directory)
		var dirs = FS.readDirectories(function(entries){						
			$.each(entries,function(entryIdx){addProject(entries[entryIdx])})
		})
		
		//listen for user adding projects
		$('#createProject').click(function(){
			FS.createDirectory($('#projectName').val(),function(dir){
				dir.getDirectory("tasks",{create:true,exlusive:true},function(tasks){
					addProject(dir) 
				})				
			})
			
			// clear values after upload
			$('#groupName').val('')
			$('#files').val('')
		})
	}

	//load when a directory is added
	function addProject(dir){
		var imageProject = new ImageProject(dir,FS)				
		$('#sidebar').append(imageProject.NavDom())		
	}
})

