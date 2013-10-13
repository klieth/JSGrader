var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var port = 3131;

if (fs.existsSync("log.txt")) {
	fs.unlinkSync("log.txt");
	console.log("deleted log file");
}
var log = fs.createWriteStream('log.txt', {'flags': 'a'});

http.createServer(function(request, response) {
	console.log("----------");
	console.log("method = " + request.method);
	var POST = null;
	if (request.method == 'POST') {
		var queryData = "";
		request.on('data', function(data) {
			queryData += data;
			if(queryData.length > 1e6) {
				queryData = "";
				response.writeHead(413, {'Content-Type': 'text/plain'}).end();
				request.connection.destroy();
			}
		});

		request.on('end', function() {
			console.log("queryData: " + queryData);
			POST = qs.parse(queryData);
			serve();
		});
	} else {
		serve();
	}
	function serve() {
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
		} else if (cmd == "sakai") {
			var filename = "tests/" + unescape(url.parse(request.url).pathname.substring(7));
			console.log('cmd == sakai, filename: ' + filename);
			fs.readdir(filename + "/Submission attachment(s)", function (err, files) {
				if (err) {
					console.log(err);
					response.write("Error looking in directory");
					response.end();
					return;
				}
				var htmlname = null;
				for (var i = 0; i < files.length; i++) {
					if (files[i].indexOf(".htm") > 0) {
						htmlname = files[i];
						break;
					}
				}
				if (!htmlname) {
					response.write("No submission for " + filename);
					response.end();
					return;
				}
				fs.readFile(filename + "/Submission attachment(s)" + "/" + htmlname,'binary',function(err,data) {
					if (err) {
						response.write("Error reading file: " + filename);
						response.end();
						return;
					}
					response.writeHead(200, {'Content-type':'text/html'});
					response.write(data,'binary');
					response.end();
					return;
				});
			});
		} else if (cmd == "list") {
			// List all of the .html files that need to be tested
			var toGrade = [];
			fs.readdir("tests", function(err, files) {
				if (err) {
					response.write("Error looking in directory");
					response.end();
					return;
				}
				for (var i = 0; i < files.length; i++) {
					if (files[i].indexOf("grade") > 0) continue;
					if (files[i].indexOf("Aponte") > 0) continue;
					toGrade.push(files[i]);
				}
				response.writeHead(200, {'Content-Type':'application/json'});   
				response.write(JSON.stringify(toGrade));
				response.end();
				return;
			});
		} else if (cmd == "echo") {
			console.log("cmd == echo");
			if (!POST) {
				response.write("Post data was not filled");
				repsonse.end();
				return;
			}
			console.log("POST data filled");
			console.log("POST: " + Object.keys(POST));
			console.log("value: " + POST.val);
			log.write(POST.val + "\n");
		} else {
			response.write("Command not recognized.\nTry again with localhost:" + port + "/test.");
			response.end();
			return;
		}
	}
}).listen(port);

console.log("Listening on port " + port);
