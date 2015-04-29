			// hook page ready to setup the calculator
			$(function () {
				// function to compute fret position
				function fretPosition(fretNumber, scaleLength) {
					// http://www.liutaiomottola.com/formulae/fret.htm
					var pos = scaleLength - (scaleLength / Math.pow(2, (fretNumber / 12)));
					// round to 3 digits and return
					return pos.toFixed(3);
				}
								
				// return a fret marker string for a fret number
				function fretMarker(fretNumber) {
					var singles = [3, 5, 7, 9];

					// pattern repeats every 12 frets
					fretNumber = ((fretNumber-1) % 12) + 1;

					if ($.inArray(fretNumber, singles) >= 0) {
						// we have a single dot
						return '&bull;';
					}

					if (fretNumber == 12) {
						// we have a double dot
						return '&bull;&nbsp;&bull;';
					}

					// empty
					return '&nbsp;';
				}

				function showError(message) {
					// hide results
					$('#fretPositions').addClass('hidden');
					// show error
					$('#errorMessage').text(message).removeClass('hidden');
				}

				function showResults() {
					// hide error
					$('#errorMessage').text('').addClass('hidden');
					// show results
					$('#fretPositions').removeClass('hidden');
				}

				// changing selection copies value to scale length
				$('#preDefinedScaleLength').change(function () {
					var data = $('#preDefinedScaleLength option:selected').data();

					if (data !== null && data !== undefined) {
						if (data.scale !== undefined) {
							$('#scaleLength').val(data.scale);
						}

						if (data.frets !== undefined) {
							$('#numFrets').val(data.frets);
						}
					}
				});

				// click on calculate computes the positions.
				$('#fretcalc').submit(function (event) {
					var scale = parseFloat($('#scaleLength').val()),
						frets = parseInt($('#numFrets').val(), 10),
						minHeight = parseInt($('#minHeight').val(), 10),
						tbody, height, heightScale, pos,
						i, html;

					// prevent default form submission
					event.preventDefault();

					// validate that we have a number
					if (isNaN(scale) || scale <= 0.0) {
						showError('Please enter a number in the Scale Length field, or select a pre-defined one.');
						return;
					}
					if (isNaN(frets) || frets < 1) {
						showError('Please specify a number of frets.');
						return;
					}
					if (isNaN(minHeight) || minHeight < 1) {
						showError('Please configure the minHeight input.');
						return;
					}

					// remove any previous output rows
					tbody = $('#fretPositions > tbody').empty();

					// calculate the scaling factor to apply for cell heights
					heightScale = minHeight / (fretPosition(frets, 1.0) - fretPosition(frets-1, 1.0));

					// the nut
					tbody.append('<tr><td>Nut</td><td>0.0</td><td class="nut"></td></tr>');
					
					// generate the new rows
					for (i = 1; i <= frets; i = i + 1) {
						pos = fretPosition(i, scale);
						
						height = heightScale * (fretPosition(i, 1.0) - fretPosition(i-1, 1.0));
						
						html  = '<tr>';
						html += '<td>' + (i).toString() + '</td>';
						html += '<td>' + pos.toString() + '</td>';
						html += '<td class="fret" style="height: ' + height + 'px;">' + fretMarker(i) + '</td>';
						html += '</tr>';

						tbody.append(html);
					}
					
					// the end of the fret board
					tbody.append('<tr><td class="noborder"></td><td class="noborder"></td><td class="end"></td></tr>');

					// make visible
					showResults();
				});

			});