jQuery(document).ready(function(){
    var $ = jQuery;
    
    if(tk.isMobile.any()){
        tk.ad.showPageFoot("ad-content-footer","300-250" ,true);
    }else{
         tk.ad.showPageFoot("ad-content-footer","728-90" ,true);
    }
    
    $('pre').addClass('prettyprint linenums'); //添加Google code Hight需要的class


    $('.entry a').each(function(index,element){
        var href = $(this).attr('href');
        if(href){
            if(href.indexOf('#') == 0){
            }else if ( href.indexOf('/') == 0 || href.toLowerCase().indexOf('tiankonguse.com')>-1 ){
                $(this).attr('target','_blank');
            }else if ($(element).has('img').length){
            }else{
                $(this).attr('target','_blank');
                $(this).addClass('external');
            }
        }
    });

    (function(){
        var ie6 = ($.browser && $.browser.msie && $.browser.version=="6.0") ? true : false;
        var contentMap = {};
        var $menuIndex = $('#menuIndex');
        
        function initHeading(){
            var h2 = [];
            var h3 = [];
            var h2index = 0;

            $.each($('.entry h2, .entry h3'),function(index,item){
                if(item.tagName.toLowerCase() == 'h2'){
                    var h2item = {};
                    h2item.name = $(item).text();
                    h2item.id = 'menuIndex'+index;
                    contentMap["#content-h2-" + h2item.name] = h2item.id;
                    h2.push(h2item);
                    h2index++;
                }else{
                    var h3item = {};
                    h3item.name = $(item).text();
                    h3item.id = 'menuIndex'+index;
                    contentMap["#content-h3-" + h3item.name] = h3item.id;
                    if(!h3[h2index-1]){
                        h3[h2index-1] = [];
                    }
                    h3[h2index-1].push(h3item);
                }
                item.id = 'menuIndex' + index;
            });

            return {h2:h2,h3:h3}
        }

        function genTmpl(){
            var h1txt = $('h1').text();
            var tmpl = '<ul><li class="h1"><a href="#content-h1-' + h1txt + '">' + h1txt + '</a></li>';

            var heading = initHeading();
            var h2 = heading.h2;
            var h3 = heading.h3;

            for(var i=0;i<h2.length;i++){
                tmpl += '<li><a href="#content-h2-' + h2[i].name + '" data-id="'+h2[i].id+'">'+h2[i].name+'</a></li>';

                if(h3[i]){
                    for(var j=0;j<h3[i].length;j++){
                        tmpl += '<li class="h3"><a href="#content-h3-' + h3[i][j].name + '" data-id="'+h3[i][j].id+'">'+h3[i][j].name+'</a></li>';
                    }
                }
            }
            tmpl += '</ul>';

            return tmpl;
        }

        function gotoSelectorPos(id){
            var selector = id ? '#' + id : 'h1'
            var scrollNum = $(selector).offset().top;
            $('body, html').animate({ scrollTop: scrollNum-30 }, 400, 'swing');
        }

        function genIndex(){
            var tmpl = genTmpl();
            //var indexCon = '<div id="menuIndex" class="sidenav"></div>';
            //$('#content').append(indexCon);
            var $next = $("#menuIndex-next");
            $menuIndex = $('#menuIndex');
            $menuIndex.append($(tmpl));
                
            $menuIndex.delegate('a','click',function(e){
                    e.preventDefault();
                    gotoSelectorPos($(this).attr('data-id'));
                });
            $menuIndex.append($next.children());
            $next.remove();
        }

        var waitForFinalEvent = (function () {
            var timers = {};
            return function (callback, ms, uniqueId) {
                if (!uniqueId) {
                    uniqueId = "Don't call this twice without a uniqueId";
                }
                if (timers[uniqueId]) {
                    clearTimeout (timers[uniqueId]);
                }
                timers[uniqueId] = setTimeout(callback, ms);
            };
        })();

        if($('.entry h2').length > 0 &&  !ie6){

            genIndex();

             var scrollTop = [];
             var scrollLiTop = [];
             var scrollLiOffset= [];
             var menuIndexTop = $menuIndex.offset().top;
            $.each($('#menuIndex li a'),function(index,item){
                var id = $(item).attr('data-id');
                var selector = id ? '#'+id : 'h1'
                var top = $(selector).offset().top;
                scrollTop.push(top);
                var liOffset = $(item).parent().offset();
                scrollLiOffset.push(liOffset);
                scrollLiTop.push(liOffset.top - menuIndexTop);
            });
            
            if(!tk.isMobile.any()){
                
                var menuIndexLeft = $menuIndex.offset().left;
                var winHeight =  tk.min($(window).height(), screen.height);
                var indexHeight = $menuIndex.height();
                var menuIndexBottom = menuIndexTop + indexHeight;
                var length = scrollTop.length;
                
                function getNowTop(index, nowTop){
                    var bottomHeight = indexHeight - scrollLiTop[index] + 260;
                    if(bottomHeight < winHeight){
                        return nowTop - (indexHeight - scrollLiTop[index]);
                    }
                    
                    var top = scrollTop[index] - scrollLiTop[index];
                    
                    if(top - 10 < nowTop){
                        top = nowTop;
                    }
                    
                    return top;

                }
                
                $(window).scroll(function(){
                    waitForFinalEvent(function(){
                        var nowTop = $(window).scrollTop();
                        var index;
                        
                        if(nowTop+60 > scrollTop[length-1]){
                            index = length;
                        }else{
                            for(var i=0;i<length;i++){
                                if(nowTop+60 <= scrollTop[i]){
                                    index = i;
                                    break;
                                }
                            }
                        }
                        $('#menuIndex li').removeClass('on');
                        $('#menuIndex li').eq(index).addClass('on');
                        
                        
                        if(nowTop+20 > menuIndexTop){
                            if(winHeight >= indexHeight){
                                $menuIndex.css({
                                    position:'fixed'
                                    ,top:'20px'
                                    ,left:menuIndexLeft,
                                    bottom :"auto"
                                });
                            }else{
                                var top = getNowTop(index, nowTop);
                                $menuIndex.css({
                                    position:'absolute',
                                    top: top + 'px',
                                    left:menuIndexLeft
                                });
                            
                            }
  
                        }else{
                            $menuIndex.css({
                                position:'static'
                                ,top:0
                                ,left:0,
                                bottom : "auto"
                            });
                        }
    

                    });
                });
    
                $(window).resize(function(){
                    $menuIndex.css({
                        position:'static'
                        ,top:0
                        ,left:0,
                        bottom : "auto"
                    });
    
                    menuIndexTop = $menuIndex.offset().top;
                    menuIndexLeft = $menuIndex.offset().left;
    
                    $(window).trigger('scroll')
                });
            }


            
            if(/\#content-h/.test(location.hash)){
                gotoSelectorPos(contentMap[location.hash]);
            }

        }else{
            var $next = $("#menuIndex-next");
            $menuIndex.append($next.children());
            $next.remove();
        }
    })();

    $.getScript('/javascripts/prettify/prettify.js',function(){
        prettyPrint();
    });


    if(/css3-animation/.test(location.href)){
        $("head").append("<link rel='stylesheet' type='text/css' href='/stylesheets/css3-ani.css'/>");
        $.getScript('/javascripts/css3-ani.js',function(){});
    }
    
    $("table").addClass("table table-bordered table-hover table-striped table-condensed");

    
});
