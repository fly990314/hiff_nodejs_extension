'use strict';
import { isNumber } from 'lodash';
import '../css/sidebarPanel.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { load } from 'cheerio';
const {parse, stringify} = require('flatted/cjs');
var cheerio = require('cheerio');
var format = require('xml-formatter');

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

var changed_set = [];
var added_set = [];
var removed_set = [];

// compare control part
const startCompare_btn = document.getElementById("startCompare");
const stopCompare_btn = document.getElementById("stopCompare");
const compare_control_box = document.getElementById("compareControlBox");

// compare result part
const compare_result_select_dropdown = document.getElementById("diffSelectDropdown");
const compare_result_display_table = document.getElementById("diff_content_table");
const compare_result_display_title = document.getElementById("diff_content_title");

var timer_time = 3;
var countInterval;
var compare_result_title_for_changed = '<tr><th scope="col" class="first-table bg-dark text-white" >Attribute</th><th scope="col" class="second-table bg-dark text-white">Value</th></tr>';
var compare_result_title_for_added = '<tr><th scope="col" class="second-table bg-dark text-white">ADD HTML</th></tr>';
var compare_result_title_for_removed = '<tr><th scope="col" class="second-table bg-dark text-white">REMOVE HTML</th></tr>';
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

var update_filter_panel_results = function() {
    if(filter_checkbox_1.checked) {filter_checkbox_1_result = true;}
        else {filter_checkbox_1_result = false;} 
        if(filter_checkbox_2.checked) {filter_checkbox_2_result = true;}
        else {filter_checkbox_2_result = false;} 
    if(filter_checkbox_3.checked) {filter_checkbox_3_result = true;}
        else {filter_checkbox_3_result = false;}
    if(filter_tag_input.disable != true) { filter_checkbox_2_input_result = (filter_tag_input.value).toLowerCase(); }
        else { filter_checkbox_2_input_result = ""; }
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
const communicate_with_start_compare = function(isOption) {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background',
            payload:{ senderLocation: 'mainPanel', message: 'we need to save current html and wait end of compare.', hiffOption: isOption}
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
    // let isDisplayStyle = filter_checkbox_3_result

    return new Promise((resolve,reject)=>{
        countInterval = setInterval
        (
            function ()
            {
                add_text_node_in_element( compare_control_box, `剩下 ${secondsRemaining} sec` );
                secondsRemaining = secondsRemaining - 1;
                if (secondsRemaining < 0) 
                { 
                    clearInterval(countInterval);
                    add_text_node_in_element( compare_control_box, "Compare End" );
                    resolve();
                };
            }, 
            1000
        );
    });
}

async function compare_process(timer_wait_time, isOption) {
    communicate_with_start_compare(isOption);
    await time_showing_function(timer_wait_time);
    communicate_with_end_compare();
}

startCompare_btn.addEventListener('click', 
    ()=>
    {
        chrome.storage.local.set({'diff': "empty"}, function() { console.log('Value is reset to empty.'); });
        update_filter_panel_results();
        compare_process(timer_time, filter_checkbox_3_result);
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
            chrome.storage.local.set({'diff': sender_package.compareResult }, function() { });

            return_sender_response( { } );
            }
    }
);

// <Compare result>
function to_filter_same_tag() {
    if(filter_checkbox_2_result){
        for(var i = 0; i < changed_set.length ; i++) {
            if( changed_set[i].nodeINFO[0]['name'] == filter_checkbox_2_input_result) {
                changed_set.splice(i, 1);
            }
        }

        for(var i = 0; i < added_set.length ; i++) {
            if( added_set[i].nodeINFO[0]['name'] == filter_checkbox_2_input_result) {
                added_set.splice(i, 1);
            }
        }

        for(var i = 0; i < removed_set.length ; i++) {
            if( removed_set[i].nodeINFO[0]['name'] == filter_checkbox_2_input_result) {
                removed_set.splice(i, 1);
            }
        }
    }
}

