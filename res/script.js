/*
* HanziCraft Worksheet Generator - Interactive Frontend Engine
*/

$(document).ready(function() {
	var currentPage = 1;
	var totalPages = 1;
	var pinyinCache = {};
	var strokesCache = {};
	var activeMobileTab = 'setup'; // 'setup' | 'preview'
	var previewDebounceTimer = null;

	/* ==========================================================================
	   1. Mobile Viewport & Tab Switching
	   ========================================================================== */
	function setMobileView(tab) {
		activeMobileTab = tab;
		if (tab === 'setup') {
			$('#setup-panel').removeClass('hidden').addClass('flex');
			$('#preview-panel').removeClass('flex').addClass('hidden lg:flex');
			$('#mobile-toggle-icon').text('📄');
			$('#mobile-toggle-text').text('Page View');
		} else {
			$('#setup-panel').removeClass('flex').addClass('hidden lg:flex');
			$('#preview-panel').removeClass('hidden').addClass('flex');
			$('#mobile-toggle-icon').text('⚙️');
			$('#mobile-toggle-text').text('Setup');
		}
	}

	$('#mobile-toggle-view').click(function() {
		setMobileView(activeMobileTab === 'setup' ? 'preview' : 'setup');
	});

	// Ensure desktop always displays both
	function checkViewport() {
		if ($(window).width() >= 1024) {
			$('#setup-panel').removeClass('hidden').addClass('flex');
			$('#preview-panel').removeClass('hidden').addClass('flex');
		} else {
			setMobileView(activeMobileTab);
		}
	}
	$(window).resize(checkViewport);
	checkViewport();

	/* ==========================================================================
	   2. Helper: Extract & Deduplicate Chinese Characters
	   ========================================================================== */
	function getCleanCharacters() {
		var raw = $('#characters').val() || '';
		var filtered = raw.replace(/[^\u4E00-\u9FFF]+/g, '');
		var chars = filtered.split('');
		if ($('#removeDuplicates').is(':checked')) {
			chars = chars.filter(function(val, idx, self) {
				return self.indexOf(val) === idx;
			});
		}
		return chars;
	}

	/* ==========================================================================
	   3. SVG Practice Box Generator
	   ========================================================================== */
	function createPracticeBoxHtml(char, isTrace, hasGridlines, fontStyle) {
		fontStyle = fontStyle || ($('#selected-font-style').val()) || 'sans';
		var gridlinesSvg = '';
		if (hasGridlines) {
			gridlinesSvg = 
				'<line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>' +
				'<line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>' +
				'<line x1="0" y1="0" x2="100" y2="100" stroke="#f1f5f9" stroke-width="0.8" stroke-dasharray="2 2"/>' +
				'<line x1="0" y1="100" x2="100" y2="0" stroke="#f1f5f9" stroke-width="0.8" stroke-dasharray="2 2"/>';
		}

		var charText = '';
		if (char) {
			var fill = isTrace ? '#cbd5e1' : '#0f172a';
			var fontFamily = (fontStyle === 'kaiti')
				? '\'AR PL UKai CN\', \'KaiTi\', \'STKaiti\', \'Kaiti SC\', \'楷体\', \'楷体_GB2312\', \'BiauKai\', \'Ma Shan Zheng\', serif'
				: '\'WenQuanYi Zen Hei\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'PingFang SC\', \'Microsoft YaHei\', \'Noto Sans SC\', sans-serif';
			charText = '<text x="50" y="74" text-anchor="middle" font-size="64" font-family="' + fontFamily + '" font-weight="normal" fill="' + fill + '">' + char + '</text>';
		}

		return '<div class="flex-1 aspect-square min-w-0">' +
			'<svg class="w-full h-full bg-white block" viewBox="0 0 100 100">' +
				'<rect x="0" y="0" width="100" height="100" fill="none" stroke="#64748b" stroke-width="1.8"/>' +
				gridlinesSvg +
				charText +
			'</svg>' +
		'</div>';
	}

	/* ==========================================================================
	   4. Live Worksheet Preview Renderer
	   ========================================================================== */
	function getLayoutConfig(charSize) {
		if (typeof window.getLayoutConfig === 'function') {
			return window.getLayoutConfig(charSize);
		}
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
		var printableWidth = 187;
		var cellWidth = printableWidth / numCols;
		return {
			charSize: charSize,
			label: label,
			numCols: numCols,
			practiceSquares: practiceSquares,
			traceSquares: traceSquares,
			rowsPerPage: rowsPerPage,
			cellWidth: cellWidth,
			cellHeight: cellWidth,
			printableWidth: printableWidth
		};
	}

	function renderLivePreview() {
		var chars = getCleanCharacters();
		var title = $('#doc-title').val() || '基础汉字书写练习';
		var charSize = Math.min(24, Math.max(12, Number($('#char-size').val()) || 17));
		var fontStyle = $('#selected-font-style').val() || 'sans';
		var layout = getLayoutConfig(charSize);
		var numCols = layout.numCols;
		var practiceSquares = layout.practiceSquares;
		var rowsPerPage = layout.rowsPerPage;
		var showTrace = $('#show-trace-guides').is(':checked');
		var numTrace = showTrace ? layout.traceSquares : 0;
		var useGrid = $('#use-gridlines').is(':checked');
		var showPinyin = $('#write-pinyin').is(':checked');
		var showStrokes = $('#paste-so-images').is(':checked');
		var showName = $('#write-name').is(':checked');

		// Sync font style toggle buttons & badges
		if (fontStyle === 'kaiti') {
			$('#font-style-kaiti')
				.addClass('border-red-600 bg-red-50/70 text-red-700 shadow-sm')
				.removeClass('border-slate-200 bg-white text-slate-700');
			$('#font-style-sans')
				.addClass('border-slate-200 bg-white text-slate-700')
				.removeClass('border-red-600 bg-red-50/70 text-red-700 shadow-sm');
			$('#font-style-badge').text('Brush / Calligraphy (楷体)');
			$('#worksheet-paper-container').addClass('font-chinese-kaiti').removeClass('chinese-font font-chinese-sans');
			$('#characters').addClass('font-chinese-kaiti').removeClass('chinese-font');
			$('#paper-title').addClass('font-chinese-kaiti').removeClass('chinese-font');
			$('#paper-header-name').addClass('font-chinese-kaiti').removeClass('chinese-font');
		} else {
			$('#font-style-sans')
				.addClass('border-red-600 bg-red-50/70 text-red-700 shadow-sm')
				.removeClass('border-slate-200 bg-white text-slate-700');
			$('#font-style-kaiti')
				.addClass('border-slate-200 bg-white text-slate-700')
				.removeClass('border-red-600 bg-red-50/70 text-red-700 shadow-sm');
			$('#font-style-badge').text('Sans-Serif (黑体)');
			$('#worksheet-paper-container').addClass('chinese-font font-chinese-sans').removeClass('font-chinese-kaiti');
			$('#characters').addClass('chinese-font').removeClass('font-chinese-kaiti');
			$('#paper-title').addClass('chinese-font').removeClass('font-chinese-kaiti');
			$('#paper-header-name').addClass('chinese-font').removeClass('font-chinese-kaiti');
		}

		// Pagination calculation based on rows per page
		totalPages = Math.max(1, Math.ceil(chars.length / rowsPerPage));
		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;

		// Update UI counters and badges
		$('#char-counter').text(chars.length + ' chars · ' + totalPages + ' ' + (totalPages === 1 ? 'page' : 'pages'));
		$('#char-size-val').text(charSize + ' mm · ' + layout.label);
		$('#char-size-desc').text('Automatically fits 1 reference + ' + practiceSquares + ' practice squares (' + (showTrace ? numTrace + ' faint trace + ' + (practiceSquares - numTrace) + ' blank' : practiceSquares + ' blank') + ') per row.');
		
		// Hide 1/1 pagination when only 1 page
		if (totalPages > 1) {
			$('#pagination-controls-wrapper').show();
			$('#paper-header-page').text(currentPage + ' / ' + totalPages).removeClass('hidden');
			$('#page-indicator').text('Page ' + currentPage + ' of ' + totalPages);
		} else {
			$('#pagination-controls-wrapper').hide();
			$('#paper-header-page').text('').addClass('hidden');
		}
		$('#prev-page-btn').prop('disabled', currentPage <= 1);
		$('#next-page-btn').prop('disabled', currentPage >= totalPages);

		// Paper Header
		$('#paper-title').text(title);
		if (showName) {
			$('#paper-header-name').show();
		} else {
			$('#paper-header-name').hide();
		}

		// Slice characters for current page
		var pageChars = chars.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
		var rowsContainer = $('#paper-rows');
		rowsContainer.empty();

		if (pageChars.length === 0) {
			rowsContainer.html(
				'<div class="py-20 text-center text-slate-400">' +
					'<p class="text-sm">No Chinese characters entered.</p>' +
					'<p class="text-xs mt-1">Type characters or select a preset above to begin.</p>' +
				'</div>'
			);
			return;
		}

		// Render character rows (up to rowsPerPage on this page)
		pageChars.forEach(function(char, idx) {
			var rowId = 'preview-row-' + idx;
			// Instant Pīnyīn resolution
			var singlePy = pinyinCache[char] || '';
			if (!singlePy && showPinyin) {
				singlePy = getPinyin(char);
				if (singlePy) {
					singlePy = singlePy.trim().split(/\s+/)[0];
					pinyinCache[char] = singlePy;
				}
			}

			var rowHtml = '<div id="' + rowId + '" class="flex flex-col gap-0.5 sm:gap-1 py-1">' +
				// Sub-row: Pinyin on left & Stroke Order directly to its right
				'<div class="flex items-center justify-start gap-2 px-0.5 min-h-[18px] sm:min-h-[20px]">' +
					'<div class="row-pinyin font-sans text-slate-800 font-semibold text-xs sm:text-[13px] shrink-0 leading-tight" style="' + (showPinyin ? '' : 'display:none;') + '">' + (showPinyin ? singlePy : '') + '</div>' +
					'<div class="row-strokes flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar"></div>' +
				'</div>' +
				// Main row: Automatically filled practice boxes
				'<div class="flex items-center gap-0.5 sm:gap-1 w-full">';

			// Box 0: Reference character
			rowHtml += createPracticeBoxHtml(char, false, useGrid, fontStyle);

			// Practice boxes (Boxes 1 to practiceSquares)
			for (var b = 1; b <= practiceSquares; b++) {
				var isTraceBox = (b <= numTrace);
				rowHtml += createPracticeBoxHtml(isTraceBox ? char : '', isTraceBox, useGrid, fontStyle);
			}

			rowHtml += '</div></div>';
			rowsContainer.append(rowHtml);

			// If pinyin needed async update
			if (showPinyin && !singlePy) {
				getPinyin(char, function(py) {
					var pyText = py ? py.trim().split(/\s+/)[0] : '';
					pinyinCache[char] = pyText;
					$('#' + rowId + ' .row-pinyin').text(pyText).show();
				});
			}

			// Render HanziWriter fanning stroke order SVGs
			if (showStrokes) {
				var strokesDiv = $('#' + rowId + ' .row-strokes').show();
				if (strokesCache[char]) {
					renderFanningSvgInPreview(strokesDiv, strokesCache[char], fontStyle);
				} else {
					HanziWriter.loadCharacterData(char, {
						charDataLoader: function(c, onDone, onErr) {
							var encoded = encodeURIComponent(c);
							$.getJSON('/data/strokes/' + encoded + '.json')
								.done(onDone)
								.fail(function() {
									$.getJSON('data/strokes/' + encoded + '.json')
										.done(onDone)
										.fail(function() {
											// Last-resort fallback if local static file server is unavailable
											$.getJSON('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/' + encoded + '.json')
												.done(onDone)
												.fail(onErr);
										});
								});
						}
					}).then(function(data) {
						if (data && data.strokes) {
							strokesCache[char] = {
								strokes: data.strokes,
								medians: data.medians || []
							};
							renderFanningSvgInPreview(strokesDiv, strokesCache[char], fontStyle);
						}
					}).catch(function() {});
				}
			} else {
				$('#' + rowId + ' .row-strokes').hide();
			}
		});

		// Fill remaining rows up to rowsPerPage with clean practice grids to eliminate dead white space
		if (pageChars.length < rowsPerPage) {
			for (var emptyIdx = pageChars.length; emptyIdx < rowsPerPage; emptyIdx++) {
				var emptyRowId = 'preview-row-empty-' + emptyIdx;
				var emptyRowHtml = '<div id="' + emptyRowId + '" class="flex flex-col gap-0.5 sm:gap-1 py-1">' +
					// Sub-row spacer to keep exact row height and alignment
					'<div class="flex items-center justify-start gap-2 px-0.5 min-h-[18px] sm:min-h-[20px] invisible select-none">' +
						'<div class="font-sans text-xs leading-tight">&nbsp;</div>' +
					'</div>' +
					// Main row: Practice grid boxes matching current row width and column count
					'<div class="flex items-center gap-0.5 sm:gap-1 w-full">';
				for (var eb = 0; eb < numCols; eb++) {
					emptyRowHtml += createPracticeBoxHtml('', false, useGrid, fontStyle);
				}
				emptyRowHtml += '</div></div>';
				rowsContainer.append(emptyRowHtml);
			}
		}
	}

	function medianToSvgPath(points) {
		if (!points || points.length === 0) return '';
		return 'M ' + points.map(function(pt) { return pt[0] + ' ' + pt[1]; }).join(' L ');
	}

	function renderFanningSvgInPreview(container, charData, fontStyle) {
		container.empty();
		var strokes = (charData && charData.strokes) ? charData.strokes : (Array.isArray(charData) ? charData : []);
		var medians = (charData && charData.medians) ? charData.medians : null;
		var isSans = (fontStyle === 'sans' && Array.isArray(medians) && medians.length > 0);

		strokes.forEach(function(s, idx) {
			var svgEl = '<svg class="w-4 h-4 sm:w-[18px] sm:h-[18px] border border-slate-200 rounded-[2px] bg-white p-0.5 shrink-0" viewBox="0 0 1024 1024">' +
				'<g transform="translate(0, 900) scale(1, -1)">';

			if (isSans) {
				var mediansPortion = medians.slice(0, idx + 1);
				mediansPortion.forEach(function(m) {
					var pathD = medianToSvgPath(m);
					svgEl += '<path d="' + pathD + '" fill="none" stroke="#1e293b" stroke-width="76" stroke-linecap="round" stroke-linejoin="round"/>';
				});
			} else {
				var portion = strokes.slice(0, idx + 1);
				portion.forEach(function(pathD) {
					svgEl += '<path d="' + pathD + '" fill="#1e293b"/>';
				});
			}

			svgEl += '</g></svg>';
			container.append(svgEl);
		});
	}

	function schedulePreviewUpdate() {
		clearTimeout(previewDebounceTimer);
		previewDebounceTimer = setTimeout(renderLivePreview, 120);
	}

	/* ==========================================================================
	   5. Event Listeners for Live Updates
	   ========================================================================== */
	$('#characters, #doc-title').on('input', schedulePreviewUpdate);
	$('#char-size').on('input change', function() {
		var val = Math.min(24, Math.max(12, Number($(this).val()) || 17));
		var layout = getLayoutConfig(val);
		var showTrace = $('#show-trace-guides').is(':checked');
		var numTrace = showTrace ? layout.traceSquares : 0;
		$('#char-size-val').text(val + ' mm · ' + layout.label);
		$('#char-size-desc').text('Automatically fits 1 reference + ' + layout.practiceSquares + ' practice squares (' + (showTrace ? numTrace + ' faint trace + ' + (layout.practiceSquares - numTrace) + ' blank' : layout.practiceSquares + ' blank') + ') per row.');
		schedulePreviewUpdate();
	});
	$('#show-trace-guides, #removeDuplicates, #use-gridlines, #write-pinyin, #paste-so-images, #write-name').on('change', schedulePreviewUpdate);

	// Font Style Switcher
	$('.font-style-btn').click(function() {
		var selected = $(this).data('font');
		$('#selected-font-style').val(selected);
		renderLivePreview();
	});

	// Presets
	$('.preset-btn').click(function() {
		var chars = $(this).data('chars');
		$('#characters').val(chars);
		currentPage = 1;
		schedulePreviewUpdate();
	});

	// Pagination
	$('#prev-page-btn').click(function() {
		if (currentPage > 1) {
			currentPage--;
			renderLivePreview();
		}
	});
	$('#next-page-btn').click(function() {
		if (currentPage < totalPages) {
			currentPage++;
			renderLivePreview();
		}
	});

	/* ==========================================================================
	   6. PDF Creation Orchestration
	   ========================================================================== */
	function triggerPdfCreation() {
		var chars = getCleanCharacters();
		if (chars.length === 0) {
			alert('Please enter at least one Chinese character to generate a worksheet.');
			return;
		}

		var docTitle = $('#doc-title').val() || '基础汉字书写练习';
		var charSize = Math.min(24, Math.max(12, Number($('#char-size').val()) || 17));
		var fontStyle = $('#selected-font-style').val() || 'sans';
		var showTrace = $('#show-trace-guides').is(':checked');
		var pasteSoImages = $('#paste-so-images').is(':checked');
		var writePinyin = $('#write-pinyin').is(':checked');
		var useGridlines = $('#use-gridlines').is(':checked');
		var writeName = $('#write-name').is(':checked');
		var filename = $('#doc-filename').val() || docTitle;
		var wayOfRetrieval = $('input[name=way-of-retr]:checked').val() || 'download';

		// Clean up existing template clones
		$('[id^=strokeOrderSvgs-]').not('#strokeOrderSvgs-template').remove();

		// Show status
		$('#statusTr').removeClass('hidden success error').addClass('processing flex');
		$('#status-spinner').removeClass('hidden');
		$('#mainstatus').text('Generating PDF...');
		$('#substatus').html('Preparing stroke order vector diagrams (<span class="amountDone">0</span>/' + chars.length + ')');
		$('#formFieldset *').prop('disabled', true);
		$('#create-pdf, #top-btn-download, #mobile-btn-download').prop('disabled', true);

		var remainingCallbacks = chars.length;

		for (var i = 0; i < chars.length; i++) {
			var char = chars[i];
			$('#strokeOrderSvgs-template').clone().attr('id', 'strokeOrderSvgs-' + char).insertAfter('#strokeOrderSvgs-template');

			drawSO(pasteSoImages, char, (function(c) {
				return function() {
					remainingCallbacks--;
					$('.amountDone').text(chars.length - remainingCallbacks);

					if (remainingCallbacks <= 0) {
						if (writePinyin) {
							$('#substatus').text('Resolving Pīnyīn transliteration...');
							getPinyin(chars.join(' '), function(pyResult) {
								var charPinyin = pyResult ? pyResult.trim().split(/\s+/) : [];
								if (charPinyin.length !== chars.length) {
									charPinyin = chars.map(function(c) {
										return pinyinCache[c] || (typeof pinyinPro !== 'undefined' ? pinyinPro.pinyin(c, { toneType: 'symbol' }) : '');
									});
								}
								createPdf(docTitle, chars, charSize, pasteSoImages, writePinyin, useGridlines, writeName, filename, charPinyin, wayOfRetrieval, showTrace, fontStyle);
							});
						} else {
							createPdf(docTitle, chars, charSize, pasteSoImages, writePinyin, useGridlines, writeName, filename, [], wayOfRetrieval, showTrace, fontStyle);
						}
					}
				};
			})(char), fontStyle);
		}
	}

	$('#create-pdf, #top-btn-download, #mobile-btn-download').click(triggerPdfCreation);

	// Global hook called when createPdf completes
	window.onPdfCreated = function() {
		$('#statusTr').removeClass('processing').addClass('success');
		$('#status-spinner').addClass('hidden');
		$('#mainstatus').text('PDF Created Successfully!');
		$('#substatus').html('Worksheet exported in print-ready A4 format.');
		$('#formFieldset *').prop('disabled', false);
		$('#create-pdf, #top-btn-download, #mobile-btn-download').prop('disabled', false);
	};

	/* ==========================================================================
	   7. Direct Printing
	   ========================================================================== */
	$('#top-btn-print, #sidebar-btn-print, #mobile-btn-print').click(function() {
		window.print();
	});

	/* ==========================================================================
	   8. About & Guide Modal
	   ========================================================================== */
	$('#top-btn-about, #mobile-top-btn-about').click(function() {
		$('#about-modal').removeClass('hidden').addClass('flex');
	});
	$('#close-about-modal, #dismiss-about-modal').click(function() {
		$('#about-modal').removeClass('flex').addClass('hidden');
	});

	/* ==========================================================================
	   9. Initial Mount
	   ========================================================================== */
	renderLivePreview();
});
