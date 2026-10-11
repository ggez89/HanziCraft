/*
*	Creates Pdf from given params.
*	characters, charPinyin : String arrays
*	charSizeOrTrace : int (Character size in mm: 12-24, or fallback trace count)
*	writePinyin, useGridlines, writeName, pasteSoImages : Booleans
*	docTitle, filename, wayOfRetrieval : Strings
*	enableTrace : Boolean (optional)
*/
function getLayoutConfig(charSize) {
	charSize = Math.max(12, Math.min(24, Number(charSize) || 17));
	var numCols, rowsPerPage, label;
	if (charSize <= 12) { numCols = 15; rowsPerPage = 13; label = 'Compact'; }
	else if (charSize <= 13) { numCols = 14; rowsPerPage = 12; label = 'Small'; }
	else if (charSize <= 14) { numCols = 13; rowsPerPage = 12; label = 'Small'; }
	else if (charSize <= 15) { numCols = 12; rowsPerPage = 11; label = 'Medium'; }
	else if (charSize <= 17) { numCols = 11; rowsPerPage = 11; label = 'Standard'; }
	else if (charSize <= 19) { numCols = 10; rowsPerPage = 10; label = 'Medium-Large'; }
	else if (charSize <= 21) { numCols = 9; rowsPerPage = 9; label = 'Large'; }
	else { numCols = 8; rowsPerPage = 8; label = 'Jumbo'; }
	
	var practiceSquares = numCols - 1;
	var traceSquares = Math.max(1, Math.min(practiceSquares, Math.round(practiceSquares * 0.38)));
	var printableWidth = 187; // mm (210 - 23mm margins)
	var cellWidth = printableWidth / numCols;
	var cellHeight = cellWidth;
	
	return {
		charSize: charSize,
		label: label,
		numCols: numCols,
		practiceSquares: practiceSquares,
		traceSquares: traceSquares,
		rowsPerPage: rowsPerPage,
		cellWidth: cellWidth,
		cellHeight: cellHeight,
		printableWidth: printableWidth
	};
}
window.getLayoutConfig = getLayoutConfig;