function isElementSame(a, b) {
    // Object Attribute compare
    let aAttribute = a.attribs;
    let bAttribute = b.attribs;
    let a_attribute_key_list = Object.getOwnPropertyNames(aAttribute);
    let b_attribute_key_list = Object.getOwnPropertyNames(bAttribute);

    if (a_attribute_key_list.length != b_attribute_key_list.length) {
        return false;
    }

    for (var i = 0; i < a_attribute_key_list.length; i++) {
        var a_attribute_key = a_attribute_key_list[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (aAttribute[a_attribute_key] !== bAttribute[a_attribute_key]) {
            return false;
        }
    }

    // Object type and name compare
    if(a.type !== b.type || a.name !== b.name) { return false; }
    
    // if type, name, attribute all same, return true.
    return true;
}

function return_element_innerHTML(node) {
    return node.outerHTML;
 }

function load_selecting_element_and_filter_sets(diffObject) {
    return new Promise((resolve, reject) =>{
        chrome.devtools.inspectedWindow.eval("(" + return_element_innerHTML.toString() + ")($0)", function (result, isException) {
            if (!isException && result !== null) {
                let inited_result = result.replace(/\n/g, "").replace(/    /g, "");
                let regenerate_node = function merge_element_attribute_to_object($node) {
                    // input: element
                    var return_object = {};
                    if($node['attribs'] && $node['type'] !== "text") {``
                      return_object = $node['attribs'];
                      return_object['label'] = $node['name'];
                    }
                    else if ($node['type'] === "text") {
                      return_object['data'] = $node['data'];
                    }
                    $node['attribs'] = return_object
                    return $node;
                  }
                let $result = cheerio.load(inited_result);
                let $element_info =  $result($result.root()).children()['0'];

                $result = cheerio.load(inited_result);
                $element_info =  regenerate_node( $result($result.root()).children()['0'] );

                //比較...
                // tag, name, attribs是不是都相同 $element_info
                for(var i = 0; i < changed_set.length ; i++) {
                    if(!isElementSame( $element_info, changed_set[i].nodeINFO[0] )) {
                        changed_set.splice(i, 1);
                    }
                }
    
                for(var i = 0; i < added_set.length ; i++) {
                    if(!isElementSame( $element_info, added_set[i].nodeINFO[0] )) {
                        changed_set.splice(i, 1);
                    }
                }
    
                for(var i = 0; i < removed_set.length ; i++) {
                    if(!isElementSame( $element_info, removed_set[i].nodeINFO[0] )) {
                        changed_set.splice(i, 1);
                    }
                }
                resolve();
            }
        });
    }) 

}

 async function diffDrpodownUpdate(diffObject) {
    let changed_area = document.getElementById("dropdown-changed-area");
    let added_area = document.getElementById("dropdown-added-area");
    let removed_area = document.getElementById("dropdown-removed-area");
    changed_set = diffObject.changed_type;
    added_set = diffObject.added_type;
    removed_set = diffObject.removed_type;
    
    // // filter1 <select current element>

    //使用非同步解決方法
    if(filter_checkbox_1_result)
    {
        await load_selecting_element_and_filter_sets(diffObject);
    }
    
    // filter2  <tag>
    to_filter_same_tag();

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

    if(nodeObject.nodeINFO[0].type === "text") {
        if (beforePath !== undefined) {return beforePath + " [text]";}
        else if (afterPath !==undefined) {return afterPath + " [text]";}
        else if (beforeParentPath !==undefined) {return beforeParentPath + " [text]";}
        else if (afterParentPath !==undefined) {return afterParentPath + " [text]";}
        else {return "null";}
    }
    else{
        if (beforePath !== undefined) {return beforePath;}
        else if (afterPath !==undefined) {return afterPath;}
        else if (beforeParentPath !==undefined) {return beforeParentPath;}
        else if (afterParentPath !==undefined) {return afterParentPath;}
    }
}

chrome.storage.onChanged.addListener(
    function(changes, areaName) {
        if(areaName === 'local'){
            if(changes['diff']['newValue'] !== "empty"){
                let changedNewValue = changes['diff']['newValue'];
                let parse_result = parse(changedNewValue);
                console.log("update diff dropdown!!");
                console.log(parse_result);
                diffDrpodownUpdate(parse_result);

            }
        }
    }
  )

compare_result_select_dropdown.addEventListener("change", function(changeResult) {
    let selectedOptionIndex = compare_result_select_dropdown.selectedIndex;
    console.log(selectedOptionIndex)
    let changed_set_length = changed_set.length;
    let added_set_length = added_set.length;
    let removed_set_length = removed_set.length;
    let buffer=0;

    if(selectedOptionIndex == 0) {
        compare_result_display_table.innerHTML = compare_result_title_for_changed;
        compare_result_display_table.innerHTML = "";
        return;
    }

    // changed set
    if ( changed_set_length != 0 && selectedOptionIndex <= (buffer + changed_set_length) ) {
        let index = selectedOptionIndex-1;
        let changed_diff_list = changed_set[index].diff_attr_result;
        let changed_diff_keys = Object.keys(changed_diff_list);
        let total_innerHTML = "";
        compare_result_display_table.innerHTML = compare_result_title_for_changed;
        for(var i=0; i < changed_diff_keys.length; i++) {
            let attributeName = changed_diff_keys[i];
            let before_value = changed_diff_list[changed_diff_keys[i]]['before'];
            let after_value = changed_diff_list[changed_diff_keys[i]]['after'];
            let diff = changed_diff_list[changed_diff_keys[i]]['diff_msg'];
            let innerHTML_for_changed = "<tr><th rowspan='3' scope='row' class='text-center text-nowrap bg-dark bg-opacity-50'>"
                + attributeName + "</th><td>" + before_value +"</td></tr><tr><td class='table-secondary'>" + after_value 
                + "</td></tr><tr><td class='table-danger'>" + diff + "</td></tr>"
            total_innerHTML += innerHTML_for_changed;
        }

        // implementation
        compare_result_display_table.innerHTML = total_innerHTML;
        return;
    }
    else if (changed_set_length == 0) {
        buffer += 1
    }

    buffer += changed_set_length;

    console.log(buffer);
    console.log(added_set_length);
    console.log(selectedOptionIndex);
    console.log(buffer + added_set_length);

    // added set
    if ( added_set_length != 0 && selectedOptionIndex <= (buffer + added_set_length) ) {
        let index = selectedOptionIndex - buffer-1;
        let addedElementHTML = format(added_set[index].contentHTML);
        compare_result_display_title.innerHTML = compare_result_title_for_added;
        compare_result_display_table.innerHTML = "<tr><td id='addedHTML'></td><tr>";
        let addedContent = document.getElementById("addedHTML");
        addedContent.textContent = addedElementHTML;
        console.log("finish added set~");
        // implementation
        return ;
    }
    else if (added_set_length == 0) {
        buffer += 1
    }
    
    buffer += added_set_length;

    // remove set
    if ( removed_set_length != 0 && selectedOptionIndex <= (buffer + removed_set_length) ) {
        let index = selectedOptionIndex - buffer-1;
        let removedElementHTML = format(added_set[index].contentHTML);
        compare_result_display_title.innerHTML = compare_result_title_for_removed;
        compare_result_display_table.innerHTML = "<tr><td id='removedHTML'></td><tr>";
        let removedContent = document.getElementById("removedHTML");
        removedContent.textContent = removedElementHTML;
        return;
    }
    else if (removed_set_length == 0) {
        buffer += 1
    }

    //超過全部種類數量總和
    if(selectedOptionIndex > buffer + removed_set_length) {
        console.log("table error!!!");
        return;
    }
});

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
// test area
// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
const test_button = document.getElementById("testButton");

test_button.addEventListener('click', 
    () => 
    {
        console.log("click test button");
        const hiff = require('../lib/index.js');
        
        update_filter_panel_results();
        // let html1 = '<button id="btn-start" class="testClass">Start Compare And Wait 3s</button>';
        // let html2 = '<button id="btn-start" class="nochange">Start Compare And Wait 3s</button>';

        // test script
        // let html1 = "<script class='topscriptXXXX'>test</script><div class='testClass'><button class='testButton'>testButton</button><script nonce='VyzdIjQJnOlXYvc6BcgI7g'>if (window.ytcsi) {window.ytcsi.tick('ai', null, '');}</script></div>";
        // let html2 = "<script class='topscript'>test</script><div class='testClass'><button class='testerror'>testButton</button><script nonce='VyzdIjQJnOlXYvc6BcgI7g'>test</script></div>";

        //test style
        // let html1 = '<div class="testClass" style="testStyle">123</div>';
        // let html2 = '<div class="testClass" style="error">123</div>';
        
        // test add part
        let html1 = '<div class="testClass" style="testStyle"></div>';
        let html2 = '<div class="testClass" style="testStyle"><div class="addElement" id="test">123</div></div>';

        // let html1 = '<div class="testClass" style="testStyle"><button style="testSStyle">test</button><button id="btn-start" class="testClass" style="margin-top:1px">Start Compare And Wait 3s</button></div>';
        // let html2 = '<div class="testClass" style="error"><button style="error">testerror</button><button id="btn-start" class="testClass" style="margin-top:1px">Start Compare And Wait 3s</button></div>';
        let result = hiff.compare(html1, html2, {ignoreStyleAttribute: true});
        
        console.log(result);
        console.log(result.added_type[0].contentHTML);

        
        // let result = hiff.compare(html1, html2);
        diffDrpodownUpdate(result);
    }
);

chrome.devtools.panels.elements.onSelectionChanged.addListener( showSelectElementHTML);

function showSelectElementHTML() {

    chrome.devtools.inspectedWindow.eval("(" + update_current_selecting_element_msg.toString() + ")($0)", function (result, isException) {
        if (!isException && result !== null) {
            filter_selecting_element_msg.innerText = result;
        }
    });
}

function update_current_selecting_element_msg(node) {
    let head_of_innerHTML, teal_of_innerHTML, content_of_element;
    let outer_content = node.outerHTML.replace(/\n/g, "").replace(/    /g, "");
    let inner_content = node.innerHTML.replace(/\n/g, "").replace(/    /g, "");

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

        if(is_element_Long) {
            content_of_element = outer_content.slice(0, 46) + "...>..." + outer_content.slice(teal_of_innerHTML);
        }
        else {
            content_of_element = outer_content.slice(0, head_of_innerHTML) + "..." + outer_content.slice(teal_of_innerHTML);
        }
        return "Is Selecting:\n" + content_of_element;
    }
 }

// 當inspect頁面有select的動作，就會執行loadLastSelected函式，並套用updateLastSelected函式


window.addEventListener("load", function(event) {
    showSelectElementHTML();
  });