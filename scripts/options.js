var bgProcess;
var imageTick = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGrSURBVDjLvZPZLkNhFIV75zjvYm7VGFNCqoZUJ+roKUUpjRuqp61Wq0NKDMelGGqOxBSUIBKXWtWGZxAvobr8lWjChRgSF//dv9be+9trCwAI/vIE/26gXmviW5bqnb8yUK028qZjPfoPWEj4Ku5HBspgAz941IXZeze8N1bottSo8BTZviVWrEh546EO03EXpuJOdG63otJbjBKHkEp/Ml6yNYYzpuezWL4s5VMtT8acCMQcb5XL3eJE8VgBlR7BeMGW9Z4yT9y1CeyucuhdTGDxfftaBO7G4L+zg91UocxVmCiy51NpiP3n2treUPujL8xhOjYOzZYsQWANyRYlU4Y9Br6oHd5bDh0bCpSOixJiWx71YY09J5pM/WEbzFcDmHvwwBu2wnikg+lEj4mwBe5bC5h1OUqcwpdC60dxegRmR06TyjCF9G9z+qM2uCJmuMJmaNZaUrCSIi6X+jJIBBYtW5Cge7cd7sgoHDfDaAvKQGAlRZYc6ltJlMxX03UzlaRlBdQrzSCwksLRbOpHUSb7pcsnxCCwngvM2Rm/ugUCi84fycr4l2t8Bb6iqTxSCgNIAAAAAElFTkSuQmCC';
var imageCross = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIhSURBVDjLlZPrThNRFIWJicmJz6BWiYbIkYDEG0JbBiitDQgm0PuFXqSAtKXtpE2hNuoPTXwSnwtExd6w0pl2OtPlrphKLSXhx07OZM769qy19wwAGLhM1ddC184+d18QMzoq3lfsD3LZ7Y3XbE5DL6Atzuyilc5Ciyd7IHVfgNcDYTQ2tvDr5crn6uLSvX+Av2Lk36FFpSVENDe3OxDZu8apO5rROJDLo30+Nlvj5RnTlVNAKs1aCVFr7b4BPn6Cls21AWgEQlz2+Dl1h7IdA+i97A/geP65WhbmrnZZ0GIJpr6OqZqYAd5/gJpKox4Mg7pD2YoC2b0/54rJQuJZdm6Izcgma4TW1WZ0h+y8BfbyJMwBmSxkjw+VObNanp5h/adwGhaTXF4NWbLj9gEONyCmUZmd10pGgf1/vwcgOT3tUQE0DdicwIod2EmSbwsKE1P8QoDkcHPJ5YESjgBJkYQpIEZ2KEB51Y6y3ojvY+P8XEDN7uKS0w0ltA7QGCWHCxSWWpwyaCeLy0BkA7UXyyg8fIzDoWHeBaDN4tQdSvAVdU1Aok+nsNTipIEVnkywo/FHatVkBoIhnFisOBoZxcGtQd4B0GYJNZsDSiAEadUBCkstPtN3Avs2Msa+Dt9XfxoFSNYF/Bh9gP0bOqHLAm2WUF1YQskwrVFYPWkf3h1iXwbvqGfFPSGW9Eah8HSS9fuZDnS32f71m8KFY7xs/QZyu6TH2+2+FAAAAABJRU5ErkJggg==';
//var imgRefresh =
// 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAI/SURBVDjLjZPbS9NhHMYH+zNidtCSQrqwQtY5y2QtT2QGrTZf13TkoYFlzsWa/tzcoR3cSc2xYUlGJfzAaIRltY0N12H5I+jaOxG8De+evhtdOP1hu3hv3sPzPO/z4SsBIPnfuvG8cbBlWiEVO5OUItA0VS8oxi9EdhXo+6yV3V3UGHRvVXHNfNv6zRfNuBZVoiFcB/3LdnQ8U+Gk+bhPVKB3qUOuf6/muaQR/qwDkZ9BRFdCmMr5EPz6BN7lMYylLGgNNaKqt3K0SKDnQ7us690t3rNsxeyvaUz+8OJpzo/QNzd8WTtcaQ7WlBmPvxhx1V2Pg7oDziIBimwwf3qAGWESkVwQ7owNujk1ztvk+cg4NnAUTT4FrrjqUKHdF9jxBfXr1rgjaSk4OlMcLrnOrJ7latxbL1V2lgvlbG9MtMTrMw1r1PImtfyn1n5q47TlBLf90n5NmalMtUdKZoyQMkLKlIGLjMyYhFpmlz3nGEVmFJlRZNaf7pIaEndM24XIjCOzjX9mm2S2JsqdkMYIqbB1j5C6yWzVk7YRFTsGFu7l+4nveExIA9aMCcOJh6DIoMigyOh+o4UryRWQOtIjaJtoziM1FD0mpE4uZcTc72gBaUyYKEI6khgqINXO3saR7kM8IZUVCRDS0Ucf+xFbCReQhr97MZ51wpWxYnhpCD3zOrT4lTisr+AJqVx0Fiiyr4/vhP4VyyMFIUWNqRrV96vWKXKckBoIqWzXYcoPDrUslDJoopuEVEpIB0sR+AuErIiZ6OqMKAAAAABJRU5ErkJggg==';
//var imgSave =
// 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAH+SURBVBgZBcE9i11VGAbQtc/sO0OCkqhghEREAwpWAWUg8aMVf4KFaJEqQtAipTZWViKiCGOh2Ap2gmJhlSIWFsFOxUK0EsUM3pl79n4f12qHb3z3Fh7D83gC95GOJsDe0ixLk5Qq/+xv/Lw9Xd+78/HLX3Y8fXTr2nWapy4eCFKxG7Fby97SnDlYtMbxthyfzHO//nl85fNvfvnk8MbX5xa8IHx1518Vkrj54Q+qQms2vVmWZjdiu5ZR2rT01166/NCZg/2PFjwSVMU6yjoC1oq+x6Y3VbHdlXWExPd379nf7Nmejv2Os6OC2O4KLK0RNn3RNCdr2Z5GJSpU4o+/TkhaJ30mEk5HwNuvX7Hpi76wzvjvtIwqVUSkyjqmpHS0mki8+9mPWmuWxqYvGkbFGCUAOH/+QevYI9GFSqmaHr5wkUYTAlGhqiRRiaqiNes6SOkwJwnQEqBRRRJEgkRLJGVdm6R0GLMQENE0EkmkSkQSVVMqopyuIaUTs0J455VLAAAAAODW0U/GiKT0pTWziEj44PZ1AAAAcPPqkTmH3QiJrlEVDXDt0qsAAAAAapa5BqUnyaw0Am7//gUAAAB49tEXzTmtM5KkV/y2G/X4M5fPao03n/sUAAAAwIX7y5yBv9vhjW/fT/IkuSp5gJKElKRISYoUiSRIyD1tufs/IXxui20QsKIAAAAASUVORK5CYII=';
var imgLoad = 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==';

