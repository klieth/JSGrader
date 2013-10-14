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
	var index = 0;
	var files = null;
	$.get("/list", function (data) {
		files = data;
		console.log("files: " + JSON.stringify(files));
	});
	var page = $('#page');
	page.load(function() {
		page[0].contentWindow.alert = function(data) {
			//$.post("/echo",{val:"ALERT used: " + data});
			writer.print("ALERT used: " + data);
			console.log(data);
		};
		var tests = [
			{"key":"ft2in","val":"2"},
			{"key":"f2c","val":"32"}
		];
		for (var i = 0; i < tests.length; i++) {
			page.contents().find('[name=conType]').val(tests[i].key);
			page.contents().find('[name=inField]').val(tests[i].val);
			page.contents().find('[type=button]').click();
			var ret = page.contents().find('[name=outField]').val();
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
