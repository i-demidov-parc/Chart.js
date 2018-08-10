'use strict';

module.exports = function(Chart) {

	Chart.ConditionLine = function(context, config) {
		config.type = 'conditionLine';

		return new Chart(context, config);
	};

};
