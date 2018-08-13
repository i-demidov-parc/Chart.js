'use strict';

module.exports = function(Chart) {

	Chart.Condition = function(context, config) {
		config.type = 'condition';

		return new Chart(context, config);
	};

};
