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
    initBaseMap();

    console.log('topbar', window.outerHeight, window.innerHeight)
    console.log(document.documentElement.clientWidth, screen.width, screen.availWidth, window.innerWidth)
    console.log(document.documentElement.clientHeight, screen.height, screen.availHeight, window.innerHeight)
    $(window).resize(function (e) {
        //1.自适应调整底图
        initBaseMap();
        //自适应调整控件的left top
        // redrawWidget();
        //自适应调整控件的宽高
        // console.log(document.documentElement.clientWidth, screen.width, screen.availWidth, window.innerWidth)
        // console.log('resize', e)

    });

    initBtnStyle();

    function initBaseMap() {
        img = new Image();
        img.src = "./source/bg.png";
        cvs = document.getElementById("basemap");
        jqBaseMap = $('#basemap');
        console.log('pw', parent.document.documentElement.clientWidth, document.documentElement.clientWidth)
        console.log('ph', parent.document.documentElement.clientHeight, document.documentElement.clientHeight)
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
            if (!curWidgetPool || !curWidgetPool.length)
                getData(-1);
        }
        jqBaseMap.on('click', e => {
            console.log('jqbm', e.offsetX, e.offsetY, e.clientX, e.clientY);
        })
        // cvs.onclick = (e) => {};
    }

    function redrawWidget() {
        //获取到控件
        // let alarms = curWidgetPool.filter(o => o.type === 1 && (o.id).indexOf("转台") >= 0);
        curWidgetPool.forEach(o => {
            $('#' + o.id).remove();
            genWidgetByType(o);
        })
    }

    function genWidgetByType(o) {
        let dom = $('#' + o.id);
        if (dom && dom.length > 0) {
            return false;
        }
        // console.log('gwt', screen.width, document.documentElement.clientWidth, screen.height, document.documentElement.clientHeight)
        // if (screen.width - document.documentElement.clientWidth > 50) {
        //     o.x = Math.round(o.x / (screen.width / document.documentElement.clientWidth));
        // }
        // if (screen.height - document.documentElement.clientHeight > 50) {
        //     o.y = Math.round(o.y / (screen.height / document.documentElement.clientHeight));
        // }
        if (o.type === 0) {
            addWidget(o)
        } else if (o.type === 1) {
            let p1 = 6;//顶部三条线等分距离
            let p2 = 7;//线长度
            let p3 = 8;//顶部线点到点距离
            let p4 = 10;//长方形1高度
            let p5 = 6;//长方形1和2起始点间隔宽度
            let p6 = 3;//长方形2高度
            addAlert(o, p1, p2, p3, p4, p5, p6);
            if (screen.width !== document.documentElement.clientWidth) {
                // addAlert(o, p1 / 2, p2 / 2, p3 / 2, p4 / 2, p5 / 2, p6 / 2);
                let widthRatio = (document.documentElement.clientWidth / screen.width).toFixed(2);
                let heightRatio = (document.documentElement.clientHeight / screen.height).toFixed(2);
                // addAlert2(o, p1, p2, p3, p4, p5, p6, widthRatio, heightRatio);
                // addAlert(o, p1, p2, p3, p4, p5, p6);
                // console.log('宽高', (document.documentElement.clientWidth / screen.width).toFixed(2), (document.documentElement.clientHeight / screen.height).toFixed(2));
            }

        } else if (o.type === 2) {
            // genArrowHeadFromData(o);
        }
    }

    function getData(isLocal) {
        // let url = 'http://localhost:2078/api';
        let url = 'http://10.5.13.112:2078/api';
        let dataType = 'json';
        if (!isLocal) {
            url = 'http://10.5.13.112:2078/napi/GetAssemble?flag=1';
            // url = 'http://localhost:2078/napi/GetAssemble?flag=1';
            dataType = 'TEXT';
        }
        $.ajax({
            type: 'get'
            , url: url
            // , url: 'http://localhost:2078/napi/GetAssemble?flag=1'
            , dataType: dataType
            , success: function (res) {
                console.log('获取数据:', res)
                let wgd = res;
                if (dataType === 'TEXT') {
                    //[object XMLDocument]
                    let reg = /\[(.+?)\]/g;
                    wgd = JSON.parse(res.match(reg)[0]);
                }
                wgd.forEach(o => {
                    let widget = {};
                    widget.tid = o.tid;
                    widget.id = o.id;
                    widget.x = o.x;
                    widget.y = o.y;
                    widget.defaultX = o.x;
                    widget.defaultY = o.y;
                    widget.type = o.type;
                    widget.colorIdx = o.coloridx || o.colorIdx;
                    widget.content = o.content;
                    curWidgetPool.push(widget);
                    genWidgetByType(o);
                    // console.log(o.id, o.x, o.y, o.content, o.colorIdx)
                })
                console.log('组件数组:', curWidgetPool)
            }
        });
    }

    $('.saveInfoBtn').on('click', e => {
        save();
    })

    $('.moveWidgetBtn').on('click', e => {
        //1。可以移动线
        isDragging = true;

        // $('.dlc').on('mouseover', e => {
        //     let ele = e.target || e.currentTarget;
        //     let wgtId = ele.id;
        //     $('#' + wgtId).addClass('lineBorder');
        // });
        // $('.dlc').on('mouseout', e => {
        //     let ele = e.target || e.currentTarget;
        //     let wgtId = ele.id;
        //     $('#' + wgtId).removeClass('lineBorder');
        // });
        // $('.dlc').draggable({
        //     draggable: false,
        //     containment: ".bgContainer",
        //     stop: function (e, ui) {
        //         let ele = e.target || e.currentTarget;
        //         let wgtId = ele.id;
        //         curWidgetPool.forEach(o => {
        //             if (o.id === wgtId) {
        //                 o.x = ui.position.left;
        //                 o.y = ui.position.top;
        //             }
        //         });
        //         // console.log('.dlc', curWidgetPool);
        //     }
        // });

        //2。线的div非常大，需要缩小，根据最大x和最大y，减去left和top来作为width和height

        let chosenWgt = $('.widget');

        //把widget放到顶层,
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
                // console.log(wgtId + ' 拖动中', cvs.width, cvs.height, ui.offset.left, ui.offset.top)
                if (ui.offset.top < 0 || ui.offset.left < 0 || ui.offset.top > cvs.height || ui.offset.left > cvs.width) {
                    return false;
                }
            },
            stop: function (e, ui) {
                let ele = e.target || e.currentTarget;
                let wgtId = ele.id;
                curWidgetPool.forEach(o => {
                    if (o.id === wgtId) {
                        o.x = ui.position.left;
                        o.y = ui.position.top;
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
                            addWidget(deletedElement);
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

            console.log(wgtId, '点击位置:', e.offsetX, e.offsetY);
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
            case 1:
                nCxt.strokeStyle = '#f00';
                break;
            case 2:
                nCxt.strokeStyle = '#0f0';
                break;
            case 3:
                nCxt.strokeStyle = '#ff0';
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

function addAlert2(widget, p1, p2, p3, p4, p5, p6, widthRatio, heightRatio) {
    let id = widget.id;
    let content = widget.content;
    let colorIdx = widget.colorIdx;
    let top = widget.y;
    let left = widget.x;
    $(".widgetPool").append('<canvas id="' + id + '"class="widget alarm"></canvas>');
    // $($('.widget')[$('.widget').length - 1]).css('position', 'absolute');
    // let canvas = document.getElementsByClassName("widget")[$(".widget").length - 1];
    let canvas = document.getElementById(id);
    canvas.width = Math.round((2 * (p1 + p3)) * widthRatio);
    canvas.height = Math.round((2 * (p1 + p3) + p5 + p6) * heightRatio);

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
            cxt.strokeStyle = "rgb(255,255,0)";
            cxt.fillStyle = "rgb(255,255,0)";
            break;
        case 4:
            cxt.strokeStyle = "rgb(119,119,119)";
            cxt.fillStyle = "rgb(119,119,119)";
            break;
    }

    cxt.beginPath();
    cxt.moveTo(0, 0);
    cxt.lineTo(Math.round(p1 * widthRatio), Math.round(p2 * heightRatio));
    cxt.closePath()
    cxt.stroke();

    cxt.beginPath();
    cxt.moveTo(Math.round((p1 + p3) * widthRatio), 0);
    cxt.lineTo(Math.round((p1 + p3) * widthRatio), Math.round(p2 * heightRatio));
    cxt.closePath()
    cxt.stroke();

    cxt.beginPath();
    cxt.moveTo(Math.round((2 * (p1 + p3)) * widthRatio), 0);
    cxt.lineTo(Math.round((2 * (p1 + p3) - p1) * widthRatio), Math.round(p2 * heightRatio));
    cxt.closePath()
    cxt.stroke();

    cxt.beginPath();
    cxt.arc(Math.round((p1 + p3, 2 * (p1 + p3) - p1) * widthRatio), Math.round((p1 + p3) * heightRatio), 0, Math.PI, true);
    cxt.fill();

    cxt.fillRect(0, Math.round((2 * (p1 + p3) - p1) * heightRatio), Math.round(), Math.round(p4 * heightRatio));

    cxt.fillRect(0, Math.round((2 * (p1 + p3) + p5) * heightRatio), Math.round((2 * (p1 + p3)) * widthRatio), Math.round(p6 * heightRatio));

    let wgt = $('#' + id);
    wgt.css('position', 'absolute');
    wgt.css('top', top);
    wgt.css('left', left);
}


function addAlert(widget, p1, p2, p3, p4, p5, p6) {
    let id = widget.id;
    let content = widget.content;
    let colorIdx = widget.colorIdx;
    let top = widget.y;
    let left = widget.x;
    $(".widgetPool").append('<canvas id="' + id + '"class="widget alarm"></canvas>');
    // $($('.widget')[$('.widget').length - 1]).css('position', 'absolute');
    // let canvas = document.getElementsByClassName("widget")[$(".widget").length - 1];
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
            cxt.strokeStyle = "rgb(255,255,0)";
            cxt.fillStyle = "rgb(255,255,0)";
            break;
        case 4:
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
    let top = widget.y;
    let left = widget.x;
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
        case 1:
            grd.addColorStop(0, 'rgb(255,0,0,0.9)');
            grd.addColorStop(1, 'rgb(205,59,59,0.9)');
            break;
        case 2:
            grd.addColorStop(0, 'rgb(0,255,0,0.9)');
            grd.addColorStop(1, 'rgb(163,229,136,0.9)');
            break;
        case 3:
            grd.addColorStop(0, 'rgb(255,81,0,0.9)');
            grd.addColorStop(1, 'rgba(255,136,0,0.9)');
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