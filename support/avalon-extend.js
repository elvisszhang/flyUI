avalon.readyon = function (callback) {
	///兼容FF,Google
	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', function () {
			document.removeEventListener('DOMContentLoaded', arguments.callee, false);
			callback();
		}, false)
	}
	//兼容IE
	else if (document.attachEvent) {
		document.attachEvent('onreadytstatechange', function () {
			if (document.readyState == "complete") {
				document.detachEvent("onreadystatechange", arguments.callee);
				callback();
			}
		})
	}
	else if (document.lastChild == document.body) {
		callback();
	}
};
//需要fetch-pollyfill组件支持
avalon.ajax=function(sUrl,oData,options){
	var fnSuccess=options.fnSuccess||null;
	var fnError=options.fnError||null;
	var sType=options.sType||"json";
	var sMethod=options.sMethod||"GET";
	fetch(sUrl,{
		method:sMethod,
		body:oData,
	}).then(function(oResponse){
		switch(sType){
			case "text":
			case "html":return oResponse.text();
			default:return oResponse.json();
		}
	}).then(function(oResult){
		if(fnSuccess) fnSuccess(oResult);
	}).catch(function(ex){
		if(fnError) fnError(ex);
	});
};

avalon.post=function(sUrl,oData,fnSuccess,fnError){
	var options={
		sMethod:"post",
		fnSuccess:fnSuccess,
		fnError:fnError
	};
	avalon.ajax(sUrl,oData,options);
};

avalon.get=function(sUrl,fnSuccess,fnError){
	var options={
		sMethod:"get",
		fnSuccess:fnSuccess,
		fnError:fnError
	};
	avalon.ajax(sUrl,null,options);
};

avalon.put=function(sUrl,oData,fnSuccess,fnError){
	var options={
		sMethod:"put",
		fnSuccess:fnSuccess,
		fnError:fnError
	};
	avalon.ajax(sUrl,oData,options);
};

avalon.delete=function(sUrl,oData,fnSuccess,fnError){
	var options={
		sMethod:"delete",
		fnSuccess:fnSuccess,
		fnError:fnError
	};
	avalon.ajax(sUrl,oData,options);
};

avalon.del=function(iId,sUrl,jumpUrl){
	fyAlert("确定删除数据","数据删除后无法恢复",function(){
		avalon.get(sUrl+iId,function(oResult){
			if(oResult.state==0){
				fyAlert("删除成功","正在跳转...",function(){
					window.location.href=jumpUrl;
				});
				setTimeout(function(){
					window.location.href=jumpUrl;
				},1000);
			}else{
				fyAlert("删除失败",oResult.mess,null,"error");
			}
		});
	},"warning",function(){});
};
/*
	上传图片方法 未封装完
*/
avalon.upbtn=function(s){
	var btn=s.target.getAttribute("target");
	document.querySelector("#"+btn).click();
},
avalon.upheadpic=function(s){
	if(s.target.value==""){
		return;
	}else {
		var btn=s.target.getAttribute("target");
		e=document.querySelector("#"+btn);
		e.value="上传中...";
		e.setAttribute("disabled","");
		var isUp=true;
		var data = new FormData();
		data.append('staffcertimg', s.target.files[0]);
		avalon.post("ajax_upload",data,function(oResult){
			if(oResult.state==0){
				vm.headpic=oResult.mess;
				e.value="选择图片";
				e.removeAttribute("disabled");
			}else{
				fyAlert(oResult.mess,"",null,"error");
				e.value="选择图片";
				e.removeAttribute("disabled");
			}
		},function(ex){
			fyAlert(ex,"",null,"error");
			e.value="选择图片";
			e.removeAttribute("disabled");
		});
	}
},

/*
	判断是否字符串
	@param uObj 待判断的变量
	@return     返回判断结果
 */
avalon.isString=function(uObj){
	return avalon.type(uObj)=="string";
};

/*
	获取url里的参数
	用正则表达式获取地址栏参数
	@return     返回参数
	调用方法:
	alert(GetQueryString("参数名1"));
	alert(GetQueryString("参数名2"));
 */
avalon.getQueryString=function(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null)return  unescape(r[2]); return "";
};

/*
 判断是否字符串
 @param uObj 待判断的变量
 @return     返回判断结果
 */
avalon.isArray=function(uObj){
	return avalon.type(uObj)=="array";
};

avalon.isNumber=function(uObj){
	return avalon.type(uObj)=="number";
}

/*
	modal-tip插件用 用于合并属性方法
	min()返回第一个参数
	avalon.mix(vm.config.tip,avalon.comConfig(sName,sproperty),{
		sproperty.name:""
	})
 */
avalon.comConfig=function(sName,sProperty){
	if(avalon.components[sName]&&avalon.components[sName].defaults.hasOwnProperty(sProperty))
		return avalon.components[sName].defaults[sProperty];
	else return null;
};

