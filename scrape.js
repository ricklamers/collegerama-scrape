var fs = require('fs'),
    request = require('request');

var TOTAL_DOWNLOAD_SIZE = 0;
var TOTAL_COMPLETED = 0;
var FILE_COUNT = 0;
var FILES_LEFT = 0;
var BYTES_SPEED_COUNT = 0;

var GLOBAL_TIME = process.hrtime();

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    
    var totalSize = parseInt(res.headers['content-length']);

    TOTAL_DOWNLOAD_SIZE += totalSize;
    FILE_COUNT += 1;
    FILES_LEFT += 1;

    if(err){
        console.log(err);
    }else{
        var req = request(uri);
        req.on('data',function(chunk){

            TOTAL_COMPLETED += chunk.length;
            BYTES_SPEED_COUNT += chunk.length;

            // track time
            var timeDiff = getTimeDiff();

            var transferSpeed = (((BYTES_SPEED_COUNT / timeDiff) * 1000000) / (1024*1024)).toFixed(4);

            if(timeDiff > 100000){

                var speedFormatted = transferSpeed + "MiB/s";
                process.stdout.write("Download progress " + (Math.round((TOTAL_COMPLETED/TOTAL_DOWNLOAD_SIZE)*10000)/100).toFixed(2) + "% (" + FILES_LEFT + " files left) speed: " + speedFormatted + "\r");
                
                // reset GLOBAL_TIME and BYTES_SPEED_COUNT
                GLOBAL_TIME = process.hrtime();
                BYTES_SPEED_COUNT = 0;
            }
            
            // console.log()
        })
        req.pipe(fs.createWriteStream(filename)).on('close',function(){
            callback();
            FILES_LEFT -= 1;
        });
    }
  });
};

function getTimeDiff(){
    var hrTime = process.hrtime(GLOBAL_TIME)
    return (hrTime[0] * 1000000 + hrTime[1] / 1000);
}

var lectures = [];

for(var x = 0; x < lectures.length; x ++){
    var lecture = lectures[x];
    
    (function(lecture){

        request.post("https://collegerama.tudelft.nl/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions", {json: 
            {"getPlayerOptionsRequest":
                {
                    "ResourceId": lecture['resourceID'],
                    "QueryString": "?catalog=" + lecture['catalogID'],
                    "UseScreenReader":false,
                    "UrlReferrer":"https://collegerama.tudelft.nl/Mediasite/Catalog/catalogs/eemcs-lectures"
                }
            }
        }, function(err, res, body){
            if(err){
                console.log(err);
            }else{

                console.log("Got metadata for " + lecture['lectureTitle']);

                if(body.d){
                    var streams = body.d.Presentation.Streams;
                    var streamType = 'slides';
        
                    for(var p in streams){
                        if(p > 0){
                            streamType = 'feed ' + p;
                        }

                        if (streams[p].VideoUrls && streams[p].VideoUrls.length > 0){

                            // assuming VideoUrls[0] is always the video/mp4 MimeType one
                            var streamURL = streams[p].VideoUrls[0].Location;
        
                            var newFileName = lecture['lectureTitle'] + ' ' + streamType + '.mp4';
            
                            // download each stream and report when it's done
                            (function(newFileName){
                                download(streamURL, "data/" + newFileName, function(){
                                    console.log("\nDone: " + newFileName);
                                })
                            })(newFileName);

                        }else{

                            console.log("WARNING: streams[" + p + "]" + " has no VideoUrls");

                        }
                        
                        
                    }
                }else{
                    console.log("Error", body);
                }
                
            }
        });

    })(lecture);
    
}