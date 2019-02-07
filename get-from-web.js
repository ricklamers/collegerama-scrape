lectures = [];

$('.VideoPreviewCardDataListStyle tr.CardRow').each(function(){
	var lectureA = $(this).find("a#cardTitle");
	var lectureTitle = lectureA.text();
	var lectureURL = lectureA.attr('href');
	var url1Re = new RegExp('Play/([^?]*)');
	var resourceID = url1Re.exec(lectureURL)[1];
	var url2Re = re2 = new RegExp('catalog=(.*)');
	var catalogID = url2Re.exec(lectureURL)[1];
	lectures.push({lectureTitle: lectureTitle, catalogID: catalogID, resourceID: resourceID});
});

JSON.stringify(lectures);