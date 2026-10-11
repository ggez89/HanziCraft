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
	function createPracticeBoxHtml(char, isTrace, hasGridlines) {
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
			charText = '<text x="50" y="74" text-anchor="middle" font-size="64" font-family="\'WenQuanYi Zen Hei\', -apple-system, BlinkMacSystemFont, \'PingFang SC\', \'Microsoft YaHei\', \'Noto Sans SC\', sans-serif" font-weight="normal" fill="' + fill + '">' + char + '</text>';
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
	function renderLivePreview() {
		var chars = getCleanCharacters();
		var title = $('#doc-title').val() || '基础汉字书写练习';
		var numTrace = Math.min(10, Math.max(0, Number($('#number-gray-signs').val()) || 0));
		var useGrid = $('#use-gridlines').is(':checked');
		var showPinyin = $('#write-pinyin').is(':checked');
		var showStrokes = $('#paste-so-images').is(':checked');
		var showName = $('#write-name').is(':checked');

		// Pagination calculation (11 characters per page max)
		totalPages = Math.max(1, Math.ceil(chars.length / 11));
		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;

		// Update UI counters
		$('#char-counter').text(chars.length + ' chars · ' + totalPages + ' ' + (totalPages === 1 ? 'page' : 'pages'));
		$('#gray-signs-val').text(numTrace + ' / 10 squares');
		$('#page-indicator').text('Page ' + currentPage + ' of ' + totalPages);
		$('#paper-header-page').text(currentPage + ' / ' + totalPages);
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
		var pageChars = chars.slice((currentPage - 1) * 11, currentPage * 11);
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

		// Render rows
		pageChars.forEach(function(char, idx) {
			var rowId = 'preview-row-' + idx;
			var rowHtml = '<div id="' + rowId + '" class="flex flex-col gap-0.5 sm:gap-1 py-0.5 sm:py-1">' +
				// Sub-row: Pinyin on left & Stroke Order directly to its right
				'<div class="flex items-center justify-start gap-1.5 sm:gap-2.5 text-xs px-0.5 min-h-[16px] sm:min-h-[18px]">' +
					'<div class="row-pinyin font-mono text-slate-700 font-semibold h-3.5 sm:h-4 text-[10px] sm:text-xs shrink-0 leading-none"></div>' +
					'<div class="row-strokes flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar"></div>' +
				'</div>' +
				// Main row: 11 Practice boxes
				'<div class="flex items-center gap-0.5 sm:gap-1 w-full">';

			// Box 0: Reference character
			rowHtml += createPracticeBoxHtml(char, false, useGrid);

			// Boxes 1 to 10: Practice boxes
			for (var b = 1; b <= 10; b++) {
				var isTraceBox = (b <= numTrace);
				rowHtml += createPracticeBoxHtml(isTraceBox ? char : '', isTraceBox, useGrid);
			}

			rowHtml += '</div></div>';
			rowsContainer.append(rowHtml);

			// Fetch & display Pinyin
			if (showPinyin) {
				$('#' + rowId + ' .row-pinyin').show();
				if (pinyinCache[char]) {
					$('#' + rowId + ' .row-pinyin').text(pinyinCache[char]);
				} else {
					getPinyin(char, function(py) {
						var singlePy = py.trim().split(' ')[0] || '';
						pinyinCache[char] = singlePy;
						$('#' + rowId + ' .row-pinyin').text(singlePy);
					});
				}
			} else {
				$('#' + rowId + ' .row-pinyin').hide();
			}

			// Render HanziWriter fanning stroke order SVGs
			if (showStrokes) {
				var strokesDiv = $('#' + rowId + ' .row-strokes').show();
				if (strokesCache[char]) {
					renderFanningSvgInPreview(strokesDiv, strokesCache[char]);
				} else {
					HanziWriter.loadCharacterData(char, {
						charDataLoader: function(c, onDone, onErr) {
							$.getJSON('/data/strokes/' + encodeURIComponent(c) + '.json')
								.done(onDone)
								.fail(function() {
									$.getJSON('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/' + encodeURIComponent(c) + '.json')
										.done(onDone)
										.fail(onErr);
								});
						}
					}).then(function(data) {
						if (data && data.strokes) {
							strokesCache[char] = data.strokes;
							renderFanningSvgInPreview(strokesDiv, data.strokes);
						}
					}).catch(function() {});
				}
			} else {
				$('#' + rowId + ' .row-strokes').hide();
			}
		});
	}

	function renderFanningSvgInPreview(container, strokes) {
		container.empty();
		strokes.forEach(function(s, idx) {
			var portion = strokes.slice(0, idx + 1);
			var svgEl = '<svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-200 rounded-[2px] bg-white p-0.5 shrink-0" viewBox="0 0 1024 1024">' +
				'<g transform="translate(0, 900) scale(1, -1)">';
			portion.forEach(function(pathD) {
				svgEl += '<path d="' + pathD + '" fill="#1e293b"/>';
			});
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
	$('#number-gray-signs').on('input change', function() {
		$('#gray-signs-val').text($(this).val() + ' / 10 squares');
		schedulePreviewUpdate();
	});
	$('#removeDuplicates, #use-gridlines, #write-pinyin, #paste-so-images, #write-name').on('change', schedulePreviewUpdate);

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
		var numberOfGrayscaleSigns = Math.min(10, Math.max(0, Number($('#number-gray-signs').val())));
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
							getPinyin(chars.join(''), function(pyResult) {
								var charPinyin = pyResult.trim().split(/\s+/);
								createPdf(docTitle, chars, numberOfGrayscaleSigns, pasteSoImages, writePinyin, useGridlines, writeName, filename, charPinyin, wayOfRetrieval);
							});
						} else {
							createPdf(docTitle, chars, numberOfGrayscaleSigns, pasteSoImages, writePinyin, useGridlines, writeName, filename, [], wayOfRetrieval);
						}
					}
				};
			})(char));
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
