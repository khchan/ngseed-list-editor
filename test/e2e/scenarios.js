'use strict';

describe('E2E Testing for List Editor Module', function() {

	browser.get('index.html');

	describe('Saving and cancelling of row/column actions', function() {

		// Cancelling data edits
		it('should edit row and cancel data', function() {
			element(by.id('selectRowEditID_0')).click();
			element(by.id('cancelRowEditID_0')).click();

			element(by.id('selectRowEditID_1')).click();
			element(by.id('cancelRowEditID_1')).click();

			element(by.id('selectRowEditID_2')).click();
			element(by.id('cancelRowEditID_2')).click();

			element(by.id('selectRowEditID_3')).click();
			element(by.id('cancelRowEditID_3')).click();
			
			return true;
		});

		it('should create a new row successfully', function() {
			element(by.css('tfoot > tr > td > div.btn-group > button.btn-primary')).click();
			return true;
		});

	});
});
