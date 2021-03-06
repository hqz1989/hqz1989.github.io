tk.Composition(Array, {
    eachdo : function eachdo(fn){
		for (var i = 0; i < this.length; i++) {
			fn.call(this[i], i);
		}
    },
    remDup : function remDup(){
		var temp = [];
		for (var i = 0; i < this.length; i++) {
			var bool = true;
			for (var j = i + 1; j < this.length; j++) {
				if (this[i] === this[j]) {
					bool = false;
                    break;
				}
			}
			if (bool === true) {
				temp.push(this[i]);
			}
		}
		return temp;
    }
});

tk.AddMethod(TK,{
    Tetris : function Tetris(){
        this.board = [];
        this.pSize = 40;
        this.canvasHeight = 880;
        this.canvasWidth = 400;
        this.next_shap_pad = 2;
        this.isMobile =  tk.isMobile.any();
        this.canvas = null;
        this.tetris = null;
        this.dom = null;
		this.boardHeight = 0;
		this.time = 0;
		this.score = 0;
		this.level = 1;
		this.lines = 0;
		this.numLevels = 10;
		this.curSqs = [];
		this.curComplete = false;
		this.tempShapes = null;
        this.nextShapeDisplay = null;
        this.levelDisplay = null;
        this.timeDisplay = null;
        this.scoreDisplay = null;
        this.linesDisplay = null;
        this.isOver = false;
        this.isActive = true;
        this.isDown = false;
        this.callback = null;
		this.shapes = [
            [[-1, 1], [0, 1], [1, 1], [0, 0]], // TEE
            [[-1, 0], [0, 0], [1, 0], [2, 0]], // line
            [[-1, -1], [-1, 0], [0, 0], [1, 0]], // L EL
            [[1, -1], [-1, 0], [0, 0], [1, 0]], // R EL
            [[0, -1], [1, -1], [-1, 0], [0, 0]], // R ess
            [[-1, -1], [0, -1], [0, 0], [1, 0]], // L ess
            [[0, -1], [1, -1], [0, 0], [1, 0]] // square
		];
        this.timer = null;
        this.pTimer = null;
        this.curX = 0;
		this.curY = 0;
        this.sqs = [];
        this.style = {};
        this.spawnX = 4;
		this.spawnY = 1;
        this.speed = 700;
        this.preClickTime = 0;
        this.preClickPos = null;
        this.doubleClickTime = 500;
    }
});

