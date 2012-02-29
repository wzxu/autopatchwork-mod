Object.keys || (Object.keys = function(k) {
    var r = [];
    for(var i in k)
    r.push(i);
    return r;
});

var self = this;
var siteinfo = [], timestamp, manifest, site_stats = {}, site_fail_stats = {}, custom_info = {};
var URL_SITEINFO = 'http://ss-o.net/json/wedataAutoPagerizeSITEINFO.json';
var MICROFORMATs = [{
    MICROFORMAT: true,
    url: '^https?://.',
    nextLink: '//a[@rel="next"] | //link[@rel="next"]',
    insertBefore: '//*[contains(concat(" ",@class," "), " autopagerize_insert_before ")]',
    pageElement: '//*[contains(concat(" ",@class," "), " autopagerize_page_element ")]'
}, {
    MICROFORMAT: true,
    url: '^https?://.',
    nextLink: '//link[@rel="next"] | //a[contains(concat(" ",@rel," "), " next ")] | //a[contains(concat(" ",@class," "), " next ")]',
    pageElement: '//*[contains(concat(" ",@class," "), " hfeed ") or contains(concat(" ",@class," "), " story ") or contains(concat(" ",@class," "), " instapaper_body ") or contains(concat(" ",@class," "), " xfolkentry ")]'
}];
var browser, 
    BROWSER_CHROME = 1,
    BROWSER_SAFARI = 2,
    BROWSER_OPERA = 3;

/*if(~window.navigator.userAgent.indexOf('Chrome')) browser = BROWSER_CHROME;
else if(~window.navigator.userAgent.indexOf('Apple')) browser = BROWSER_SAFARI;
else */browser = BROWSER_OPERA;

var H = location.href.replace('index.html', '');
window.APWBg = {
    state: true,
    css: '',
    custompatterns: [],
    config: {
        auto_start: true,
        target_blank: true,
        remain_height: 400,
        disable_iframe: false,
        change_address: false,
        debug_mode: false,
        bar_status: 'on'
    },
    save_custom_patterns: function(patterns) {
        storagebase.AutoPatchWorkPatterns = patterns;
        APWBg.custompatterns = JSON.parse(patterns);
        init_database();
    },
    reset_custom_patterns: function() {
        APWBg.custompatterns = [];
        storagebase.AutoPatchWorkPatterns = '';
    },
    init_css: function(css) {
        if (css && css.replace(/[\s\n]*/, '') !== '') {
            APWBg.css = storagebase.AutoPatchWorkCSS = css;
        } else {
            storagebase.AutoPatchWorkCSS = APWBg.css = getCSS();
        }
    },
    update: function() {
        storagebase.AutoPatchWorkConfig = JSON.stringify(APWBg.config);
    },
    disabled_sites: [],
    blacklist_check: function(url) {
        if(url.indexOf('http') !== 0)
            return true;
        return APWBg.disabled_sites.some(function(site) {
            if(site.type === 'regexp')
                return new RegExp(site.matcher).test(url);
            else if(site.type === 'prefix')
                return url.indexOf(site.matcher) === 0;
            else if(site.type === 'domain')
                return new RegExp('^https?://' + site.matcher + '/').test(url);
        });
    },
    add_disabled_site: function(site) {
        APWBg.disabled_sites.push(site);
        storagebase.disabled_sites = JSON.stringify(APWBg.disabled_sites);
    },
    save_disabled_site: function() {
        storagebase.disabled_sites = JSON.stringify(APWBg.disabled_sites);
    },
    delete_disabled_site: function(site) {
        var site_s = JSON.stringify(site);
        for(var i = 0; i < APWBg.disabled_sites.length; i++) {
            var str = JSON.stringify(APWBg.disabled_sites[i]);
            if(str === site_s) {
                APWBg.disabled_sites.splice(i, 1);
                storagebase.disabled_sites = JSON.stringify(APWBg.disabled_sites);
                break;
            }
        }
    }
};

