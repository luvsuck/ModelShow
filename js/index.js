let setIdThenDo;

function makeSth(v) {
    setIdThenDo(v);
}

$(function () {
    let img;
    let cvs;
    let jqBaseMap;
    let context;
    let ratio;
    let curWidgetPool = [];
    let isDrawingLine = false;
    let clickCount = 0;
    let arrowHeadPointArr = [];
    let isDragging = false;
    let deletedElement;
    let page;
    let timer = null;
    let currentImgUrl = "./source/1_1_11.png";
    initBaseMap(currentImgUrl);
    console.log('topbar', window.outerHeight, window.innerHeight)
    console.log(document.documentElement.clientWidth, screen.width, screen.availWidth, window.innerWidth)
    console.log(document.documentElement.clientHeight, screen.height, screen.availHeight, window.innerHeight)
    $(window).resize(function (e) {
        //1.自适应调整底图
        initBaseMap(currentImgUrl);
        //自适应调整控件的left top
        redrawWidget();
        //自适应调整控件的宽高
        // console.log(document.documentElement.clientWidth, screen.width, screen.availWidth, window.innerWidth)
        // console.log('resize', e)
    });

    initBtnStyle();

    function initBaseMap(imgSrc) {
        img = new Image();
        img.src = imgSrc;
        cvs = document.getElementById("basemap");
        jqBaseMap = $('#basemap');
        if (parent.document.documentElement.clientWidth !== document.documentElement.clientWidth) {
            cvs.width = parent.document.documentElement.clientWidth;
            cvs.height = parent.document.documentElement.clientHeight;
        } else {
            cvs.width = document.documentElement.clientWidth;
            cvs.height = document.documentElement.clientHeight;
        }
        context = cvs.getContext("2d")
        ratio = getPixelRatio(context);
        //加载底图
        img.onload = () => {
            // console.log(img.width, img.height, document.documentElement.clientWidth, document.documentElement.clientHeight);
            context.fillStyle = context.createPattern(img, 'no-repeat')
            context.drawImage(img, 0, 0, document.documentElement.clientWidth * ratio, document.documentElement.clientHeight * ratio)
            if (!curWidgetPool || !curWidgetPool.length) {
                getData(0, 1);
                setTimerTask();
            }
        }
        jqBaseMap.on('click', e => {
            console.log('jqbm', e.offsetX, e.offsetY, e.clientX, e.clientY);
        })
        // cvs.onclick = (e) => {};
    }

    $('.hideTopChain').on('click', e => {
        if (!currentImgUrl)
            return;
        if (currentImgUrl.indexOf("1_1_11") >= 0) {
            $('.hideTopChain').html('&#xe622;')
            currentImgUrl = "./source/2_2_22.png";
        } else {
            $('.hideTopChain').html('&#xe641;')
            currentImgUrl = "./source/1_1_11.png";
        }
        initBaseMap(currentImgUrl);
        return false;
    });

    $('.clearInterval').on('click', e => {
        setTimerTask();
    });

    function setTimerTask() {
        if (!timer) {
            timer = window.setInterval(function () {
                redrawWidget();
            }, 5000);
        } else {
            window.clearInterval(timer)
            timer = null;
        }


    }

    $('.updateInfoBtn').on('click', e => {
        redrawWidget();
        return false;
    })

    function redrawWidget() {
        //获取到控件
        getData(0, 1);
        // let alarms = curWidgetPool.filter(o => o.type === 1 && (o.id).indexOf("转台") >= 0);
        curWidgetPool.forEach(o => {
            $('#' + o.id).remove();
            genWidgetByType(o);
        })
        bindEvent();
    }

    function bindEvent() {
        let widget = $('.widget');
        let count = 0;
        let timeoutID = null;
        widget.on("mousedown", function () {
            count++;
        });
        widget.on("mouseup", function () {
            count++;
        });
        widget.on("click", function (e) {
            clearTimeout(timeoutID);
            timeoutID = window.setTimeout(function (e2) {
                count++;
                let ele = e.target || e.currentTarget;
                let wgtId = ele.id;
                let w = curWidgetPool.filter(o => o.id === wgtId)[0];
                let content = w.content;
                page = layer.open({
                    title: false,
                    closeBtn: 1,
                    type: 2,
                    anim: parseInt(Math.random() * (7), 10),
                    area: ['893px', '600px'],
                    // content:'../Index.html',
                    content: "http://10.5.3.6:800/JKY_Screen/Screen/test",
                    resize: false, fixed: false
                });
                // console.log(wgtId, content);
            }, 500);
        });
        widget.on("dblclick", e => {
            count++;
            clearTimeout(timeoutID);
            let ele = e.target || e.currentTarget;
            let wgtId = ele.id;
            let w = curWidgetPool.filter(o => o.id === wgtId)[0];
            // console.log(wgtId, w.content);
            if (w.id.indexOf('调速台') >= 0) {
                initVideo('./source/video/1.mp4');
            } else if (w.id.indexOf('转台') >= 0) {
                initVideo('./source/video/4.mp4');
            } else if (w.id.indexOf('试验台') >= 0) {
                initVideo('./source/video/3.mp4');
            } else if (w.id.indexOf('工位') >= 0) {
                initVideo('./source/video/2.mp4');
            }

        });

    }

    function genWidgetByType(o) {
        let dom = $('#' + o.id);
        if (dom && dom.length > 0) {
            return false;
        }
        if (o.type === 0) {
            let w = 130, h = 80, c = 20;
            w = 65, h = 40, c = 10
            w = 80, h = 50, c = 12;
            w = 92, h = 66, c = 14
            addWidgetType2(o, w, h, c);
            // addWidget(o)
        } else if (o.type === 1) {
            let p1 = 6;//顶部三条线等分距离
            let p2 = 7;//线长度
            let p3 = 8;//顶部线点到点距离
            let p4 = 10;//长方形1高度
            let p5 = 6;//长方形1和2起始点间隔宽度
            let p6 = 3;//长方形2高度
            addAlert(o, p1, p2, p3, p4, p5, p6);
        } else if (o.type === 2) {
            // genArrowHeadFromData(o);
        }
    }

    function getData(isLocal, remoteFlag) {
        let url = 'http://10.5.13.112:2078/api';
        let dataType = 'json';
        if (!isLocal) {
            url = 'http://10.5.3.6:800/WebService/Jky_Interface.asmx/GetAssemble?flag=1;'
            if (!remoteFlag) {
                url = 'http://localhost:2078/napi/GetAssemble?flag=1';
            }
            dataType = 'TEXT';
        }

        $.ajax({
            type: 'get'
            , url: url
            , dataType: dataType
            , success: function (res) {
                let wgd = res;
                if (dataType === 'TEXT') {
                    //[object XMLDocument]
                    let reg = /\[(.+?)\]/g;
                    wgd = JSON.parse(res.match(reg)[0]);
                }
                curWidgetPool = [];
                wgd.forEach(o => {
                    let widget = {};
                    widget.tid = o.tid;
                    widget.id = o.id;
                    widget.x = o.x;
                    widget.y = o.y;
                    widget.defaultX = o.x;
                    widget.defaultY = o.y;
                    widget.type = o.type;
                    widget.colorIdx = o.colorIdx;
                    if (o.coloridx !== undefined) {
                        widget.colorIdx = o.coloridx;
                    }
                    widget.content = o.content;
                    curWidgetPool.push(widget);
                    genWidgetByType(widget);
                })
                console.log('组件数组:', curWidgetPool)
                bindEvent();
            }
        });
    }

    $('.saveInfoBtn').on('click', e => {
        save();
    })

    $('.moveWidgetBtn').on('click', e => {
        isDragging = true;

        let chosenWgt = $('.widget');

        chosenWgt.removeClass('toTheBottom');
        chosenWgt.addClass('toTheTop');

        chosenWgt.on('mouseover', e => {
            let ele = e.target || e.currentTarget;
            let wgtId = ele.id;
            $('#' + wgtId).addClass('lineBorder');
        });
        chosenWgt.on('mouseout', e => {
            let ele = e.target || e.currentTarget;
            let wgtId = ele.id;
            $('#' + wgtId).removeClass('lineBorder');
        });

        chosenWgt.draggable({
            draggable: false,
            containment: ".bgContainer",
            drag: function (e, ui) {
                let ele = e.target || e.currentTarget;
                let wgtId = ele.id;
                let wo = $('#' + wgtId);

                if (ui.offset.top < 0) {
                    // console.log('顶部距离超出');
                    return false;
                }
                if (ui.offset.left < 0) {
                    // console.log('左侧距离超出');
                    return false;
                }
                if ((ui.offset.left + parseInt(wo.attr('width')) / ratio >= document.documentElement.clientWidth)) {
                    // console.log(wgtId + ' 拖动中w', ui.offset.left, wo.attr('width'), document.documentElement.clientWidth, '右侧距离超出');
                    return false;
                }
                if ((ui.offset.top + parseInt(wo.attr('height')) / ratio >= document.documentElement.clientHeight)) {
                    // console.log(wgtId + ' 拖动中h', ui.offset.top, wo.attr('height'), document.documentElement.clientHeight, '底部距离超出');
                    return false;
                }
            },
            stop: function (e, ui) {
                let ele = e.target || e.currentTarget;
                let wgtId = ele.id;
                let ow = $('#' + wgtId);
                curWidgetPool.forEach(o => {
                    if (o.id === wgtId) {
                        // console.log('(' + ui.position.left + '/' + document.documentElement.clientWidth + ')*100', '(' + ui.position.top + '/' + document.documentElement.clientHeight + ')*100');
                        let leftPercent = ((ui.position.left / document.documentElement.clientWidth)).toFixed(4) * 10000;
                        let topPercent = ((ui.position.top / document.documentElement.clientHeight)).toFixed(4) * 10000;
                        o.x = leftPercent;
                        o.y = topPercent;
                        //解法
                        // console.log(Math.round(document.documentElement.clientWidth * (leftPercent / 10000)), Math.round(document.documentElement.clientHeight * (topPercent / 10000)))
                        // console.log('[' + leftPercent + ',' + topPercent + '] , ' + '[' + ui.position.left + ' , ' + ui.position.top + ']')
                        // console.log('拖动结束', ui.position.left, ui.position.top, document.documentElement.clientWidth, document.documentElement.clientHeight)
                    }
                });
                // console.log('拖动结束pool', curWidgetPool);
            }
        });

        chosenWgt.off('click');
        chosenWgt.on('click', e => {
            let ele = e.target || e.currentTarget;
            let wgtId = ele.id;
            curWidgetPool.forEach(o => {
                if (o.id === wgtId) {
                    o.test = '测试纸';
                    // console.log(o);
                }
            });

            $(document).off('keydown');
            //todo-zyy 监听鼠标按下

            $(document).on('keydown', e => {
                // console.log(e.key, e.ctrlKey)
                if (e.key === 'Delete') {
                    $('#' + wgtId).remove()
                    let findIdx;
                    for (let i = 0; i < curWidgetPool.length; i++) {
                        if (curWidgetPool[i].id === wgtId) {
                            deletedElement = curWidgetPool[i];
                            curWidgetPool[i] = {};
                            findIdx = i;
                            break;
                        }
                    }
                    if (findIdx) {
                        curWidgetPool.splice(findIdx, 1);
                        // console.log('删除后', curWidgetPool)
                    }
                }
                // console.log(deletedElement);
                if (e.ctrlKey && e.key === 'z') {
                    if (deletedElement) {
                        curWidgetPool.push(deletedElement)
                        if (deletedElement.type === 0) {
                            let w = 130, h = 80, c = 20;
                            w = 65, h = 40, c = 10
                            w = 80, h = 50, c = 12;
                            w = 92, h = 66, c = 14
                            addWidgetType2(deletedElement, w, h, c);
                            //addWidget(deletedElement);
                        } else {
                            let p1 = 6;//顶部三条线等分距离
                            let p2 = 7;//线长度
                            let p3 = 8;//顶部线点到点距离
                            let p4 = 10;//长方形1高度
                            let p5 = 6;//长方形1和2起始点间隔宽度
                            let p6 = 3;//长方形2高度
                            addAlert(deletedElement, p1, p2, p3, p4, p5, p6);
                        }
                    }
                    // console.log('撤销后', curWidgetPool)
                }
            });
            // console.log(JSON.stringify(curWidgetPool))

            console.log('当前点击' + wgtId, curWidgetPool.filter(cwp => cwp.id === wgtId)[0]);
            // console.log(wgtId, '点击位置:', e.offsetX, e.offsetY);
            e.stopPropagation();
            return false;
        });
    });

    setIdThenDo = function startDrawLine(arrowHeadId) {
        if (page) {
            layer.close(page);
        }
        if (!arrowHeadId) {
            return false;
        }
        let cId = arrowHeadId;
        jqBaseMap.after('<canvas class="arrowhead" id="' + cId + '"></canvas>');

        let nCvs = document.getElementById(cId);
        console.log('cid', cId)
        console.log('dom', nCvs)
        nCvs.width = document.documentElement.clientWidth;
        nCvs.height = document.documentElement.clientHeight;

        let nCxt = nCvs.getContext("2d");

        //将canvas放到这baseMap上面
        let wgt = $('#' + cId);
        wgt.css('position', 'absolute');
        wgt.css('top', jqBaseMap.offset().top);
        wgt.css('left', jqBaseMap.offset().left);

        isDrawingLine = true;

        $('.widget').addClass('toTheBottom');
        $('.widget').removeClass('toTheTop');

        nCvs.onclick = e => {
            let ele = e.target || e.currentTarget;
            let wgtId = ele.id;
            if (isDrawingLine) {
                let p = {};
                clickCount++;
                p.x = e.offsetX
                p.y = e.offsetY
                arrowHeadPointArr.push(p);
                if (arrowHeadPointArr.length >= 3) {
                    genArrowHead(cId, nCvs, nCxt, wgt, '#0f0');
                    return false;
                }
            }
            // console.log('cvsWgt', e.clientX, e.clientY, e.offsetX, e.offsetY, wgtId);
        }
    }

    $('.drawingLineBtn').on('click', e => {
        page = layer.open({
            title: false,
            closeBtn: 0,
            type: 2,
            anim: parseInt(Math.random() * (7), 10),
            area: ['170px', '50px'],
            content: "./page/setId.html",
            resize: false, fixed: false
        });
    });

    function getMinimumXANdY(pArr) {
        let xArr = [];
        let yArr = [];
        pArr.forEach(o => {
            xArr.push(o.x);
        })

        pArr.forEach(o => {
            yArr.push(o.y);
        })

        // console.log(xArr, yArr)

        let nx = xArr.sort((a, b) => {
            return a - b;
        })

        let ny = yArr.sort((a, b) => {
            return a - b;
        })

        let info = {};
        info.width = nx[nx.length - 1] - nx[0];
        info.height = ny[ny.length - 1] - ny[0];
        info.mx = nx[0];
        info.my = ny[0];
        return info;

    }

    function genArrowHeadFromData(widget) {
        jqBaseMap.after('<canvas class="widget arrowhead" id="' + widget.id + '"></canvas>');
        let nCvs = document.getElementById(widget.id);
        let pointArr = JSON.parse(widget.content);
        let info = getMinimumXANdY(pointArr);
        nCvs.width = info.width
        nCvs.height = info.height
        let wgtDom = $('#' + widget.id);
        wgtDom.css('top', widget.y);
        wgtDom.css('left', widget.x)
        wgtDom.css('position', 'absolute');

        let nCxt = nCvs.getContext("2d");
        let colorIdx = widget.colorIdx;
        switch (colorIdx) {
            //红1 绿2 蓝3 黄4 灰5
            case 1:
                nCxt.strokeStyle = '#f00';
                break;
            case 2:
                nCxt.strokeStyle = '#0f0';
                break;
            case 3:
                nCxt.strokeStyle = 'rgb(16, 131, 218)';
                break;
            case 4:
                nCxt.strokeStyle = '#ff0';
                break;
            case 5:
                nCxt.strokeStyle = 'rgb(119,119,119)';
                break;

        }
        nCxt.lineWidth = 2;
        nCxt.lineCap = 'round';
        //TODO 设置虚线样式
        nCxt.lineJoin = 'round';
        nCxt.setLineDash([15, 10]);
        nCxt.lineDashOffset = 0.0;
        nCxt.closePath();
        for (let i = 0; i < pointArr.length; i++) {
            switch (i) {
                case 0:
                    nCxt.beginPath();
                    nCxt.moveTo(pointArr[i].x, pointArr[i].y);
                    break;
                case 1:
                    nCxt.lineTo(pointArr[i].x, pointArr[i].y);
                    nCxt.moveTo(pointArr[i].x, pointArr[i].y);
                    nCxt.closePath();
                    nCxt.stroke();
                    break;
                case 2:
                    nCxt.lineTo(pointArr[i].x, pointArr[i].y);
                    nCxt.moveTo(pointArr[i].x, pointArr[i].y);
                    nCxt.closePath();
                    nCxt.stroke();
                    break;
            }
        }

        if (curWidgetPool && curWidgetPool.length) {
            let w = curWidgetPool.filter(o => o.id === widget.id);
            if (!w || !w.length)
                curWidgetPool.push(widget);
        } else {
            curWidgetPool.push(widget);
        }
    }

    function genArrowHead(cId, nCvs, nCxt, wgt, colorStr) {
        //根据坐标点计算宽高
        let info = getMinimumXANdY(arrowHeadPointArr);
        // console.log(info, jqBaseMap.offset().top, jqBaseMap.offset().left)
        let widthScale = nCvs.width / info.width;
        let heightScale = nCvs.height / info.height;

        nCvs.width = info.width
        nCvs.height = info.height
        arrowHeadPointArr.map(o => {
            o.x = o.x - info.mx;
            o.y = o.y - info.my;
        })
        nCxt = nCvs.getContext('2d');
        wgt.css('top', info.my + jqBaseMap.offset().top);
        wgt.css('left', info.mx + jqBaseMap.offset().left)

        wgt.addClass('widget');

        nCxt.strokeStyle = colorStr;
        nCxt.lineWidth = 2;
        nCxt.lineCap = 'round';
        //TODO 设置虚线样式
        nCxt.lineJoin = 'round';
        nCxt.setLineDash([15, 10]);
        nCxt.lineDashOffset = 0.0;
        nCxt.closePath();
        for (let i = 0; i < arrowHeadPointArr.length; i++) {
            switch (i) {
                case 0:
                    nCxt.beginPath();
                    nCxt.moveTo(arrowHeadPointArr[i].x, arrowHeadPointArr[i].y);
                    break;
                case 1:
                    nCxt.lineTo(arrowHeadPointArr[i].x, arrowHeadPointArr[i].y);
                    nCxt.moveTo(arrowHeadPointArr[i].x, arrowHeadPointArr[i].y);
                    nCxt.closePath();
                    nCxt.stroke();
                    break;
                case 2:
                    nCxt.lineTo(arrowHeadPointArr[i].x, arrowHeadPointArr[i].y);
                    nCxt.moveTo(arrowHeadPointArr[i].x, arrowHeadPointArr[i].y);
                    nCxt.closePath();
                    nCxt.stroke();
                    break;
            }
        }
        let lineWidget = {};
        lineWidget.id = cId;
        lineWidget.x = wgt.css('left').replaceAll('px', '').trim();
        lineWidget.y = wgt.css('top').replaceAll('px', '').trim();
        lineWidget.type = 2;
        lineWidget.colorIdx = 1;
        lineWidget.content = JSON.stringify(arrowHeadPointArr);
        console.log(JSON.stringify(arrowHeadPointArr))
        curWidgetPool.push(lineWidget);
        // console.log('线条', lineWidget, '数组', curWidgetPool);
        clickCount = 0;
        arrowHeadPointArr = [];
        isDrawingLine = false;
    }

    function save() {
        console.log('保存信息', curWidgetPool)
        $.ajax({
            type: 'post',
            // url: 'http://localhost:2078/api',¬
            url: 'http://10.5.13.112:2078/api',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(curWidgetPool),
            success: function (res) {
                console.log(1);
            },
            error: function (e) {

            }
        })
    }

});

