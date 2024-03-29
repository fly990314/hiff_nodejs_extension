'use strict';

import '../css/sidebarPanel.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const {parse, stringify} = require('flatted/cjs');
var cheerio = require('cheerio');
var format = require('xml-formatter');

// variables
// --------------------------------------------------------------------------------------------
// extension illustrate
const tool_illustrate_hide_display_button = document.getElementById("hide-display-illustrate-btn");

// compare filter part -> options variable
const filter_checkbox_1 = document.getElementById("control-option1");
const filter_checkbox_2 = document.getElementById("control-option2");
const filter_checkbox_3 = document.getElementById("control-option3");
const filter_tag_input  = document.getElementById("control-option3-input");

// timer part
const setting_timer_btn = document.getElementById("timer-setting-btn");
const timer_input_field = document.getElementById("timer-input");

// compared control
// compare result info
//
const display_current_info = document.getElementById("displayCurrent_Info");
const selectingMSG_value = document.getElementById("selectingMSG_value");

const cssDislay_info = document.getElementById("cssDisplay_Info");

const tagDisplay_info = document.getElementById("tagDisplay_Info");
const tagDisplay_value = document.getElementById("tagDisplay_value");

const timerSetting_info = document.getElementById("timerSetting_Info");

const startCompare_btn = document.getElementById("startCompare");
const stopCompare_btn = document.getElementById("stopCompare");
const compare_status_info = document.getElementById("compare-status-info");

// compare result part
const compare_result_select_dropdown = document.getElementById("diffSelectDropdown");
const compare_result_display_table = document.getElementById("diff_content_table");
const compare_result_display_title = document.getElementById("diff_content_title");

var filter_checkbox_1_result = false;
var filter_checkbox_2_result = false;
var filter_checkbox_3_result = false;
var filter_checkbox_3_input_result = "";

var compare_all_info = {};

var changed_set = [];
var added_set = [];
var removed_set = [];

var timer_time = 3;
var countInterval;
var compare_result_title_for_changed = '<tr><th scope="col" class="first-table bg-dark text-white" >Attribute</th><th scope="col" class="second-table bg-dark text-white">Value</th></tr>';
var compare_result_title_for_added = '<tr><th scope="col" class="second-table bg-dark text-white">ADD HTML</th></tr>';
var compare_result_title_for_removed = '<tr><th scope="col" class="second-table bg-dark text-white">REMOVE HTML</th></tr>';
const illustrate_cintent = '<p class="step">STEP1 :</p><p class="stepContent">Select the options that you want.</p>'
                            + '<p class="step">STEP2 :</p><p class="stepContent">Select time of timer and show in the box..</p>'
                            + '<p class="step">STEP3 :</p><p class="stepContent">Click button to start compare and wait timer to the end.</p>'
                            + '<p class="step">STEP4 :</p><p class="stepContent">Select dropdown option and show the attribbute result in the table.</p>'

// illustrate
// --------------------------------------------------------------------------------------------
tool_illustrate_hide_display_button.addEventListener('click',
    () =>
    {
        let intro_illustrate_element = document.getElementById("intro-text")
        let innerHTML = intro_illustrate_element.innerHTML.replace(/\n/g, "").replace(/    /g, "");

        if(innerHTML === illustrate_cintent) {
            intro_illustrate_element.innerHTML = "";
            tool_illustrate_hide_display_button.textContent = "Open Illustrate" 

        }
        else if (innerHTML === ""){
            intro_illustrate_element.innerHTML = illustrate_cintent;
            tool_illustrate_hide_display_button.textContent = "Hide Illustrate";
        }
    }
);

// <timer>
// --------------------------------------------------------------------------------------------
setting_timer_btn.addEventListener('click', 
    () => 
    {
        // clearInterval(countInterval);
        if( Number(timer_input_field.value) != NaN && timer_input_field.value > 0) {
            timer_time = timer_input_field.value;
            timerSetting_info.innerHTML = `Timer Setting: ${timer_time}sec`;
        }

        else {
            timer_time = -1;
            timerSetting_info.innerHTML = `Timer Setting: Should be input valid value`;
        }

        timer_input_field.value = "";
    }
);

// <Compare filter>
// --------------------------------------------------------------------------------------------
// -> Option1: Ignore style attribute's change
filter_checkbox_1.addEventListener('change', function() {
    if (this.checked) {
        filter_checkbox_1_result = true;
        cssDislay_info.textContent = 'Ignore style attribute\'s change: "checked"'
    } else {
        filter_checkbox_1_result = false;
        cssDislay_info.textContent = 'Ignore style attribute\'s change: "unchecked"'
    }
});

