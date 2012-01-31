// ==UserScript==
// @include http*
// @exclude opera:*
// @exclude chrome:*
// @exclude about:*
// @exclude widget:*
// @exclude *://localhost*
// @exclude *://192.168.*
// @exclude *://0.0.0.0*
// @exclude *dragonfly.opera.com*
// ==/UserScript==

(function APW(g, XPathResult, XMLHttpRequest, Node, history, location, sessionStorage) {
    if(window.name === 'AutoPatchWork-request-frame') return;
    if (g.opera && !APW.loaded) {
        var args = arguments;
        document.addEventListener('DOMContentLoaded', function(e) {
            APW.loaded = true;
            APW.apply(window, args);
        }, false);
        return;
    }
    var sendRequest = window.navigator.userAgent.indexOf('Chrome') !== -1 ? function(data,callback) {
        if (callback) chrome.extension.sendRequest(data, callback);
        else chrome.extension.sendRequest(data);
    } : window.navigator.userAgent.indexOf('Apple') !== -1 ? (function() {
        var eventData = {};
        safari.self.addEventListener('message', function(evt) {
            (evt.name in eventData) && eventData[evt.name](evt.message);
        },false);
        return function(data, callback, name) {
            name = (name || '') + (Date.now() + Math.random().toString(36));
            callback && (eventData[name] = callback);
            safari.self.tab.dispatchMessage(name,data);
        }
    })() : this.opera ? (function(data, callback) {
        Object.keys || (Object.keys = function(k) {
            var r = [];
            for (i in k) r.push(i);
            return r;
        });
        var eventData = {};
        opera.extension.onmessage = function(evt) {
            (evt.data.name in eventData) && eventData[evt.data.name](evt.data.data);
        };
        return function(data, callback, name) {
            name = (name || '') + (Date.now() + Math.random().toString(36));
            callback && (eventData[name] = callback);
            opera.extension.postMessage({name:name,data:data});
        };
    })() : null;
    var options = {
        BASE_REMAIN_HEIGHT:400,
        FORCE_TARGET_WINDOW:true,
        DEFAULT_STATE:true,
        TARGET_WINDOW_NAME:'_blank',
        BAR_STATUS:true,
        css:''
    };
    var status = {
        state:true,
        loaded:false,
        page_number:1,
        nextLink:null,
        pageElement:null,
        last_element:null,
        insert_point:null,
        append_point:null,
        bottom:null,
        remain_height:null
    };
    var Root = /BackCompat/.test(document.compatMode) ? document.body : document.documentElement;
    var debug = false;
    var isXHTML = document.documentElement.nodeName !== 'HTML'
        && document.createElement('p').nodeName !== document.createElement('P').nodeName;
    window.addEventListener('AutoPatchWork.siteinfo', siteinfo, false);
    var bar;
    
    sendRequest({url: location.href, isFrame: window.top!=window.self}, init, 'AutoPatchWork.init');
    
    var matched_siteinfo, forceIframe;
    window.addEventListener('hashchange', function(e) {
        if (window.AutoPatchWorked && AutoPatchWorked.siteinfo) {
            var first_element = (AutoPatchWorked.get_next_elements(document)||[])[0];
            var status = AutoPatchWorked.status;
            if (status.first_element !== first_element) {
                forceIframe = true;
                var ev = document.createEvent('Event');
                ev.initEvent('AutoPatchWork.reset', true, true);
                ev.siteinfo = AutoPatchWorked.siteinfo;
                document.dispatchEvent(ev);
            }
        } else if (matched_siteinfo) {
            matched_siteinfo.some(function(s) { return AutoPatchWork(s); });
        }
    },false);
    function init(info) {
        matched_siteinfo = info.siteinfo;
        if (info.config) {
            options.BASE_REMAIN_HEIGHT = info.config.remain_height;
            options.DEFAULT_STATE = info.config.auto_start;
            options.FORCE_TARGET_WINDOW = info.config.target_blank;
            options.REPLACE_STATE = info.config.replace_state;
            options.BAR_STATUS = info.config.bar_status;
            options.css = info.css;
            debug = info.config.debug_mode;
        }
        var fails = [];
        var r = info.siteinfo.some(function(s) {
            return AutoPatchWork(s) || (fails.push(s), false);
        });
        (r === false) && sendRequest({failed_siteinfo:fails});
    }
    function siteinfo(evt) {
        if (evt.siteinfo && !window.AutoPatchWorked) {
            AutoPatchWork(evt.siteinfo);
        } else if (evt.siteinfo) {
            var ev = document.createEvent('Event');
            ev.initEvent('AutoPatchWork.reset', true, true);
            for (var k in evt.siteinfo) {
                ev[k] = evt.siteinfo[k];
            }
            document.dispatchEvent(ev);
        }
    }
    function AutoPatchWork(siteinfo) {
        if (window.AutoPatchWorked) return true;
        if (isXHTML) {
            status.resolver = function() {
                return document.documentElement.namespaceURI;
            };
            get_next = x_get_next;
            get_next_elements = x_get_next_elements;
            createHTML = createXHTML;
            siteinfo.nextLink = addDefaultPrefix(siteinfo.nextLink);
            siteinfo.pageElement = addDefaultPrefix(siteinfo.pageElement);
        }

        var loading = false;
        var scroll = false;
        var nextLink = status.nextLink = siteinfo.nextLink;
        var pageElement = status.pageElement = siteinfo.pageElement;
        var location_href = location.href;

        log('site '+siteinfo.url+' detected');

        var next = get_next(document);
        if (!next) return log('next link '+nextLink+' not found');
        
        var page_elements = get_next_elements(document);
        if (!page_elements.length) return log('page content like '+pageElement+' not found');

        if (history.replaceState) {
            var _createHTML = createHTML;
            createHTML = function createHTML_history() {
                var current = location.href;
                if (state.nextURL)
                    history.replaceState('', '', state.nextURL);
                var doc = _createHTML.apply(this, arguments);
                if (state.nextURL)
                    history.replaceState('', '', current);
                return doc;
            };
        }
        if ( (next.host && next.host !==location.host) || (next.protocol && next.protocol !==location.protocol) ) {
            request = request_iframe;
        }
        // per-site fixes
        if ('www.tumblr.com' === location.host) {
            script_filter = none_filter;
        }
        if (forceIframe || /^http:\/\/(www|images)\.google\.(?:[^.]+\.)?[^.\/]+\/images\?./.test(location.href)) {
            request = request_iframe;
        }
        if (location.host==='matome.naver.jp') {
            var _get_next = get_next;
            get_next = function(doc) {
                var next = _get_next(doc);
                if (!next || !next.hasAttribute('onclick')) return;
                var nextpage = next.getAttribute('onclick').match(/goPage\(\s*(\d+)\s*\)/)[1];
                var form=document.getElementsByName('missionViewForm')[0];
                var param=[].slice.call(form).map(function(i){return i.name+'='+(i.name==='page'?nextpage:i.value);}).join('&');
                next.href = location.pathname+'?'+param;
                return next;
            };
            next = get_next(document);
        }

        var first_element = status.first_element = page_elements[0];
        var last_element = status.last_element = page_elements.pop();
        var insert_point = status.insert_point = last_element.nextSibling;
        var append_point = status.append_point = last_element.parentNode;
        var htmlDoc, url;

        var loaded_urls = {};
        var location_pushed = false;
        var session_object = {};
        var page_num = 0;
        loaded_urls[location.href] = true;
        loaded_urls[next.href] = true;
        status.remain_height || (status.remain_height = calc_remain_height());
        
        window.addEventListener('scroll', check_scroll, false);
        window.addEventListener('resize', check_scroll, false);
        window.addEventListener('AutoPatchWork.request', request, false);
        window.addEventListener('AutoPatchWork.load', load, false);
        window.addEventListener('AutoPatchWork.append', append, false);
        options.REPLACE_STATE && window.addEventListener('AutoPatchWork.append', replace_state, false);
        window.addEventListener('AutoPatchWork.error', error_event, false);
        window.addEventListener('AutoPatchWork.reset', reset, false);
        window.addEventListener('AutoPatchWork.state', state, false);
        window.addEventListener('AutoPatchWork.terminated', terminated, false);
        window.addEventListener('AutoPatchWork.toggle', toggle, false);
        if (request === request_iframe) {
            window.addEventListener('AutoPatchWork.pageloaded', function(){
                var i = document.getElementById('AutoPatchWork-request-frame');
                i && i.parentNode && i.parentNode.removeChild(i);
            }, false);
        }
        if (options.BAR_STATUS) {
            bar  = document.createElement('div');
            bar.id = 'AutoPatchWork-bar';
            bar.className = 'on';
            bar.onmouseover = function() {
                var onoff = document.createElement('button');
                onoff.textContent = 'TGL';
                onoff.onclick = _toggle;
                var option = document.createElement('button');
                option.textContent = 'OPT';
                option.onclick = function() {
                    sendRequest({options:true});
                };
                var manager = document.createElement('button');
                manager.textContent = 'SI';
                manager.onclick = function() {
                    sendRequest({manage:true});
                };
                bar.appendChild(onoff);
                bar.appendChild(option);
                bar.appendChild(manager);
                bar.onmouseover = null;
            };
            function _toggle() {
                if (bar.className === 'on') {
                    bar.className = 'off';
                    state_off();
                } else if(bar.className === 'off') {
                    bar.className = 'on';
                    state_on();
                }
            }
            document.body.appendChild(bar);
            bar.addEventListener('click', function(e) {
                if(e.target === bar) {
                    _toggle();
                }
            }, false);
            status.bar = bar;
        }
        var style = document.createElement('style');
        style.textContent = options.css;
        style.id = 'AutoPatchWork-style';
        document.head.appendChild(style);
        var pageHeight = Root.offsetHeight;
        if (window.innerHeight >= pageHeight) {
            check_scroll();
        }
        if (options.FORCE_TARGET_WINDOW) {
            window.addEventListener('AutoPatchWork.DOMNodeInserted', target_rewrite, false);
        } else {
            window.addEventListener('AutoPatchWork.DOMNodeInserted', restore_setup, false);
            restoreText();
            window.addEventListener('beforeunload', savePosition, false);
        }
        dispatch_event('AutoPatchWork.initialized', status);
        if (!options.DEFAULT_STATE) state_off();
        sendRequest({message:'AutoPatchWork.initialized', siteinfo:siteinfo});
        window.AutoPatchWorked = {
            init: AutoPatchWork,
            siteinfo: siteinfo,
            get_next: get_next,
            get_next_elements: get_next_elements,
            status:status
        };

        return true;

        function reset(evt) {
            Object.keys(evt.siteinfo).forEach(function(k) {
                status[k] = evt.siteinfo[k];
            });
            status.page_number = 1;
            window.removeEventListener('scroll', check_scroll, false);
            window.removeEventListener('AutoPatchWork.request', request, false);
            window.removeEventListener('AutoPatchWork.load', load, false);
            window.removeEventListener('AutoPatchWork.append', append, false);
            options.REPLACE_STATE && window.removeEventListener('AutoPatchWork.append', replace_state, false);
            window.removeEventListener('AutoPatchWork.error', error_event, false);
            window.removeEventListener('AutoPatchWork.reset', reset, false);
            window.removeEventListener('AutoPatchWork.DOMNodeInserted', target_rewrite, false);
            window.removeEventListener('AutoPatchWork.DOMNodeInserted', restore_setup, false);
            window.removeEventListener('AutoPatchWork.state', state, false);
            window.removeEventListener('beforeunload', savePosition, false);
            if (status.bottom && status.bottom.parentNode) {
                status.bottom.parentNode.removeChild(status.bottom);
            }
            if (bar && bar.parentNode) {
                bar.parentNode.removeChild(bar);
            }
            delete window.AutoPatchWorked;
            AutoPatchWork({nextLink:status.nextLink, pageElement:status.pageElement});
        }
        function error_event(evt) {
            error(evt.message);
        }
        function state(evt) {
            switch (evt.status) {
                case 'on':
                    state_on();
                    break;
                case 'off':
                    state_off();
                    break;
            }
        }
        function toggle() {
            status.state ? state_off() : state_on();
        }
        function terminated(evt) {
            status.state = false;
            window.removeEventListener('scroll', check_scroll, false);
            bar && (bar.className = 'terminated');
            setTimeout(function() {
                bar && bar.parentNode && bar.parentNode.removeChild(bar);
                bar = null;
            }, 1000);
            if (status.bottom && status.bottom.parentNode) {
                status.bottom.parentNode.removeChild(status.bottom);
            }
        }
        function log(arguments) {
            if (!debug) return;
            if (window.opera && window.opera.postError) {
                window.opera.postError('[AutoPatchWork] ' + Array.prototype.slice.call(arguments).join(''));
            } else if (window.console) {
                console.log('[AutoPatchWork] ' + Array.prototype.slice.call(arguments).join(''));
            }
        }
        /*function message(message) {
            if (debug) log(message, JSON.stringify(siteinfo,null,2));
            return false;
        }*/
        function error(message) {
            if (debug) log(message, JSON.stringify(siteinfo,null,2));
            status.state = false;
            window.removeEventListener('scroll', check_scroll, false);
            if (status.bottom && status.bottom.parentNode) {
                status.bottom.parentNode.removeChild(status.bottom);
            }
            bar && (bar.className = 'error');
            return false;
        }
        function dispatch_event(type,opt) {
            var ev = document.createEvent('Event');
            ev.initEvent(type, true, false);
            if (opt) {
                Object.keys(opt).forEach(function(k) {
                    if (!ev[k]) {
                        ev[k] = opt[k];
                    }
                });
            }
            document.dispatchEvent(ev);
        }
        function dispatch_mutation_event(opt) {
            var mue = document.createEvent('MutationEvent');
            with (opt) {
                mue.initMutationEvent(eventName, bubbles, cancelable, relatedNode, prevValue, newValue, attrName, attrChange);
                targetNode.dispatchEvent(mue);
            }
        }
        function check_scroll() {
            if (loading || !status.state) return;
           
            var remain = Root.scrollHeight - window.innerHeight - window.pageYOffset;
            if (remain < status.remain_height) {
                dispatch_event('AutoPatchWork.request');
                bar && (bar.className = 'loading');
            }
        }
        function target_rewrite(evt) {
            if (evt && evt.target) {
                var as = evt.target.getElementsByTagName('a');
                for (var i = 0, l = as.length;i < l;i++) {
                    var a = as[i], _a = a.getAttribute('href');
                    if (_a && !/^javascript:/.test(_a) && !/^#/.test(_a) && !a.target) {
                        a.setAttribute('target', options.TARGET_WINDOW_NAME);
                    }
                }
            }
        }
        function restore_setup(evt) {
            if (evt && evt.target) {
                var target = evt.target;
                target.addEventListener('click', function(evt) {
                    var _target = evt.target;
                    do {
                        if (_target.href) {
                            sessionStorage['AutoPatchWork.restore.' + location_href] = 1;
                            break;
                        } else if (target === _target) {
                            break;
                        }
                        _target = _target.parentNode;
                    } while (_target);
                }, false);
            }
        }
        function check_restore() {
            return !!sessionStorage['AutoPatchWork.restore.' + location_href];
        }
        function saveText(url, page, text) {
            session_object[page] = {page: page, text: text};
            sessionStorage['AutoPatchWork.text.' + location_href] = JSON.stringify(session_object);
        }
        function savePosition() {
            sessionStorage['AutoPatchWork.scroll.' + location_href] = window.pageYOffset;
        }
        function restorePosition() {
            window.scrollTo(window.pageXOffset, parseInt(sessionStorage['AutoPatchWork.scroll.' + location_href], 10));
        }
        function restoreText() {
            if (check_restore()) {
                var cache_str = sessionStorage['AutoPatchWork.text.' + location_href];
                if (cache_str) {
                    var cache = JSON.parse(cache_str);
                    Object.keys(cache).forEach(function(num){
                        var page = cache[num];
                        dispatch_event('AutoPatchWork.load',{response:{responseText:page.text}, url:page.url});
                    });
                    restorePosition();
                }
            } else {
                delete sessionStorage['AutoPatchWork.text.' + location_href];
                delete sessionStorage['AutoPatchWork.scroll.' + location_href];
            }
            delete sessionStorage['AutoPatchWork.restore.' + location_href];
        }
        function state_on(){
            status.state = true;
            bar && (bar.className = 'on');
        }
        function state_off(){
            status.state = false;
            bar && (bar.className = 'off');
        }
        function request(){
            if(!loading) loading = true;
            var url = state.nextURL = next.href || next.getAttribute('href') || next.action || next.value;
            var x = new XMLHttpRequest();
            x.onload = function() {
                dispatch_event('AutoPatchWork.load',{response:x, url:url});
            };
            x.onerror = function(){
                dispatch_event('AutoPatchWork.error',{message:'request failed. status:' + x.status});
            };
            x.open('GET', url, true);
            x.overrideMimeType('text/html; charset=' + document.characterSet);
            x.send(null);
        }
        function request_iframe(){
            if(!loading) loading = true;
            var url = state.nextURL = next.href || next.getAttribute('href') || next.action || next.value;
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.setAttribute('style','display: none !important'); //failsafe
            iframe.id = iframe.name = 'AutoPatchWork-request-frame';
            iframe.onload = function(){
                var doc = iframe.contentDocument;
                dispatch_event('AutoPatchWork.load',{htmlDoc:doc, url:url});
                iframe.parentNode && iframe.parentNode.removeChild(iframe);
            };
            iframe.onerror = function(){
                dispatch_event('AutoPatchWork.error',{message:'request failed. status:' + x.status});
            };
            iframe.src = url;
            document.body.appendChild(iframe);
        }
        function script_filter(text){
            return text.replace(/<script(?:[ \t\r\n][^>]*)?>[\S\s]*?<\/script[ \t\r\n]*>/gi, ' ');
        }
        function none_filter(text){
            return text;
        }
        function load(evt){
            loading = false;
            if (!evt.response && !evt.htmlDoc) return;
            loaded_url = evt.url;
            if (evt.response) {
                htmlDoc = createHTML(script_filter(evt.response.responseText), evt.url);
            } else if (evt.htmlDoc) {
                htmlDoc = evt.htmlDoc;
            } else {
                return;
            }
            status.loaded = true;
            if (!options.FORCE_TARGET_WINDOW) {
                if (evt.response) {
                    saveText(loaded_url, status.page_number, evt.response.responseText);
                } else if (evt.htmlDoc) {
                    saveText(loaded_url, status.page_number, htmlDoc.outerHTML || htmlDoc.documentElement.outerHTML);
                }
            }
            dispatch_event('AutoPatchWork.append');
        }
        function replace_state(evt){
            if (!location_pushed) {
                location_pushed = true;
                history.pushState('', '', location.href);
            }
            history.replaceState('', '', loaded_url);
         }
        function append(evt){
            if (!status.loaded || !htmlDoc) return;

            var insert_point = status.insert_point;
            var append_point = status.append_point;
            status.loaded = false;

            var root, node;
            if (/^tbody$/i.test(append_point.localName)) {
                var colNodes = document.evaluate('child::tr[1]/child::*[self::td or self::th]',
                    append_point, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                var colums = 0;
                for (var i = 0, l = colNodes.snapshotLength;i<l;i++) {
                    var col = colNodes.snapshotItem(i).getAttribute('colspan');
                    colums += parseInt(col,10) || 1;
                }
                node = document.createElement('td');
                root = document.createElement('tr');
                node.setAttribute('colspan',colums);
                root.appendChild(node);
            } else {
                root = node = document.createElement('div');
            }
            
            node.className = 'autopagerize_page_separator_blocks';
            var h4 = node.appendChild(document.createElement('h4'));
            h4.className = 'autopagerize_page_separator';
            var span = h4.appendChild(document.createElement('span'));
            span.className = 'autopagerize_page_info';
            var a = span.appendChild(document.createElement('a'));
            a.className = 'autopagerize_link';
            a.href = loaded_url;
            a.setAttribute('number',++status.page_number);
            if (htmlDoc.querySelector('title'))
                a.setAttribute('title', htmlDoc.querySelector('title').textContent.trim());

            append_point.insertBefore(root, insert_point);

            var docs = get_next_elements(htmlDoc);
            var first = docs[0];
            docs.forEach(function(doc,i,docs){
                var insert_node = append_point.insertBefore(document.importNode(doc, true), insert_point);
                if (insert_node && insert_node.setAttribute) insert_node.setAttribute('apw-data-url', loaded_url);
                var mutation = {
                    targetNode: insert_node,
                    eventName: 'AutoPatchWork.DOMNodeInserted',
                    bubbles: true,
                    cancelable: false,
                    relatedNode: append_point,
                    prevValue: null,
                    newValue: loaded_url,
                    attrName: 'URL',
                    attrChange: 2 // MutationEvent.ADDITION
                };
                dispatch_mutation_event(mutation);
                docs[i] = insert_node;
            });
            if (status.bottom) status.bottom.style.height = Root.scrollHeight + 'px';
            next = get_next(htmlDoc);
            if (!next) {
                dispatch_event('AutoPatchWork.terminated',{message:'nextLink not found.'});
            } else {
                next_href = next.getAttribute('href') || next.getAttribute('action') || next.getAttribute('value');
                if (next_href && !loaded_urls[next_href]) {
                    loaded_urls[next_href] = true;
                } else {
                    return dispatch_event('AutoPatchWork.error',{message:next_href + ' is already loaded.'});
                }
                bar && (bar.className = status.state ? 'on' : 'off');
                setTimeout(function(){
                    check_scroll();
                }, 1000);
            }
            dispatch_event('AutoPatchWork.pageloaded');
            bar && (bar.className = 'on');
            htmlDoc = null;
        }
        function createXHTML(str){
            return new DOMParser().parseFromString(str, 'application/xhtml+xml');
        }
        function createHTML(source, url){
            // http://gist.github.com/198443
            var doc = document.implementation.createHTMLDocument ?
                document.implementation.createHTMLDocument('HTMLParser') :
                document.implementation.createDocument(null, 'html', null);
            if (doc.documentElement) {
                doc.documentElement.innerHTML = source;
            } else {
                var range = document.createRange();
                range.selectNodeContents(document.documentElement);
                var fragment = range.createContextualFragment(source);
                var headChildNames = {title: true, meta: true, link: true, script: true, style: true, /*object: true,*/ base: true/*, isindex: true,*/};
                var child,
                head = doc.querySelector('head') || doc.createElement('head'),
                body = doc.querySelector('body') || doc.createElement('body');
                while ((child = fragment.firstChild)) {
                    if (
                        (child.nodeType === Node.ELEMENT_NODE && !(child.nodeName.toLowerCase() in headChildNames)) || 
                        (child.nodeType === Node.TEXT_NODE &&/\S/.test(child.nodeValue))
                       ) {
                        break;
                    }
                    head.appendChild(child);
                }
                body.appendChild(fragment);
                doc.documentElement.appendChild(head);
                doc.documentElement.appendChild(body);
            }
            return doc;
        }
        function get_next(doc){
            return doc.evaluate(status.nextLink,doc,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
        }
        function get_next_elements(doc){
            var r = doc.evaluate(status.pageElement, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (var i = 0, l = r.snapshotLength, res = (l && new Array(l)) || []; i<l; i++)
                res[i] = r.snapshotItem(i);
            return element_filter(res);
        }
        function x_get_next(doc){
            return doc.evaluate(status.nextLink,doc,status.resolver,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
        }
        function x_get_next_elements(doc){
            var r = doc.evaluate(status.pageElement, doc, status.resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (var i = 0,l = r.snapshotLength, res = (l && new Array(l)) || [];i<l;i++) res[i] = r.snapshotItem(i);
            return element_filter(res);
        }
        function element_filter(nodes){
            var first = nodes[0];
            return nodes.filter(function(node){
                if (first === node || first.compareDocumentPosition(node) === Node.DOCUMENT_POSITION_FOLLOWING)
                    return true;
                else
                    return false;
            });
        }
        function calc_remain_height(){
            var bottom;
            var _point = insert_point;
            while (_point && !_point.getBoundingClientRect) {
                _point = _point.nextSibling;
            }
            if (_point) {
                var rect = _point.getBoundingClientRect();
                bottom = rect.top + window.pageYOffset;
            } else if (append_point && append_point.getBoundingClientRect) {
                var rect = append_point.getBoundingClientRect();
                bottom = rect.top + rect.height + window.pageYOffset;
            }
            if (!bottom) {
                bottom = Math.round(Root.scrollHeight * 0.8);
            }
            return Root.scrollHeight - bottom + options.BASE_REMAIN_HEIGHT;
        }
        function addDefaultPrefix(xpath, prefix) {
            var tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g;
            var TERM = 1, OPERATOR = 2, MODIFIER = 3;
            var tokenType = OPERATOR;
            prefix += ':';
            function replacer(token, identifier, suffix, term, operator, modifier) {
                if (suffix) {
                    tokenType =
                        (suffix == ':' || (suffix == '::' && (identifier == 'attribute' || identifier == 'namespace')))
                        ? MODIFIER : OPERATOR;
                } else if (identifier) {
                    if (tokenType == OPERATOR && identifier != '*') {
                        token = prefix + token;
                    }
                    tokenType = (tokenType == TERM) ? OPERATOR : TERM;
                } else {
                    tokenType = term ? TERM : operator ? OPERATOR : MODIFIER;
                }
                return token;
            }
            return xpath.replace(tokenPattern, replacer);
        }
    }
})(this, window.XPathResult, window.XMLHttpRequest, window.Node, window.history, window.location, window.sessionStorage);