function initBtnStyle() {
    $('.moveWidgetBtn').on('mouseover', e => {
        // console.log(e)
    })
}

function getPixelRatio(context) {
    let backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
};

function addAlert(widget, p1, p2, p3, p4, p5, p6) {
    let id = widget.id;
    let content = widget.content;
    let colorIdx = widget.colorIdx;
    let top = Math.round(document.documentElement.clientHeight * (widget.y / 10000));
    let left = Math.round(document.documentElement.clientWidth * (widget.x / 10000));
    $(".widgetPool").append('<canvas id="' + id + '"class="widget alarm"></canvas>');
    let canvas = document.getElementById(id);
    canvas.width = 2 * (p1 + p3)
    canvas.height = 2 * (p1 + p3) + p5 + p6;

    let cxt = canvas.getContext("2d");

    switch (colorIdx) {
        case 1:
            cxt.strokeStyle = "rgb(255,0,0)";
            cxt.fillStyle = "rgb(255,0,0)";
            break;
        case 2:
            cxt.strokeStyle = "rgb(0,255,0)";
            cxt.fillStyle = "rgb(0,255,0)";
            break;
        case 3:
            cxt.strokeStyle = "rgb(16, 131, 218)";
            cxt.fillStyle = "rgb(122,177,217)";
            break;
        case 4:
            cxt.strokeStyle = "rgb(255,255,0)";
            cxt.fillStyle = "rgb(255,255,0)";
            break;
        case 5:
            cxt.strokeStyle = "rgb(119,119,119)";
            cxt.fillStyle = "rgb(119,119,119)";
            break;
    }

    cxt.beginPath();
    cxt.moveTo(0, 0);
    cxt.lineTo(p1, p2);
    cxt.closePath()
    cxt.stroke();

    cxt.beginPath();
    cxt.moveTo(p1 + p3, 0);
    cxt.lineTo(p1 + p3, p2);
    cxt.closePath()
    cxt.stroke();

    cxt.beginPath();
    cxt.moveTo(2 * (p1 + p3), 0);
    cxt.lineTo(2 * (p1 + p3) - p1, p2);
    cxt.closePath()
    cxt.stroke();

    cxt.beginPath();
    cxt.arc(p1 + p3, 2 * (p1 + p3) - p1, p1 + p3, 0, Math.PI, true);
    cxt.fill();

    cxt.fillRect(0, 2 * (p1 + p3) - p1, 2 * (p1 + p3), p4);

    cxt.fillRect(0, 2 * (p1 + p3) + p5, 2 * (p1 + p3), p6);

    let wgt = $('#' + id);
    wgt.css('position', 'absolute');
    wgt.css('top', top);
    wgt.css('left', left);
}