// -> Option2: Only display change of current selecting elemnt
filter_checkbox_2.addEventListener('change', function() {
    if (this.checked) {
        filter_checkbox_2_result = true;
        display_current_info.textContent = 'Only display change of current selecting elemnt: "checked"';
    } else {
        filter_checkbox_2_result = false;
        display_current_info.textContent = 'Only display change of current selecting elemnt: "unchecked"';
    }
});

    // show selecting element
    // 當inspect頁面有select的動作，就會執行loadLastSelected函式，並套用updateLastSelected函式
function showSelectElementHTML() {

    chrome.devtools.inspectedWindow.eval("(" + update_current_selecting_element_msg.toString() + ")($0)", function (result, isException) {
        if (!isException && result !== null) {
            selectingMSG_value.textContent = result;
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
            return "Current is selecting:\n" + outer_content.slice(0, 46) + "...>" + outer_content.slice(second_left_parentheses);
        }
        else {
            return "Current is selecting:\n " + outer_content;
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
        return "Current is selecting:\n" + content_of_element;
    }
}

chrome.devtools.panels.elements.onSelectionChanged.addListener( showSelectElementHTML);

window.addEventListener("load", function(event) {
    showSelectElementHTML();
  });

// -> Option3: Display one tag's change
filter_checkbox_3.addEventListener('change', function() {
    if (this.checked) {
        filter_checkbox_3_result = true;
        filter_tag_input.disabled=false;
        tagDisplay_info.textContent = 'Display one tag\'s change: "checked"';
    } 
    else {
        filter_checkbox_3_result = false;
        filter_tag_input.value = "";
        filter_tag_input.disabled=true;
        tagDisplay_info.textContent = 'Display one tag\'s change: "unchecked"';
        tagDisplay_value.textContent = "Current limit tag value: ";
    }
  });

filter_tag_input.addEventListener('input', function() { 
    tagDisplay_value.textContent = "Current limit tag value: " + filter_tag_input.value;
});

// <Compare Control>
// --------------------------------------------------------------------------------------------
// -> Compare end listener
chrome.runtime.onMessage.addListener( 
    (sender_package, sender, return_sender_response) => 
    {
        if (sender_package.type === 'return_compare_result_to_mainPanel') {
            //Set Local Storage
            chrome.storage.local.set({'diff': sender_package.compareResult }, function() { });
            startCompare_btn.disabled = false;

            return_sender_response( { } );
            }
    }
);

// -> button listener
startCompare_btn.addEventListener('click', 
    ()=>
    {
        if(timer_time <=0 || ( filter_checkbox_3_result === true && filter_tag_input.value === "")) {
            compare_status_info.innerHTML = `Should ensure info corrent!`;
        }
        else{
            startCompare_btn.disabled = true;
            chrome.storage.local.set({'diff': "empty"}, function() { console.log('Value is reset to empty.'); });
            compare_result_display_title.innerHTML = "";
            compare_result_display_table.innerHTML = "";
            compare_all_info = {'css_display': filter_checkbox_1_result, 'display_current_element': filter_checkbox_2_result, 'tag_display': filter_checkbox_3_result, 'tag_value': filter_tag_input.value, 'time': timer_time};
            compare_process( compare_all_info );
        }
    }
);

stopCompare_btn.addEventListener('click', 
    () => 
    {
        clearInterval(countInterval);
        startCompare_btn.disabled = false;
        compare_status_info.innerHTML = `Ready To Compare`;
    }
);

    // -> tool function
const communicate_with_start_compare = function(compare_info) {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background',
            payload:{ senderLocation: 'sidebarPanel', message: 'we need to save current html and wait end of compare.', hiffOption: compare_info}
        },
        response => { }
    );
}

const communicate_with_end_compare = function() {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background and start to compare',
            payload:{ senderLocation: 'sidebarPanel', message: 'need to save current html and start to compare HTML of before and after.' }
        },
        response => { }
    );
}

    //promise function
