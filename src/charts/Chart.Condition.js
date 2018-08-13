'use strict';

var conditionFiller = require('../plugins/plugin.conditionFiller');

module.exports = function(Chart) {

	Chart.Condition = function(context, config) {
		config.type = 'condition';

		config.plugins = config.plugins || [];

		config.plugins.push(conditionFiller);

		return new Chart(context, config);
	};

};
