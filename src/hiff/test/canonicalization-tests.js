var compare = require('../lib').compare;
var hiff = require('../lib');
var assert = require('chai').assert;

function noChange(html1, html2) {
  return function() {
    assert.isFalse(compare(html1, html2).different);
  };
}

describe("Semantic comparison", function () {
  it("should ignore whitespace between tags", noChange(
    "<div>Hello</div><div>Hi!</div>",
    "<div>Hello</div> \n  <div>Hi!</div>"
  ));

  it("should ignore leading/trailing whitespace in text", noChange(
    "<div> \n Hello \n </div>",
    "<div>Hello\n</div>"
  ));

  it("should understand newlines in attributes", noChange(
    "<meta content='This is some content.'>",
    "<meta content='This\n is some\n   content.'>"
  ));

  it("should compare  HTML that get ot cmd 'document.body.innerHTML'", noChange(
    '\n   <section class="blog-articles">\n  <article id="one"></article>\n  <article id="two"></article>\n  <article id="three"></article><article id="four"></article>\n</section>',
    '<section class="blog-articles"><article id="one"></article><article id="two"></article><article id="three"></article><article id="four"></article></section>'
  ));

});
