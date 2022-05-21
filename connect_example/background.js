//持續(OnConnect)接收訊息(On Message)
console.log("background start!");

chrome.runtime.onConnect.addListener(function(port)
    {
        if(port.name === "Main Panel Communication")
        {
            port.onMessage.addListener(function(response) {
                if(response.button === "start compare")
                {
                    console.log("get msg in background: ", response.msg);
                    // return msg from background
                    var message = { button: "start compare" , msg: "start compare msg from background."};
                    port.postMessage(message);
                    console.log(port.name);
                }
                else if(response.button === "end compare")
                {
                    console.log("get msg in background: ", response.msg);
                    // return msg from background
                    var message = { button: "end compare" , msg: "end compare reset msg from background."};
                    port.postMessage(message);
                    console.log(port.name);
                }
                else if(response.button === "reset")
                {
                    console.log("get msg in background: ", response.msg);
                    // return msg from background
                    var message = { button: "reset" , msg: "return reset msg from background."};
                    port.postMessage(message);
                    console.log(port.name);
                }
            });
        }
    }
);