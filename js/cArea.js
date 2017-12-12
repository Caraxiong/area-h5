window.CArea = (function() {
    let Area = function() {
        this.area; //弹出的地址控价
        this.data; //传给控件的数据
        this.index = 0; //控制省市区控件是第几个select
        this.value = [0, 0, 0]; //添加到input hidden的code
    }
    Area.prototype = {
        //初始化
        init: function(params) {
            this.params = params;
            this.trigger = document.querySelector(params.trigger);
            if(params.valueTo) {
              this.valueTo = document.querySelector(params.valueTo);
            }
            this.keys = params.keys;
            this.type = params.type || 1;
            switch (this.type) {
                case 1:
                case 2:
                    break;
                default:
                    throw new Error('错误提示: 没有这种数据源类型');
                    break;
            }
            this.bindEvent();
        },
        //获取数据
        getData: function(callback) {
            let _self = this;
            if (typeof _self.params.data == "object") {
                _self.data = _self.params.data;
                callback();
            } else {
                let xhr = new XMLHttpRequest();
                xhr.open('get', _self.params.data);
                xhr.onload = function(e) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                        var responseData = JSON.parse(xhr.responseText);
                        _self.data = responseData.data;
                        if (callback) {
                            callback()
                        };
                    }
                }
                xhr.send();
            }
        },
        //绑定事件
        bindEvent: function() {
            let _self = this
            //渲染插件
            function popupArea(e) {
                _self.area = document.createElement('div')
                _self.area.className = 'c-area'
                _self.area.innerHTML = `<div class="area_ctrl slideInUp">
                        <div class="area_btn_box">
                            <div class="area_btn carea_cancel">取消</div>
                            <div class="area_btn carea_finish">确定</div>
                        </div>
                        <div class="area_roll_mask">
                            <div class="area_roll">
                                <div>
                                    <div class="gear area_province" data-areatype="area_province"></div>
                                        <div class="area_grid">
                                        </div>
                                    </div>
                                    <div>
                                        <div class="gear area_city" data-areatype="area_city"></div>
                                        <div class="area_grid">
                                        </div>
                                     </div>
                                     <div>
                                        <div class="gear area_county" data-areatype="area_county"></div>
                                        <div class="area_grid">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    document.body.appendChild(_self.area);
                    areaCtrlInit();
                    let carea_cancel = _self.area.querySelector(".carea_cancel");
                    carea_cancel.addEventListener('touchstart', function(e) {
                        _self.close(e);
                    });
                    var carea_finish = _self.area.querySelector(".carea_finish");
                    carea_finish.addEventListener('touchstart', function(e) {
                        _self.finish(e);
                    });
                    var area_province = _self.area.querySelector(".area_province");
                    var area_city = _self.area.querySelector(".area_city");
                    var area_county = _self.area.querySelector(".area_county");
                    area_province.addEventListener('touchstart', touchStart);
                    area_city.addEventListener('touchstart', touchStart);
                    area_county.addEventListener('touchstart', touchStart);
                    area_province.addEventListener('touchmove', touchMove);
                    area_city.addEventListener('touchmove', touchMove);
                    area_county.addEventListener('touchmove', touchMove);
                    area_province.addEventListener('touchend', touchEnd);
                    area_city.addEventListener('touchend', touchEnd);
                    area_county.addEventListener('touchend', touchEnd);
            }
            //初始化插件默认值
            function areaCtrlInit() {
                _self.area.querySelector('.area_province').setAttribute('val',_self.value[0]);
                _self.area.querySelector('.area_city').setAttribute('val',_self.value[1]);
                _self.area.querySelector('.area_county').setAttribute('val',_self.value[2]);

                switch (_self.type) {
                    case 1:
                        _self.setGearTooth(_self.data);
                        break;
                    // case 2:
                    //     _self.setGearTooth(_self.data[0]);
                    //     break;
                }
            }
            //触摸开始
            function touchStart(e) {
                e.preventDefault();
                let target = e.target;
                while(true) {
                    //当触发在tooth上时，向上查找到父节点
                    if(!target.classList.contains('gear')){
                        target = target.parentElement;
                    }else{
                        break;
                    }
                }
                //清空定时器
                clearInterval(target['int_' + target.id]);
                //targetTouches:绑定事件的那个结点上的触摸点的集合列表
                //screenY:事件发生时鼠标指针相对于屏幕的垂直坐标。
                //记录手指touch时页面上相对于屏幕的垂直坐标
                target['old_'+target.id] = e.targetTouches[0].screenY;
                //获取当前时间
                target['o_t_'+target.id] = (new Date()).getTime();
                let top = target.getAttribute('top');
                if(top) {
                    //取当前的距离，去掉em
                    target['o_d_' + target.id] = parseFloat(top.replace(/em/g,""));
                }else{
                    target['o_d_' + target.id] = 0;
                }
                target.style.webkitTransitionDuration = target.style.transitionDuration = '0ms';
            }
            //手指移动
            function touchMove(e) {
                e.preventDefault();
                let target = e.target;
                while (true) {
                    //当触发在tooth上时，向上查找到父节点
                    if(!target.classList.contains('gear')){
                        target = target.parentElement;
                    }else{
                        break;
                    }
                }
                //记录手指touch move时页面上相对于屏幕的垂直坐标
                target['new_' + target.id] = e.targetTouches[0].screenY;
                //获取当前时间
                target['n_t_' + target.id] = (new Date()).getTime();
                //计算高度差
                let f = (target['new_' + target.id] - target['old_'+target.id]) * 30 / window.innerHeight;
                //记录当前位置
                target['pos_' + target.id] = target['o_d_' + target.id] + f;
                //过渡动画
                target.style['-webkit-transform'] = 'translate3d(0,' + target['pos_' + target.id] + 'em,0)';
                //记录在页面元素上当前的top
                target.setAttribute('top', target['pos_' + target.id] + 'em');
                //判断是否离开屏幕
                if(e.targetTouches[0].screenY < 1){
                    touchEnd(e);
                };
            }
            //离开屏幕
            function touchEnd(e) {
                e.preventDefault();
                let target = e.target;
                while (true) {
                    //当触发在tooth上时，向上查找到父节点
                    if(!target.classList.contains('gear')){
                        target = target.parentElement;
                    }else{
                        break;
                    }
                }
                // 高度差/时间差
                let flag = (target["new_" + target.id] - target["old_" + target.id]) / (target["n_t_" + target.id] - target["o_t_" + target.id]);
                // 计算速度
                if (Math.abs(flag) <= 0.2) {
                    target["spd_" + target.id] = (flag < 0 ? -0.08 : 0.08);
                } else {
                    if (Math.abs(flag) <= 0.5) {
                        target["spd_" + target.id] = (flag < 0 ? -0.16 : 0.16);
                    } else {
                        target["spd_" + target.id] = flag / 2;
                    }
                }
                //判断是否有当前位置的记录值
                if (!target["pos_" + target.id]) {
                    target["pos_" + target.id] = 0;
                }
                //滚动
                roll(target);
            }
            //缓动效果
            function roll(target) {
                let d = 0;
                let stopRoll = false;
                function setDuration() {
                    target.style.webkitTransitionDuration = target.style.transitionDuration = '200ms';
                    stopRoll = true;
                }
                clearInterval(target["int_" + target.id]);
                target["int_" + target.id] = setInterval(function() {
                    let pos = target["pos_" + target.id];
                    let speed = target["spd_" + target.id] * Math.exp(-0.03 * d);
                    pos += speed;
                    if (Math.abs(speed) > 0.1) {} else {
                        //速度小于0.1时，停止
                        let b = Math.round(pos / 2) * 2;
                        pos = b;
                        setDuration();
                    }
                    //当滚到顶的时候停止
                    if (pos > 0) {
                        pos = 0;
                        setDuration();
                    }
                    //当前区块的高度，取反作为最小top，当滚到底时停止
                    let minTop = -(target.dataset.len - 1) * 2;
                    if (pos < minTop) {
                        pos = minTop;
                        setDuration();
                    }
                    //停止时
                    if (stopRoll) {
                        let gearVal = Math.abs(pos) / 2;
                        setGear(target, gearVal);
                        clearInterval(target["int_" + target.id]);
                    }
                    target["pos_" + target.id] = pos;
                    target.style["-webkit-transform"] = 'translate3d(0,' + pos + 'em,0)';
                    target.setAttribute('top', pos + 'em');
                    d++;
                }, 30);
            }
            //控制插件滚动后停留的值
            function setGear(target, val) {
                val = Math.round(val);
                target.setAttribute('val', val);
                switch (_self.type) {
                    case 1:
                         _self.setGearTooth(_self.data);
                        break;
                    case 2:
                        switch(target.dataset['areatype']){
                            case 'area_province':
                                _self.setGearTooth(_self.data[0]);
                                break;
                            case 'area_city':
                                 var ref = target.childNodes[val].getAttribute('ref');
                                 var childData=[];
                                 var nextData= _self.data[2];
                                 for (var i in nextData) {
                                     if(i==ref){
                                        childData = nextData[i];
                                        break;
                                     }
                                 };
                             _self.index=2;
                             _self.setGearTooth(childData);
                             break;
                     }
                }
            }
            _self.getData(function() {
                _self.trigger.addEventListener('click',popupArea);
            });
        },
        //重置节点个数
        setGearTooth: function(data) {
            let _self = this;
            let item = data || [];
            let l = item.length;
            let gearChild = _self.area.querySelectorAll('.gear');
            let gearVal = gearChild[_self.index].getAttribute('val');
            let maxVal = l - 1;
            if (gearVal > maxVal) {
                gearVal = maxVal;
            }
            gearChild[_self.index].setAttribute('data-len', l);
            if (l > 0) {
                let id = item[gearVal][this.keys['id']];
                let childData;
                switch (_self.type) {
                    case 1:
                        childData = item[gearVal].child
                        break;
                    case 2:
                        var nextData= _self.data[_self.index+1]
                        for (var i in nextData) {
                            if(i==id){
                                childData = nextData[i];
                                break;
                            }
                        };
                        break;
                }
                let itemStr = "";
                for (var i = 0; i < l; i++) {
                    itemStr += "<div class='tooth'  ref='" + item[i][this.keys['id']] + "'>" + item[i][this.keys['name']] + "</div>";
                }
                gearChild[_self.index].innerHTML = itemStr;
                gearChild[_self.index].style["-webkit-transform"] = 'translate3d(0,' + (-gearVal * 2) + 'em,0)';
                gearChild[_self.index].setAttribute('top', -gearVal * 2 + 'em');
                gearChild[_self.index].setAttribute('val', gearVal);
                _self.index++;
                if (_self.index > 2) {
                    _self.index = 0;
                    return;
                }
                _self.setGearTooth(childData);
            } else {
                gearChild[_self.index].innerHTML = "<div class='tooth'></div>";
                gearChild[_self.index].setAttribute('val', 0);
                if(_self.index==1){
                    gearChild[2].innerHTML = "<div class='tooth'></div>";
                    gearChild[2].setAttribute('val', 0);
                }
                _self.index = 0;
            }
        },
        //点击完成
        finish: function(e) {
            let _self = this;
            let area_province = _self.area.querySelector(".area_province");
            let area_city = _self.area.querySelector(".area_city");
            let area_county = _self.area.querySelector(".area_county");
            let provinceVal = parseInt(area_province.getAttribute("val"));
            let provinceText = area_province.childNodes[provinceVal].textContent;
            let provinceCode = area_province.childNodes[provinceVal].getAttribute('ref');
            let cityVal = parseInt(area_city.getAttribute("val"));
            let cityText = area_city.childNodes[cityVal].textContent;
            let cityCode = area_city.childNodes[cityVal].getAttribute('ref');
            let countyVal = parseInt(area_county.getAttribute("val"));
            let countyText = area_county.childNodes[countyVal].textContent;
            let countyCode = area_county.childNodes[countyVal].getAttribute('ref');
            _self.trigger.value = provinceText + ((cityText)?(',' + cityText):(''))+ ((countyText)?(',' + countyText):(''));
            _self.value = [provinceVal, cityVal, countyVal];
            if(this.valueTo){
                this.valueTo.value= provinceCode +((cityCode)?(',' + cityCode):('')) + ((countyCode)?(',' + countyCode):(''));
            }
            _self.close(e);
        },
        //点击取消
        close: function(e) {
            e.preventDefault();
            let _self = this;
            let evt = new CustomEvent('input');
            _self.trigger.dispatchEvent(evt);
            document.body.removeChild(_self.area);
            _self.area = null;
        }
    }
    return Area;
})();
