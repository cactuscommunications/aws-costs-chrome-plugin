'use strict';

self.setInterval(rewriteEBSTable, 1000);

function rewriteEBSTable() {
    if (window.location.href.toString().indexOf("LaunchInstanceWizard") === -1) {
        Object.keys(ebsMap).forEach(function (key) {
            $("iframe#storage-gwt-frame").contents().find("div:contains(" + key + ")").each(function (index, elm) {
                //Only change the div that is in the table => only if the text is inside a <td>
                if ($(this).closest("td").length === 1) {

                    const sizeOfDiskElm = $(this).parent().prev().children(":first");
                    if (!sizeOfDiskElm.text().includes("$")) {
                        const numGb = parseInt(sizeOfDiskElm.text().split(" ")[0], 10);
                        sizeOfDiskElm.text(sizeOfDiskElm.text() + " (" + (ebsMap[key] * numGb) + "$/mo)");
                    }
                }
            });
        });
    }
}