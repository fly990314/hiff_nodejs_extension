var hiff = require('./src/hiff/lib');
var cheerio = require('cheerio');

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
// var testHTML = '<div id="testElement" style="border: 1px;" class="mystyle">testFinish</div>'

// let inited_result = testHTML.replace(/\n/g, "").replace(/    /g, "");
                
// let $result = cheerio.load(inited_result);
// console.log($result($result.root()).children()['0'] )
// let $element_info =  $result($result.root()).children()['0'];


var get_web_html = document.body.innerHTML.replace(/\n    /g, "");
var result = hiff.compare(html1, html2); 
console.log(result);