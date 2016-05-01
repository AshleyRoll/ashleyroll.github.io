/*global angular */
/*jslint white: true, browser: true */

/*
** Application Main script and Navigation Controller
*/

(function (angular) {
	'use strict';

	var module = angular.module('tgApp',
		[
		]);
		
	//
	// Directive "while-held" allows a button etc to continously 
	// call a function (like ngClick) but repeating until released
	// 
	module.directive('whileHeld', ['$interval', '$timeout', '$parse', function ($interval, $timeout, $parse) {	
		return {
			restrict: 'A',
			scope: {
				'whileHeld': '&',
				'whileHeldRate': '=',
				'whileHeldDelay': '='
			},
			link: function (scope, element) {
				var action = $parse(scope.whileHeld),
					timerDelay = null, timerRepeat = null;
					
				function tickAction() {
					// call the parsed handler
					action(scope);
				}
				
				function endAction() {
					if(timerDelay !== null) {
						$timeout.cancel(timerDelay);
						timerDelay = null;
					}
					
					if(timerRepeat !== null) {
						$interval.cancel(timerRepeat);
						timerRepeat = null;
					}
					unBindEndAction();
				}
				
				function bindEndAction() {
					element.on('mouseup', endAction);
					element.on('mouseleave', endAction);
				}
				
				function unBindEndAction() {
					element.off('mouseup', endAction);
					element.off('mouseleave', endAction);
				}			
				
					
				function beginAction(e) {
					e.preventDefault();
					tickAction();	// do the action immediately
					
					// start a timeout for the initial delay
					timerDelay = $timeout(function() {
						timerDelay = null;	// make sure we don't try to cancel this now that it is done
						
						// do the "first" repeat
						tickAction();
						
						// start the interval to run the continous actions
						timerRepeat = $interval(tickAction, scope.whileHeldRate);
					}, scope.whileHeldDelay);
					
					bindEndAction();
				}
					
					
				function bindWhilePressed() {
					element.on('mousedown', beginAction);
				}
				
				bindWhilePressed();			
			}
		};
	}]);
	
		
	//
	// Main Controller runs the show...
	//
	module.controller('MainCtrl', ['$scope', '$timeout', function($scope, $timeout) {
		var audioContext, osc, gain;
		
		// attempt to create an audio context
		try {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		} catch(e) {
			alert("Your browser doesn't support the Web Audio API. Try Chrome, Firefox, Safari, Opera, or Edge.");
			throw e;
		}
		
		$scope.limits = {
			minFrequency: 40,
			maxFrequency: 5000,
			numberOfOctaves: 0,
			initialFrequency: 440
		};
		
				
		function computeVolume(fromValue) {
			var fraction = parseInt(fromValue) / 100;
			// Let's use an x*x curve (x-squared) since simple linear (x) does not
			// sound as good.
			return fraction * fraction;
		}
		
		
		$scope.data = {
			volume: '50',			// range input gives us a string
			frequency: '0',			// range input gives us a string,
			scaledVolume: 0,		// we scale the volume to make it respond reasonably to the ear
		};
		
		$scope.data.scaledVolume = computeVolume($scope.data.volume);
		
		// the slider isn't fully supported by Angular, ngMin and ngMax don't seem to work
		// so we have to bind this using {{}} and this results in the value defaulting to 100.
		$timeout(function() {
			$scope.data.frequency = $scope.limits.initialFrequency.toString();
		}, 10);
		
		
		
		$scope.Play = function() {
			if(!$scope.data.playing) {
				$scope.data.playing = true;
				
				// create oscillator
				osc = audioContext.createOscillator();
				osc.type = 'sine';
				osc.frequency.value = $scope.data.frequency;
				
				
				// create gain node
				gain = audioContext.createGain();
				gain.gain.value = $scope.data.scaledVolume;
				
				// wire together
				osc.connect(gain);
				gain.connect(audioContext.destination);
				
				osc.start();
			}
		};
		
		$scope.Stop = function() {
			if($scope.data.playing) {
				$scope.data.playing = false;
				gain.gain.value = 0.0;
				osc.stop();
				osc = undefined;
				gain = undefined;
			}
		};
		
		$scope.UpdateVolume = function() {
			$scope.data.scaledVolume = computeVolume($scope.data.volume);
			if($scope.data.playing) {
				gain.gain.value = $scope.data.scaledVolume;
			}
		};
		
		$scope.UpdateFrequency = function() {
			if($scope.data.playing) {
				osc.frequency.value = $scope.data.frequency;
			}
		};
		
		$scope.MoveFrequency = function(amount) {
			var f = parseFloat($scope.data.frequency) + amount;
			if(f < $scope.limits.minFrequency) {
				f = $scope.limits.minFrequency;
			}
			
			if(f > $scope.limits.maxFrequency) {
				f = $scope.limits.maxFrequency;
			}
			$scope.data.frequency = f.toString();
			$scope.UpdateFrequency();
		};
		
		
	}]);
	
}(angular));