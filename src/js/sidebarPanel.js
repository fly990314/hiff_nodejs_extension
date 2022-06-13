'use strict';
import { isNumber } from 'lodash';
import '../css/sidebarPanel.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const {parse, stringify} = require('flatted/cjs');

// timer part
const setting_timer_btn = document.getElementById("timer-setting-btn");
const timer_input_field = document.getElementById("timer-input");
const timerStatusBox = document.getElementById("timerStatusBox");


// compare filter part -> options variable
const filter_checkbox_1 = document.getElementById("control-option1");
const filter_checkbox_2 = document.getElementById("control-option2");
const filter_checkbox_3 = document.getElementById("control-option3");
const filter_tag_input = document.getElementById("control-option2-input");

const filter_selecting_element_msg = document.getElementById("selectingMSG");

var filter_checkbox_1_result = false;
var filter_checkbox_2_result = false;
var filter_checkbox_2_input_result = "";
var filter_checkbox_3_result = false;

// compare control part
const startCompare_btn = document.getElementById("startCompare");
const stopCompare_btn = document.getElementById("stopCompare");
const compare_control_box = document.getElementById("compareControlBox");

// compare result part
const compare_result_msg = document.getElementById("html_msg");
const compare_result_select_box = document.getElementById("diffSelectDropdown");

var timer_time = 3;
var countInterval;

// tool function

var add_text_node_in_element = function(element, text) {
    //clean nodes of element.
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    //start to create child in the element.
    var text_tag = document.createTextNode(text); 
    element.appendChild(text_tag);
};

const communicate_with_start_compare = function() {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background',
            payload:{ senderLocation: 'mainPanel', message: 'we need to save current html and wait end of compare.' }
        },
        response => { }
    );
}

const communicate_with_end_compare = function() {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background and start to compare',
            payload:{ senderLocation: 'mainPanel', message: 'need to save current html and start to compare HTML of before and after.' }
        },
        response => { }
    );
}

var time_showing_function = function(actualTime) {
    let secondsRemaining = actualTime;
    countInterval = setInterval
    (
        function ()
        {
            add_text_node_in_element( compare_control_box, `剩下 ${secondsRemaining} sec` );
            secondsRemaining = secondsRemaining - 1;
            if (secondsRemaining < 0) 
            { 
                clearInterval(countInterval);
                communicate_with_end_compare();
                add_text_node_in_element( compare_control_box, "Compare End" );
            };
        }, 1000
        );
    };

    var update_filter_panel_results = function() {
    if(filter_checkbox_1.checked) {filter_checkbox_1_result = true;}
        else {filter_checkbox_1_result = false;} 
        if(filter_checkbox_2.checked) {filter_checkbox_2_result = true;}
        else {filter_checkbox_2_result = false;} 
    if(filter_checkbox_3.checked) {filter_checkbox_3_result = true;}
        else {filter_checkbox_3_result = false;}
    if(filter_tag_input.disable != true) { filter_checkbox_2_input_result = filter_tag_input.value; }
    // console.log("filter_checkbox_1_result: " + filter_checkbox_1_result);
    // console.log("filter_checkbox_2_result: " + filter_checkbox_2_result);
    // console.log("filter_checkbox_3_result: " + filter_checkbox_3_result);
    // console.log("filter_checkbox_2_inputresult: " + filter_checkbox_2_input_result);
    
}

// listener
// <timer>
setting_timer_btn.addEventListener('click', 
    () => 
    {
        clearInterval(countInterval);
        if( Number(timer_input_field.value) != NaN && timer_input_field.value > 0) {
            timer_time = timer_input_field.value; 
            add_text_node_in_element(timerStatusBox, `Timer Setting is ${timer_time}sec`);
        }

        else {
            add_text_node_in_element(timerStatusBox, `Should be input valid value`);
        }

        timer_input_field.value = "";
    }
);

// <compare filter>
filter_checkbox_2.addEventListener('change', function() {
    if (this.checked) {
        filter_tag_input.disabled=false;
    } 
    else {
        filter_tag_input.value = "";
      filter_tag_input.disabled=true;
    }
  });

// <Compare Control>
startCompare_btn.addEventListener('click', 
    () => 
    {
        chrome.storage.sync.set({'diff': "empty"}, function() { console.log('Value is reset to empty.'); });

        update_filter_panel_results();
        time_showing_function(timer_time);
        communicate_with_start_compare();
    }
);

stopCompare_btn.addEventListener('click', 
    () => 
    {
        clearInterval(countInterval);
        add_text_node_in_element(compare_control_box, `強制End timer=${timer_time}秒`);
    }
);

// <Compare end listener>
chrome.runtime.onMessage.addListener( 
    (sender_package, sender, return_sender_response) => 
    {
        if (sender_package.type === 'return_compare_result_to_mainPanel') {
            //Set Local Storage
            chrome.storage.sync.set({'diff': sender_package.compareResult }, function() { });

            return_sender_response( { } );
            }
    }
);

