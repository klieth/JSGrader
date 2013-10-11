
$(function() {
	var testing;
	var index = 0;
	var files = null;
	$.get("/list", function (data) {
		files = data;
		console.log("files: " + JSON.stringify(files));
	});
	var page = $('#page');
	console.log('setting load function');
	page.load(function() {
		page[0].contentWindow.alert = function(data) {
			$.post("/echo",{val:"ALERT used: " + data});
			console.log(data);
		};
		page.contents().find('[name=conType]').val("ft2in");
		page.contents().find('[name=inField]').val("2");
		page.contents().find('[type=button]').click();
		var ret = page.contents().find('[name=outField]').val();
		console.log("returning: " + ret);
		$.post("/echo", {val:ret}).done(function (data) {
			console.log("Echo finished");
		});
	});
	console.log('setting src attr');
	function kickoff() {
		console.log("Loading: " + files[index]);
		page.attr('src','http://localhost:3131/sakai/' + files[index]);
		index++;
		if (index >= files.length) clearInterval(testing);
	}
	testing = setInterval(kickoff,2000);
});
