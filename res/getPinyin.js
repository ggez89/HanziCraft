/*
*	returns Pinyin for passed character string.
*	String character = the character(s) you wanna get the pinyin for
*	Function callback(result) = function that will be called after getPinyin is done
*/
function getPinyin(character, callback){
	var p = null;
	if (typeof window !== "undefined" && window.pinyinPro) {
		p = window.pinyinPro;
	} else if (typeof globalThis !== "undefined" && globalThis.pinyinPro) {
		p = globalThis.pinyinPro;
	} else if (typeof pinyinPro !== "undefined") {
		p = pinyinPro;
	}

	if (p && typeof p.pinyin === "function") {
		try {
			var py = p.pinyin(character, { toneType: "symbol" });
			if (typeof callback === "function") {
				callback(py || "");
			}
			return py || "";
		} catch (e) {
			console.warn("pinyinPro error:", e);
		}
	}

	var requestUrl = "/api/pinyin?text=" + encodeURIComponent(character);
	if (typeof $ !== "undefined" && typeof $.getJSON === "function") {
		$.getJSON(requestUrl, function(data){
			if(data && data.result == "ok"){
				if (typeof callback === "function") callback(data.text);
			} else {
				if (typeof callback === "function") callback("");
			}
		}).fail(function(){
			if (typeof callback === "function") callback("");
		});
	} else if (typeof callback === "function") {
		callback("");
	}
	return "";
}