// main
document.addEventListener('DOMContentLoaded',function(){
(function option_init(opt) {

    function find(path) {
        if (typeof path !== 'string') return [];
        var arr = [];
        for (var nl = document.querySelectorAll(path), i = 0, ref = arr.length = nl.length; i < ref; i++) arr[i] = nl[i];
        return arr;
    }

    var html = document.querySelector('html');
    html.setAttribute('lang', window.navigator.language);
    html.setAttribute('xml:lang', window.navigator.language);

    function APWException(message) {
        this.message = message;
        this.name = '[AutoPatchWork]';
    }

    switch (browser_type) {
        case BROWSER_CHROME:
            bgProcess = browser.extension.getBackgroundPage();
            AutoPatchWork = bgProcess.AutoPatchWorkBG;
            break;
        case BROWSER_SAFARI:
            if(!opt) {
                safari.self.tab.dispatchMessage('option_init');
                safari.self.addEventListener('message', function(evt) {
                    if(evt.name === 'option_init') {
                        option_init(evt.message);
                    } else if(evt.name === 'updated_siteinfo') {
                        bgProcess.callback();
                    }
                }, false);
                return;
            } else {
                AutoPatchWork = opt;
                ['init_css', 'save_custom_patterns', 'reset_custom_patterns', 'add_disabled_site', 'delete_disabled_site'].forEach(function(action) {
                    AutoPatchWork[action] = function() {
                        safari.self.tab.dispatchMessage('invoke_action', {
                            action: action,
                            args: Array.prototype.slice.call(arguments)
                        });
                    };
                });
                AutoPatchWork.update = function() {
                    safari.self.tab.dispatchMessage('invoke_action', {
                        action: 'update',
                        config: AutoPatchWork.config
                    });
                };
                AutoPatchWork.save_disabled_site = function() {
                    safari.self.tab.dispatchMessage('invoke_action', {
                        action: 'save_disabled_site',
                        disabled_sites: AutoPatchWork.disabled_sites
                    });
                };
                bgProcess = {
                    downloadDatabase: function(callback) {
                        bgProcess.callback = callback;
                        safari.self.tab.dispatchMessage('invoke_action', { action: 'download_database' });
                    }
                };
            }
            break;
        case BROWSER_OPERA:
            bgProcess = opera.extension.bgProcess;
            if (typeof bgProcess === 'object') AutoPatchWork = bgProcess.AutoPatchWorkBG;
            else
                throw new APWException('Browser version is too old.');
            break;
        default:
    }

    var WIDTH = 700;
    //var HEIGHT = Math.max(window.innerHeight - 100, 500);

    // General settings tab
    var open_siteinfo_manager = document.getElementById('open_siteinfo_manager');
    open_siteinfo_manager.addEventListener('click', function() {
        switch (browser_type) {
            case BROWSER_CHROME:
                browser.tabs.query({active: true}, function(t) {
                        browser.tabs.create({ 'url': 'siteinfo_manager.html', index: (t[0] ? t[0].index : 0) + 1 });
                 });
                break;
            case BROWSER_SAFARI:
                safari.self.tab.dispatchMessage('options', { manage: true });
                break;
            case BROWSER_OPERA:
                opera.extension.postMessage({
                    name: 'options',
                    data: { manage: true }
                });
                break;
            default:
        }
    }, false);

    var update_siteinfo = document.getElementById('update_siteinfo');
    update_siteinfo.addEventListener('click', function() {
        var button_text = update_siteinfo.textContent.trim();
        update_siteinfo.disabled = true;
        update_siteinfo.innerHTML = '<img src="' + imgLoad + '">Updating...';
        update_siteinfo.className = 'MSG_update_siteinfo_upd';

        bgProcess.downloadDatabase(function() {
            update_siteinfo.innerHTML = '<img src="' + imageTick + '">Updated';
            update_siteinfo.className = 'MSG_update_siteinfo_sucс';

            setTimeout(function(){
                update_siteinfo.textContent = button_text;
                update_siteinfo.className = 'MSG_update_siteinfo';
                update_siteinfo.disabled = false;
            }, 4000);
        }, function() {
            update_siteinfo.innerHTML = '<img src="' + imageCross + '">Unchanged';
            update_siteinfo.className = 'MSG_update_siteinfo_fail';
            setTimeout(function(){
                update_siteinfo.textContent = button_text;
                update_siteinfo.className = 'MSG_update_siteinfo';
                update_siteinfo.disabled = false;
            }, 4000);

        });
    }, false);

    var reload_db = document.getElementById('reload_db');
    reload_db.addEventListener('click', function() {
        reload_db.disabled = true;
        bgProcess.initDatabase();
        reload_db.disabled = false;
    }, false);

    document.getElementById('db_location').value = bgProcess.JSON_SITEINFO_DB_MIN;
    var update_wedata_location = document.getElementById('update_wedata_location');
    update_wedata_location.addEventListener('click', function() {
        update_wedata_location.disabled = true;
        var loc = document.getElementById('db_location').value;
        if (!loc || loc.length < 10) {
            bgProcess.resetDBLocation(false);
            document.getElementById('db_location').value = bgProcess.JSON_SITEINFO_DB_MIN;
            update_wedata_location.disabled = false;
        } else if (loc !== bgProcess.JSON_SITEINFO_DB_MIN && /^https?:\/\/.+\.json.*/i.test(loc)) {
            bgProcess.checkExists(loc, function (exists) {
                if (exists) bgProcess.updateMiniDatabaseURL(loc);
                update_wedata_location.disabled = false;
            });
        } else update_wedata_location.disabled = false;
    }, false);

    document.getElementById('full_db_location').value = bgProcess.JSON_SITEINFO_DB;
    var update_wedata_full_location = document.getElementById('update_wedata_full_location');
    update_wedata_full_location.addEventListener('click', function() {
        update_wedata_full_location.disabled = true;
        var loc = document.getElementById('full_db_location').value;
        if (!loc || loc.length < 10) {
            bgProcess.resetDBLocation(true);
            document.getElementById('full_db_location').value = bgProcess.JSON_SITEINFO_DB;
            update_wedata_full_location.disabled = false;
        } else if (loc !== bgProcess.JSON_SITEINFO_DB && /^https?:\/\/.+\.json.*/i.test(loc)) {
            bgProcess.checkExists(loc, function (exists) {
                if (exists) bgProcess.updateFullDatabaseURL(loc);
                update_wedata_full_location.disabled = false;
            });
        } else update_wedata_full_location.disabled = false;
    }, false);

    find('[type="radio"]').forEach(function(box) {
        var name = box.name;
        var val = AutoPatchWork.config[name] || 'on';
        if(val === box.value) {
            box.checked = true;
        }
        box.addEventListener('click', function() {
            AutoPatchWork.config[name] = box.value;
            AutoPatchWork.update();
        }, false);
    });
    find('[type="checkbox"]').forEach(function(box) {
        var id = box.id;
        var val = AutoPatchWork.config[id];
        if(val === true || val === false) {
            box.checked = val;
        } else {
            box.checked = false;
        }
        box.addEventListener('click', function() {
            AutoPatchWork.config[id] = box.checked ? true : false;
            AutoPatchWork.update();
        }, false);
    });
    find('[type="range"]').forEach(function(box) {
        var id = box.id;
        var output = document.querySelector('#' + id + '_value');
        var val = AutoPatchWork.config[id];
        box.value = val;
        output.textContent = box.value;
        box.addEventListener('change', function() {
            AutoPatchWork.config[id] = +this.value;
            output.textContent = box.value;
            AutoPatchWork.update();
        }, false);
    });

    // Custom CSS for separator tab
    var css_text = document.getElementById('css_text');
    css_text.value = AutoPatchWork.css || '';
    var apply_css = document.getElementById('apply_css');
    apply_css.addEventListener('click', function() {
        AutoPatchWork.init_css(css_text.value);
    }, false);
    var reset_css = document.getElementById('reset_css');
    reset_css.addEventListener('click', function() {
        reset_css.disabled = true;
        AutoPatchWork.init_css();
        setTimeout(function() {
            css_text.value = AutoPatchWork.css;
            reset_css.disabled = false;
        }, 200);
    }, false);

    // Custom SITEINFO patterns tab
    var custom_patterns = document.getElementById('custom_patterns');
    custom_patterns.value = storagebase.AutoPatchWorkPatterns || '';
    var apply_custom_patterns = document.getElementById('apply_custom_patterns');
    apply_custom_patterns.addEventListener('click', function() {
        try {
            JSON.parse(custom_patterns.value);
        } catch (bug) {
            alert('Invalid JSON format. Check original SITEINFO for the reference.');
            return;
        }
        AutoPatchWork.save_custom_patterns(custom_patterns.value);
    }, false);
    var reset_custom_patterns = document.getElementById('reset_custom_patterns');
    reset_custom_patterns.addEventListener('click', function() {
        reset_custom_patterns.disabled = true;
        AutoPatchWork.reset_custom_patterns();
        setTimeout(function() {
            custom_patterns.value = storagebase.AutoPatchWorkPatterns;
            reset_custom_patterns.disabled = false;
        }, 200);
    }, false);

    // Backup tab
    var backup_field = document.getElementById('backup_field');
    // It's too big to load from the beginning
    document.getElementById('menu-backup').onclick = function() {
        backup_field.value = JSON.stringify(storagebase) || '';
    };
    var save_backup = document.getElementById('save_backup');
    save_backup.addEventListener('click', function() {
        save_backup.disabled = true;
        var backup = JSON.parse(backup_field.value);
        storagebase.clear();
        for (var item in backup)
            if (backup.hasOwnProperty(item))
                storagebase.setItem(item, backup[item]);
        setTimeout(function() {
            bgProcess.initDatabase();
            save_backup.disabled = false;
        }, 500);
    }, false);
    var reset_backup = document.getElementById('reset_backup');
    reset_backup.addEventListener('click', function() {
        reset_backup.disabled = true;
        storagebase.clear();
        //init here; callback on completion
        setTimeout(function() {
            backup_field.value = JSON.stringify(storagebase);
            reset_backup.disabled = false;
        }, 1000);
    }, false);

    // Blacklists
    var filter_list = document.getElementById('filter_list'),
        filter_text = document.getElementById('filter_text'),
        filter_type = document.getElementById('filter_type'),
        add_filter = document.getElementById('add_filter');

    AutoPatchWork.disabled_sites.forEach(create_filter);

    function create_filter(site) {
        var li = document.createElement('li'),
            types = filter_type.cloneNode(true);

        types.id = '';
        li.appendChild(types);
        types.value = site.type;
        types.addEventListener('change', function() {
            site.type = types.value;
            AutoPatchWork.save_disabled_site();
        }, false);

        var input = document.createElement('input');
        input.type = 'text';
        input.value = site.matcher;
        input.addEventListener('input', function() {
            site.matcher = input.value;
            AutoPatchWork.save_disabled_site();
        }, false);
        li.appendChild(input);

        var del = document.createElement('button');
        del.textContent = /*i18n.getMessage('del') ||*/ 'Del';
        del.addEventListener('click', function() {
            input.disabled = !input.disabled;
            if(input.disabled) {
                AutoPatchWork.delete_disabled_site(site);
                del.textContent = /*i18n.getMessage('undo') ||*/ 'Undo';
            } else {
                AutoPatchWork.add_disabled_site(site);
                del.textContent = /*i18n.getMessage('del') ||*/ 'Del';
            }
        }, false);
        li.appendChild(del);

        filter_list.appendChild(li);
    }

    add_filter.addEventListener('click', function() {
        var site = filter_text.value;
        if(!site) return;

        var type = filter_type.value;
        if(type.toLowerCase() === 'regexp') {
            try {
                new RegExp(site);
            } catch (bug) {
                alert('[AutoPatchWork] RegExp '+site+' has invalid format!');
                return;
            }
        }
        site = { matcher: site, type: type };
        create_filter(site);
        AutoPatchWork.add_disabled_site(site);
        filter_text.value = '';
    }, false);

    var sections = find('section.content'),
        inner_container = document.getElementById('inner-container'),
        container = document.getElementById('base');

    inner_container.style.width = sections.length * (WIDTH + 20) + 'px';
    container.style.height = 'auto'; //HEIGHT + 'px';
    sections.forEach(function(section) {
        section.style.visibility = 'hidden';
        section.style.height = '100px';
    });

    var btns = find('#menu-tabs>li>a'),
        default_title = document.title;

    btns.forEach(function(btn, i, btns) {
        btn.addEventListener('click', function(evt) {
            evt.preventDefault();
            btns.forEach(function(btn) {
                btn.parentNode.className = '';
            });
            btn.parentNode.className = 'selected';
            sections[i].style.visibility = 'visible';
            sections[i].style.height = 'auto';
            new Tween(inner_container.style, {
                marginLeft: {
                    to: i * -WIDTH,
                    tmpl: '$#px'
                },
                time: 0.2,
                onComplete: function() {
                    document.title = default_title + btn.hash;
                    if (!window.opera) location.hash = btn.hash;
                    window.scrollBy(0, -1000);
                    sections.forEach(function(section, _i) {
                        if(i !== _i) {
                            section.style.visibility = 'hidden';
                            section.style.height = '100px';
                        }
                    });
                }
            });
        }, false);
    });

    if(location.hash) {
        sections.some(function(section, i) {
            if('#' + section.id === location.hash) {
                btns.forEach(function(btn) {
                    btn.parentNode.className = '';
                });
                btns[i].parentNode.className = 'selected';
                inner_container.style.marginLeft = -WIDTH * i + 'px';
                section.style.visibility = 'visible';
                section.style.height = 'auto';
                document.title = default_title + location.hash;
            }
        });
    } else {
        sections[0].style.height = 'auto';
        sections[0].style.visibility = 'visible';
        document.title = default_title + '#' + sections[0].id;
    }

})();
}, false);

