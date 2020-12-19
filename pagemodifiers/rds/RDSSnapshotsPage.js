'use strict';

self.setInterval(rewriteRDSSnapshotPage, 1000);

function rewriteRDSSnapshotPage() {
    if (window.location.href.toString().indexOf("#db-snapshots:") !== -1) {
        const rdsDBSize = getRDSDBSizeForAccount();
        if(rdsDBSize === "Unknown") {
            const snapshotsSpan = $("span[class='gwt-InlineHTML']:contains(Snapshots)").first();

            if ($("span#snapshot_cost_span").length) {
                snapshotsSpan.parent().next().remove();
            }

            snapshotsSpan.parent().after($("<span id='snapshot_cost_span' class=\"gwt-InlineHTML\">Could not find account DB size - please navigate to RDS main page to read it, and come back here.</span></span>"));
        } else {
            const snapshotsSpan = $("span[class='gwt-InlineHTML']:contains(Snapshots)").first();
            const snapshotsSize = calculateSnapshotGB();

            const gbToPayFor = (snapshotsSize - getRDSDBSizeForAccount() * 1000);
            const priceForSnapshotsPerMonth = gbToPayFor * 0.095;

            if ($("span#snapshot_cost_span").length) {
                snapshotsSpan.parent().next().remove();
            }
            snapshotsSpan.parent().after($("<span id='snapshot_cost_span' class=\"gwt-InlineHTML\">You have DBs with a total of " + rdsDBSize + " TB. You have backups for a total of " + (snapshotsSize / 1000) + " TB. You will therefore pay " + priceForSnapshotsPerMonth + " $/mo for backups. Based on snapshots visible on this page ONLY!</span></span>"));
        }
    }
}

var snapshotSize = 0;

function calculateSnapshotGB() {
    snapshotSize = 0;

    $("span:contains(GiB):not(:has(span))").each(function (index, elm) {
        snapshotSize += parseInt($(this).text().split(" ")[0], 10);
    });


    return snapshotSize;
}