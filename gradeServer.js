var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var port = 3131;
var logfile;
var testfile;

var help = "Usage: node gradeServer.js -t [test file] -l [log file] [options]";
help += "\nAvailable options:";
help += "\n\t-p --port Specify an alternate port to use (default " + port + ")";

if (process.argv.length == 2) {
	console.log(help);
	process.exit();
}

for (var i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == "-p" || process.argv[i] == "--port") {
		i++;
		if (isNaN(process.argv[i])) {
			console.log("Must specify a port number after " + process.argv[i-1]);
			process.exit();
		}
		port = Number(process.argv[i+1]);
	} else if (process.argv[i] == "-t" || process.argv[i] == "--test-file") {
		i++;
		if (process.argv[i].indexOf("-") == 0) {
			console.log("Must specify the tests filename after " + process.argv[i-1]);
			process.exit();
		}
		testfile = process.argv[i];
		console.log("Using " + testfile + " for tests");
	} else if (process.argv[i] == "-l" || process.argv[i] == "--log-file") {
		i++;
		if (process.argv[i].indexOf("-") == 0) {
			console.log("Must specify the log filename after " + process.argv[i-1]);
			process.exit();
		}
		logfile = process.argv[i];
		console.log("Using " + logfile + " for log");
	} else if (process.argv[i] == "-h" || process.argv[i] == "--help") {
		console.log(help);
		process.exit();
	}
}

if (!logfile || !testfile) {
	console.log("Must specify logfile and testfile");
	process.exit();
}

if (fs.existsSync(logfile)) {
	fs.unlinkSync(logfile);
	console.log("deleted old log file: " + logfile);
}
var log = fs.createWriteStream(logfile, {'flags': 'a'});

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
					if (files[i].indexOf("grade") < 0) {
						toGrade.push(files[i]);
					}
				}
				response.writeHead(200, {'Content-Type':'application/json'});   
				response.write(JSON.stringify(toGrade));
				response.end();
				return;
			});
		} else if (cmd == "echo") {
			console.log("cmd == echo");
			if (!POST) {
				console.log("Post data not filled");
				response.write("Post data was not filled");
				response.end();
				return;
			}
			console.log("POST data filled");
			console.log("POST: " + Object.keys(POST));
			console.log("value: " + POST.val);
			log.write(POST.val + "\n");
			response.end();
			return;
		} else if (cmd == "tests") {
			console.log("cmd == tests");
			console.log("Test file = " + testfile);
			fs.readFile(testfile,'binary', function(err,data) {
				if (err) {
					response.write("Error reading tests file");
					response.end();
					return;
				}
				response.writeHead(200, {'Content-type':'application/json'});
				console.log("Sending: " + data);
				response.write(data,'binary');
				response.end();
				return;
			});
		} else {
			response.write("Command not recognized.\nTry again with <a href=\"localhost:"+port+"/test\">localhost:" + port + "/test</a> .");
			response.end();
			return;
		}
	}
}).listen(port);

console.log("Listening on port " + port);
