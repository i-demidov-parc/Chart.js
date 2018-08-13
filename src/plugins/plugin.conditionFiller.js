'use strict';

var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');

function doFill (ctx, points, conditionBoundaries, color, chartArea) {
	var currentPoint;
	var nextPoint;
	var currentPointView;
	var nextPointView;

	ctx.save();
	ctx.beginPath();

	for (var i = 0, imax = points.length; i < imax; i++) {
		currentPoint = points[i];
		nextPoint = points[i + 1];
		currentPointView = currentPoint && currentPoint._view;
		nextPointView = nextPoint ? nextPoint._view : {
			x: chartArea.right
		};

		if (conditionBoundaries.max !== undefined) {
			if (currentPointView.y < conditionBoundaries.max) {
				ctx.rect(currentPointView.x, currentPointView.y, nextPointView.x - currentPointView.x, conditionBoundaries.max - currentPointView.y);
			}
		}

		if (conditionBoundaries.min !== undefined) {
			if (currentPointView.y > conditionBoundaries.min) {
				ctx.rect(currentPointView.x, conditionBoundaries.min, nextPointView.x - currentPointView.x, currentPointView.y - conditionBoundaries.min);
			}
		}
	}

	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
}

module.exports = {
	afterDatasetsUpdate: function(chart, options) {
		var count = (chart.data.datasets || []).length;
		var meta, i, el, source, scale, conditionBoundaries;

		for (i = 0; i < count; ++i) {
			meta = chart.getDatasetMeta(i);
			el = meta.dataset;
			source = null;

			if (el && el._model) {
				scale = el._scale;
				conditionBoundaries = chart.config.data.conditionBoundaries || {};

				if (conditionBoundaries.min > conditionBoundaries.max) {
					var min = conditionBoundaries.min;

					conditionBoundaries.min = conditionBoundaries.max;
					conditionBoundaries.max = min;
				}

				source = {
					visible: chart.isDatasetVisible(i),
					chart: chart,
					el: el,
					conditionBoundaries: {
						max: conditionBoundaries.max && scale.getPixelForValue(conditionBoundaries.max),
						min: conditionBoundaries.min && scale.getPixelForValue(conditionBoundaries.min)
					}
				};
			}

			meta.$conditionFiller = source;
		}
	},

	beforeDatasetDraw: function(chart, args) {
		var meta = args.meta.$conditionFiller;

		if (!meta) {
			return;
		}

		var ctx = chart.ctx;
		var el = meta.el;
		var view = el._view;
		var points = el._children || [];
		var color = view.backgroundColor || defaults.global.defaultColor;

		if (color && points.length && meta.visible) {
			helpers.canvas.clipArea(ctx, chart.chartArea);

			doFill(ctx, points, meta.conditionBoundaries, color, chart.chartArea);

			helpers.canvas.unclipArea(ctx);
		}
	}
};