/* jshint ignore:start */
// Tweener Like snippet
// var tw = new Tween(div.style,{time:1, onComplete:function(){},left:{to:0,from:100,tmpl:"$#px"}});
function Tween(item, opt) {
    var self = this, TIME = 10, time = (opt.time||1) * 1000, TM_EXP = /(\+)?\$([\#\d])/g, sets = [], isFilter,
        easing = opt.transition || function(t, b, c, d){return c*t/d + b;}, _T = {time:1,onComplete:1,transition:1,delay:1};
    for (var k in opt) if (opt.hasOwnProperty(k)) if (!_T[k]) {
        var set = opt[k], from = set.from || 0;
        if (typeof item === 'function') {
            isFilter = true;
            sets.push({from:from, to:set.to});
        } else {
            from = from || parseFloat(item[k]) || 0;
            sets.push({key:k, from:from, to:set.to, tmpl:(set.tmpl || '-$#')});
        }
    }
    var L = sets.length, delay = opt.delay*1000 || 0, startTime = new Date()*1 + delay, run = function(){
        var now = new Date()*1, tim = self.prev = now - startTime;
        for (var k = 0; k < L; ++k) {
            var set = sets[k], val = easing(tim, set.from, set.to - set.from, time);
            if (isFilter) {
                item(val);
            } else {
                item[set.key] = set.tmpl.replace(TM_EXP,
                    function(m, p, m1){return p && val < 0 ? 0 : (m1 === '#' ? val : val.toFixed(m1));});
            }
        }
        if (tim <= time) {self.T=setTimeout(function(){run.call(self);},TIME);}
        else {
            for (var k = 0; k < L; ++k) {
                if (isFilter) {
                    item(sets[k].to);
                } else {
                    item[sets[k].key] = sets[k].tmpl.replace(TM_EXP, sets[k].to);
                }
            }
            if (typeof opt.onComplete === 'function') opt.onComplete(item);
            self.end = true;
        }
    };
    self.prev = 0;
    this.restart = function(){
        startTime = new Date()*1 - self.prev;
        run();
    };
    this.pause = function(){
        if(self.T){
            clearTimeout(self.T);
            self.T = null;
        }
    };
    this.stop = function(){
        if(self.T){
            clearTimeout(self.T);
            self.T = null;
            self.prev = 0;
            for (var k = 0; k < L; ++k) {
                var set = sets[k], val = set.from;
                if (isFilter) {
                    item(val);
                } else {
                    item[set.key] = set.tmpl.replace(TM_EXP,
                        function(m, p, m1){return p && val < 0 ? 0 : (m1 === '#' ? val : val.toFixed(m1));});
                }
            }
        }
    };
    if (delay) this.T=setTimeout(function(){run();},delay); else run(0);
}
/* jshint ignore:end */