function addWidget(widget) {
    let id = widget.id;
    let content = widget.content;
    let colorIdx = widget.colorIdx;
    let top = Math.round(document.documentElement.clientHeight * (widget.y / 10000));
    let left = Math.round(document.documentElement.clientWidth * (widget.x / 10000));
    $(".widgetPool").append('<canvas id= "' + id + '"class="widget mark"></canvas>');
    let canvas = document.getElementById(id);
    canvas.width = 130;
    canvas.height = 105;

    let cxt = canvas.getContext("2d");

    cxt.beginPath();
    cxt.moveTo(0, 0);
    cxt.lineTo(130, 0);
    cxt.lineTo(130, 30);
    cxt.lineTo(125, 32);
    cxt.lineTo(125, 72);
    cxt.lineTo(130, 74);
    cxt.lineTo(130, 105);
    cxt.lineTo(0, 105);
    cxt.lineTo(0, 75);
    cxt.lineTo(5, 73);
    cxt.lineTo(5, 33);
    cxt.lineTo(0, 31);


    let grd = cxt.createLinearGradient(60, 105, 60, 0);

    switch (colorIdx) {
        //红1 绿2 蓝3 黄4 灰5
        case 1:
            grd.addColorStop(0, '#f00');
            grd.addColorStop(1, 'rgb(205,59,59,0.9)');
            break;
        case 2:
            grd.addColorStop(0, 'rgb(0,255,0,0.9)');
            grd.addColorStop(1, 'rgb(163,229,136,0.9)');
            break;
        case 3:
            grd.addColorStop(0, 'rgb(16, 131, 218)');
            grd.addColorStop(1, 'rgb(122,177,217)');
            break;
        case 4:
            grd.addColorStop(0, 'rgb(255,81,0,0.9)');
            grd.addColorStop(1, 'rgba(255,136,0,0.9)');
            break;
        case 5:
            grd.addColorStop(0, 'rgb(119,119,119)');
            grd.addColorStop(1, 'rgb(86,85,85)');
            break;
    }


    cxt.strokeStyle = '#fff';
    cxt.fillStyle = grd;
    cxt.fill();
    cxt.fillStyle = "#ff0";
    cxt.textAlign = "center";
    cxt.font = "16px bold 黑体";
    cxt.textBaseline = "middle";


    if (content) {
        if (content.indexOf('|') >= 0) {
            let text1 = content.split('|')[0];
            let text2 = content.split('|')[1];
            cxt.fillText(text1, 60, 42);
            cxt.fillText(text2, 60, 62);
        } else {
            cxt.fillText(content, 60, 62);
        }
    }

    cxt.closePath();
    cxt.stroke();

    let wgt = $('#' + id);
    wgt.css('position', 'absolute');
    wgt.css('top', top);
    wgt.css('left', left);
}

