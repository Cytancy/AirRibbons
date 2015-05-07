//  Created by CY Tan
//  Copyright (c) 2015 CY Tan. All rights reserved.

"use strict"

function AetoAttributeSet(range, timingFunction, attribute, startValue, endValue) {
	if (range != null && Array.isArray(range) && range.length > 0 && 
		timingFunction != null && typeof(timingFunction) == "function") {
		this.range = range;
		this.timingFunction = timingFunction;
		this.attribute = attribute;
		this.startValue = startValue;
		this.endValue = endValue;
	}
	else {
		throw new Error('[Error] AetoAttributeSet: Invalid values passed to constructor.');
	}
}