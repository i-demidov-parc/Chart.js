'use strict';

var defaults = require('../core/core.defaults');
var Element = require('../core/core.element');
var helpers = require('../helpers/index');

var defaultColor = defaults.global.defaultColor;

defaults._set('global', {
	elements: {
		wat: {
			radius: 3,
			pointStyle: 'circle',
			backgroundColor: defaultColor,
			borderColor: defaultColor,
			borderWidth: 1,
			// Hover
			hitRadius: 1,
			hoverRadius: 4,
			hoverBorderWidth: 1
		}
	}
});

function xRange(mouseX) {
	var vm = this._view;
	return vm ? (Math.abs(mouseX - vm.x) < vm.radius + vm.hitRadius) : false;
}

function yRange(mouseY) {
	var vm = this._view;
	return vm ? (Math.abs(mouseY - vm.y) < vm.radius + vm.hitRadius) : false;
}

function fixNum(num) {
	if (num) {
		num = parseFloat(num.toFixed(1));
	}

	return num;
}

module.exports = Element.extend({
	inRange: function(mouseX, mouseY) {
		var vm = this._view;
		return vm ? ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2)) : false;
	},

	inLabelRange: xRange,
	inXRange: xRange,
	inYRange: yRange,

	getCenterPoint: function() {
		var me = this;
		var vm = me._view;
		var x = vm.x + me._xScale.scaleItemCenter;

		return {
			x: x,
			y: vm.y
		};
	},

	getArea: function() {
		return Math.PI * Math.pow(this._view.radius, 2);
	},

	tooltipPosition: function() {
		var me = this;
		var vm = this._view;
		var x = vm.x + me._xScale.scaleItemCenter;

		return {
			x: x,
			y: vm.y,
			padding: vm.radius + vm.borderWidth
		};
	},

	draw: function(chartArea, nextPoint) {
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
});
