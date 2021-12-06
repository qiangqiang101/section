function b64EncodeUnicode(str)
{return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,function toSolidBytes(match,p1){return String.fromCharCode('0x'+p1);}));}
function reverse(s)
{return s.split("").reverse().join("");}
function drawProgress()
{if(typeof ProgressBar!=='undefined'){var progresses=$('.c-progress');if(progresses.length){progresses.each(function(ind,item){var rates=new ProgressBar.Circle(item,{strokeWidth:4,color:'#e51d35'});rates.animate($(item).data('value'));});}}}
function number_format(number,decimals,decPoint,thousandsSep)
{number=(number+'').replace(/[^0-9+\-Ee.]/g,'')
var n=!isFinite(+number)?0:+number
var prec=!isFinite(+decimals)?0:Math.abs(decimals)
var sep=(typeof thousandsSep==='undefined')?',':thousandsSep
var dec=(typeof decPoint==='undefined')?'.':decPoint
var s=''
var toFixedFix=function(n,prec){var k=Math.pow(10,prec)
return ''+(Math.round(n*k)/k).toFixed(prec)}
s=(prec?toFixedFix(n,prec):''+Math.round(n)).split('.')
if(s[0].length>3){s[0]=s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g,sep)}
if((s[1]||'').length<prec){s[1]=s[1]||''
s[1]+=new Array(prec-s[1].length+1).join('0')}
return s.join(dec)}
function createCookieSport(name,value,time){var date=new Date();date.setTime(date.getTime()+time);var expires="; expires="+date.toGMTString();document.cookie=name+"="+value+";"+expires;}
function updateNavActive()
{$('.header-btn').removeClass('active');if($('.header-btn[href="'+_p+'"]').length>0){$('.header-btn[href="'+_p+'"]').addClass('active');}}
function printSeoSettings()
{document.title=_seo.title;$("meta[name=description]").attr("content",_seo.desc);$("meta[name=keywords]").attr("content",_seo.keywords);}
function comingSoon()
{alert(_lang.coming_soon_game);}
function alertLogin()
{alert(_lang.login_first.replace(/\\n/g,"\n"));}
function under_maintenance()
{alert(_lang.maintenance_msg);}
function getDownload(cGame){$.ajax({type:'POST',data:{theme:theme,ap:'1',game:cGame},url:'tp/download_page',dataType:'html'}).success(function(data){$('#divdownload').html(data);$('#divdownload').fadeIn("fast");});}
function langSelect(langvalue){eraseCookie();createCookie(langvalue,"30");location.reload();if(directmarket==1){window.location.href="http://"+window.location.hostname+"/?lang="+langvalue;}else{window.location.href="http://"+window.location.hostname+"/"+country+"/?lang="+langvalue;}}
function createCookie(value,days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));var expires="; expires="+date.toGMTString();document.cookie="language="+value+";"+expires;}
function eraseCookie(){createCookie('language',"",-1);}
function setDailyCookie(cookieName){var setDate=new Date();setDate.setHours(23,59,59,0);var expiredDate="expires="+setDate.toGMTString();document.cookie=cookieName+"=1;"+expiredDate+";path=/";}
function checkDailyCookie(cookieName){var name=cookieName+"=";var decodedCookie=decodeURIComponent(document.cookie);var ca=decodedCookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' '){c=c.substring(1);}
if(c.indexOf(name)==0){return c.substring(name.length,c.length);}}
return "";}