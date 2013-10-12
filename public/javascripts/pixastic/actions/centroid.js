/*
 * Pixastic Lib - Crop - v0.1.1
 * Copyright (c) 2008-2009 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

// returns a json object {red : redcentroid, green : greencentroid, blue: bluecentroid}
Pixastic.Actions.centroid = {
	process : function(params) {
		if (Pixastic.Client.hasCanvas()) {
			
			var minred   = params.options.ei.minRed
			var mingreen = params.options.ei.minGreen
			var minblue  = params.options.ei.minBlue
			var roi      = params.options.ei.roi

			var data = params.canvas.getContext("2d").getImageData(Math.round(roi.left),Math.round(roi.top),Math.round(roi.width),Math.round(roi.height)).data
			console.log(data.length,Mathround(roi.width)*Math.round(roi.height))
			var width = roi.width			
			var centroids = {red:{x:0,y:0,c:0},green:{x:0,y:0,c:0},blue:{x:0,y:0,c:0}}

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

			params.numericData = true
			return centroids;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvas();
	}
}


