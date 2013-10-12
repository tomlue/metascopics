var vals = null
var ImmunoEye = (function(){

	return {

		//just count all the pixels of color options.objectColor
		//divide by the width of the brush
		ObjectLength: function(rawImage, options, callback, canvas) {
			callback(options.objectPixels.length/options.brushwidth)
		},

		IntensityNearFarDifference : function(rawImage,options,callback,canvas){

			var width = rawImage.width;
			var height = rawImage.height;
			var ctx = canvas.getContext("2d")
			
			var tempCanvas = document.createElement('canvas');
			var tmpCtx = tempCanvas.getContext('2d')
			tempCanvas.width = width; tempCanvas.height = height;
			tmpCtx.drawImage(rawImage,0,0)
			var imgData = tmpCtx.getImageData(0,0,width,height).data

			function rawPixelToPixel(id){
				return {x:(id/4)%width, y: Math.floor((id/4)/width)}
			}

			function pixelToRawPixel(p){
				return 4*(p.y*width + p.x)
			}
			
			function linePixels(x0,y0,x1,y1,breakCondition,callback){
				var breakCondition = breakCondition ? breakCondition : function(){return false}
				var pixels = []
				var dx = Math.abs(x1-x0)
				var dy = Math.abs(y1-y0)

				if(x0 < x1){ sx = 1 } else{ sx = -1 }
					if(y0 < y1){ sy = 1 } else{ sy = -1 }
						var err = dx-dy

					while(true){			  		

						if(breakCondition({x:x0,y:y0})){
							break
						}

						pixels.push({x:x0,y:y0})
						if(x0 === x1 && y0 === y1){
							break
						}

						var e2 = 2*err				    

						if(e2 > -dy){
							err = err - dy
							x0  = x0  + sx
						}

						if(x0 === x1 && y0 === y1){
							break				    	
						}				       

						if(e2 <  dx){
							err = err + dx
							y0  = y0  + sy 
						}
					}
					return pixels
				}

				function findCentroid(rawpixels){
					var pixels   = rawpixels.map(rawPixelToPixel)				
					return pixels.reduce(function(acc,p){return {x:acc.x+p.x/pixels.length,y:acc.y+p.y/pixels.length}},{x:0,y:0})				
				}

				var centroid = findCentroid(options.objectPixels)
				ctx.fillStyle = "rgba(255,255,255,0.3)"
				ctx.fillRect(Math.round(centroid.x)-5,Math.round(centroid.y)-5,10,10)

				var borderPixels = new HashSet()
				borderPixels.addAll(options.objectPixels)
				var coveredPixels = new HashSet()

				var surfacePixel = null
				var breakCondition = function(pixel){
					var rawPixel = pixelToRawPixel(pixel)

					if(borderPixels.contains(rawPixel)){
						surfacePixel = pixel;
						return true;
					}

				// if(coveredPixels.contains(rawPixel))
				// 	return true
				// else
				// 	coveredPixels.add(rawPixel)
				// return false
			}
			
			//each 
			var maxDistance = Math.sqrt(Math.pow(width,2) + Math.pow(height,2))
			var distanceIntensity = new Array(Math.round(maxDistance))
			var distanceCounts = new Array(Math.round(maxDistance))			
			var distanceAverageIntensity = new Array(Math.round(maxDistance))
			var totalER = 0;
			
			for(var i=0; i<distanceIntensity.length;i++){
				distanceIntensity[i] = 0;
				distanceCounts[i] = 0;
			}
			
			//top bottom line	
			console.log("maxshelldistance is",options.maxShellDistance)		
			for(var y=0;y<height;y+=height-1){				
				for(var x=0; x<rawImage.width; x+=2){
					var topLinePixels= linePixels(x,y,centroid.x,centroid.y,breakCondition)
					topLinePixels.forEach(function(pixel){
						var rawPixel = pixelToRawPixel(pixel)
						var distanceId = Math.round(Math.sqrt(Math.pow(surfacePixel.x - pixel.x,2) + Math.pow(surfacePixel.y - pixel.y,2)))								
						if(distanceId > options.maxShellDistance){
							
						}
						else{
							distanceIntensity[distanceId] += imgData[rawPixel + 1]
							totalER += imgData[rawPixel + 1]
							distanceCounts[distanceId]++
						}
					})
					//coloring
					topLinePixels.forEach(function(p){ctx.fillRect(p.x,p.y,1,1)})						
					ctx.fillRect(surfacePixel.x-5,surfacePixel.y-5,10,10)								
				}
			}

			//left right line
			for(var x=0;x<width;x+=width-1){
				for(var y=0; y<rawImage.height; y+=2){
					var topLinePixels= linePixels(x,y,centroid.x,centroid.y,breakCondition)
					topLinePixels.forEach(function(pixel){
						var rawPixel = pixelToRawPixel(pixel)
						var distanceId = Math.round(Math.sqrt(Math.pow(surfacePixel.x - pixel.x,2) + Math.pow(surfacePixel.y - pixel.y,2)))					
						if(distanceId > options.maxShellDistance){

						}else{
							distanceIntensity[distanceId] += imgData[rawPixel + 1]
							totalER += imgData[rawPixel + 1]					
							distanceCounts[distanceId]++
						}						
					})
				//coloring
				topLinePixels.forEach(function(p){ctx.fillRect(p.x,p.y,1,1)})						
				ctx.fillRect(surfacePixel.x-5,surfacePixel.y-5,10,10)								
			}
		}

		for(var i=0; i<distanceIntensity.length; i++){

			if(isNaN(distanceIntensity[i]))
				distanceIntensity[i] = 0

			if(isNaN(distanceCounts[i]))
				distanceCounts[i] = 0;

			if(distanceCounts[i] > 0) 
				distanceAverageIntensity[i] = distanceIntensity[i]/totalER
			else
				distanceAverageIntensity[i]=0			
		}


		vals = distanceAverageIntensity

		callback(distanceAverageIntensity)
	},

	centroidSurfaceDistances : function(rawImage,options,callback,canvas){
		var roi 	 = options.roi
		var minred   = options.minRed
		var mingreen = options.minGreen
		var minblue  = options.minBlue		

		if(roi.width == 0 || roi.width == null){
			roi.width = rawImage.width
			roi.height = rawImage.height
		}


		var tempcanvas = document.createElement("canvas")
		tempcanvas.width = roi.width
		tempcanvas.height = roi.height

		var ctx 	   = tempcanvas.getContext("2d");
		ctx.drawImage(rawImage,roi.left,roi.top,roi.width,roi.height,0,0,roi.width,roi.height)

		var imgdata    = ctx.getImageData(0,0,roi.width,roi.height)
		var width 	   = roi.width			
		var centroids  = {red:{x:0,y:0,c:0},green:{x:0,y:0,c:0},blue:{x:0,y:0,c:0}}			
		var c = null;

		if(canvas)
			c = canvas.getContext('2d')

		for(var i=0; i<imgdata.data.length; i+=4){

			var x = (i/4)%width + roi.left
			var y = Math.floor((i/4)/roi.width) + roi.top				
			var r = imgdata.data[i]
			var g = imgdata.data[i+1]
			var b = imgdata.data[i+2]

			if(imgdata.data[i] > minred * 255)					
				centroids.red = {x:centroids.red.x+x,y:centroids.red.y+y,c:centroids.red.c+1}
			else 
				r = 0 

			if(imgdata.data[i+1] > mingreen * 255)
				centroids.green = {x:centroids.green.x+x,y:centroids.green.y+y,c:centroids.green.c+1}
			else 
				g = 0				

			if(imgdata.data[i+2] > minblue * 255)
				centroids.blue = {x:centroids.blue.x+x,y:centroids.blue.y+y,c:centroids.blue.c+1}
			else 
				b = 0

			if(canvas){				
				c.fillStyle = "rgb("+ r + "," + g + "," + b + ")"
				c.fillRect(x,y,1,1)
			}
		}

		centroids.red = {x:centroids.red.x/centroids.red.c,y:centroids.red.y/centroids.red.c}
		centroids.green = {x:centroids.green.x/centroids.green.c,y:centroids.green.y/centroids.green.c}
		centroids.blue = {x:centroids.blue.x/centroids.blue.c,y:centroids.blue.y/centroids.blue.c}

		var centroidColorDist = function(centroid,color){
			var cx = Math.round(centroid.x)
			var cy = Math.round(centroid.y)
			var mindist = 1.7E+10308
			var minx = 0
			var miny = 0

			for(var i=0; i<imgdata.data.length; i+=4){

				var x = (i/4)%width + roi.left
				var y = Math.floor((i/4)/roi.width) + roi.top				
				var dist = 1.7E+10308

				if(color == 'red' && imgdata.data[i] > minred * 255)
					dist = Math.pow(x-cx,2) + Math.pow(y-cy,2)

				else if(color == 'green' && imgdata.data[i+1] > mingreen * 255)
					dist = Math.pow(x-cx,2) + Math.pow(y-cy,2)						

				else if(color == 'blue' && imgdata.data[i+2] > minblue * 255)
					dist = Math.pow(x-cx,2) + Math.pow(y-cy,2)


				if(dist < mindist){
					mindist = dist					
					minx = x
					miny = y
				}

			}

			return {dist:mindist,minx:minx,miny:miny}
		}

		var distances = {
			RG : centroidColorDist(centroids.red,'green'),
				// RB : centroidColorDist(centroids.red,'blue'),
				// GB : centroidColorDist(centroids.green,'blue')
			}
			

			if(canvas)
			{	
				ctx = canvas.getContext('2d')
				ctx.fillStyle = 'RGB(255,175,175)'
				ctx.fillRect(Math.round(centroids.red.x),Math.round(centroids.red.y),20,20)			

				ctx.fillStyle = 'RGB(175,255,175)'
				ctx.fillRect(Math.round(distances.RG.minx),Math.round(distances.RG.miny),10,10)

				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(centroids.red.x+10,centroids.red.y+10);
				ctx.lineTo(distances.RG.minx +5,distances.RG.miny+5);
				ctx.stroke()				
			}

			var returnval = {RG: Math.sqrt(distances.RG.dist)}
			
			callback(returnval)
		},		

		centroidDistances : function(rawImage,options,callback,canvas){					
			
			var roi 	 = options.roi
			var minred   = 0.2//options.minRed
			var mingreen = 0.1//options.minGreen
			var minblue  = 0.0//options.minBlue		

			if(roi.width == 0 || roi.width == null){
				roi.width = rawImage.width
				roi.height = rawImage.height
			}


			var tempcanvas = document.createElement("canvas")
			tempcanvas.width = roi.width
			tempcanvas.height = roi.height
			
			var ctx 	   = tempcanvas.getContext("2d");
			ctx.drawImage(rawImage,roi.left,roi.top,roi.width,roi.height,0,0,roi.width,roi.height)
			
			var data       = ctx.getImageData(0,0,roi.width,roi.height).data
			var width 	   = roi.width			
			var centroids  = {red:{x:0,y:0,c:0},green:{x:0,y:0,c:0},blue:{x:0,y:0,c:0}}

			for(var i=0; i<data.length; i+=4){

				var x = (i/4)%width + roi.left
				var y = Math.floor((i/4)/roi.width) + roi.top				
				
				if(data[i] > minred * 255)					
					centroids.red = {x:centroids.red.x+x,y:centroids.red.y+y,c:centroids.red.c+1}				

				if(data[i+1] > mingreen * 255)
					centroids.green = {x:centroids.green.x+x,y:centroids.green.y+y,c:centroids.green.c+1}				

				if(data[i+2] > minblue * 255)
					centroids.blue = {x:centroids.blue.x+x,y:centroids.blue.y+y,c:centroids.blue.c+1}
			}
			
			centroids.red = {x:centroids.red.x/centroids.red.c,y:centroids.red.y/centroids.red.c}
			centroids.green = {x:centroids.green.x/centroids.green.c,y:centroids.green.y/centroids.green.c}
			centroids.blue = {x:centroids.blue.x/centroids.blue.c,y:centroids.blue.y/centroids.blue.c}
			
			if(canvas)
			{
				ctx = canvas.getContext('2d')
				ctx.fillStyle = '#ff0000'
				ctx.fillRect(Math.round(centroids.red.x),Math.round(centroids.red.y),10,10)			

				ctx.fillStyle = '#00ff00'
				ctx.fillRect(Math.round(centroids.green.x),Math.round(centroids.green.y),10,10)

				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 5;
				ctx.beginPath();

				ctx.moveTo(centroids.red.x,centroids.red.y);
				ctx.lineTo(centroids.green.x,centroids.green.y);
				ctx.stroke()
			}

			var centroidDistance = function(c1,c2){
				return Math.sqrt(Math.pow(c1.x-c2.x,2) + Math.pow(c1.y-c2.y,2))
			}

			var distances = {
				RG : centroidDistance(centroids.red,centroids.green),
				RB : centroidDistance(centroids.red,centroids.green),
				GB : centroidDistance(centroids.blue,centroids.green)
			}
			
			callback(distances)
		}
	}

})()
