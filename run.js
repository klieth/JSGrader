var writer = {
	//timer: null,
	buffer: "",
	print: function(str) {
		//if (!timer) timer = setInterval(send,2000);
		this.buffer += str + '\n';
	},
	send: function() {
		console.log("trying to send");
		if (this.buffer != "") {
			console.log("buffer was full, sending: " + this.buffer);
			$.post("/echo", {val:this.buffer});
			this.buffer = "";
		}
	}
}

var testing;

function stop() {
	clearInterval(testing);
}


$(function() {
	$.get("/tests", function (data, text) {
		var allNumbers = text.split(" ");
		for (var i = 0; i < allNumbers.length; i++) {
			allNumbers[i] = Number(allNumbers[i]);
		}
		$('div.myNumbers').innerHTML(text);
	});

	$.post("/tests", function (data, text) {
		$('input[name=myNumbers]').innerHTML(text);
	});
});

$(function() {
	var index = 0;
	var files = null;
	var tests = null;
	$.get("/tests", function (data) {
		tests = data;
		console.log("TEST DATA:");
		console.log(JSON.stringify(data));
		console.log("----------");
	});
	$.get("/list", function (data) {
		files = data;
		console.log("files: " + JSON.stringify(files));
	});
	var page = $('#page');
	page.load(function() {
		page[0].contentWindow.alert = function(data) {
			writer.print("ALERT used: " + data);
			console.log(data);
		};
		for (var i = 0; i < tests.length; i++) {
			for (var j = 0; j < tests[i].input.length; j++) {
				page.contents().find('[name=' + tests[i].input[j].key + ']').val(tests[i].input[j].val);
			}
			/*
			page.contents().find('[name=conType]').val(tests[i].key);
			page.contents().find('[name=inField]').val(tests[i].val);
			*/
			page.contents().find('[type=button]').click();
			var ret = page.contents().find('[name=outFieldA]').val();
			if (tests[i].output == "error") {
				ret = "Should be ERROR: " + ret;
			} else if (ret.indexOf(tests[i].output) > -1) {
				ret = "CORRECT: " + ret;
			}
			console.log(ret);
			writer.print(ret);
		}
		//writer.print(page.contents().find('[name=outField]').val());
		writer.send();
	});
	function kickoff() {
		console.log("Loading: " + files[index]);
		writer.print("GRADING: " + files[index]);
		var newUrl = 'http://localhost:3131/sakai/' + escape(files[index]);
		console.log('requesting: ' + newUrl);
		page.attr('src',newUrl);
		index++;
		if (index >= files.length) clearInterval(testing);
	}
	testing = setInterval(kickoff,2000);
});