/*
	生成url
	@param  sUrl    网址
	@param  uParam  请求参数，可以为string、object、array
	@param  sHost   服务器地址，可为空
	@return         返回处理生成好的完整url
 */
avalon.url=function(sUrl,uParam,sHost){
	sHost=sHost||"";
	var sParam="";
	if(avalon.isString(uParam)) sParam=uParam;
	else if(avalon.isArray(uParam)) sParam=uParam.join("&");
	else if(avalon.isObject(uParam)){
		avalon.each(uParam,function(k,v){
			if(sParam=="") sParam=k+"="+v;
			else sParam+="&"+k+"="+v;
		});
	}else sParam=uParam;
	return sHost+sUrl+(avalon.config.suffix?avalon.config.suffix:".html")+(sParam==""?"":"?"+sParam);
};
/*
	获取字典数据
	@param  iId     字典编号
	@param  fnCallback(oDict)  获取到数据后的回调
	@depency    需要store.js支持
 */
avalon.getDict=function(iId,fnSuccess,fnError){
	var oObj=storeEx.get("dict_"+iId);
	if(oObj) fnSuccess(oObj);
	else {
		var sUrl="http://www.qbdongdong.com/v1/common/dict/"+iId+".json";
		//var sUrl = avalon.config.apiurl + iId + ".json";
		avalon.get(sUrl, function (oResult) {
			if (oResult.state == 0) {
				storeEx.set("dict_"+iId,oObj,7200);
				//将获取到的dict数据返回
				fnSuccess(oResult.table);
			}
		}, fnError);
	}
};
/*
 获取字典数据项
 @param  iId     字典编号
 @param  fnCallback(oDict)  获取到数据后的回调
 @depency    需要store.js支持
 */
avalon.getDictItem=function(iId,fnSuccess,fnError){
	var oObj=storeEx.get("dict_"+iId);
	if(oObj) fnSuccess(oObj);
	else {
		var sUrl="http://www.qbdongdong.com/v1/common/dict_item/"+iId+".json";
		//ar sUrl = avalon.config.apiurl + iId + ".json";
		avalon.get(sUrl, function (oResult) {
			if (oResult.state == 0) {
				storeEx.set("dict_"+iId,oResult.table,7200000);
				//将获取到的dict数据返回
				fnSuccess(oResult.table);
			}
		}, fnError);
	}
};

avalon.keyTable=function(iDict){
	var oData=document.getElementById("data_"+iDict);
	var oVm=avalon.vmodels["data_"+iDict];
	if(!oVm){
		//生成组件
		var oController=document.createElement("div");
		oController.setAttribute("ms-controller","data_"+iDict);
		oController.id="data_"+iDict;
		oController.innerHTML="<wbr ms-widget=\"[{is:'ms-data'},@config]\" />";
		document.body.appendChild(oController);
		avalon.define({
			$id:"data_"+iDict,
			isShow:true,
			config:{
				isShow:false
			}
		});
		avalon.scan(oController);
	}
	return oVm;
};

/*
*日期格式化
*/
avalon.filters.unixdate = function(iSecond,sFormat){
	sFormat = sFormat || "yyyy-MM-dd";
	return avalon.filters.date(iSecond*1000,sFormat);
}
avalon.filters.unixdate1=function(iSecond,sFormat){
	sFormat=sFormat||"yyyy-MM-dd HH:mm:ss";
	return avalon.filters.date(iSecond*1000,sFormat);
};
avalon.filters.addDays=function(oDate,iDay){
	var dtResult=new Date(oDate);
	dtResult.setDate(oDate.getDate() + iDay);
	return dtResult;
};
avalon.filters.formatDate=function(oDate,sFormat){
	sFormat=sFormat||"yyyy-MM-dd";
	sFormat = avalon.filters.replace(sFormat, "yyyy", oDate.getFullYear());
	sFormat = avalon.filters.replace(sFormat, "MM", avalon.filters.getFullMonth(oDate));
	sFormat = avalon.filters.replace(sFormat, "dd", avalon.filters.getFullDate(oDate));
	sFormat = avalon.filters.replace(sFormat, "HH", avalon.filters.getFullHour(oDate));
	return sFormat;
};
avalon.filters.getFullMonth=function(oDate){
	var v = oDate.getMonth() + 1;
	if (v > 9) return v.toString();
	return "0" + v;
};

avalon.filters.getFullDate=function(oDate){
	var v = oDate.getDate();
	if (v > 9) return v.toString();
	return "0" + v;
};

avalon.filters.getFullHour=function(oDate){
	var v = oDate.getHours();
	if (v > 9) return v.toString();
	return "0" + v;
};

avalon.filters.replace=function(sSrc, sOld, sNew) {
	return sSrc.split(sOld).join(sNew);
};