var time_showing_function = function(actualTime) {
    let secondsRemaining = actualTime;
    // let isDisplayStyle = filter_checkbox_3_result

    return new Promise((resolve, reject)=>{
        countInterval = setInterval
        (
            function ()
            {
                compare_status_info.textContent = `剩下 ${secondsRemaining} sec`;
                secondsRemaining = secondsRemaining - 1;
                if (secondsRemaining < 0) 
                { 
                    clearInterval(countInterval);
                    compare_status_info.textContent = "Ready To Compare";
                    resolve();
                };
            }, 
            1000
        );
    });
}
    //async function
async function compare_process(compare_info) {

    communicate_with_start_compare(compare_info);
    await time_showing_function(compare_info.time);
    communicate_with_end_compare();
}

// <Compare result>
// --------------------------------------------------------------------------------------------
// option: [Display one tag's change] function 
function to_filter_same_tag() {
    for(var i = 0; i < changed_set.length ; i++) {
        if(( changed_set[i].nodeINFO[0].name === filter_checkbox_3_input_result && changed_set[i].nodeINFO[0].type === "tag") || (changed_set[i].nodeINFO[0].parent.name === filter_checkbox_3_input_result && changed_set[i].nodeINFO[0].type === "text")){
            changed_set.splice(i, 1);
            i-=1;
        }
    }

    for(var i = 0; i < added_set.length ; i++) {
        if(( added_set[i].nodeINFO[0].name === filter_checkbox_3_input_result && added_set[i].nodeINFO[0].type === "tag") || (added_set[i].nodeINFO[0].parent.name === filter_checkbox_3_input_result && added_set[i].nodeINFO[0].type === "text")){
            added_set.splice(i, 1);
            i-=1;
        }
    }

    for(var i = 0; i < removed_set.length ; i++) {
        if(( removed_set[i].nodeINFO[0].name === filter_checkbox_3_input_result && removed_set[i].nodeINFO[0].type === "tag") || (removed_set[i].nodeINFO[0].parent.name === filter_checkbox_3_input_result && removed_set[i].nodeINFO[0].type === "text")){
            removed_set.splice(i, 1);
            i-=1;
        }
    }
}

// option: [Only display change of current selecting elemnt] function
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

function return_element_outerHTML(node) {
    return node.outerHTML;
}

function load_selecting_element_and_filter_sets(diffObject) {
    return new Promise((resolve, reject) =>{
        chrome.devtools.inspectedWindow.eval("(" + return_element_outerHTML.toString() + ")($0)", function (result, isException) {
            if (!isException && result !== null) {
                let inited_result = result.replace(/\n/g, "").replace(/    /g, "");
                let $result = cheerio.load(inited_result);
                let $element_info =  $result($result.root()).children()['0'];
                //比較...
                for(var i = 0; i < changed_set.length; i++) {
                    if(changed_set[i].nodeINFO[0].type === "tag") {
                        //屬性為tag，用當前的selectingNode屬性比對
                        if(!isElementSame( $element_info, changed_set[i].selectingNode[0] )) {
                            changed_set.splice(i, 1);
                            i-=1;
                        }
                    }
                    else if (changed_set[i].nodeINFO[0].type === "text"){
                        //屬性為data，用當前的selectingNode的父節點屬性比對
                        if(!isElementSame( $element_info, changed_set[i].selectingNode[0].parent)){
                            changed_set.splice(i, 1);
                            i-=1;
                        }
                    }
                }
                
                for(var i = 0; i < added_set.length ; i++) {
                    if(added_set[i].nodeINFO[0].type === "tag") {
                        //屬性為tag，用當前的selectingNode屬性比對
                        if(!isElementSame( $element_info, added_set[i].selectingNode[0] )) {
                            added_set.splice(i, 1);
                            i-=1;
                        }
                    }
                    else if (added_set[i].nodeINFO[0].type === "text"){
                        //屬性為data，用當前的selectingNode的父節點屬性比對
                        if(!isElementSame( $element_info, added_set[i].selectingNode[0].parent)){
                            added_set.splice(i, 1);
                            i-=1;
                        }
                    }
                }
                
                for(var i = 0; i < removed_set.length ; i++) {
                    if(removed_set[i].nodeINFO[0].type === "tag") {
                        //屬性為tag，用當前的selectingNode屬性比對
                        if(!isElementSame( $element_info, removed_set[i].selectingNode[0] )) {
                            added_set.splice(i, 1);
                            i-=1;
                        }
                    }
                    else if (removed_set[i].nodeINFO[0].type === "text"){
                        //屬性為data，用當前的selectingNode的父節點屬性比對
                        if(!isElementSame( $element_info, removed_set[i].selectingNode[0].parent)){
                            added_set.splice(i, 1);
                            i-=1;
                        }
                    }
                }
                resolve();
            }
        });
    }) 

}