//// main //////

if(browser === BROWSER_SAFARI) {
    safari.extension.settings.addEventListener('change', function(evt) {
        if(evt.key in APWBg.config) {
            APWBg.config[evt.key] = evt.newValue;
        } else if(evt.key === 'excludes') {
            var urls = evt.newValue.trim().split(' ');
            APWBg.disabled_sites = urls.map(function(url) {
                return { type: 'prefix', matcher: url };
            });
            APWBg.save_disabled_site();
        }
    }, false);
}

if(storagebase.disabled_sites) APWBg.disabled_sites = JSON.parse(storagebase.disabled_sites);
else storagebase.disabled_sites = JSON.stringify(APWBg.disabled_sites);

if(storagebase.AutoPatchWorkConfig) APWBg.config = JSON.parse(storagebase.AutoPatchWorkConfig);
else storagebase.AutoPatchWorkConfig = JSON.stringify(APWBg.config);

if(storagebase.site_stats) site_stats = JSON.parse(storagebase.site_stats);
else storagebase.site_stats = JSON.stringify(site_stats);

if(storagebase.site_fail_stats) site_fail_stats = JSON.parse(storagebase.site_fail_stats);
else storagebase.site_fail_stats = JSON.stringify(site_fail_stats);

if(storagebase.custom_info) custom_info = JSON.parse(storagebase.custom_info);
else storagebase.custom_info = JSON.stringify(custom_info);

if(storagebase.AutoPatchWorkCSS) APWBg.css = storagebase.AutoPatchWorkCSS;
else APWBg.init_css();

if(storagebase.AutoPatchWorkPatterns) APWBg.custompatterns = JSON.parse(storagebase.AutoPatchWorkPatterns);
else APWBg.reset_custom_patterns();

var version = '', Manifest, IconData = {};

function getManifest(callback) {
    var url = './manifest.json';
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        callback(JSON.parse(xhr.responseText));
    };
    xhr.open('GET', url, true);
    xhr.send(null);
}

function getCSS() {
    var url = './css/main.css';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
}

function getWedataId(inf) {
    return parseInt(inf.resource_url ? inf.resource_url.replace('http://wedata.net/items/', '') : '0', 10);
}


function applyCustomFields(info) {
    siteinfo.forEach(function(i) {
        var id = i['wedata.net.id'];
        var ci = custom_info[id];
        if(ci) { Object.keys(ci).forEach(function(k) { i[k] = ci[k]; }); }
    });
}

function initDatabase() {
    // Sometimes the base gets corrupt when incorrectly exiting Opera.
    try { 
        if(!Store.has('siteinfo_wedata')) throw 'database expired';
        var data = Store.get('siteinfo_wedata');
        siteinfo = APWBg.custompatterns.concat(data.siteinfo);
        timestamp = new Date(data.timestamp);
        applyCustomFields();
    } catch (bug) {
        downloadDatabase();
    }
}

function createDatabase(info) {
    var keys = ['nextLink', 'pageElement', 'url', 'insertBefore'];
    siteinfo = [];
    info.forEach(function(i) {
        var d = i.data || i, r = {};
        keys.forEach(function(k) { if(d[k]) r[k] = d[k]; });
        try { new RegExp(r.url); } catch (bug) { return; }
        r['wedata.net.id'] = i['wedata.net.id'] || getWedataId(i);
        siteinfo.push(r);
    });
    siteinfo.sort(function(a, b) { return (b.url.length - a.url.length); });
    siteinfo.push.apply(siteinfo, MICROFORMATs);
    siteinfo.push({
        "url": "^http://matome\\.naver\\.jp/",
        "nextLink": "id(\"_pageNavigation\")//a[contains(@class, \"mdPagination01Next\")]",
        "pageElement": "//div[contains(@class, \"blMain00Body\")]/*",
        //exampleUrl:  'http://matome.naver.jp/odai/2124461146762161898',
        "wedata.net.id": "matome.naver"
    });
    window.opera && siteinfo.push({
        url: '^http://www\\.google\\.(?:[^.]+\\.)?[^./]+/images\\?.',
        nextLink: 'id("nav")//td[@class="cur"]/following-sibling::td/a',
        pageElement: '//table[tbody/tr/td/a[contains(@href, "/imgres")]]'
        //,exampleUrl:
        // 'http://images.google.com/images?gbv=2&hl=ja&q=%E3%83%9A%E3%83%BC%E3%82%B8'
    });
    timestamp = new Date;
    Store.set('siteinfo_wedata', {
            siteinfo: siteinfo,
            timestamp: timestamp.toLocaleString()
        },{ day: 60 });
    applyCustomFields();
}

