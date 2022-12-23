(function() {
    const eventEndpoint = "https://realtime.dekanat.pp.ua/";

    const submitEvent = function (formData) {
        return fetch(eventEndpoint, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            keepalive: true,
            credentials: "omit",
            cache: "no-cache",
            body: JSON.stringify(Object.fromEntries(formData.entries())),
        })
    }

    const submitEventPreConnect = function () {
        submitEventPreConnect.done = submitEventPreConnect.done || fetch(eventEndpoint, {
            method: "HEAD",
            mode: "no-cors",
            credentials: "omit",
            cache: "no-cache",
        });
    }

    const captureRegForm = function (e) {
        if (e.hasOwnProperty('originalEvent')) {
            e = e.originalEvent
        }

        if (e.hasOwnProperty('realtimeCaptured') && e.realtimeCaptured) {
            return;
        }

        if (!e.defaultPrevented || e.type === 'click') {
            e.realtimeCaptured = true
            let form = captureRegForm.form
            for (let element of [e.target, e.target.form, this, this.form]) {
                if (element && element instanceof HTMLFormElement) {
                    form = element
                    break;
                }
            }

            submitEvent(new FormData(form));
        }
    }

    /**
     * @param {ParentNode} node
     */
    const setupRegFormCapture = function (node) {
        let regForm = node.querySelector('#reg')
        if (regForm) {
            submitEventPreConnect();

            captureRegForm.form = regForm
            regForm.removeEventListener('submit', captureRegForm);
            regForm.addEventListener('submit', captureRegForm);

            regForm.querySelectorAll("[type=submit]").forEach(function (submitButton) {
                submitButton.removeEventListener('click', captureRegForm)
                submitButton.addEventListener('click', captureRegForm)
            })

            window.jQuery && window.jQuery(regForm).off('submit.capture', captureRegForm).on('submit.capture', captureRegForm)
        }
    }

    const deleteLessonCapture = function (e) {
        e.defaultPrevented || submitEvent(new URLSearchParams(
            e.target.getAttribute('href').split('#')[0].split('?')[1] || ''
        ))
    }

    /**
     * @param {ParentNode} node
     */
    const setupDeleteLessonCapture = function (node) {
        let deleteLink = node.querySelector('#delzn');
        if (deleteLink) {
            submitEventPreConnect();
            deleteLink.removeEventListener('click', deleteLessonCapture)
            deleteLink.addEventListener('click', deleteLessonCapture)
        }
    }

    const modalBodyObserver = new MutationObserver(function (mutationList) {
        for (let mutation of mutationList) {
            if (mutation.addedNodes.length) {
                setupDeleteLessonCapture(mutation.target);
                return;
            }
        }
    });

    const setupCapture = function () {
        let modalBody = document.querySelector('#m1 .modal-body');
        if (modalBody) {
            modalBodyObserver.disconnect();
            modalBodyObserver.observe(modalBody, {childList: true});
        }

        setupRegFormCapture(document)
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        setupCapture();
    } else {
        document.addEventListener('DOMContentLoaded', setupCapture)
    }

    const loadScript = function (src) {
        let polyfillScript = document.createElement('script')
        polyfillScript.setAttribute('src', src);
        polyfillScript.setAttribute('defer', 'defer')
        document.head.appendChild(polyfillScript)
    }

    window.FormData || loadScript('https://cdn.jsdelivr.net/npm/formdata-polyfill@4.0.10/formdata.min.js')
    window.URLSearchParams|| loadScript('https://cdnjs.cloudflare.com/ajax/libs/url-search-params/1.1.0/url-search-params.js');
})()