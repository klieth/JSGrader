var writer = {
	buffer: "",
	print: function(str) {
		this.buffer += str + '\n';
	},
	send: function() {
		console.log("trying to send");
		if (this.buffer != "") {
			console.log("buffer was full, sending: " + this.buffer);
			$.post("/echo", {val:this.buffer});
			this.buffer = "";
		}
	},
	clear: function() {
		this.buffer = "";
	}
}

var testing;

function stop() {
	clearInterval(testing);
}

$(function() {
	var index = 0;
	var files = null;
	var tests = null;
	var name;
	$.get("/tests", function (data) {
		tests = data;
		console.log("TEST DATA:");
		console.log(JSON.stringify(data));
		console.log("----------");
	}).fail(function (e) {
		console.log("error getting tests");
		console.log(e);
	});
	$.get("/list", function (data) {
		files = data;
		console.log("files: " + JSON.stringify(files));
	});
	var page = $('#page');
	page.load(function() {
		writer.print("GRADING: " + name);
		page[0].contentWindow.alert = function(data) {
			writer.print("ALERT used: " + data);
			console.log(data);
		};
		// TODO - Make teamObjs generic (e.g.: contentWindow[tests.fieldName])
		console.log("setting raw data");
		page.contents().find('[name=' + tests.inputId + ']').val(tests.rawData);
		// TODO - Make this button click a safer operation (guarantee it with an id?)
		page.contents().find('[type=button]').click();
		var testObj = page[0].contentWindow.teamObjs;
		if (tests.data.length != testObj.length) {
			writer.print("Wrong number of team members (found " + testObj.length + " expected " + tests.data.length + ")");
		}
		var allCorrect = Array();
		for (var i = 0; i < testObj.length; i++) {
			var objCorrect = Array();
			var oindex = 0;
			for (var prop in testObj[i]) {
				var val = testObj[i][prop];
				if (typeof(val) === "function") {
					var ret = val.call(testObj[i]);
					if (ret == tests.data[i][prop]) {
						objCorrect[oindex] = "c";
					} else if (!ret) {
						objCorrect[oindex] = "n";
					} else {
						objCorrect[oindex] = "w";
					}
				} else {
					if (val == tests.data[i][prop]) {
						objCorrect[oindex] = "c";
					} else if (!val) {
						objCorrect[oindex] = "n";
					} else {
						objCorrect[oindex] = "w";
					}
				}
				oindex++;
			}
			allCorrect[i] = (function(arr) {
				var obj = {c:0,w:0,n:0};
				for (var item = 0; item < arr.length; item++) {
					obj[arr[item]]++;
				}
				return obj;
			})(objCorrect);
		}
		console.log(allCorrect);
		writer.print(JSON.stringify((function(arr) {
			var obj = {c:0,w:0,n:0};
			for (var item = 0; item < arr.length; item++) {
				obj.c += arr[item].c;
				obj.w += arr[item].w;
				obj.n += arr[item].n;
			}
			return obj;
		})(allCorrect)));
		writer.send();
	});
	function kickoff() {
		writer.clear();
		console.log("Loading: " + files[index]);
		name = files[index];
		var newUrl = 'http://localhost:3131/sakai/' + escape(files[index]);
		console.log('requesting: ' + newUrl);
		page.attr('src',newUrl);
		index++;
		if (index >= files.length) {
			console.log("FINISHED");
			clearInterval(testing);
		}
	}
	testing = setInterval(kickoff,1500);
});
