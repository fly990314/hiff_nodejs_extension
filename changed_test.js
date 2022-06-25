var hiff = require('./src/hiff/lib');

var html1 = '<html><head><title>Paragraph soup test</title></head><body><article><p>This is the first paragraph.</p><p>This is the second paragraph.</p><p>This is the third paragraph.</p></article></body></html>';
var html2 = '<html><head><title>Paragraph soup test</title></head><body><article><p>This is the first paragraph.</p><p>This paragraph was added.</p><p>This is the second paragraph.</p><p>This paragraph was also added.</p><p>Along with this one.</p><p>And that one.</p><p>This is the third paragraph.</p></article></body></html>';


// var get_web_html = document.body.innerHTML.replace(/\n    /g, "");
var result = hiff.compare(html1, html2); 
console.log(result);
if (result.different) {
  console.log("HTML fragments are different, changes:");
  result.changes.map(function(change) {
    console.log("In node " + change.before.parentPath + ":\n\t" + change.message);
  });
} else {
  console.log("No changes found.");
}