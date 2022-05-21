(function() 
    {
        chrome.devtools.inspectedWindow.eval
        (
            "document.title",
            function (result, isException) 
            {
                if (!isException && result) 
                {
                    chrome.devtools.panels.create("Hiff-Main-Panel", "diff-img/diff-logo-icon-16.png", "mainPanel.html", function (panel) {});
                }
            }
        );
    }
)();

(function() 
    {
        chrome.devtools.panels.elements.createSidebarPane
        (
            "Hiff-Sidebar-Panel",
            function (sidebar) 
            {
                "use strict";
                sidebar.setPage("sidebarPanel.html");
                sidebar.setHeight("350px");
            }
        );
    }
)();