tk.Composition(TK.Tetris, {
    init : function init(option){
        tk.AddMethod(this, option);
        this.initBoard();
        this.initInfo();
        this.initLevelScores();
        this.initShapes();
        this.bindKeyEvents();
        this.play();
    },
    initBoard : function initBoard(){
        this.boardHeight = this.canvasHeight / this.pSize;
        this.boardWidth = this.canvasWidth / this.pSize;
        var s = this.boardHeight * this.boardWidth;
        for (var i = 0; i < s; i++) {
            this.board.push(0);
        }
    },
    initInfo : function initInfo(){
        var tpl = '';
        tpl +=('<div id="next_shape"></div>');
        tpl +=('<p id="level">Level: <span></span></p>');
        tpl +=('<p id="lines">Lines: <span></span></p>');
        tpl +=('<p id="score">Score: <span></span></p>');
        tpl +=('<p id="time">Time: <span></span></p>');
        
        if(this.isMobile){
            tpl +=('<p class="help">左滑:<span>左</span></p>');
            tpl +=('<p class="help">右滑:<span>右</span></p>');
            tpl +=('<p class="help">双击:<span>旋转</span></p>');
            tpl +=('<p class="help pause">上双击:<span>暂停</span></p>');
            tpl +=('<p class="help">下双击:<span>下</span></p>');
        }else{
            tpl +=('<p class="help">方向键控制游戏</p>');
            tpl +=('<p class="help"><div style="font-size: 15px;color: red;">1.这个游戏是tiankonguse开发的。<br>2.这个版本的效率比较低<br>3.优化策略已经有了<br>4.tiankonguse没有时间优化<br>5.你想优化时请联系我</div></p>');
        }
        tpl = '<div id="info">' + tpl + '</div>';
        tpl += '<div id="canvas"></div>';
        this.dom.html(tpl);
        
        for(var name in this.style){
            var styleDom = this.style[name];
            var $dom = $("#" + name);
            for(var key in styleDom){
                $dom.css(key, styleDom[key]);
            }
        }
        
        this.info = this.dom.find("#info");
        
        this.canvas = this.dom.find("#canvas");
        this.nextShapeDisplay = this.dom.find("#next_shape");
        this.levelDisplay = this.dom.find("#level span");
        this.timeDisplay = this.dom.find("#time span");
        this.scoreDisplay = this.dom.find("#score span");
        this.linesDisplay = this.dom.find("#lines span");
        
        this.setInfo('time');
        this.setInfo('score');
        this.setInfo('level');
        this.setInfo('lines');
    },
    setInfo : function(el) {
        this[el + 'Display'].html(this[el])
    },
    initLevelScores : function initLevelScores(){
        var c = 1;
        for (var i = 1; i <= this.numLevels; i++) {
            this['level' + i] = [c * 1000, 40 * i, 5 * i];
            c = c + c;
        }
    },
    initShapes : function initShapes() {
        this.curSqs = [];
        this.curComplete = false;
        this.shiftTempShapes();
        this.curShapeIndex = this.tempShapes[0];
        this.curShape = this.shapes[this.curShapeIndex];
        this.initNextShape();
        this.setCurCoords(this.spawnX, this.spawnY);
        this.drawShape(this.curX, this.curY, this.curShape);
    },
    shiftTempShapes : function shiftTempShapes(){
        try {
            if (typeof this.tempShapes === "undefined"
                    || this.tempShapes === null) {
                this.initTempShapes();
            } else {
                this.tempShapes.shift();
            }
        } catch (e) {
            throw new Error("Could not shift or init tempShapes: " + e);
        }
    },
    initTempShapes : function initTempShapes(){
        this.tempShapes = [];
        for (var i = 0; i < this.shapes.length; i++) {
            this.tempShapes.push(i);
        }
        var k = this.tempShapes.length;
        while (--k) { // Fisher Yates Shuffle
            var j = Math.floor(Math.random() * (k + 1));
            var tempk = this.tempShapes[k];
            var tempj = this.tempShapes[j];
            this.tempShapes[k] = tempj;
            this.tempShapes[j] = tempk;
        }
    },
    initNextShape : function() {
        if (typeof this.tempShapes[1] === 'undefined') {
            this.initTempShapes();
        }
        try {
            this.nextShapeIndex = this.tempShapes[1];
            this.nextShape = this.shapes[this.nextShapeIndex];
            this.drawNextShape();
        } catch (e) {
            throw new Error("Could not create next shape. " + e);
        }
    },
    drawNextShape : function() {
        var ns = [];
        for (var i = 0; i < this.nextShape.length; i++) {
            ns[i] = this.createSquare(this.nextShape[i][0] + this.next_shap_pad,
                    this.nextShape[i][1] + this.next_shap_pad, this.nextShapeIndex);
        }
        this.nextShapeDisplay.html("");
        for (var k = 0; k < ns.length; k++) {
            this.nextShapeDisplay.append(ns[k]);
        }
    },
    createSquare : function(x, y, type) {
        var el = document.createElement('div');
        el.className = 'square type' + type;
        el.style.left = (x * this.pSize) + 'px';
        el.style.top = (y * this.pSize) + 'px';
        el.style.width =  this.pSize + 'px';
        el.style.height = this.pSize + "px";
        return $(el);
    },
    setCurCoords : function(x, y) {
        this.curX = x;
        this.curY = y;
    },
    drawShape : function(x, y, p) {
        for (var i = 0; i < p.length; i++) {
            var newX = p[i][0] + x;
            var newY = p[i][1] + y;
            
            this.curSqs[i] = this.createSquare(newX, newY,
                    this.curShapeIndex);
        }
        for (var k = 0; k < this.curSqs.length; k++) {
            this.canvas.append(this.curSqs[k]);
        }
    },
    bindKeyEvents : function() {
        var that = this;
        var event = "keypress";
        if (this.isSafari() || this.isIE()) {
            event = "keydown";
        }
        
        if(this.isMobile){
            this.addMobileEvent("touchstart", function(event){
                event = event.originalEvent;
               if($(event.target).attr("id") == "tetris" || $(event.target).parents("#tetris").length){
                    
                }else{
                    return;
                }
                var touches = event.changedTouches || event.touches;
                var touch = touches[0]; 

                that.startX = touch.pageX;    
                that.startY = touch.pageY;
            });
            this.addMobileEvent("touchend", function(event){
                event = event.originalEvent;
               if($(event.target).attr("id") == "tetris" || $(event.target).parents("#tetris").length){
                    
                }else{
                    return;
                }
                event.preventDefault();
                var touches = event.changedTouches || event.touches;
                var touch = touches[0];
                var x = touch.pageX - that.startX;
                var y = touch.pageY - that.startY; 
                var absx = Math.abs(x);               
                var absy = Math.abs(y); 
                var twoStep = that.pSize * 5;

                if(x >= that.pSize && absy <= absx){//右
                    that.preClickTime = 0;  
                    if(absx > twoStep){
                        that.handleKey("RIGHT");
                    }
                    that.handleKey("RIGHT");
                }else if(x <= -that.pSize && absy <= absx){//左
                    that.preClickTime = 0;
                    if(absx > twoStep){
                        that.handleKey("LEFT");
                    }
                    that.handleKey("LEFT");
                }else if(absy <= that.pSize && absx <= that.pSize){
                    var time = tk.time();
                    if(time - that.preClickTime < that.doubleClickTime){
                        var dir = that.getMobileEvent([touch.pageX, touch.pageY], that.preClickPos);
                        that.preClickTime = 0;
                        that.handleKey(dir);
                    }else{
                        that.preClickTime = time;
                        that.preClickPos = [touch.pageX, touch.pageY];
                    }

                }else{
                    that.preClickTime = 0;
                }            
                
            });
        }else{
            this.addEvent(event, function(e) {
                var which = that.whichKey(e);
                var dir = that.getDir(which);
                that.handleKey(dir);
            });
        }
        
    },
    getMobileEvent : function getMobileEvent(newPos, oldPos){
        var x = newPos[0] - oldPos[0];
        var y = newPos[1] - oldPos[1]; 
        var absx = Math.abs(x);       
        var absy = Math.abs(y);
        var pSize2 = this.pSize*2;
        
        var dir = "";
        if(x >= this.pSize && absy <= absx){//右 
            dir = "RIGHT";
        }else if(x < -this.pSize && absy <= absx){//左
            dir = "LEFT";
        }else if(y > this.pSize && absy >= absx){
            dir = "DOWN";
        }else if(y < -this.pSize && absy >= absx){
            dir = "PAUSE";
        }else if(absy <= pSize2 && absx <= pSize2){
            dir = "ROTATE";
        }
        return dir;
    },
    whichKey : function(e) {
        var c;
        if (window.event) {
            c = window.event.keyCode;
        } else if (e) {
            c = e.keyCode;
        }
        return c;
    },
    addMobileEvent : function addMobileEvent(event, cb){
        this.dom.bind(event,cb);
    },
    addEvent : function(event, cb){
        if (window.addEventListener) {
            document.addEventListener(event, cb, false);
        } else {
            document.attachEvent('on' + event, cb);
        }
    },
    getDir : function getDir(which){
        var dir = '';
        switch (which) {
            case 37 :
                dir = "LEFT";
                break;
            case 38 :
                dir = "ROTATE";
                break;
            case 39 :
                dir = "RIGHT";
                break;
            case 40 :
                dir = "DOWN";
                break;
            case 27 : // esc: pause
                dir = "PAUSE";
                break;
            default :
                break;
        }
        return dir;
    },
    handleKey : function(dir) {
        if(this.isOver)return;
        switch (dir) {
            case "LEFT" :
                this.move('L');
                break;
            case "ROTATE" :
                this.move('RT');
                break;
            case "RIGHT" :
                this.move('R');
                break;
            case "DOWN" :
                this.isDown = true;
                //this.move('D');
                break;
            case "PAUSE" : // esc: pause
                this.togglePause();
                break;
            default :
                break;
        }
    },
    togglePause : function() {
        this.isDown = false;
        
        if (this.isActive) {
            this.clearTimers();
            this.isActive = false;
            this.info.find(".pause span").html("继续");
        } else {
            this.info.find(".pause span").html("暂停");
            this.play();
        }
    },
    move : function(dir) {
        if (!this.isActive) {
            return;
        }
        
        var s = '';
        var that = this;
        var tempX = this.curX;
        var tempY = this.curY;
        switch (dir) {
            case 'L' :
                s = 'left';
                tempX -= 1;
                break;
            case 'R' :
                s = 'left';
                tempX += 1;
                break;
            case 'D' :
                s = 'top';
                tempY += 1;
                break;
            case 'RT' :
                this.rotate();
                return true;
                break;
            default :
                throw new Error('wtf');
                break;
        }
        
        if (this.checkMove(tempX, tempY, this.curShape)) {
            this.curSqs.eachdo(function(i) {
                var l = parseInt($(this).css(s), 10);
                if(dir === 'L'){
                    l -= that.pSize;
                }else{
                    l += that.pSize;
                }
                $(this).css(s, l + 'px');
            });
            this.curX = tempX;
            this.curY = tempY;
        } else if (dir === 'D') {
            if (this.curY === 1 || this.time === this.maxTime) {
                this.gameOver();
                return false;
            }
            this.isDown = false;
            this.curComplete = true;
        }
    },
    checkMove : function(x, y, p) {
        if (this.isOB(x, y, p) || this.isCollision(x, y, p)) {
            return false;
        }
        return true;
    },
    isCollision : function(x, y, p) {
        var that = this;
        var bool = false;
        p.eachdo(function() {
            var newX = this[0] + x;
            var newY = this[1] + y;
            if (that.boardPos(newX, newY) === 1) {
                bool = true;
            }
        });
        return bool;
    },
    isOB : function(x, y, p) {
        var w = this.boardWidth - 1;
        var h = this.boardHeight - 1;
        var bool = false;
        p.eachdo(function() {
            var newX = this[0] + x;
            var newY = this[1] + y;
            if (newX < 0 || newX > w || newY < 0 || newY > h) {
                bool = true;
            }
        });
        return bool;
    },
    boardPos : function(x, y) {
        return this.board[x + (y * this.boardWidth)];
    },
    gameOver : function() {
        this.clearTimers();
        if(!this.isOver){
            this.isOver = 1;
            this.callback && this.callback(this.score); 
        }
        
    },
    clearTimers : function() {
        clearTimeout(this.timer);
        clearTimeout(this.pTimer);
        this.timer = null;
        this.pTimer = null;
    },
    isIE : function() {
        return this.bTest(/IE/);
    },
    isFirefox : function() {
        return this.bTest(/Firefox/);
    },
    isSafari : function isSafari() {
        return this.bTest(/Safari/);
    },
    bTest : function bTest(rgx) {
        return rgx.test(navigator.userAgent);
    },
    play : function play() {
        var that = this;
        
        if (this.timer === null) {
            this.initTimer();
        }
        var gameLoop = function() {
            
            that.move('D');
            if (that.curComplete) {
                that.markBoardShape(that.curX, that.curY, that.curShape);
                that.curSqs.eachdo(function() {
                    that.sqs.push(this);
                });
                that.calcScore({
                    shape : true
                });
                that.checkRows();
                that.checkScore();
                that.initShapes();
                that.play();
            } else {
                that.pTimer = setTimeout(gameLoop, that.speed * that.getBase());
            }
        };
        this.pTimer = setTimeout(gameLoop, that.speed * that.getBase());
        this.isActive = true;
    },
    getBase : function getBase(){
        if(this.isDown){
            return 0.3;
        }else{
            return 1;
        }
    },
    initTimer : function initTimer() {
        var that = this;
        var tLoop = function() {
            that.incTime();
            that.timer = setTimeout(tLoop, 2000);
        };
        this.timer = setTimeout(tLoop, 2000);
    },
    incTime : function() {
        this.time++;
        this.setInfo('time');
    },
    markBoardShape : function markBoardShape(x, y, p) {
        var that = this;
        p.eachdo(function(i) {
            var newX = p[i][0] + x;
            var newY = p[i][1] + y;
            that.markBoardAt(newX, newY, 1);
        });
    },
    markBoardAt : function markBoardAt(x, y, val) {
        this.board[this.getBoardIdx(x, y)] = val;
    },
    getBoardIdx : function(x, y) {
        return x + (y * this.boardWidth);
    },
    calcScore : function calcScore(args) {
        var lines = args.lines || 0;
        var shape = args.shape || false;
        var speed = args.speed || 0;
        var score = 0;

        if (lines > 0) {
            score += lines * this["level" + this.level][1];
            this.incLines(lines);
        }
        if (shape === true) {
            score += shape * this["level" + this.level][2];
        }
        this.incScore(score);
    },
    incLines : function incLines(num) {
        this.lines += num;
        this.setInfo('lines');
    },
    incScore : function incScore(amount) {
        this.score += amount;
        this.setInfo('score');
    },
    checkRows : function checkRows() {
        var that = this;
        var start = this.boardHeight;
        this.curShape.eachdo(function() {
            var n = this[1] + that.curY;
            if (n < start) {
                start = n;
            }
        });

        var c = 0;
        var stopCheck = false;
        for (var y = this.boardHeight - 1; y >= 0; y--) {
            switch (this.getRowState(y)) {
                case 'F' :
                    this.removeRow(y);
                    c++;
                    break;
                case 'E' :
                    if (c === 0) {
                        stopCheck = true;
                    }
                    break;
                case 'U' :
                    if (c > 0) {
                        this.shiftRow(y, c);
                    }
                    break;
                default :
                    break;
            }
            if (stopCheck === true) {
                break;
            }
        }
        if (c > 0) {
            this.calcScore({
                lines : c
            });
        }
    },
    removeRow : function removeRow(y) {
        for (var x = 0; x < this.boardWidth; x++) {
            this.removeBlock(x, y);
        }
    },
    removeBlock : function removeBlock(x, y) {
        var that = this;
        this.markBoardAt(x, y, 0);
        this.sqs.eachdo(function(i) {
            if (that.getPos(this)[0] === x && that.getPos(this)[1] === y) {
                this.remove();
                that.sqs.splice(i, 1);
            }
        });
    },
    getPos : function getPos(block) {
        var p = [];
        p.push(parseInt(block.css("left"), 10) / this.pSize);
        p.push(parseInt(block.css("top"), 10) / this.pSize);
        return p;
    },
    shiftRow : function shiftRow(y, amount) {
        var that = this;
        for (var x = 0; x < this.boardWidth; x++) {
            this.sqs.eachdo(function() {
                if (that.isAt(x, y, this)) {
                    that.setBlock(x, y + amount, this);
                }
            });
        }
        that.emptyBoardRow(y);
    },
    isAt : function isAt(x, y, block) {
        if (this.getPos(block)[0] === x && this.getPos(block)[1] === y) {
            return true;
        }
        return false;
    },
    setBlock : function setBlock(x, y, block) {
        this.markBoardAt(x, y, 1);
        var newX = x * this.pSize;
        var newY = y * this.pSize;
        block.css("left", newX + 'px');
        block.css("top", newY + 'px');
    },
    emptyBoardRow : function emptyBoardRow(y) {
        for (var x = 0; x < this.boardWidth; x++) {
            this.markBoardAt(x, y, 0);
        }
    },
    checkScore : function checkScore() {
        if (this.score >= this["level" + this.level][0]) {
            this.incLevel();
        }
    },
    incLevel : function incLevel() {
        this.level++;
        this.speed = this.speed - 75;
        this.setInfo('level');
    },
    getRowState : function getRowState(y) {
        var c = 0;
        for (var x = 0; x < this.boardWidth; x++) {
            if (this.boardPos(x, y) === 1) {
                c = c + 1;
            }
        }
        if (c === 0) {
            return 'E';
        }
        if (c === this.boardWidth) {
            return 'F';
        }
        return 'U';
    },
    rotate : function rotate() {
        if (this.curShapeIndex !== 6) { // square
            var temp = [];
            this.curShape.eachdo(function() {
                temp.push([this[1] * -1, this[0]]);
            });
            if (this.checkMove(this.curX, this.curY, temp)) {
                this.curShape = temp;
                this.removeCur();
                this.drawShape(this.curX, this.curY, this.curShape);
            } else {
            }
        }
    },
    removeCur : function removeCur() {
        var that = this;
        this.curSqs.eachdo(function() {
            this.remove();
        });
        this.curSqs = [];
    }
});


