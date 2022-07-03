/*jshint node:true*/
"use strict";

var _ = require('lodash');
var colors = require('colors');
var diff = require('diff');
var stringify = require('../display/stringify-node');
var cssPath = require('../util/css-path');
var node = require('../util/cheerio-utils').node;
var nodeType = require('../util/cheerio-utils').nodeType;
var safeParent = require('../util/cheerio-utils').safeParent;

module.exports = {
  added: added,
  removed: removed,
  changed: changed,
  changedText: changed,

  DiffLevel: {
    SAME_BUT_DIFFERENT: 'same-but-different',
    NOT_THE_SAME_NODE: 'not-the-same-node',
    IDENTICAL: 'identical'
  }
};

// ==========================================================
function added($addedNode, $parentBefore, indexBefore, $parentAfter, indexAfter) {
  return {
    type: "added",
    before: locationInfo($parentBefore, undefined, indexBefore),
    after:  locationInfo($parentAfter, $addedNode, indexAfter),
    selectingNode: $parentAfter,
    //變更html後才會判斷select條件，所以要選$parentAfter
    nodeINFO: $addedNode,
    contentHTML: stringify($addedNode, false),
    // message: "Added:    " + colors.green(stringify($addedNode, true)),
  };
}

function removed($removedNode, $parentBefore, indexBefore, $parentAfter, indexAfter) {
  return {
    type: "removed",
    before: locationInfo($parentBefore, $removedNode, indexBefore),
    after:  locationInfo($parentAfter, undefined, indexAfter),
    selectingNode: $parentAfter,
    nodeINFO: $removedNode,
    contentHTML: stringify($removedNode, false),
    // message: "Removed:  " + colors.red(stringify($removedNode, true))
  };
}

function changed($nodeBefore, $nodeAfter) {
  // the 'changed' type doesn't have parents/indices available up front, so
  // we have to find them out here
  var before = grabParentAndIndex($nodeBefore),
      after = grabParentAndIndex($nodeAfter);

  // base info about the change
  return {
    type: "changed",
    before: locationInfo(before.$parent, $nodeBefore, before.index),
    after: locationInfo(after.$parent, $nodeAfter, after.index),
    selectingNode: $nodeAfter,
    nodeINFO: $nodeBefore,
    // attributeAfter: merge_element_attribute_to_object($nodeAfter),
    // attributeBefore: merge_element_attribute_to_object($nodeBefore),
    info_compare: info_compare ($nodeBefore, $nodeAfter)

    // message: "Modified: " + coloredChanges(stringify($nodeBefore, true), stringify($nodeAfter, true)),
  };
}

// === common functionality for nailing down change locations

function locationInfo($parentNode, $node, index) {
  var siblingsInfo = findSiblings($parentNode, $node, index);

  return _.extend(siblingsInfo, {
  // paths to the node itself and the parent
    parentPath: cssPath($parentNode),
    path: $node ? cssPath($node) : undefined,

    // index of the node (or the point where you'd have to insert it, if it's not in this DOM)
    index: index,

    // nodes
    $node: $node, $parent: $parentNode
  });
}

function findSiblings($parentNode, $node, index) {
  var $ = $parentNode.cheerio;

  var prevIndex = index - 1;
  var nextIndex = $node ? (index + 1) : index;   // if the node doesn't actually exist in this DOM
  // $next should point to what *would* be the next node
  var parentContents = $parentNode.contents();
  var prevExists = (prevIndex >= 0 && prevIndex < parentContents.length);
  var nextExists = (nextIndex >= 0 && nextIndex < parentContents.length);

  return {
    $previous: prevExists ? $($parentNode.contents()[prevIndex]) : undefined,
    $next: nextExists ? $($parentNode.contents()[nextIndex]) : undefined
  };
}

function grabParentAndIndex($node) {
  var $ = $node.cheerio, $parent = node($, safeParent($node));
  var index = _.findIndex($parent.contents(), function(n) {
    return $(n).is($node);
  });
  return {$parent: $parent, index: index};
}

function return_element_all_info($node) {
  let node_element = Object.assign({}, $node);
  let return_object= {};
  if (node_element[0]['type'] === "tag") {
    return_object =  Object.assign({}, node_element[0]['attribs']);
    return_object['label'] = node_element[0]['name'] ;
  }
  else if(node_element[0]['type'] === "text") {
    return_object['data'] = node_element[0]['data'];
  }
  return return_object;
}

function info_compare ($node_before, $node_after) {
  // if($node_before[0]['type'] === "text" || $node_after[0]['type'] === "text") { return {}; }
  let diff_attribute_result = {};
  let info_with_before = return_element_all_info($node_before);
  let info_with_after  = return_element_all_info($node_after);

  let before_info_keys = Object.keys(info_with_before);
  let after_info_keys = Object.keys(info_with_after);
  let keys = _.uniq(before_info_keys.concat(after_info_keys));
  for (var i in keys) {
    if (info_with_before.hasOwnProperty(keys[i]) === true && info_with_after.hasOwnProperty(keys[i]) === true) {
      let beforeInfo = info_with_before[keys[i]];
      let afterInfo = info_with_after[keys[i]];
      if(keys[i] === "label") {
        if(beforeInfo === afterInfo) {
          diff_attribute_result[keys[i]] = {'before': beforeInfo, 'after': afterInfo, 'diff_msg': "[Same]"};
        }
        else {
          diff_attribute_result[keys[i]] = {'before': beforeInfo, 'after': afterInfo, 'diff_msg': "[Diff]"};
        }
        continue;
      }
      let parts = diff.diffChars(beforeInfo, afterInfo);
      let diff_msg = "";
      // 如果attribute value不同，才需要比對，不然diff_msg會為空值
      if (beforeInfo !==afterInfo) {
        diff_msg = _.map(parts, function(part) 
                      {
                        // before and after -> add是before到after有增加東西，增加的東西是after的
                        if (part.added){return '<font class="after">'+part.value+ '</font>';}
                        else if (part.removed) {return '<font class="before">'+part.value+ '</font>';}
                        else {return part.value};
                      }).join("");
        diff_msg = "[Diff] " + diff_msg;
      }
      else {
        diff_msg = "[Same]";
      }
      diff_attribute_result[keys[i]] = {'before': beforeInfo, 'after': afterInfo, 'diff_msg':diff_msg};
    }
    
    else if (info_with_before.hasOwnProperty(keys[i]) === false && info_with_after.hasOwnProperty(keys[i]) === true) {
      let diff_msg = "[Add] " + '<font class="before">'+info_with_after[keys[i]]+ '</font>';
      diff_attribute_result[keys[i]] = {'before': "", 'after': info_with_after[keys[i]], 'diff_msg': diff_msg};
    }
    
    else if (info_with_before.hasOwnProperty(keys[i]) === true && info_with_after.hasOwnProperty(keys[i]) === false) {
      let diff_msg = "[Remove] " + '<font class="after">'+info_with_before[keys[i]]+ '</font>';
      diff_attribute_result[keys[i]] = {'before': info_with_before[keys[i]], 'after': "", 'diff_msg': diff_msg};
    }
    
    else if(info_with_before.hasOwnProperty(keys[i]) === false && info_with_after.hasOwnProperty(keys[i]) === false) {
      continue;
    }
  }
  return diff_attribute_result;
}

// === colored messages

function coloredChanges(beforeStr, afterStr) {
  var parts = diff.diffWords(beforeStr, afterStr);
  return _.map(parts, function(part) {
    var color = part.added ? 'green' : (part.removed ? 'red' : 'grey');
    return colors[color](part.value);
  }).join("");
}