function addWidgetType2(widget, w, h, c) {
    let id = widget.id;
    let content = widget.content;
    let colorIdx = widget.colorIdx;
    let top = Math.round(document.documentElement.clientHeight * (widget.y / 10000));
    let left = Math.round(document.documentElement.clientWidth * (widget.x / 10000));
    $(".widgetPool").append('<canvas id= "' + id + '"class="widget mark"></canvas>');
    let canvas = document.getElementById(id);
    canvas.width = w;
    canvas.height = h;

    let cxt = canvas.getContext("2d");

    cxt.strokeStyle = '#fff';

    let grd = cxt.createLinearGradient(60, 105, 60, 0);
    switch (colorIdx) {
        //红1 绿2 蓝3 黄4 灰5
        case 1:
            grd.addColorStop(0, '#f00');
            grd.addColorStop(1, 'rgb(205,59,59,0.9)');
            break;
        case 2:
            grd.addColorStop(0, 'rgb(0,255,0,0.9)');
            grd.addColorStop(1, 'rgb(163,229,136,0.9)');
            break;
        case 3:
            grd.addColorStop(0, 'rgb(16, 131, 218)');
            grd.addColorStop(1, 'rgb(122,177,217)');
            break;
        case 4:
            grd.addColorStop(0, 'rgb(255,81,0,0.9)');
            grd.addColorStop(1, 'rgba(255,136,0,0.9)');
            break;
        case 5:
            grd.addColorStop(0, 'rgb(119,119,119)');
            grd.addColorStop(1, 'rgb(86,85,85)');
            break;
    }
    cxt.fillStyle = grd;
    cxt.strokeRect(0, 0, w, h);
    cxt.fillRect(0, 0, w, h);

    cxt.strokeStyle = '#fff';
    cxt.fillStyle = 'rgba(25, 25, 46,0)';


    cxt.beginPath();
    cxt.moveTo(0, 0.5 * c);
    cxt.lineTo(0.5 * c, c);
    cxt.lineTo(0.5 * c, 3 * c);
    cxt.lineTo(0, 3.5 * c);
    cxt.fill();
    cxt.closePath();
    cxt.stroke();


    cxt.beginPath();
    cxt.moveTo(w, 0.5 * c);
    cxt.lineTo(w - 0.5 * c, c);
    cxt.lineTo(w - 0.5 * c, 3 * c);
    cxt.lineTo(w, 3.5 * c);
    cxt.fill();
    cxt.closePath();
    cxt.stroke();

    //补偿
    cxt.clearRect(0, h - 0.5 * c, w + 1, 0.5 * c + 1);
    cxt.strokeRect(-1, 0, w + 10, h - 0.5 * c + 10);


    //清除杂线
    // ctx2.fillStyle = 'rgb(25, 25, 46)';
    // ctx2.strokeStyle= 'rgb(25, 25, 46)';
    // ctx2.beginPath();
    // ctx2.moveTo(0, 0.5 * c);
    // ctx2.lineTo(0, 3.5 * c);
    // ctx2.fill();
    // ctx2.closePath();
    // ctx2.stroke();

    cxt.fillStyle = "#ff0";
    cxt.textAlign = "center";
    cxt.font = "12px bold 黑体";
    cxt.textBaseline = "middle";

    if (content) {
        if (content.indexOf('\\n') >= 0) {
            let splitStr = content.split('\\n');
            if (splitStr.length === 3) {
                let text1 = content.split('\\n')[0];
                let text2 = content.split('\\n')[1];
                let text3 = content.split('\\n')[2];
                console.log(text1, text2)
                cxt.fillText(text1, w / 2, h * (1 / 4) - 5);
                cxt.fillText(text2, w / 2, h / 2 - 5);
                cxt.fillText(text3, w / 2, h * (3 / 4) - 5);
            } else if (splitStr.length === 2) {
                let text1 = content.split('\\n')[0];
                let text2 = content.split('\\n')[1];
                cxt.fillText(text1, w / 2, h / 2 - (h / 4));
                cxt.fillText(text2, w / 2, h / 2 - (h / 4) + 20);
            }

        } else {
            cxt.fillText(content, w / 2, h / 2 - 5);
        }
    }

    let wgt = $('#' + id);
    wgt.css('position', 'absolute');
    wgt.css('top', top);
    wgt.css('left', left);
}

function initVideo(src) {
    $('#mui-player').removeClass('setHidden');
    let mp = new MuiPlayer({
        container: '#mui-player',
        title: 'Title',
        preload: true,
        autoplay: true,
        muted: true,
        src: src,
        themeColor: '#fff',
        custom: {
            headControls: [
                {
                    slot: 'closeVideo',
                    click: function (e) {
                        mp.destory();
                        $('#mui-player').addClass('setHidden')
                    },
                    style: {}
                }
            ]
        }
    })
    // mp.reloadUrl('./source/video/1.mp4')
    // mp.destory();
    // mp.close()
}