(function() {
    var tetris = new TK.Tetris();
    var cw,ch, oneSize, pad = 1, canvasWidth, canvasHeight,w,h, one;
    
    w =  tk.min($(window).width(), screen.width, screen.availWidth);
    h =  tk.min($(window).height(), screen.height, screen.availHeight);
    var tetrisPad = 0;
    var menuHeight = 38;
    var menuPad = 15;
    var adHeight = 50;
    var boadWidth = 2;
    h -= boadWidth;
    
    //fix QQ bug
    if(tk.isMobile.QQ()){
        h -= 2;
        $("#tetris").css("border", "0px");
    }
    
    var widthNum = 10;
    
    if(tk.isMobile.any()){
        h -= menuHeight;
        tetrisPad += menuHeight;
        h -= adHeight;
        
        if(w > 754){
            h -= menuPad;
            tetrisPad += menuPad;
            
            $(".right-ad,.left-ad").hide();
            w -= 500;
            h -= 150;
            widthNum = 15;
        }
        oneSize = parseInt(w * 0.7 / widthNum);
        cw = oneSize * widthNum;
        ch = oneSize * parseInt(h/oneSize);
        //tetrisPad += (h - ch);
        $("#tetris").css("width", w+"px");
        
        $("#tetris").css("padding-top", tetrisPad+"px");
    }else{
        if(w < 1400){
            w -= 700;
            h -= 150;
            oneSize = parseInt(w * 0.7 / widthNum);
            cw = oneSize * widthNum;
            ch = oneSize * parseInt(h/oneSize);
            
            $("#tetris").css("height", h+"px");
            $("#tetris").css("width", w+"px");
        }else{
            pad = 2;
            ch = 800;
            cw = 400;
            oneSize = 40;
            w = 700;
        }
    }
    
    setTimeout(function(){
        tetris.init({
            canvasHeight : ch,
            canvasWidth : cw,
            pSize : oneSize,
            next_shap_pad : pad,
            dom : $("#tetris"),
            style : {
                "canvas" :{
                    "width" : cw + "px",
                    "height" : ch + "px"
                },
                "info" :{
                    "width" : (w-cw) + "px",
                    "height" : ch + "px"
                },
                "next_shape" : {
                    "padding-bottom" : (oneSize * 3 + 10) + "px"
                }
            },
            callback : function(score){
                showMessage(score, function(){
                    location.href = location.href;
                });
            }
        });
    }, 1000);
    

})();
