var Results = klass(function(task, saveValues) {

	this.id = task.id + "_results"
	this.task = task;
	this.data = saveValues ? saveValues.data : []
	this.colors = []

}).methods({

	addData: function(group, name, val) {
		var found = -1
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i].group === group && this.data[i].name === name) {
				found = i;
				break;
			}
		}

		if (found === -1)
			this.data.push({
				group: group,
				name: name,
				val: val
			})
		else
			this.data[found] = {
				group: group,
				name: name,
				val: val
			}

			$('#' + this.id + ' svg').remove()
		this.visualize()
	},

	Dom: function() {
		var that = this;

		var resultdiv = document.createElement("div")
		resultdiv.className = "results"
		resultdiv.id = this.id

		var download = document.createElement("a")
		download.id = "download";
		download.innerHTML = 'download'
		$(download).click(function() {
			var csv = that.dataCSVStr()
			window.open("data:text/csv;charset=utf-8," + escape(csv))
		})

		$(resultdiv).append(download)
		$('<div class="empty"></div>').insertAfter($(download))

		return resultdiv
	},

	dataCSVStr: function() {
		var array = typeof this.data != 'object' ? JSON.parse(this.data) : this.data;

		var str = '';
		var line = '';

		//include labels in first line
		if (true) {
			var head = array[0];
			if ($("#quote").is(':checked')) {
				for (var index in array[0]) {
					var value = index + "";
					line += '"' + value.replace(/"/g, '""') + '",';
				}
			} else {
				for (var index in array[0]) {
					line += index + ',';
				}
			}

			line = line.slice(0, -1);
			str += line + '\r\n';
		}

		for (var i = 0; i < array.length; i++) {
			var line = '';

			// wrap strings in double quotes
			if (true) {
				for (var index in array[i]) {
					var value = array[i][index] + "";
					line += '"' + value.replace(/"/g, '""') + '",';
				}
			} else {
				for (var index in array[i]) {
					line += array[i][index] + ',';
				}
			}

			line = line.slice(0, -1);
			str += line + '\r\n';
		}
		return str;
	},

	//we'll just save the csv 
	visualize: function() {
		var that = this;
		var names = _.unique(this.data.map(function(d) {
			return d.group
		}))
		var groupValues = names.map(function(name) {
			var groupData = that.data.filter(function(data) {
				return data.group === name
			})
			var values = groupData.map(function(val) {
				return val.val
			})
			return {
				name: name,
				values: values
			}
		})

		console.log("groupvalues are",groupValues)

		CentroidSurfaceDistanceVisualization({
			el: $('#' + that.id).get(0),
			groupValues: groupValues
		})
	},

	// the s
	saveValues: function() {
		return {
			data: this.data
		}
	}
})