function downloadDatabase(callback, error_back) {
    var xhr = new XMLHttpRequest();
    siteinfo = [];
    xhr.onload = function() {
        var info;
        try {
            info = JSON.parse(xhr.responseText);
            createDatabase(info);
            if( typeof callback === 'function') {
                callback();
            }
        } catch (bug) {
            if( typeof error_back === 'function') {
                error_back(bug);
                return;
            } else {
                throw bug;
            }
        }
    };
    xhr.onerror = function(err) {
        if( typeof error_back === 'function') {
            error_back(err);
        }
    };
    try {
       xhr.open('GET', URL_SITEINFO, true);
       xhr.send(null);
   } catch (bug) { 
       console.log(bug.message || bug);
   }
}

getManifest(function(_manifest) { Manifest = _manifest; version = _manifest.version; });
initDatabase();

window.onload = function() {
    var CHROME_GESTURES = 'jpkfjicglakibpenojifdiepckckakgk';
    var CHROME_KEYCONFIG = 'okneonigbfnolfkmfgjmaeniipdjkgkl';
    var action = {
        group: 'AutoPatchWork',
        actions: [{ name: 'AutoPatchWork.toggle' }, { name: 'AutoPatchWork.request' }]
    };
    self.chrome && chrome.extension.sendRequest(CHROME_GESTURES, action);
    self.chrome && chrome.extension.sendRequest(CHROME_KEYCONFIG, action);
};

var toggleCode = '(' + (function() {
    var ev = document.createEvent('Event');
    ev.initEvent('AutoPatchWork.toggle', true, false);
    document.dispatchEvent(ev);
}).toString() + ')();';

switch(browser) {
    case BROWSER_CHROME:
            chrome.extension.onRequest.addListener(handleMessage);
            break;
    case BROWSER_SAFARI:
        safari.application.addEventListener("message", function(evt) {
            var name = evt.name;
            if(name === 'option_init') {
                evt.target.page.dispatchMessage(name, APWBg);
            } else if(name === 'invoke_action') {
                if(evt.message.action === 'update') {
                    APWBg.config = evt.message.config;
                    APWBg.update();
                } else if(evt.message.action === 'save_disabled_site') {
                    APWBg.disabled_sites = evt.message.disabled_sites;
                    APWBg.save_disabled_site();
                } else if(evt.message.action === 'downloadDatabase') {
                    downloadDatabase(function() {
                        evt.target.page.dispatchMessage('updated_siteinfo');
                    });
                } else {
                    APWBg[evt.message.action].apply(APWBg, evt.message.args);
                }
            } else if(name === 'siteinfo_init') {
                evt.target.page.dispatchMessage(name, {
                    siteinfo: siteinfo,
                    custom_info: custom_info,
                    site_stats: site_stats,
                    site_fail_stats: site_fail_stats,
                    APWBg: APWBg
                });
            } else {
                handleMessage(evt.message, {}, function(data) {
                    evt.target.page.dispatchMessage(name, data);
                });
            }
        }, false);
        break;
    case BROWSER_OPERA:
        self.opera.extension.onmessage = function(evt) {
            var name = evt.data.name;
            var message = evt.data.data;
            if (!evt.source && name !== 'invoke_action') return;
            switch(name) {
                case 'option_init': // WTF??
                    evt.source.postMessage({
                        name: name,
                        data: JSON.parse(JSON.stringify(APWBg))
                    });
                    break;
                case 'siteinfo_init':
                    evt.source.postMessage({
                        name: name,
                        data: {
                            siteinfo: siteinfo,
                            custom_info: custom_info,
                            site_stats: site_stats,
                            site_fail_stats: site_fail_stats,
                            APWBg: JSON.parse(JSON.stringify(APWBg))
                        }
                    });
                    break;
                case 'invoke_action':
                    switch(message.action) {
                        case 'update':
                            APWBg.config = message.config;
                            APWBg.update();
                            break;
                        case 'save_disabled_site':
                            APWBg.disabled_sites = message.disabled_sites;
                            APWBg.save_disabled_site();
                            break;
                        case 'download_database':
                            downloadDatabase(function() { evt.source.postMessage({ name: 'updated_siteinfo' }); });
                            break;
                        default:
                            APWBg[message.action].apply(APWBg, message.args);
                    }
                    break;
                default:
                    handleMessage(message, {}, function(data) {
                        evt.source.postMessage({ name: name, data: data });
                    });
            }
        };
}

