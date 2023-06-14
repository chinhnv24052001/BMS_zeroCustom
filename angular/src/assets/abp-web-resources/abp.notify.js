var abp = abp || {};
(function () {

    /* DEFAULTS *************************************************/

    var defaultOptions = {
        position: "top-right",
        timer: 4000,
        padding: 250,
        toast: true,
        showClass: {
            popup: "",
            icon: "",
        },
        showConfirmButton: false,
    };

    /* NOTIFICATION *********************************************/

    var showNotification = function (type, message, title, options) {
        var icon = options.iconHtml
            ? `<i class="mr-2 kt-shape-font-color-1 ` +
                `${options.iconHtml}` +
              `"></i>`
        : "";

        if (title) {
            options.title =
                '<span class="kt-shape-font-color-1">' +
                title +
                `</span> <button style=" float: right; color: #fff; background: transparent; border: none;"><i class="fa fa-times" style="color: #fff" (click)="${Swal.close()}"></i></button>`;
        }

        options.html =
            // icon +
            '<span class="kt-shape-font-color-1" style="font-family: "Roboto"; color: white !important; font-size: 16px !important; text-overflow: ellipsis; white-space: no-wrap; overflow: hidden;">' +
            message +
            "</span>";
        var combinedOptions = Object.assign({}, defaultOptions, options);
        Swal.fire(combinedOptions);
    };

    abp.notify.success = function (message, title, options) {
        showNotification(
            "success",
            message,
            'Notification',
            Object.assign(
                {
                    background: "#34bfa3",
                    // iconHtml: "fa fa-check",
                },
                options
            )
        );
    };

    abp.notify.info = function (message, title, options) {
        showNotification(
            "info",
            message,
            'Notification',
            Object.assign(
                {
                    background: "#36a3f7",
                    // iconHtml: "fa fa-info",
                },
                options
            )
        );
    };

    abp.notify.warn = function (message, title, options) {
        showNotification(
            "warning",
            message,
            'Warning',
            Object.assign(
                {
                    background: "#ffb822",
                    // iconHtml: `fa fa-exclamation-triangle`,
                },
                options
            )
        );
    };

    abp.notify.error = function (message, title, options) {
        showNotification(
            "error",
            message,
            'Error',
            Object.assign(
                {
                    background: "#f4516c",
                    // iconHtml: `fa fa-exclamation-triangle`,
                },
                options
            )
        );
    };

})();
