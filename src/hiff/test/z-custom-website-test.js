var compare = require('../lib').compare;
var assert = require('chai').assert;
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

function compareFixtures(file1, file2, options) {
  var path1 = path.join(__dirname, "fixtures", file1);
  var path2 = path.join(__dirname, "fixtures", file2);
  var html1 = fs.readFileSync(path1, 'utf-8').toString();
  var html2 = fs.readFileSync(path2, 'utf-8').toString();

  return compare(html1, html2, options);
}

describe("Sample html compare", function () {
  it("Test changed_setting: info_compared of changed setting", function() {
    var html1 = 
    ' \
    <div class="col-md-3"> \
        <h3>Business Hours</h3> \
        <p><i test="123" class="fa fa-clock-o"></i> <span class="day">Weekdays:</span><span>9am to 10pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Saturday:</span><span>9am to 2pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Sunday:</span><span>Closed</span></p> \
    </div> \
    ';

    var html2 = 
    ' \
    <div class="col-md-3"> \
        <h3>Business Hours</h3> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Weekdays:</span><span>9am to 10pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Saturday:</span><span>9am to 2pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Sunday:</span><span>Closed</span></p> \
    </div> \
    ';

    var compare_result = compare(html1, html2);
    assert.ok(compare_result.different);

    assert.propertyVal(compare_result.changed_type[0].info_compare.class, 'before', 'fa fa-clock-o');
    assert.propertyVal(compare_result.changed_type[0].info_compare.class, 'after', 'fa fa-clock-o');
    assert.propertyVal(compare_result.changed_type[0].info_compare.class, 'diff_msg', '[Same]');

    assert.propertyVal(compare_result.changed_type[0].info_compare.label, 'before', 'i');
    assert.propertyVal(compare_result.changed_type[0].info_compare.label, 'after', 'i');
    assert.propertyVal(compare_result.changed_type[0].info_compare.label, 'diff_msg', '[Same]');

    assert.propertyVal(compare_result.changed_type[0].info_compare.label, 'before', 'i');
    assert.propertyVal(compare_result.changed_type[0].info_compare.label, 'after', 'i');
    assert.propertyVal(compare_result.changed_type[0].info_compare.label, 'diff_msg', '[Same]');
  });

  it("Test added_setting: info_compared of added setting", function() {
    var html1 = 
    ' \
    <div class="col-md-3"> \
        <h3>Business Hours</h3> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Weekdays:</span><span>9am to 10pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Saturday:</span><span>9am to 2pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Sunday:</span><span>Closed</span></p> \
    </div> \
    ';

    var html2 = 
    ' \
    <div class="col-md-3"> \
        <h3>Business Hours</h3> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Weekdays:</span><span>9am to 10pm</span></p> \
        <p><div class="test">123</div></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Saturday:</span><span>9am to 2pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Sunday:</span><span>Closed</span></p> \
    </div> \
    ';

    var compare_result = compare(html1, html2);
    assert.ok(compare_result.different);
    assert.equal(compare_result.added_type.length, 1, "test add type!");
    assert.equal(compare_result.changed_type.length, 0, "test changed type!");
    assert.equal(compare_result.removed_type.length, 0, "test removed type!");
    
    assert.equal(compare_result.added_type[0].contentHTML, '<p><div class="test">123</div></p>');
    assert.equal(compare_result.added_type[0].nodeINFO[0].name, 'p');
  });

  it("Test removed_setting: info_compared of removed setting", function() {
    var html1 = 
    ' \
    <div class="col-md-3"> \
        <h3>Business Hours</h3> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Weekdays:</span><span>9am to 10pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Saturday:</span><span>9am to 2pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Sunday:</span><span>Closed</span></p> \
    </div> \
    ';
    
    var html2 = 
    ' \
    <div class="col-md-3"> \
        <h3>Business Hours</h3> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Weekdays:</span><span>9am to 10pm</span></p> \
        <p><i class="fa fa-clock-o"></i> <span class="day">Saturday:</span><span>9am to 2pm</span></p> \
    </div> \
    ';

    var compare_result = compare(html1, html2);
    assert.ok(compare_result.different);
    assert.equal(compare_result.added_type.length, 0, "test add type!");
    assert.equal(compare_result.changed_type.length, 0, "test changed type!");
    assert.equal(compare_result.removed_type.length, 1, "test removed type!");
    
    assert.equal(compare_result.removed_type[0].contentHTML, '<p><i class="fa fa-clock-o"></i><span class="day">Sunday:</span><span>Closed</span></p>');
    assert.equal(compare_result.removed_type[0].nodeINFO[0].name, 'p');
  });

});