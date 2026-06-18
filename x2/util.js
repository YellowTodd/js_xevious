
//------------------------------------------------------
// 언어 환경
//------------------------------------------------------
function _getLanguage() {
  try {
    return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2)
  }
  catch(e) {
    return undefined;
  }
}

//------------------------------------------------------
// 난수
//------------------------------------------------------
function _random( nMax ) {
	return Math.floor( Math.random() * nMax );
}

//------------------------------------------------------
// JS 읽기
//------------------------------------------------------

function _include( strFilename ) {
	document.write(
		'<script type="text/javascript" charset="utf-8" src="' +
		strFilename + '.js' +
		'"><\/script>'
	); 
}

//------------------------------------------------------
// cookie에서 지정한 이름에 대응하는 값을 가져온다
//------------------------------------------------------

function _getCookie( strName )
{
	var str = _getCookie2( strName, '; ', document );
	if( !str )
		str = _getCookie2( strName, ';', document );
	if( !str )
		str = _getCookie2( strName, '; ', top.document );
	if( !str )
		str = _getCookie2( strName, ';', top.document );

	return str;
}

function _getCookie2( strName, strTerm, objTop )
{
	var strCookieAr = objTop.cookie.split( strTerm );
	for( var i=0; i<strCookieAr.length; i++ ) {
		var strValueAr = strCookieAr[i].split( '=' );
		if( strValueAr[0] === strName ) {
			var str = decodeURIComponent( strValueAr[1] );
			if( str == 'undefined' ) // for IE
				return null;
			return str;
		}
	}
	return null;
}

//------------------------------------------------------
// 값에 이름을 붙여 cookie에 저장한다
//------------------------------------------------------

//function _setCookie( strName, strValue, strPath, nExpire )
function _setCookie( strName, strValue )
{
	var strCookie = strName + '=' + encodeURIComponent( strValue );

	var dateExpire = new Date(); //　현재 날짜와 시간을 가져온다
	dateExpire.setTime( dateExpire.getTime()+(90*1000*60*60*24)); //　Cookie 기한: 90일
	dateExpire = dateExpire.toGMTString();
	strCookie += ';expires=' + dateExpire +';';

	document.cookie = strCookie;
//	alert(strCookie.length);
}

//------------------------------------------------------
// cookie를 삭제한다
//------------------------------------------------------

//function _deleteCookie( strName, strPath )
function _deleteCookie( strName )
{
	var dateExpire = new Date(); //　현재 날짜와 시간을 가져온다
	dateExpire.setYear(dateExpire.getYear()-1);
	var strCookie = strName + '=;expires=' + dateExpire.toGMTString()+ ';';
	document.cookie = strCookie;
}

//------------------------------------------------------
// cookie에 쓸 문자열을 모은다
//------------------------------------------------------

var TM0 = '!';
var TM1 = '\'';
var TM2 = ')';

var g_DataAr = new Array();
function _saveData( strKey, strValue ) {
	g_DataAr[strKey] = strKey + TM0 + strValue
}

function _loadData( strKey ) {
	var str = g_DataAr[strKey];
	if( str ) {
		var strValAr = str.split(TM0);
		if( strValAr[1] )
			return strValAr[1];
	}
	
	return '';
}

function _storeDataToCookie() {
	var n = 0;
	var str = '';
	for( var sub in g_DataAr ) {
		str += g_DataAr[sub];
		str += TM1;
		var nLen = COOKIE.length+str.length+40;
		if( nLen > 1000 ) {
			_setCookie( COOKIE+n, str );
			n++;
			str = '';
		}
	}
	if( str.length ) {
		_setCookie( COOKIE+n, str );
	}

	return true;
}

function _retrieveDataFromCookie() {
	delete(g_DataAr);
	g_DataAr = new Array();

	var i;
	for( i=0; i<10; i++ ) {
		var str = _getCookie( COOKIE+i );
		if( !str )
			break;
		var strAr = str.split( TM1 );
		for( var j=0; j<strAr.length; j++ ) {
			var strValAr = strAr[j].split( TM0 );
			g_DataAr[strValAr[0]] = strAr[j];
		}
	}
	if( i == 0 )
		return false;

	return true;
}

function _initData() {
	for( var i=0; i<10; i++ )
		_deleteCookie( COOKIE+i );

	delete(g_DataAr);
	g_DataAr = new Array();
}

//------------------------------------------------------
// 프로토타입 체인을 만든다(클래스 상속)
//------------------------------------------------------
function _inherit( funcSubClass, funcSuperClass ) {
	var funcTemp = new Function();
	funcTemp.prototype = funcSuperClass.prototype;

	funcSubClass.prototype  = new funcTemp;
	funcSubClass.prototype.constructor  = funcSubClass;	// 부모 constructor가 되어 있으므로 되돌려 쓴다

	funcSubClass.prototype.base = function () {
		var funcOrigBase = this.base;						// 현재 base를 저장
		this.base = funcSuperClass.prototype.base || null;	// 부모 base로 설정
		funcSuperClass.apply( this, arguments );			// 부모 생성자 실행
		this.base = funcOrigBase;							// 원래 base로 되돌림

		if( this.constructor == funcSubClass )	// 자기 자신이면(부모가 아니면) 다시 사용할 수 없도록 base 삭제
			delete this.base;
	};

/*
	for( var n in funcSuperClass ) {
		funcSubClass.prototype[n] = funcSuperClass[n];
    }
*/
}

//------------------------------------------------------
// 이벤트 전파 차단
//------------------------------------------------------
function _stopEvent( e ) {
	// 버블링 단계의 이벤트 전파 차단
	if( e && e.stopPropagation )
		e.stopPropagation();
	else if( window.event )
		window.event.cancelBubble = true;

	// 기본 이벤트 억제
	if( e && e.preventDefault )
		e.preventDefault();
	else if( window.event )
		window.event.returnValue = false;
}

//------------------------------------------------------
// Ascii → KeyCode 변환
//------------------------------------------------------

function _ToKeyCode( str ) {
	return str.toUpperCase().charCodeAt(0);
}

//------------------------------------------------------
// KeyCode → Ascii 변환
//------------------------------------------------------

function _ToChar( nKeyCode ) {
	return String.fromCharCode(nKeyCode).toLowerCase();
}

//------------------------------------------------------
// 웹에 업로드되어 있는지 검사
//------------------------------------------------------
function _isUploaded() {
	const strFolderAr = document.location.href.split('/');
	if( strFolderAr[0] == 'https:' )
		return true;
	return (strFolderAr[0]=='http:')? true : false;
}

//------------------------------------------------------
// 현재 시각 가져오기
//------------------------------------------------------
const now = window.performance && (
	performance.now || 
	performance.mozNow || 
	performance.msNow || 
	performance.oNow || 
	performance.webkitNow );

function _getTime() {
	return ( now && now.call( performance ) ) || ( new Date().getTime() );
}