function handleMessage(request, sender, sendResponse) {
    if(request.message === 'AutoPatchWork.initialized') {
        var id = request.siteinfo['wedata.net.id'] || 'microformats';
        site_stats[id] = ++site_stats[id] || 1;
        storagebase.site_stats = JSON.stringify(site_stats);
        return;
    }
    if(request.failed_siteinfo) {
        request.failed_siteinfo.forEach(function(s) {
            var id = s['wedata.net.id'];
            if(!id) return;
            site_fail_stats[id] = ++site_fail_stats[id] || 1;
        });
        storagebase.site_fail_stats = JSON.stringify(site_fail_stats);
        return;
    }
    if(request.manage) {
        openOrFocusTab('siteinfo_manager.html');
        return;
    }
    if(request.options) {
        openOrFocusTab('options.html');
        return;
    }
    if(!APWBg.state || (request.isFrame && APWBg.config.disable_iframe))
        return;

    var infos = [], url = request.url;

    if(!url || APWBg.blacklist_check(url) || url.index)
        return;

    for(var i = 0, len = siteinfo.length, s; i < len; i++) {
        s = siteinfo[i];
        if(!s.disabled && new RegExp(siteinfo[i].url).test(url))
            infos.push(siteinfo[i]);
    }

    sendResponse({
        siteinfo: infos,
        config: APWBg.config,
        css: APWBg.css
    });
}

function openOrFocusTab(uri) {
    switch (browser) {
        case BROWSER_CHROME:
            chrome.windows.getAll({ populate: true},
                function(windows) {
                if(!windows.some(function(w) {
                    if(w.type === 'normal') {
                        return w.tabs.some(function(t) {
                            if(t.url === H + uri) {
                                chrome.tabs.update(t.id, { 'selected': true });
                                return true;
                            }
                        });
                    }
                })) { chrome.tabs.getSelected(null, function(t) {
                        chrome.tabs.create({ 'url': uri, 'selected': true, index: t.index + 1 });
                    });
                }
            });
            break;
        case BROWSER_SAFARI:
            if(!safari.application.browserWindows.some(function(w) {
                return w.tabs.some(function(t) {
                    if(t.url.indexOf(H + uri) === 0) {
                        t.activate();
                        return true;
                    }
                });
            })) { safari.application.activeBrowserWindow.openTab().url = H + uri; }
            break;
        case BROWSER_OPERA:
            opera.extension.tabs.create({ url: uri, focused: true }); // Yay for Opera! ^_^
            break;
    }
}