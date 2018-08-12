'use strict';

var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

defaults._set('conditionLine', {
	showLines: true,
	spanGaps: false,

	hover: {
		mode: 'point',
		animationDuration: 0	// TODO: delete
	},

	scales: {
		xAxes: [{
			type: 'conditionCategory',
			id: 'x-axis-0'
		}],
		yAxes: [{
			type: 'conditionLinear',
			id: 'y-axis-0'
		}]
	},

	animation: {
		duration: 0	// TODO: delete
	},

	responsiveAnimationDuration: 0	// TODO: delete
});

module.exports = function(Chart) {
	
	function lineEnabled(dataset, options) {
		return helpers.valueOrDefault(dataset.showLine, options.showLines);
	}

	Chart.controllers.conditionLine = Chart.controllers.line.extend({

		datasetElementType: elements.ConditionLine,

		dataElementType: elements.ConditionPoints,

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

				meta.dataset.draw();

				helpers.canvas.unclipArea(chart.ctx);
			}

			// Draw the points
			for (; i < ilen; ++i) {
				points[i].draw(area, points[i + 1]);
			}
		},
	});
};