function createPdf(docTitle, characters, charSizeOrTrace, pasteSoImages, writePinyin, useGridlines, writeName, filename, charPinyin, wayOfRetrieval, enableTrace, fontStyleParam){
	try {
		var fontStyle = (fontStyleParam === 'kaiti' || (!fontStyleParam && typeof $ !== 'undefined' && $('#selected-font-style').val() === 'kaiti')) ? 'kaiti' : 'sans';
		var chineseFontName = (fontStyle === 'kaiti') ? 'AR PL UKai CN' : 'WenQuanYiZenHei';

		// make filename "filesystem-secure"
		filename = filename.replace(/[^a-z0-9öäüß\s\-\_\u4E00-\u9FFF]/gi, '');
		filename = filename == "" ? "my-chinese-exercise" : filename;
		// notify user
		$("#substatus").html("Starting to create your PDF");
		// new jsPDF-doc
		var doc = new jsPDF();
		// import font to jsPDF
		if (fontStyle === 'kaiti' && typeof ArPlUkaiCnBase64 !== 'undefined') {
			$("#substatus").html("Adding Chinese KaiTi calligraphy font");
			doc.addFileToVFS('AR PL UKai CN.ttf', ArPlUkaiCnBase64);
			doc.addFont('AR PL UKai CN.ttf', 'AR PL UKai CN', 'normal');
		} else if (typeof WqyZenHeiBase64 !== 'undefined') {
			$("#substatus").html("Adding Chinese sans-serif font");
			doc.addFileToVFS('wqy-zenhei.ttf', WqyZenHeiBase64);
			doc.addFont('wqy-zenhei.ttf', 'WenQuanYiZenHei', 'normal');
		}
		$("#substatus").html("Adding Pīnyīn font");
		doc.addFileToVFS('NotoSans-Regular.ttf', pinyinFontBase64);
		doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
		// set style of ends of lines (for good looking corners)
		doc.setLineCap("projecting");

		// Resolve layout config from character size
		var charSize = (typeof charSizeOrTrace === 'number' && charSizeOrTrace >= 12 && charSizeOrTrace <= 25) ? charSizeOrTrace : 17;
		var layout = getLayoutConfig(charSize);
		var numCols = layout.numCols;
		var charsPerPage = layout.rowsPerPage;
		var charCellWidth = layout.cellWidth;
		var charLineHeight = layout.cellHeight;
		var numberOfGrayscaleSigns = (enableTrace === false) ? 0 : ((typeof charSizeOrTrace === 'number' && charSizeOrTrace < 11) ? charSizeOrTrace : layout.traceSquares);

		// draw character lines
		$("#substatus").html("Writing character lines (line <span class='amountDone'>0</span>/" + characters.length + ")");
		var i;
		var j;
		var xUpLeft = 14;								// x position of the first character line on a page = left indent
		var yUpLeft = 23;								// y position start on page
		var availableRowHeight = 281 - yUpLeft;			// vertical space for all rows (258 mm)
		var charLineDistance = availableRowHeight / charsPerPage; // distance between character row baselines
		var subRowSpace = Math.max(5.0, charLineDistance - charLineHeight);
		var thisLineYUpLeft;
		var curPage = 1;								// current page
		var totalPages = Math.max(1, Math.ceil(characters.length / charsPerPage)); // total number of pages (pre-computed)
		var totalRows = totalPages * charsPerPage;
		var rightMarginX = xUpLeft + numCols * charCellWidth;

		for(i = 0; i < totalRows; ++i){
			if(i % charsPerPage == 0){ // if we're at the beginning of a page
				if(i != 0){ // if reached beginning of new page => add new page (& focus on it)
					doc.addPage();
					curPage++;
				}
				// line on top of the page
				doc.setDrawColor(0, 0, 0);
				doc.setLineWidth(0.5);
				doc.line(xUpLeft, 17, rightMarginX, 17);
				// write "姓名：" if the user wanted it
				if(writeName){
					doc.setFont(chineseFontName);
					doc.setFontSize(11); //in pt
					doc.text("姓名：", xUpLeft, 15);
					doc.setDrawColor(148, 163, 184); // slate-400
					doc.setLineWidth(0.25);
					doc.line(xUpLeft + 13, 15.5, xUpLeft + 42, 15.5);
					doc.setDrawColor(0, 0, 0);
				}
				// write doc title
				doc.setFont(chineseFontName);
				doc.setFontSize(14); //in pt
				doc.text(docTitle, 105, 15, 'center'); // A4_width/2 = 210 mm/2 = 105
				// write page number only if more than 1 page (suppress 1/1 on single page)
				if(totalPages > 1){
					doc.setFont('NotoSans');
					doc.setFontSize(10); //in pt
					doc.text(curPage + "/" + totalPages, rightMarginX, 15, 'right');
				}
				// footer matching https://github.com/ggez89/mathletics (Globe size 16 + MousePointer2 size 9 + hanzi.patrickyou.ng) aligned at left margin
				doc.setFont('NotoSans');
				doc.setFontSize(9.5); //in pt
				doc.setTextColor(148, 163, 184); // slate-400
				var footerDomain = 'hanzi.patrickyou.ng';
				var footerDomainWidth = doc.getTextWidth(footerDomain);
				var footerY = 289; // Fixed at bottom of A4 sheet (297mm height)
				var footerLeftX = xUpLeft; // Aligned at left margin (14mm)

				// Thin border line above footer
				doc.setDrawColor(226, 232, 240); // slate-200
				doc.setLineWidth(0.25);
				doc.line(xUpLeft, 283, rightMarginX, 283);

				// Draw globe icon matching Lucide Globe (size 16)
				var iconRadius = 2.1;
				var iconCenterX = footerLeftX + iconRadius + 0.2;
				var iconCenterY = footerY - 1.2;

				doc.setDrawColor(148, 163, 184); // slate-400
				doc.setLineWidth(0.28);
				// Globe outer circle
				doc.circle(iconCenterX, iconCenterY, iconRadius, 'S');
				// Equator line
				doc.line(iconCenterX - iconRadius, iconCenterY, iconCenterX + iconRadius, iconCenterY);
				// Meridian ellipse (curved meridian lines)
				doc.ellipse(iconCenterX, iconCenterY, iconRadius * 0.44, iconRadius, 'S');

				// Lucide MousePointer2 cursor arrow (size 9 placed at -bottom-0.5 -right-0.5)
				var pX = iconCenterX + 0.9;
				var pY = iconCenterY + 0.9;
				doc.setFillColor(148, 163, 184);
				doc.setDrawColor(148, 163, 184);
				doc.setLineWidth(0.2);
				doc.triangle(pX, pY, pX + 1.8, pY + 0.7, pX + 1.1, pY + 1.1, 'FD');
				doc.triangle(pX, pY, pX + 1.1, pY + 1.1, pX + 0.7, pY + 1.8, 'FD');

				var textX = iconCenterX + iconRadius + 2.6;
				doc.text(footerDomain, textX, footerY, 'left');
				doc.link(footerLeftX, footerY - 4, footerDomainWidth + 10, 6, { url: 'https://hanzi.patrickyou.ng' });

				doc.setTextColor(0, 0, 0); // restore black text color
				doc.setDrawColor(0, 0, 0);
			}

			thisLineYUpLeft = yUpLeft + (i % charsPerPage) * charLineDistance + subRowSpace;
			var isCharLine = (i < characters.length);

			// paste hanzi-writer Stroke Order SVGs (only for characters)
			if(isCharLine && pasteSoImages){
				// calculate starting X offset right after Pinyin
				var pinyinOffset = 0;
				if(writePinyin && charPinyin && charPinyin[i]){
					doc.setFont('NotoSans');
					doc.setFontSize(10);
					pinyinOffset = Math.max(13, doc.getTextWidth(charPinyin[i]) + 3);
				}
				var charSvgsEl = document.getElementById('strokeOrderSvgs-' + characters[i]);
				var charSvgs = charSvgsEl ? charSvgsEl.childNodes : [];
				var strokeScale = Math.min(1.0, Math.max(0.65, charLineHeight / 17));
				var strokeStep = 7.2 * strokeScale;
				var strokeY = thisLineYUpLeft - Math.max(5.5, subRowSpace * 0.88);

				for(var k = 0; k < charSvgs.length; k++){
					if(charSvgs[k] && charSvgs[k].nodeType === 1){
						svg2pdf(charSvgs[k], doc, {
							xOffset: xUpLeft + pinyinOffset + k * strokeStep,
							yOffset: strokeY,
							scale: strokeScale
						});
					}
				}
			}

			// gridlines - part 1 (horizontal midline)
			if(useGridlines){
				doc.setDrawColor(203, 213, 225); // slate-300
				doc.setLineWidth(0.2);
				doc.line(
					xUpLeft,
					thisLineYUpLeft + 0.5 * charLineHeight,
					rightMarginX,
					thisLineYUpLeft + 0.5 * charLineHeight
				);
				doc.setDrawColor(0, 0, 0);
			}

			// write pinyin
			if(isCharLine && writePinyin){
				doc.setFont('NotoSans');
				doc.setFontSize(Math.max(8.5, Math.min(11, charLineHeight * 0.65)));
				doc.text(charPinyin[i] || '', xUpLeft, thisLineYUpLeft - 1.5);
			}

			// single characters along the character line
			doc.setFont(chineseFontName);
			doc.setFontSize(Math.round(charLineHeight * 1.88)); // scales cleanly with character size (e.g. 32pt for 17mm)
			var charBaselineY = thisLineYUpLeft + charLineHeight * 0.78;

			for(j = 0; j < numCols; ++j){
				// gridlines - part 2 (vertical & diagonal guidelines)
				if(useGridlines){
					doc.setDrawColor(203, 213, 225); // slate-300
					doc.setLineWidth(0.2);
					// vertical midline per character
					doc.line(
						xUpLeft + (j + 0.5) * charCellWidth,
						thisLineYUpLeft,
						xUpLeft + (j + 0.5) * charCellWidth,
						thisLineYUpLeft + charLineHeight
					);
					// 2 diagonal lines per character
					doc.setLineCap("round");
					// "⭸" left top --> right bottom
					doc.line(
						xUpLeft + j * charCellWidth,
						thisLineYUpLeft,
						xUpLeft + (j + 1) * charCellWidth,
						thisLineYUpLeft + charLineHeight
					);
					// "⭷" left bottom --> right top
					doc.line(
						xUpLeft + j * charCellWidth,
						thisLineYUpLeft + charLineHeight,
						xUpLeft + (j + 1) * charCellWidth,
						thisLineYUpLeft
					);
					doc.setLineCap("projecting");
					doc.setDrawColor(0, 0, 0);
				}

				// write reference character (j=0) and faint trace characters (j=1...numberOfGrayscaleSigns)
				if(isCharLine){
					if(j === 0){
						doc.setTextColor(0, 0, 0); // Reference character in crisp black
						doc.text(characters[i], xUpLeft + 0.5 * charCellWidth, charBaselineY, 'center');
					} else if(j <= numberOfGrayscaleSigns){
						doc.setTextColor(203, 213, 225); // Faint trace characters in slate-300
						doc.text(characters[i], xUpLeft + (j + 0.5) * charCellWidth, charBaselineY, 'center');
					}
				}
			}

			// Outer cell box borders (all vertical separators)
			doc.setDrawColor(100, 116, 139); // slate-500
			doc.setLineWidth(0.35);
			for(j = 0; j <= numCols; ++j){
				doc.line(xUpLeft + j * charCellWidth, thisLineYUpLeft, xUpLeft + j * charCellWidth, thisLineYUpLeft + charLineHeight);
			}
			// upper line of row
			doc.line(xUpLeft, thisLineYUpLeft, rightMarginX, thisLineYUpLeft);
			// lower line of row
			doc.line(xUpLeft, thisLineYUpLeft + charLineHeight, rightMarginX, thisLineYUpLeft + charLineHeight);

			$(".amountDone").html(Math.min(i + 1, characters.length));
		}

		// Output document with robust Blob delivery
		var pdfBlob = doc.output('blob');
		var pdfBlobUrl = URL.createObjectURL(pdfBlob);
		var finalFilename = filename.toLowerCase().endsWith('.pdf') ? filename : (filename + '.pdf');

		if(wayOfRetrieval == "window") {
			window.open(pdfBlobUrl, '_blank');
		} else if(wayOfRetrieval == "currentWindow") {
			window.location.href = pdfBlobUrl;
		} else {
			// Trigger direct clean download
			var dlAnchor = document.createElement('a');
			dlAnchor.href = pdfBlobUrl;
			dlAnchor.download = finalFilename;
			document.body.appendChild(dlAnchor);
			dlAnchor.click();
			setTimeout(function() {
				if(dlAnchor.parentNode) dlAnchor.parentNode.removeChild(dlAnchor);
			}, 2000);
		}

		$("#statusTr").removeClass("processing").addClass("success");
		$("#mainstatus").html('PDF created successfully!');
		$("#substatus").html('Your worksheet has been generated.');
		$("#formFieldset *").prop("disabled", false);
		$("#create-pdf").show();
		if (typeof window.onPdfCreated === 'function') {
			window.onPdfCreated();
		}
	} catch (err) {
		console.error("PDF Generation error:", err);
		$("#statusTr").removeClass("processing").addClass("error");
		$("#mainstatus").html('Error creating PDF');
		$("#substatus").html(err.message || 'An unexpected error occurred during PDF export.');
		$("#formFieldset *").prop("disabled", false);
		$("#create-pdf").show();
		if (typeof window.onPdfCreated === 'function') {
			window.onPdfCreated();
		}
	}
}