// <Compare result>
function diffDrpodownUpdate(diffObject) {
    let changed_area = document.getElementById("dropdown-changed-area");
    let added_area = document.getElementById("dropdown-added-area");
    let removed_area = document.getElementById("dropdown-removed-area");

    let changed_set = diffObject.changed_type;
    let added_set = diffObject.added_type;
    let removed_set = diffObject.removed_type;

    if(changed_set.length===0){ changed_area.innerHTML = "<option disabled>未結果</option>"; }
    else{
        changed_area.innerHTML = "";
        for (var i in changed_set) {
            let name = nameOfElement(changed_set[i]);
            changed_area.innerHTML+= `<option>${name}</option>`;
        }
    }

    if(added_set.length===0 ){ added_area.innerHTML = "<option disabled>未結果</option>"; }
    else{
        added_area.innerHTML = "";
        for (var i in added_set) {
            let name = nameOfElement(added_set[i]);
            added_area.innerHTML+= `<option>${name}</option>`;
        }
    }

    if(removed_set.length===0 ){ removed_area.innerHTML = "<option disabled>未結果</option>"; }
    else{
        removed_area.innerHTML = "";
        for (var i in removed_set) {
            let name = nameOfElement(removed_set[i]);
            removed_area.innerHTML+= `<option>${name}</option>`;
        }
    }
    

}

function nameOfElement(nodeObject) {
    let beforePath = nodeObject.before.path;
    let afterPath = nodeObject.after.path;
    let beforeParentPath = nodeObject.before.parentPath;
    let afterParentPath = nodeObject.after.parentPath;

    if (beforePath !== undefined) {return beforePath;}
    else if (afterPath !==undefined) {return afterPath;}
    else if (beforeParentPath !==undefined) {return beforeParentPath;}
    else if (afterParentPath !==undefined) {return afterParentPath;}
    else {return "null";}
}

chrome.storage.onChanged.addListener(
    function(changes, areaName) {
        if(areaName === 'sync'){
            if(changes['diff']['newValue'] !== "empty"){
                let changedNewValue = changes['diff']['newValue'];
                let parse_result = parse(changedNewValue);
                diffDrpodownUpdate(parse_result);
            }
        }
    }
  )

// test area
const test_button = document.getElementById("testButton");

test_button.addEventListener('click', 
    () => 
    {
        console.log("click test button");
        const hiff = require('../lib/index.js');
        
        let html1 = '<div class="123" id="456"></div><button class="2" id="test">111</button>';
        let html2 = '<p class="000" id="000"></p><button class="1" id="test">222</button>';

        let result = hiff.compare(html1, html2);

        diffDrpodownUpdate(result);
    }
);

chrome.devtools.panels.elements.onSelectionChanged.addListener( showSelectElementHTML);

function showSelectElementHTML() {

    chrome.devtools.inspectedWindow.eval("(" + testFunction.toString() + ")($0)", function (result, isException) {
        if (!isException && result !== null) {
            filter_selecting_element_msg.innerText = result;
        }
    });
}

function testFunction(node) {
    console.log(node.tagName);
    let head_of_innerHTML, teal_of_innerHTML, content_of_element;
    let outer_content = node.outerHTML.replace(/\n/g, "").replace(/    /g, "");
    let inner_content = node.innerHTML.replace(/\n/g, "").replace(/    /g, "");
    console.log(outer_content);
    console.log(inner_content);

    if(inner_content === "") {
        first_right_parentheses = outer_content.indexOf(">");
        second_left_parentheses = outer_content.indexOf("<", 1);
        let is_element_Long = (outer_content.slice(0, first_right_parentheses+1).length >=50);
        if(is_element_Long) {
            return "Is Selecting:\n" + outer_content.slice(0, 46) + "...>" + outer_content.slice(second_left_parentheses);
        }
        else {
            return "Is Selecting:\n " + outer_content;
        }
    }
    else{
        head_of_innerHTML = outer_content.indexOf(inner_content);
        teal_of_innerHTML = head_of_innerHTML + inner_content.length;
        let is_element_Long = (outer_content.slice(0, head_of_innerHTML).length >=50);
        console.log(head_of_innerHTML);
        console.log(teal_of_innerHTML);
        if(is_element_Long) {
            content_of_element = outer_content.slice(0, 46) + "...>..." + outer_content.slice(teal_of_innerHTML);
        }
        else {
            content_of_element = outer_content.slice(0, head_of_innerHTML) + "..." + outer_content.slice(teal_of_innerHTML);
        }
        console.log(content_of_element);
        return "Is Selecting:\n" + content_of_element;
    }
 }
    // let $ = cheerio.load($0);
    // let outerHTML = chrome.devtools.inspectedWindow.eval("$0.outerHTML");
    // let innerHTML = chrome.devtools.inspectedWindow.eval("$0.innerHTML");
    // console.log(outerHTML);
    // console.log(innerHTML);

    // let head_of_innerHTML = outerHTML.indexOf(innerHTML);
    // let teal_of_innerHTML = head_of_innerHTML + innerHTML.length;
    // let content_of_element = outHTML.slice(0, head_of_innerHTML) + "..." + outHTML.slice(teal_of_innerHTML);
    // filter_selecting_element_msg.innerText = content_of_element;

// 當inspect頁面有select的動作，就會執行loadLastSelected函式，並套用updateLastSelected函式