// update dropdown result function
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

async function diffDrpodownUpdate(diffObject) {
    let changed_area = document.getElementById("dropdown-changed-area");
    let added_area = document.getElementById("dropdown-added-area");
    let removed_area = document.getElementById("dropdown-removed-area");
    changed_set = diffObject.changed_type;
    added_set = diffObject.added_type;
    removed_set = diffObject.removed_type;
    
    // // option2 <Only display change of current selecting elemnt>
    //使用非同步解決方法
    if(filter_checkbox_2_result)
    {
        await load_selecting_element_and_filter_sets(diffObject);
    }
    
    // filter3  <Display one tag's change>
    if(filter_checkbox_3_result) {
        to_filter_same_tag();
    }

    if(changed_set.length===0){ changed_area.innerHTML = "<option disabled>No result</option>"; }
    else{
        changed_area.innerHTML = "";
        for (var i in changed_set) {
            let name = nameOfElement(changed_set[i]);
            changed_area.innerHTML+= `<option>${name}</option>`;
        }
    }

    if(added_set.length===0 ){ added_area.innerHTML = "<option disabled>No result</option>"; }
    else{
        added_area.innerHTML = "";
        for (var i in added_set) {
            let name = nameOfElement(added_set[i]);
            added_area.innerHTML+= `<option>${name}</option>`;
        }
    }

    if(removed_set.length===0 ){ removed_area.innerHTML = "<option disabled>No result</option>"; }
    else{
        removed_area.innerHTML = "";
        for (var i in removed_set) {
            let name = nameOfElement(removed_set[i]);
            removed_area.innerHTML+= `<option>${name}</option>`;
        }
    }
    

}

chrome.storage.onChanged.addListener(
    function(changes, areaName) {
        if(areaName === 'local'){
            if(changes['diff']['newValue'] !== "empty"){
                let changedNewValue = changes['diff']['newValue'];
                let parse_result = parse(changedNewValue);
                console.log("update diff dropdown!!");
                console.log(parse_result)
                diffDrpodownUpdate(parse_result); 
            }
        }
    }
  )

compare_result_select_dropdown.addEventListener("change", function(changeResult) {
    let selectedOptionIndex = compare_result_select_dropdown.selectedIndex;
    let changed_set_length = changed_set.length;
    let added_set_length = added_set.length;
    let removed_set_length = removed_set.length;
    let buffer=0;

    if(selectedOptionIndex == 0) {
        compare_result_display_title.innerHTML = "";
        compare_result_display_table.innerHTML = "";
        return;
    }

    // changed set
    if ( changed_set_length != 0 && selectedOptionIndex <= (buffer + changed_set_length) ) {
        let index = selectedOptionIndex-1;
        let changed_diff_list = changed_set[index].info_compare;
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
                + "</td></tr><tr><td>" + diff + "</td></tr>"
            total_innerHTML += innerHTML_for_changed;
        }

        // implementation
        compare_result_display_title.innerHTML = compare_result_title_for_changed;
        compare_result_display_table.innerHTML = total_innerHTML;
        return;
    }
    else if (changed_set_length == 0) {
        buffer += 1
    }

    buffer += changed_set_length;

    // added set
    if ( added_set_length != 0 && selectedOptionIndex <= (buffer + added_set_length) ) {
        let index = selectedOptionIndex - buffer-1;
        let addedElementHTML = format(added_set[index].contentHTML);
        compare_result_display_title.innerHTML = compare_result_title_for_added;
        compare_result_display_table.innerHTML = "<tr><td id='addedHTML'></td><tr>";
        let addedContent = document.getElementById("addedHTML");
        addedContent.textContent = addedElementHTML;
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
    const hiff = require('../hiff/lib/index.js');
        
    compare_all_info = {'css_display': filter_checkbox_1_result, ' display_current_element': filter_checkbox_2_result, 'tag_display': filter_checkbox_3_result, 'tag_value': filter_tag_input.value, 'time': timer_time};
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
    let result = hiff.compare(html1, html2, {ignoreStyleAttribute: compare_all_info.css_display});
    
    console.log(result);
    console.log(result.added_type[0].contentHTML);
    
        
        // let result = hiff.compare(html1, html2);
        diffDrpodownUpdate(result);
    }
);