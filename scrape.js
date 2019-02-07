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

var lectures = [{"lectureTitle":"TI1106M_23","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"0533fc5889364b46af3e538cd0d92f261d"},{"lectureTitle":"TI1106M_22","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"46635aec8e854859a88e124ed458297c1d"},{"lectureTitle":"TI1106M_21","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"cc09ddeed1f04d738e275c9c5fc7ea8a1d"},{"lectureTitle":"TI1106M_20","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"c56a2a27983a45a6bc787e26bbc68cce1d"},{"lectureTitle":"TI1106M_19","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"c0c35fb792b94037b8f03742c6d4a1011d"},{"lectureTitle":"TI1106M_18","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"7ce755ce15cf4b8d8d6ff766ef1a09741d"},{"lectureTitle":"TI1106M_17","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"2b04eaaef7c14b4fa2e6681b1f9a33551d"},{"lectureTitle":"TI1106M_16","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"fc6d13761d2b4893a6d80c92f188d6b71d"},{"lectureTitle":"TI1106M_15","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"4e760aff462d4156919022aaf0505e941d"},{"lectureTitle":"TI1106M_14","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"7a787f0553794b5ca17080d297ac41871d"},{"lectureTitle":"TI1106M_13","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"ae7cb753689b4c4397a0bf81ee4a7a9f1d"},{"lectureTitle":"TI1106M_12","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"1ad48a11a9a94a11a0df9dbb5929e6211d"},{"lectureTitle":"TI1106M_11","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"723c9ebe64274ef58acba3c8c62205e41d"},{"lectureTitle":"TI1106M_10","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"8fe5e1cda83c4a6d9fd29dd07fb78d0c1d"},{"lectureTitle":"TI1106M_09","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"ed13585491ee4165859ecc6717b261e71d"},{"lectureTitle":"TI1106M_08","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"ebe9ef7afbcc4bd68ffd1f587d0e22061d"},{"lectureTitle":"TI1106M_07","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"bb3da9a57bcd4da783578357bd3b904b1d"},{"lectureTitle":"TI1106M_06","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"bb5d6586905742c6aebd438375d667411d"},{"lectureTitle":"TI1106M_05","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"10297a71ea8e4d3a9df8d4de20e8c3a21d"},{"lectureTitle":"TI1106M_04","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"eb757b69026846b292d93172c1a2cea91d"},{"lectureTitle":"TI1106M_03","catalogID":"528e5b24a2fc4def870e65bd84b28a8c21","resourceID":"c0d07ce6dcee4768be8ab1f604cb80041d"}];

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
                        var streamURL = streams[p].VideoUrls[0].Location;
        
                        var newFileName = lecture['lectureTitle'] + ' ' + streamType + '.mp4';
        
                        // download each stream and report when it's done
                        (function(newFileName){
                            download(streamURL, "data/" + newFileName, function(){
                                console.log("\nDone: " + newFileName);
                            })
                        })(newFileName);
                        
                    }
                }else{
                    console.log("Error", body);
                }
                
            }
        });

    })(lecture);
    
}