var PaintObjectEditor = Editor.extend(function(task) {

	this.defaultPars = {
		objectColor: [255, 0, 00],
		objectPixels: [],
		maxShellDistance: 200,
		brushwidth: 5
	}

}).methods({

	//overload
	onImageSelect: function(p) {

		var that = this;
		var enrichedImage = p.enrichedImage
		var el = p.el
		var pars = {
			objectColor: [255, 0, 00], //color to paint the object
			objectPixels: [], //pixels in the object
			maxShellDistance: 200, //really just used by intensityByDistanceTask
			brushwidth: 5 //width of the brush
		}

		if (!enrichedImage.taskPars[this.task.name])
			enrichedImage.taskPars[this.task.name] = {}

		for (var i in pars) {
			if (pars.hasOwnProperty(i)) {
				if (!enrichedImage.taskPars[this.task.name][i])
					enrichedImage.taskPars[this.task.name][i] = pars[i]
				else pars[i] = enrichedImage.taskPars[this.task.name][i]
			}
		}

		if (enrichedImage.taskVals[this.task.name])
			this.setImageValues(enrichedImage.taskVals[this.task.name])

		var pixelHashSet = new HashSet();

		var canvas = document.createElement('canvas')
		$(canvas).css('width', '300')
		$(canvas).css('height', '300')
		$(canvas).css('float', 'left')
		$(canvas).css('background-color', 'green')

		$('#' + this.id + " canvas").remove()
		$('#' + this.id + " .jcrop-holder").remove()
		$('#' + this.id + " #editor").append(canvas)

		// add image to editing panel load object painter
		var editImage = new Image();
		var jcrop_api;
		editImage.onload = function() {

			// update update button handlers
			$('#' + that.id + ' #update').off('click')
			$('#' + that.id + ' #update').on('click', function() {
				pars.objectPixels = pixelHashSet.values()
				enrichedImage.updateParameters(that.task, pars)
				that.task.analyseImage(enrichedImage, canvas)
			})

			//update clear button handler
			$('#' + that.id + ' #clear').off('click')
			$('#' + that.id + ' #clear').on('click', function() {
				pars.objectPixels = []
				pixelHashSet = new HashSet()
				enrichedImage.updateParameters(that.task, pars)
				enrichedImage.save(function() {
					console.log("saved")
				})
				editImage.src = $(el).attr('src')
			})

			//show image and allow painting
			canvas.width = editImage.width
			canvas.height = editImage.height
			var context = canvas.getContext('2d')
			canvas.getContext('2d').drawImage(editImage, 0, 0, editImage.width, editImage.height)

			pixelHashSet.addAll(pars.objectPixels)

			var xscale = editImage.width / $('canvas').width(),
				yscale = editImage.height / $('canvas').height()

				var painter = that.Painter(context,
					xscale, yscale, pixelHashSet, editImage.width, pars.brushwidth)

			//need to paint the current parameter pixels first thing
			that.paintPixels(context, pixelHashSet.values().map(function(id) {
				return {
					x: (id / 4) % editImage.width,
					y: Math.floor((id / 4) / editImage.width)
				}
			})); //was just values

			//when user clicks clear the last painted object
			canvas.addEventListener('mousedown', function(ev) {
				that.ev_canvas(ev, painter)
			}, false)
			canvas.addEventListener('mousemove', function(ev) {
				that.ev_canvas(ev, painter)
			}, false)
			canvas.addEventListener('mouseup', function(ev) {
				that.ev_canvas(ev, painter)
			}, false)
		}

		editImage.src = $(el).attr('src')
	},

	setImageValues: function(values) {
		// args are: el,values,histbins,densebins,densescale
		var that = this;
		if (typeof(values) == "number") {
			$('#b_editor #attributes').children().slice(2).remove()
			var lbl = document.createElement('label')
			lbl.innerHTML = "length: " + values			
			$('#' + that.id + ' #attributes').append(lbl)
		} else {
			$('#' + that.id + ' #attributes svg').remove()
			IntensityByDistanceVisualization({
				el: $('#' + that.id + ' #attributes').get(0),
				width: 360,
				height: 220,
				groupValues: [{
					name: "",
					values: values
				}]
			})
		}
	},

	Painter: function(context, xscale, yscale, pixelHashSet, width, brushwidth) {
		var editor = this;
		var tool = {
			started: false
		}

		// This is called when you start holding down the mouse button.
		// This starts the pencil drawing.
		tool.mousedown = function(ev) {
			context.beginPath();
			context.moveTo(ev._x, ev._y);
			tool.started = true;
		};

		// This function is called every time you move the mouse. Obviously, it only 
		// draws if the tool.started state is set to true (when you are holding down 
		// the mouse button).
		tool.mousemove = function(ev) {
			if (tool.started) {
				var pixels = []
				var minX = xscale * ev._x - brushwidth,
					maxX = xscale * ev._x + brushwidth
				var minY = yscale * ev._y - brushwidth,
					maxY = yscale * ev._y + brushwidth
				for (var i = Math.round(minX); i <= Math.round(maxX); i++) {
					for (var j = Math.round(minY); j <= Math.round(maxY); j++) {
						pixels.push({
							x: i,
							y: j
						});
						pixelHashSet.add(4 * (j * width + i))
					}
				}
				editor.paintPixels(context, pixels)
			}
		};

		// This is called when you release the mouse button.
		tool.mouseup = function(ev) {
			if (tool.started) {
				tool.mousemove(ev);
				tool.started = false;
			}
		};

		return tool
	},

	ev_canvas: function(ev, tool) {
		if (ev.layerX || ev.layerX == 0) { // Firefox
			ev._x = ev.layerX;
			ev._y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
			ev._x = ev.offsetX;
			ev._y = ev.offsetY;
		}

		// Call the event handler of the tool.
		var func = tool[ev.type];
		if (func) {
			func(ev);
		}
	},

	paintPixels: function(ctx, pixels) {
		for (var i = 0; i < pixels.length; i++) {
			var x = pixels[i].x;
			var y = pixels[i].y;
			ctx.fillStyle = 'rgb(255,0,0)';
			ctx.fillRect(x, y, 1, 1)
		}
	},

	Dom: function() {
		var that = this;

		var editor = document.createElement("div")
		editor.id = this.id;
		editor.className = 'editor'
		$(editor).on('editImage', function(e, p1) {
			that.onImageSelect(p1)
		})

		var editorCan = document.createElement("div")
		editorCan.id = "editor";
		editorCan.className = 'editorCan'

		var label = document.createElement("label")
		label.innerHTML = this.task.name

		var nextImage = document.createElement("input")
		nextImage.id = "nextImage";
		nextImage.type = "button";
		nextImage.value = "next";
		$(nextImage).css('height', 30)

		$(editorCan).append(label);
		$(editorCan).append(nextImage);
		$(editorCan).append(document.createElement("br"));
		$(editor).append(editorCan);

		var paramAtts = document.createElement("div")

		var paramDiv = document.createElement("div")

		var paramLbl = document.createElement("label")
		paramLbl.innerHTML = "Parameters"

		var clear = document.createElement("button")
		clear.id = 'clear';
		clear.innerHTML = 'clear';

		var update = document.createElement("button");
		update.id = 'update';
		update.innerHTML = "update";

		$(paramDiv).append(paramLbl)
		$(paramDiv).append(document.createElement("br"))
		$(paramDiv).append(clear)
		$(paramDiv).append(document.createElement("br"))
		$(paramDiv).append(update)
		$(paramDiv).append(document.createElement("br"))
		$(paramAtts).append(paramDiv)

		var imageAttributes = document.createElement("div");
		imageAttributes.id = 'attributes';

		var attLbl = document.createElement("label");
		attLbl.innerHTML = "Image Attributes";

		$(imageAttributes).append(attLbl);
		$(imageAttributes).append(document.createElement("br"))
		$(paramAtts).append(imageAttributes)
		$(editor).append(document.createElement("div"))
		$(editor).append(paramAtts);

		//hook in the listeners

		//when next button is pressed the selected image should be incremented (probably a better way to implmement this)
		$(nextImage).click(function() {
			var next = $('.thumbSelected').next()
			if (next.length === 0)
				$('.thumb').get(0).click()
			else
				next.trigger('click')
		})

		return editor
	}
})