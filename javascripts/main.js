!function(win){
    var TK = win.TK || function(){};
    TK.prototype.version = "v20130112";
    TK.prototype.author = "tiankonguse";
    TK.prototype.homepage = "http://tiankonguse.com";
    TK.prototype.QQ = "804345178";
    win.TK = TK;
    win.tk = new TK();
}(window);

TK.prototype.Composition = function Composition(target, source){
    for(var key in source){
        target.prototype[key] = source[key];
    }
};
TK.prototype.AddMethod = function AddMethod(target, source){
    for(var key in source){
        target[key] = source[key];
    }
};

tk.Composition(TK, {
    "min" : function min(){
        var a = arguments;
        var r = a[0];
        var l = a.length;
        for(var i in a){
            r = r < a[i] ? r : a[i];
        }
        return r;
    },
    "max" : function max(){
        var a = arguments;
        var r = a[0];
        var l = a.length;
        for(var i in a){
            r = r > a[i] ? r : a[i];
        }
        return r;
    }
});

tk.Composition(TK,{
    replace : function replace(str, key, val) {
        return str.split(key).join(val);
    }
});


/**
 * @functionName {Format} 得到自定义格式的时间字符串
 * @authon {tiankonguse}
 * @param {String:fmt}      
 * @return {String}
 * y:年, M:月份, d:日, m:分, s:秒 S:毫秒
 */
tk.Composition(TK,{
    Format : function Format(data, fmt) {
        var o = {
            "M+": data.getMonth() + 1,
            "d+": data.getDate(),
            "h+": data.getHours(),
            "m+": data.getMinutes(),
            "s+": data.getSeconds()
        };
        if (/(y+)/.test(fmt)){
            var match = RegExp.$1;
            var length = 4 - tk.min(match.length, 4);
            var replace = (data.getFullYear() + "");
            replace = replace.substr(length);
            fmt = tk.replace(fmt, match, replace);
        }
        if (/(S+)/.test(fmt)){
            var match = RegExp.$1;
            var replace = data.getMilliseconds() + "";
            var length = tk.max(tk.min(match.length, 3), replace.length)
            replace = "00" + replace;
            length = replace.length - length;
            replace = replace.substr(length);
            fmt = tk.replace(fmt, match, replace);
        }
        for (var k in o){
            if (new RegExp("(" + k + ")").test(fmt)){
                var match = RegExp.$1;
                var replace = o[k] + "";
                var length = tk.max(tk.min(match.length, 2), replace.length);
                replace = "0" + replace;
                length = replace.length - length;
                replace = replace.substr(length);
                fmt = tk.replace(fmt, match, replace);
            }
        }
        return fmt;
    }
});



tk.Composition(TK,{
    UTF8Length : function UTF8Length(s) {
        var l = 0;
        var c;
        for (var i = 0; i < s.length; i++) {
            c = s.charCodeAt(i);
            if (c <= 0x007f) {
                l = l + 1;
            } else if ((0x0080 <= c) && (c <= 0x07ff)) {
                l += 2;
            } else if ((0x0800 <= c) && (c <= 0xffff)) {
                l += 3;
            }
        }
        return l;
    }
});

tk.AddMethod(TK,{
    Cookie : function Cookie(){}
});
tk.Composition(TK.Cookie,{
    set: function set(name, value, domain, path) {
        document.cookie = name + "=" + value + "; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=.cm.com;"));
        return true;
    },
    get: function get(name) {
        var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
        m = document.cookie.match(r);
        return (!m ? "": m[1]);
    },
    del: function del(name, domain, path) {
        document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=.cm.com;"));
    }
});
tk.Composition(TK,{
    cookie : new TK.Cookie()
});

tk.AddMethod(TK,{
    customDropDown : function customDropDown(ele){
        this.dropdown = ele;
        this.placeholder = this.dropdown.find(".placeholder");
        this.options = this.dropdown.find("ul.dropdown-menu > li:not(.hide)");
        this.val = '';
        this.index = -1;//默认为-1;
        this.initEvents();
    }
});
tk.Composition(TK.customDropDown,{
    initEvents : function initEvents() {
        var obj = this;
        //这个方法可以不写，因为点击事件被Bootstrap本身就捕获了，显示下面下拉列表
        obj.dropdown.on("click", function(event) {
            $(this).toggleClass("active");
        });
        //点击下拉列表的选项
        obj.options.on("click", function() {
            var opt = $(this);
            obj.text = opt.find("a").text();
            obj.val = opt.attr("value");
            obj.index = opt.index();
            obj.placeholder.text(obj.text);
        });
    },
    getText : function getText() {
        return this.text;
    },
    getValue : function getValue() {
        return this.val;
    },
    getIndex : function getIndex() {
        return this.index;
    },
    selectFirst : function selectFirst() {
        this.options[0].click();
    },
    hide : function hide() {
        this.dropdown.hide()
    },
    show : function show() {
        this.dropdown.show()
    }
});