avalon.filters.contains=function(oValue,aData){
	for(var i=0;i<aData.length;i++){
		if(oValue==aData[i]) return true;
	}
	return false;
}

// 日期类型格式成指定的字符串
    function FormatDate(date, format) {
        format = Replace(format, "yyyy", date.getFullYear());
        format = Replace(format, "MM", GetFullMonth(date));
        format = Replace(format, "dd", GetFullDate(date));
        format = Replace(format, "HH", GetFullHour(date));
        return format;
    }
    //js日期字符串转换成日期类型
    function parseDate(dateStr) {
        return new Date(Replace(dateStr, "-", "/"));
    }
    //增加月  
    function AddMonths(date, value) {
        date.setMonth(date.getMonth() + value);
        return date;
    }
    //增加天  
    function AddDays(date, value) {
		var oDate=new Date(date);
        oDate.setDate(date.getDate() + value);
        return oDate;
    }
    //增加时
    function AddHours(date, value) {
        date.setHours(date.getHours() + value);
        return date;
    }
    //返回月份(两位数)  
    function GetFullMonth(date) {
        var v = date.getMonth() + 1;
        if (v > 9) return v.toString();
        return "0" + v;
    }
 
    //返回日(两位数)  
    function GetFullDate(date) {
        var v = date.getDate();
        if (v > 9) return v.toString();
        return "0" + v;
    }
    //返回时(两位数)
    function GetFullHour(date) {
        var v = date.getHours();
        if (v > 9) return v.toString();
        return "0" + v;
    }
    //比较两个时间
    function compareDate() {
        var mydate = AddDays(parseDate("2012-08-23"), 1);
        var nowdate = new Date();
        if (nowdate.getTime() < mydate.getTime()) {
            return FormatDate(nowdate, "yyyy-MM-dd");
        }
        return FormatDate(mydate, "yyyy-MM-dd");
    }

/*
 *	avalon 时间日期处理函数
*/
avalon.dateToUnix=function(uDate){
	var f = uDate.split(' ', 2);
	var d = (f[0] ? f[0] : '').split('-', 3);
	var t = (f[1] ? f[1] : '').split(':', 3);
	return (new Date(
		parseInt(d[0], 10) || null,
		(parseInt(d[1], 10) || 1) - 1,
		parseInt(d[2], 10) || null,
		parseInt(t[0], 10) || null,
		parseInt(t[1], 10) || null,
		parseInt(t[2], 10) || null
		)).getTime() / 1000;
};

avalon.curTime=function(){
	return Date.parse(new Date())/1000;
};

avalon.unixToDate=function(unixTime, isFull, timeZone) {
	if (typeof (timeZone) == 'number'){
		unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
	}
	var time = new Date(unixTime * 1000);
	var ymdhis = "";
	ymdhis += time.getUTCFullYear() + "-";
	ymdhis += (time.getUTCMonth()+1) + "-";
	ymdhis += time.getUTCDate();
	if (isFull === true){
		ymdhis += " " + time.getUTCHours() + ":";
		ymdhis += time.getUTCMinutes() + ":";
		ymdhis += time.getUTCSeconds();
	}
	return ymdhis;
};

avalon.showWait=function(oConfig,sTitle){
	// oConfig.isShow=false;
	sTitle=sTitle||"正在执行";
	oConfig.tip=avalon.mix(oConfig.tip.$model,avalon.comConfig("tip-modal","wait"),{
		title:sTitle,
		text:"请稍等..."
	});
	oConfig.showOk=false;
	oConfig.isShow=true;
};

avalon.closeWait=function(oTips){
	oTips.isShow=false;
};

//参数:组件名称,
avalon.fyComponentId={};
avalon.createComponent=function(sComName,sComId){
	var oComponent=avalon.vmodels[sComId];
	if(!oComponent){
		//检查是否创建过controller对象
		var oVm=document.getElementById("fy_component");
		if(!oVm){
			//不存在则新建controller对象
			oVm=document.createElement("div");
			avalon(oVm).attr("id","fy_component");
			avalon(oVm).attr("ms-controller","fy_component");
			document.body.appendChild(oVm);
			avalon.define({
				$id:"fy_component"
			})
		}
		var sId=avalon.fyComponentId[sComName]?avalon.fyComponentId[sComName]:1;
		sComId=sComName+"_"+(sId++);
		avalon.fyComponentId[sComName]=sId;
		var oDiv=document.createElement("div");
		avalon(oDiv).attr("id",sComId);
		oDiv.innerHTML='<wbr ms-widget="{is:\''+sComName+'\',$id:\''+sComId+'\'}" />';
		oVm.appendChild(oDiv);
		avalon.scan(oVm);
		oComponent=avalon.vmodels[sComId];
	}
	return oComponent;
}