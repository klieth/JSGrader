var http = require('http');
var url = require('url');
var fs = require('fs');
//var path = require('path');

var port = 3131;

http.createServer(function(request, response) {
	var args = url.parse(request.url).pathname.split('/');
	var cmd = args[1];
	console.log(process.cwd());

	if (cmd == "test") {
		console.log('cmd == test');
		fs.exists('./index.html', function (exists) {
			if (!exists) {
				response.write("Can't find the tester html file");
				response.end();
				return;
			}
			fs.readFile('./index.html','binary',function(err,data) {
				if (err) {
					response.write("Error reading tester html file");
					response.end();
					return;
				}
				//console.log(data);
				response.write(data,'binary');
				response.end();
				return;
			});
		});
	} else if (cmd == "file") {
		var filename = url.parse(request.url).pathname.substring(6);
		console.log('cmd == file, filename: ' + filename);
		fs.exists(filename, function (exists) {
			if (!exists) {
				response.write("Can't find file: " + filename);
				response.end();
				return;
			}
			fs.readFile(filename,'binary',function(err,data) {
				if (err) {
					response.write("Error reading file: " + filename);
					response.end();
					return;
				}
				response.write(data,'binary');
				response.end();
				return;
			});
		});
	} else if (cmd == "list") {
	}
}).listen(port);

console.log("Listening on port " + port);