tk.AddMethod(TK,{
    JSON : function JSON(ele){
        ele = ele || "{}";
        this.parse = window.JSON.parse;
        this.stringify = window.JSON.stringify;
        if(typeof ele == "string"){
            this.str = ele;
            this.object = this.parse(ele);
        }else{
            this.object = ele;
            this.str = this.stringify(ele, null, 0);
        }
    }
});
tk.Composition(TK.JSON,{
    toObject : function toObject(src){
        return this.parse(src);
    },
    toString : function toString(format){
        var str;
        if(format){
            str = this.stringify(this.object);
        }else{
            str = this.str;
        }
        return str;
    }
});
tk.Composition(TK, {
    json : new TK.JSON()
});

tk.AddMethod(TK,{
    XML : function XML(ele){
        ele = ele || "";
        this.ok = false;
        this.json = {};
        if(typeof ele == "string"){
            if (ele.trim().length == 0) {
                this.ok = true;
            }else{
                var xmlDom = jQuery.parseXML(ele);
                if (xmlDom.nodeType == 9) {
                    this.xmlDom = xmlDom.childNodes[0];
                }else{
                    this.ok = true;
                }
            }
        }else{
            this.xmlDom = ele;
        }
    }
});
tk.Composition(TK.XML,{
    toXMLDom : function toXMLDom(ele){
        ele = ele || "";
        this.ok = false;
        this.json = {};
        if(typeof ele == "string"){
            if (ele.trim().length == 0) {
                this.ok = true;
            }else{
                var xmlDom = jQuery.parseXML(ele);
                if (xmlDom.nodeType == 9) {
                    this.xmlDom = xmlDom.childNodes[0];
                }else{
                    this.ok = true;
                }
            }
        }else{
            this.xmlDom = ele;
        }
        return this.xmlDom;
    },
    toJSON : function toJSON(ele){
        if(ele){
            this.toXMLDom(ele);
        }
        if(this.ok){
            return this.json;
        }
        var xml = this.xmlDom;
        var obj = {};
        if (xml.nodeType == 1) {
            // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    }
});
tk.Composition(TK, {
    xml : new TK.XML()
});

/**
 * 获取字符串的哈希值
 * 
 * @param {String}
 *            str
 * @param {Boolean}
 *            caseSensitive
 * @return {Number} hashCode
 */
tk.Composition(TK,{
    hashString : function hashString(str, caseSensitive){
        str = str.toString();
        if (!caseSensitive) {
            str = str.toLowerCase();
        }
        // 1315423911=b'1001110011001111100011010100111'
        var hash = 1315423911, i, ch;
        for (i = str.length - 1; i >= 0; i--) {
            ch = str.charCodeAt(i);
            hash ^= ((hash << 5) + ch + (hash >> 2));
        }
        return (hash & 0x7FFFFFFF);
    }
});

tk.Composition(TK,{
    loadImg : function loadImg(imgList, callback){
        if(typeof imgList == "string"){
            imgList = [imgList];
        }
        window.TK = window.TK || {};
        var hashMap = {};
        var img = window.TK.img;
        window.TK.img = '';
        
        window.TK.callback = function(){
            window.TK.img = img;
            if(callback){
                callback();
            }
        };
        for(var i in imgList){
            var url = imgList[i];
            var key = "" + tk.hashString(url);
            if(hashMap[key])continue;
            hashMap[key] = 1;
            window.TK.img += '<img src=\''+url+'\' /><script>window.onload = function() { parent.TK.callback(); }</script>';
        }
        if(window.TK.img){
            $("body").append('<iframe src="javascript:parent.TK.img;" height="0px" width="0px"></iframe>');
        }
    }
});

tk.Composition(TK,{
    imgRealSize : function imgRealSize(url, callback){
    var img = new Image();
    img.src = url;
    if(img.complete){
        callBack(img.width, img.height);
        img = null;
    }else{
        img.onload=function(){
            callBack(img.width, img.height);
            img = null;
        };
    }
    }
});

tk.AddMethod(TK,{
    Mobile : function Mobile(){
        this.agent = navigator.userAgent;
    }
});
    
    
tk.Composition(TK.Mobile,{
   Android: function Android() {
        return this.agent.match(/Android/i);
    },
    BlackBerry: function BlackBerry() {
        return this.agent.match(/BlackBerry/i);
    },
    iOS: function iOS() {
        return this.agent.match(/iPhone|iPad|iPod/i);
    }
    ,Opera: function Opera() {
        return this.agent.match(/Opera Mini/i);
    },
    Windows: function Windows() {
        return this.agent.match(/IEMobile/i);
    },
    QQ : function QQ(){
        return this.agent.match(/QQ\//i);
    },
    any: function() {
        return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
    }
});

tk.Composition(TK, {
    isMobile  : new TK.Mobile()
});

tk.Composition(TK, {
    loadJSFile  : function loadJSFile($dom, url){
        var script = jQuery('<script src="' + url + '" async ></script>');
        $dom.append(script);
    }
});

tk.Composition(TK, {
    loadPage : function loadPage(nowPage, allPage, $pageDom, url){
        var first = true;
        if(nowPage == 1){
            first = false;
        }
        if (allPage > 1) {
            $pageDom.html("");
            var op = {
                bootstrapMajorVersion : 3,
                currentPage : nowPage,
                totalPages : allPage,
                onPageChanged : function(e, oldPage, newPage) {
                    if(first == true){
                        first = false;
                        return;
                    }
                    if(newPage > 1){
                        window.location.href=url+"page"+newPage;
                    }else{
                        window.location.href=url;
                    }
                },
                useBootstrapTooltip : true,
                tooltipTitles : function(type, page, current) {
                    switch (type) {
                        case "first" :
                            return "第一页";
                        case "prev" :
                            return "上一页";
                        case "next" :
                            return "下一页";
                        case "last" :
                            return "最后一页";
                        case "page" :
                            return "第" + page + "页";
                    }
                },
                pageUrl : function(type, page, current){
                    if(page == 1){
                        return url;
                    }else{
                        return url+"page"+page;
                    }
                    
                }
            };
            $pageDom.bootstrapPaginator(op);
        } 
    }
});


tk.Composition(TK, {
    time : function time(){
        return new Date().getTime();
    }
});

tk.AddMethod(TK,{
    AD : function AD(){
        this.isShowPageFoot = true;
        this.isLoadGoogleJs = true;
        this.adList = [];
    }
});

tk.Composition(TK.AD,{
    showPageFoot: function showPageFoot(className, key, force) {
        if(!this.isShowPageFoot && !force){
            return;
        }
        if(tk.isMobile.any()){
            $("." + className).html(this.getAd(key));
        }else{
            $("." + className).html(this.getAd(key));
        }
    },
    loadGoogleJs : function loadGoogleJs(force){
        if(!this.isLoadGoogleJs && !force){
            return;
        }
        try{
            tk.loadJSFile($("body"), "http://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
        }catch(err){
            tk.loadJSFile($("body"), "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
        }
    },
    addAd : function addAd(key, val){
        if(!this.adList[key]){
            this.adList[key] = val;
        }
    },
    getAd : function getAd(key){
        return this.adList[key] || "";
    }
});

tk.Composition(TK, {
        ad : (function(){
            var ad = new TK.AD();
            ad.addAd("300-250", "<!-- phone-footer --><ins class=\"adsbygoogle\" style=\"display:inline-block;width:300px;height:250px\" data-ad-client=\"ca-pub-2326969899478823\" data-ad-slot=\"8417451596\"></ins>");
            ad.addAd("728-90","<!-- footer --><ins class=\"adsbygoogle\" style=\"display:inline-block;width:728px;height:90px\" data-ad-client=\"ca-pub-2326969899478823\" data-ad-slot=\"5074793995\"></ins>");
            ad.addAd("320-50",'<ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="ca-pub-2326969899478823" data-ad-slot="2712008393"></ins>');
            return ad;
        })()
    }
);

tk.AddMethod(TK,{
    Comment : function Comment(){
        this.isHaveComment = true;
        this.disqus_shortname = 'tiankonguse-record';
        this.hash = location.hash;
        this.time = 5000;
    }
});

tk.Composition(TK.Comment, {
    init : function init(dom){
        this.dom = dom;
        if(!this.isHaveComment){
            return;
        }
        if(this.shouldLoad()){
            that.loadComment();
        }else{
            this.bindClick();
            this.laterLoad(this.time);
        }
        
    },
    laterLoad : function laterLoad(t){
        var that = this;
        setTimeout(function(){
            that.loadComment();
        }, t);
    },
    shouldLoad  : function shouldLoad(){
        return /\#comment/.test(this.hash );
    },
    bindClick : function bindClick(){
        var that = this;
        this.dom.on('click',function(){
            that.loadComment();
        });
    },
    loadComment : function loadComment(){
        var that = this.dom;
        that.html('加载中...');
        $.getScript('http://' + this.disqus_shortname + '.disqus.com/embed.js',function(){that.remove()});
    }
});

tk.Composition(TK, {
        comment : new TK.Comment()
    }
);


jQuery(document).ready(function(){
    //***********************
    // home follow
    var $homeContact = $('.home-contact');
    function addContactData(name, href, img){
        name = name || "";
        return '<a href="'+href+'" target="_blank"><img src="'+img+'" alt="'+name+'"/></a>';
    }
    var contactTpl = "";
    contactTpl += addContactData("新浪微博","http://weibo.com/tiankonguse/","http://www.weibo.com/favicon.ico");
    contactTpl += addContactData("豆瓣","http://www.douban.com/people/tiankonguse/","http://www.douban.com/favicon.ico");
    contactTpl += addContactData("github","https://github.com/tiankonguse/","https://github.com/apple-touch-icon-114.png");
    $homeContact.append(contactTpl);
    $(".home-follow").click(function(e){
        e.preventDefault();
        if($homeContact.is(':visible')){
            $homeContact.slideUp(100);
        }else{
            $homeContact.slideDown(100);
        }
    });
    //***********************
    
    tk.comment.init($('#disqus_container .comment'));

    //ad
    if(tk.isMobile.any()){
        tk.ad.showPageFoot("ad-page-footer", "300-250");
    }else{
        tk.ad.showPageFoot("ad-page-footer", "728-90");
    }
    
    tk.ad.loadGoogleJs();
});




