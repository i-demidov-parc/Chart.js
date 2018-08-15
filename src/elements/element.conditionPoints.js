'use strict';

var defaults = require('../core/core.defaults');
var Element = require('../core/core.element');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var defaultColor = defaults.global.defaultColor;

function fixNum(num) {
	if (num) {
		num = parseFloat(num.toFixed(1));
	}

	return num;
}

module.exports = elements.Point.extend({
	inRange: function(mouseX, mouseY) {
		var me = this;
		var vm = me._view;
		var x1, x2, by1, by2, inRange;

		if (!vm) {
			return false;
		}

		x1 = vm.x;
		inRange = (Math.pow(mouseX - x1, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2);

		if (!inRange) {
			x2 = x1 + me._xScale.scaleItemDistance;
			inRange = (Math.pow(mouseX - x2, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2);
		}

		if (!inRange) {
			by1 = vm.y - vm.hitRadius - vm.radius;
			by2 = vm.y + vm.hitRadius + vm.radius;

			inRange = mouseX >= x1 &&
					  mouseX <= x2 &&
					  mouseY >= by1 &&
					  mouseY <= by2;
		}

		return inRange;
	},

	getCenterPoint: function() {
		var me = this;
		var vm = me._view;
		var x = vm.x + me._xScale.scaleItemCenter;

		return {
			x: x,
			y: vm.y
		};
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
			console.log(vm.pointsLineWidth);

			if (vm.pointsLineWidth) {
				ctx.beginPath();
				ctx.strokeStyle = vm.borderColor || defaultColor;
				ctx.lineWidth = vm.pointsLineWidth;
				ctx.moveTo(x, y);
				ctx.lineTo(nextPointX, y);
				ctx.stroke();
			}

			ctx.strokeStyle = vm.borderColor || defaultColor;
			ctx.lineWidth = helpers.valueOrDefault(vm.borderWidth, defaults.global.elements.point.borderWidth);
			ctx.fillStyle = vm.backgroundColor || defaultColor;
			helpers.canvas.drawPoint(ctx, pointStyle, radius, x, y, rotation);
			helpers.canvas.drawPoint(ctx, pointStyle, radius, nextPointX, y, rotation);
		}
	}
});
