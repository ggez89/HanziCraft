/*
*	returns Pinyin for passed character string.
*	String character = the character(s) you wanna get the image to
*	Function callback(result) = function that will be called after getPinyin is done
*/
function getPinyin(character, callback){
	var requestUrl = "/api/pinyin?text=" + encodeURIComponent(character);
	$.getJSON(requestUrl, function(data){
		if(data && data.result == "ok"){
			callback(data.text); // return the pinyin of the character
		} else {
			callback("");
		}
	}).fail(function(){
		callback("");
	});
}