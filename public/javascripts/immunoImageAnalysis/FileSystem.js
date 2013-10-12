// lets first see if we can get the roots directory listing

function FileSystem(callback){
  var maxSize = 1024*1024*1024
  this.fs = null
  var that = this

  navigator.webkitPersistentStorage.requestQuota(maxSize, 
    function(grantedBytes) {       
      window.webkitRequestFileSystem(
        PERSISTENT, 
        grantedBytes, 
        function(fileSystem){ that.fs=fileSystem; callback(); }, 
        errorHandler);                                                                                                                       
    },                                                                                                                                    
    function(e) { console.log('Error', e); }                                                                           
  );

  // when the user uploads a file we want to add that to their application directory
  this.createDirectory = function(name,callback){        
    this.fs.root.getDirectory(name, {create: true, exclusive:true}, callback,errorHandler)
  }

  this.writeFile = function(f,dir,callback){        
    dir.getFile(f.name, {create: true, exclusive: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = callback
        fileWriter.write(f); // Note: write() can take a File or Blob object.
      }, errorHandler);
    }, errorHandler);  
  }

  this.readDirectories = function(callback) {
    // var toArray = function toArray(list) { return Array.prototype.slice.call(list || [], 0); }
    var dirReader = this.fs.root.createReader();        
    var entries   = []
    var entryAggregate = function(res){
      if(res.length > 0){
        $.each(res,function(resIdx){entries.push(res[resIdx])})
        dirReader.readEntries(entryAggregate,errorHandler)
      }
      else
        callback(entries)      
    }
          
    dirReader.readEntries(entryAggregate,errorHandler)     
  }

  this.readDirectory = function(dir,callback){
    var dirReader = dir.createReader();
    var files     = []
    var fileAgg   = function(aggFiles){
      if(aggFiles.length == 0)
        callback(files)
      else{
        $.each(aggFiles,function(fileIdx){files.push(aggFiles[fileIdx])})
        dirReader.readEntries(fileAgg,errorHandler)
      }
    }
    
    dirReader.readEntries(fileAgg,errorHandler)
  }

  this.getFS = function(){
    return this.fs;
  }

  function errorHandler(e) {
    var msg = '';

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };

    console.log('Error: ' + msg);
  }
}