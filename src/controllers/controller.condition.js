'use strict';

var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');

var globalDefaults = defaults.global;

defaults._set('condition', {
	showLines: true,
	spanGaps: false,

	hover: {
		mode: 'label'
	},

	scales: {
		xAxes: [{
			type: 'conditionCategory',
			id: 'x-axis-0'
		}],
		yAxes: [{
			type: 'linear',
			id: 'y-axis-0'
		}]
	}
});

module.exports = function(Chart) {

	function lineEnabled(dataset, options) {
		return helpers.valueOrDefault(dataset.showLine, options.showLines);
	}

	function datasetDraw() {
		var me = this;
		var vm = me._view;
		var ctx = me._chart.ctx;
		var spanGaps = vm.spanGaps;
		var points = me._children.slice(); // clone array
		var globalOptionLineElements = globalDefaults.elements.line;
		var lastDrawnIndex = -1;
		var index, current, previous, currentVM;

		// If we are looping, adding the first point again
		if (me._loop && points.length) {
			points.push(points[0]);
		}

		ctx.save();

		// Stroke Line Options
		ctx.lineCap = vm.borderCapStyle || globalOptionLineElements.borderCapStyle;

		// IE 9 and 10 do not support line dash
		if (ctx.setLineDash) {
			ctx.setLineDash(vm.borderDash || globalOptionLineElements.borderDash);
		}

		ctx.lineDashOffset = vm.borderDashOffset || globalOptionLineElements.borderDashOffset;
		ctx.lineJoin = vm.borderJoinStyle || globalOptionLineElements.borderJoinStyle;
		ctx.lineWidth = vm.borderWidth || globalOptionLineElements.borderWidth;
		ctx.strokeStyle = vm.borderColor || globalDefaults.defaultColor;

		// Stroke Line
		ctx.beginPath();
		lastDrawnIndex = -1;

		for (index = 0; index < points.length; ++index) {
			current = points[index];
			previous = helpers.previousItem(points, index);
			currentVM = current._view;

			// First point moves to it's starting position no matter what
			if (index === 0) {
				if (!currentVM.skip) {
					ctx.moveTo(currentVM.x, currentVM.y);
					lastDrawnIndex = index;
				}
			} else {
				previous = lastDrawnIndex === -1 ? previous : points[lastDrawnIndex];

				if (!currentVM.skip) {
					if ((lastDrawnIndex !== (index - 1) && !spanGaps) || lastDrawnIndex === -1) {
						// There was a gap and this is the first point after the gap
						ctx.moveTo(currentVM.x, currentVM.y);
					} else {
						// Line to next point
						// helpers.canvas.lineTo(ctx, previous._view, current._view);

						ctx.lineTo(current._view.x, previous._view.y);
						ctx.lineTo(current._view.x, current._view.y);
					}
					lastDrawnIndex = index;
				}
			}
		}

		ctx.lineTo(me._chart.chartArea.right, currentVM.y);

		ctx.stroke();
		ctx.restore();
	}

	function pointDraw(chartArea, nextPoint) {
		var vm = this._view;
		var model = this._model;
		var ctx = this._chart.ctx;
		var pointStyle = vm.pointStyle;
		var rotation = vm.rotation;
		var radius = vm.radius;
		var x = vm.x;
		var y = vm.y;
		var nextPointX = nextPoint ? nextPoint._view.x : chartArea.right;
		var errMargin = 1.01; // 1.01 is margin for Accumulated error. (Especially Edge, IE.)

		if (vm.skip) {
			return;
		}

		var isPointInArea = fixNum(model.x) >= fixNum(chartArea.left) &&
			fixNum(chartArea.right * errMargin) >= fixNum(model.x) &&
			fixNum(model.y) >= fixNum(chartArea.top) &&
			fixNum(chartArea.bottom * errMargin) >= fixNum(model.y);

		// Clipping for Points.
		if (chartArea === undefined || isPointInArea) {
			ctx.strokeStyle = vm.borderColor || defaultColor;
			ctx.lineWidth = helpers.valueOrDefault(vm.borderWidth, defaults.global.elements.point.borderWidth);
			ctx.fillStyle = vm.backgroundColor || defaultColor;
			helpers.canvas.drawPoint(ctx, pointStyle, radius, x, y, rotation);
			helpers.canvas.drawPoint(ctx, pointStyle, radius, nextPointX, y, rotation);
		}
	}

	function fixNum(num) {
		if (num) {
			num = parseFloat(num.toFixed(1));
		}

		return num;
	}

	Chart.controllers.condition = Chart.controllers.line.extend({
		draw: function() {
			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var points = meta.data || [];
			var area = chart.chartArea;
			var ilen = points.length;
			var halfBorderWidth;
			var i = 0;

			if (lineEnabled(me.getDataset(), chart.options)) {
				halfBorderWidth = (meta.dataset._model.borderWidth || 0) / 2;

				helpers.canvas.clipArea(chart.ctx, {
					left: area.left,
					right: area.right,
					top: area.top - halfBorderWidth,
					bottom: area.bottom + halfBorderWidth
				});

				datasetDraw.call(meta.dataset);

				helpers.canvas.unclipArea(chart.ctx);
			}

			// Draw the points
			for (; i < ilen; ++i) {
				pointDraw.apply(points[i], [area, points[i + 1]]);
			}
		},
	});
};
