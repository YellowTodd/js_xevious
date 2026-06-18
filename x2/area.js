
const ACTION_TYPE_INDEX    = 0x01;
const ACTION_TYPE_OBJECT   = 0x02;
const ACTION_TYPE_END      = 0x04;
const ACTION_TYPE_CONTINUE = 0x10;
const ACTION_VALUE_A1      = 1;
const ACTION_VALUE_A2      = 2;
const ACTION_VALUE_B1      = 3;
const ACTION_VALUE_B2      = 4;

function Area( objApp, nAreaNo ) {
	this.m_objApp = objApp;
	this.m_nAreaNo = nAreaNo;
	this.m_nGroundNo = 0;
	this.m_nodeGround = null;
	this.m_nMapOftX = 0;
	this.m_nMapOftY = -2048;
	this.m_objObjectAr = [];
	this.m_nActionAr = [];
	this.m_nCurAction = {type:0, value:0};
	this.m_ActivatedEnemies1 = {enemy1:0, num1:0, opt1:0, enemy2:0, num2:0, opt2:0 };
	this.m_ActivatedEnemies2 = {enemy1:0, num1:0, opt1:0, enemy2:0, num2:0, opt2:0 };
	this.m_bBacura = false;
	this.m_nBacuraEndPos = 255;
	this.m_nMaxBacuras = 1;

	function scroll( objThis ) {
		for( let i=objThis.m_objObjectAr.length-1; i>=0; i-- ) {
			const obj = objThis.m_objObjectAr[i];
			const node = obj.GetNode();
			let nPosY = parseInt( node.style.top ) + 1;
			node.style.top = nPosY + 'px';
			obj.Move();
		}

		if( objThis.m_nodeGround ) {
			objThis.m_nodeGround.style.backgroundPosition = objThis.m_nMapOftX + 'px ' + objThis.m_nMapOftY + 'px';
			objThis.m_nMapOftY++;
		}
	}

	function action( objThis ) {
		// TYPE B의 INDEX 계산
		function calcFlyingEnemyIndex() {
			// 점수를 1000으로 나눈다(소수점 버림)
			const nScore = (g_App.GetScoreObject().GetScore() / 1000)|0;
			// 앞에 0x를 붙여 16진수로 만든다
			const nScore16 = parseInt('0x'+nScore, 16);
			// 실수한 횟수+1
			const nFailed = g_App.GetSolvalouObject().NumMiss()+1;
			// 1000으로 나누어 16진수로 만든 점수를 실수 횟수로 나눈다(소수점 버림)
			let nIndex = (nScore16 / nFailed)|0;
			// 16을 넘으면 16으로 제한한다
			if( nIndex > 16 )
				nIndex = 16;
			return nIndex;
		}

		// 오브젝트 생성 함수
		function createObj( nObjType, nMaxObjects, nOption, strClassName ) {
			// 출현 수 0은 단발 출현
			let bCreate = false;
			if( nMaxObjects == 0 ) {
				bCreate = true;
			}
			// 일반 출현(최대 출현 수에 못 미치면 출현)
			else {
				let nPossibility = 5;
				if( nObjType == OBJECT_BACURA )
					nPossibility = 4;
				else if( nObjType == OBJECT_ZAKATO ) {
					nPossibility = 6;
					if( objThis.m_nAreaNo == 4 || objThis.m_nAreaNo == 9 || objThis.m_nAreaNo == 14 )
						nPossibility = 12;
				}
				else if( nObjType == OBJECT_BZAKATO ) {
					nPossibility = 6;
					if( objThis.m_nAreaNo == 9 )
						nPossibility = 12;
				}
				let nodeObjectAr = document.getElementsByClassName( strClassName );
				if( nodeObjectAr.length <= 0 )
					nPossibility = 10;
				if( _random(100) < nPossibility ) {
					if( nodeObjectAr.length < nMaxObjects )
						bCreate = true;
					nodeObjectAr = null;
				}
				//if( nObjType == OBJECT_ANDORGEN ) {
				//	bCreate = true;
				//}
			}

			if( bCreate ) {
				const obj = g_App.GetObjectManager().Create( nObjType, nOption );
				if( obj ) {
					const node = obj.GetNode();
					node.classList.add( strClassName );
				}
				return obj;
			}
			return null;
		}

		// 공중 캐릭터 생성 함수
		function createEnemy() {
			// 테이블 내용에 따른 캐릭터 생성
			if( objThis.m_ActivatedEnemies1.enemy1 ) {
				const nObjType     = objThis.m_ActivatedEnemies1.enemy1;
				const nMaxObjects  = objThis.m_ActivatedEnemies1.num1;
				const nOption      = objThis.m_ActivatedEnemies1.opt1;
				const strClassName = nObjType + '_01';
				createObj( nObjType, nMaxObjects, nOption, strClassName );
				if( nMaxObjects == 0 )
					objThis.m_ActivatedEnemies1.num1 = -1;
			}
			if( objThis.m_ActivatedEnemies1.enemy2 ) {
				const nObjType     = objThis.m_ActivatedEnemies1.enemy2;
				const nMaxObjects  = objThis.m_ActivatedEnemies1.num2;
				const nOption      = objThis.m_ActivatedEnemies1.opt2;
				const strClassName = nObjType + '_02';
				createObj( nObjType, nMaxObjects, nOption, strClassName );
				if( nMaxObjects == 0 )
					objThis.m_ActivatedEnemies1.num1 = -1;
			}
			// 테이블 내용에 따른 캐릭터 생성
			// (TYPE A가 2개 있는 AREA11 POS:156 대응)
			if( objThis.m_ActivatedEnemies2.enemy1 ) {
				const nObjType     = objThis.m_ActivatedEnemies2.enemy1;
				const nMaxObjects  = objThis.m_ActivatedEnemies2.num1;
				const nOption      = objThis.m_ActivatedEnemies2.opt1;
				const strClassName = nObjType + '_11';
				createObj( nObjType, nMaxObjects, nOption, strClassName );
				if( nMaxObjects == 0 )
					objThis.m_ActivatedEnemies1.num1 = -1;
			}
			if( objThis.m_ActivatedEnemies2.enemy2 ) {
				const nObjType     = objThis.m_ActivatedEnemies2.enemy2;
				const nMaxObjects  = objThis.m_ActivatedEnemies2.num2;
				const nOption      = objThis.m_ActivatedEnemies2.opt2;
				const strClassName = nObjType + '_12';
				createObj( nObjType, nMaxObjects, nOption, strClassName );
				if( nMaxObjects == 0 )
					objThis.m_ActivatedEnemies1.num1 = -1;
			}
		}
		
		// 스크롤 위치에서 액션 읽기
		const nIndex = objThis.GetScrollPos();
		const nActionType = objThis.m_nActionAr[nIndex].type;
		const nActionValue = objThis.m_nActionAr[nIndex].value;
		objThis.m_nActionAr[nIndex].type = 0;	// 읽었으므로 0으로 만든다(다음에 다시 읽지 않도록)

		// 바큘라용 특수 처리
		if( objThis.m_bBacura ) {
			const strClassName = 'bacura_object'
			if( nIndex < objThis.m_nBacuraEndPos ) {
				const obj = createObj( OBJECT_BACURA, objThis.m_nBacuras, 0, strClassName );
				if( obj ) {
					let nodeObjectAr = document.getElementsByClassName( strClassName );
					const nBacuras = nodeObjectAr.length + 0.3;
					if( objThis.m_nBacuras < nBacuras )
						objThis.m_nBacuras = nBacuras;
					if( objThis.m_nBacuras >  objThis.m_nMaxBacuras )
						objThis.m_nBacuras = objThis.m_nMaxBacuras;
					nodeObjectAr = null;
				}
			}
			else {
				objThis.m_bBacura = false;
				this.m_nMaxBacuras = 1;
			}
		}

		// TYPE B는 현재 캐릭터 출현을 멈추지 않는다
		let bActionTypeB = false;
		let nActionValueB = 0;
		if( nActionType != 0 ) {
			if( nActionType & ACTION_TYPE_INDEX ) {
				if( nActionValue >= ACTION_VALUE_B1 ) {
					bActionTypeB = true;
					nActionValueB = nActionValue;
				}
			}
			if( !bActionTypeB ) {
				objThis.m_nCurAction.type = nActionType;
				objThis.m_nCurAction.value = nActionValue;
			}
		}
		// 난이도 상승(TYPE B)
		if( bActionTypeB ) {
			// 난이도 상승(변수)
			if( nActionValueB == ACTION_VALUE_B1 ) {
				const nDelta = calcFlyingEnemyIndex();
				g_App.GetGameObject().AddFlyingEnemyIndex( nDelta );
			}
			else if( nActionValueB == ACTION_VALUE_B2 ) {
				const nDelta = calcFlyingEnemyIndex() * 2;
				g_App.GetGameObject().AddFlyingEnemyIndex( nDelta );
			}
		}

		// 출현 기간이 끝남
		if( objThis.m_nCurAction.type == 0 )
			return;

		// 공중 캐릭터 출현 기간 종료
		if( objThis.m_nCurAction.type & ACTION_TYPE_END) {
			objThis.m_nCurAction.type = 0;
			this.m_ActivatedEnemies1 = {enemy1:0, num1:0, opt1:0, enemy2:0, num2:0, opt2:0 };
			this.m_ActivatedEnemies2 = {enemy1:0, num1:0, opt1:0, enemy2:0, num2:0, opt2:0 };
			return;
		}

		// 공중 캐릭터 생성
		createEnemy();

		// 난이도 상승+캐릭터 출현(TYPE A)
		if( objThis.m_nCurAction.type == ACTION_TYPE_INDEX ) {
			// 난이도 상승(상수)+공중 캐릭터 출현
			if( objThis.m_nCurAction.value == ACTION_VALUE_A1 ) {
				const nDifficulty = g_App.GetConfigObject().GetDifficulty();
				let nDelta = 0;
				switch( nDifficulty ) {
					case 1: nDelta =  2;  break;
					case 2: nDelta =  6;  break;
					case 3: nDelta = 16;  break;
				}
				g_App.GetGameObject().AddFlyingEnemyIndex( nDelta );
				objThis.m_ActivatedEnemies1 = g_App.GetGameObject().GetFlyingEnemies();
			}
			if( objThis.m_nCurAction.value == ACTION_VALUE_A2 ) {
				let nDifficulty = g_App.GetConfigObject().GetDifficulty();
				let nDelta = 0;
				switch( nDifficulty ) {
					case 1: nDelta =  2;  break;
					case 2: nDelta =  6;  break;
					case 3: nDelta = 16;  break;
				}
				g_App.GetGameObject().AddFlyingEnemyIndex( nDelta );
				objThis.m_ActivatedEnemies1 = g_App.GetGameObject().GetFlyingEnemies();

				nDifficulty = g_App.GetConfigObject().GetDifficulty();
				nDelta = 0;
				switch( nDifficulty ) {
					case 1: nDelta =  2;  break;
					case 2: nDelta =  6;  break;
					case 3: nDelta = 16;  break;
				}
				g_App.GetGameObject().AddFlyingEnemyIndex( nDelta );
				objThis.m_ActivatedEnemies2 = g_App.GetGameObject().GetFlyingEnemies();
			}
		}
		// 고정 공중 캐릭터 출현
		else if( objThis.m_nCurAction.type == ACTION_TYPE_OBJECT ) {
			objThis.m_ActivatedEnemies1 = g_App.GetGameObject().GetFlyingEnemiesByIndex(objThis.m_nCurAction.value);

			// 바큘라라면 특수 처리 시작
			if( objThis.m_ActivatedEnemies1.enemy1 == OBJECT_BACURA &&
				objThis.m_ActivatedEnemies1.num1 != 0 ) { //단발 바큘라는 일반 처리
				objThis.m_bBacura = true;
				objThis.m_nBacuras = 1;
				objThis.m_nMaxBacuras = objThis.m_ActivatedEnemies1.num1;
				objThis.m_nBacuraEndPos = objThis.m_ActivatedEnemies1.opt1;
				objThis.m_ActivatedEnemies1.enemy1 = 0; //일반 처리하지 않기 위해
			}
		}
		objThis.m_nCurAction.type |= ACTION_TYPE_CONTINUE;
	}

	Area.prototype.Initialize = function( nGroundNo ) {
		//if( this.m_nGroundNo == 0 )
		if( nGroundNo == 0 )
			this.m_nodeGround = document.getElementById('idGround0');
		else
			this.m_nodeGround = document.getElementById('idGround1');
		this.m_nGroundNo = nGroundNo;

		this.m_nMapOftY = -2048;
		this.m_nodeGround.style.backgroundPosition = this.m_nMapOftX + 'px ' + this.m_nMapOftY + 'px';
		this.m_nodeGround.style.visibility = 'hidden';
		this.DeleteAllObjects();

		for( let i=0; i<256; i++ ) {
			this.m_nActionAr[i] = {type:0, value:0};
		}
		this.m_ActivatedEnemies1 = {enemy1:0, num1:0, opt1:0, enemy2:0, num2:0, opt2:0 };
		this.m_ActivatedEnemies2 = {enemy1:0, num1:0, opt1:0, enemy2:0, num2:0, opt2:0 };
	}

	this.GetAreaNo = function() {
		return this.m_nAreaNo;
	}

	this.GetNode = function() {
		return this.m_nodeGround;
	}

	this.GetScrollPos = function() {
		let nPos = ((2048+this.m_nMapOftY)/8)|0;
		if( nPos > 255 )
			nPos = 255;
		return nPos;
	}

	this.GetCurAction = function() {
		return this.m_nCurAction;
	}

	this.Show = function( bShow ) {
		if( this.m_nodeGround ) {
			let strVisibility = bShow? 'visible' : 'hidden';
			this.m_nodeGround.style.visibility = strVisibility;
		}
	}

	this.Scroll = function( bCurrent ) {
		if( bCurrent ) {
			if( this.m_nMapOftY >= 0 ) {
				const objMap = this.m_objApp.GetMapObject();
				objMap.SetNextArea();
			}
			else {
				scroll(this);
				action(this);
			}
		}
		else {
			if( this.m_nMapOftY <= SCREEN_HEIGHT )
				scroll(this);
		}
	}

	this.DeleteObject = function( obj ) {
		for( let i=this.m_objObjectAr.length-1; i>=0; i-- ) {
			if( obj == this.m_objObjectAr[i] ) {
				obj.Delete();
				this.m_objObjectAr.splice( i, 1 );
				break;
			}
		}
	}

	this.DeleteAllObjects = function() {
		for( let i=this.m_objObjectAr.length-1; i>=0; i-- ) {
			let obj = this.m_objObjectAr[i];
			obj.Delete();
			obj = null;
		}
		this.m_objObjectAr.splice(0,this.m_objObjectAr.length);
	}
	
	this.RegisterObject = function( obj, nX, nY ) {
		this.m_objObjectAr[this.m_objObjectAr.length] = obj;
		obj.Create( this, nX, nY-2048 );
		obj.Show( true );
	}
}

_inherit( Area00, Area );
function Area00( objApp ) {
	this.base(objApp, 0);
	this.m_nMapOftX = 0;

	Area00.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		this.m_nodeGround = document.getElementById('idForest');
		this.m_nMapOftY = -(393-288);
		this.m_nodeGround.style.backgroundPosition = '0px ' + this.m_nMapOftY + 'px';
		obj  = new Copyright;   this.RegisterObject( obj,  212, -32+2048 );
	}
}

_inherit( Area01, Area );
function Area01( objApp ) {
	this.base(objApp, 1);
	this.m_nMapOftX = -512;

	Area01.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj, obj2;
		obj  = new Sol;         this.RegisterObject( obj,   17, 159 );
		obj  = new BozaLogram;  this.RegisterObject( obj,  120, 154 );
		obj2 = new Logram;      this.RegisterObject( obj2, 108, 154 );      obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2, 120, 142 );      obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2, 120, 166 );      obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2, 132, 154 );      obj.AddLogram(obj2);
		obj  = new Zolbak;      this.RegisterObject( obj,  120, 222 );
		obj  = new Logram;      this.RegisterObject( obj,  136, 238 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 254 );
		obj  = new Logram;      this.RegisterObject( obj,  168, 270 );
		obj  = new Zolbak;      this.RegisterObject( obj,  184, 286 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 254 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 454 );
		obj  = new Barra;       this.RegisterObject( obj,  128, 454 );
		obj  = new Special;     this.RegisterObject( obj,  104,   6+512 );
		obj  = new Grobda1;     this.RegisterObject( obj,  134, 191+512 );
		obj  = new Grobda1;     this.RegisterObject( obj,  134, 215+512 );
		obj  = new Grobda1;     this.RegisterObject( obj,  134, 239+512 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 303+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  112, 422+512 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 438+512 );
		obj  = new Logram;      this.RegisterObject( obj,  144, 222+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 238+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  136, 302+1024 );
		obj  = new Barra;       this.RegisterObject( obj,  136, 318+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   96, 406+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 406+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   96, 150+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,  112, 150+1536 );

		this.m_nActionAr[  2] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 20] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 40] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 60] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 72] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 96] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[100] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B2};
		this.m_nActionAr[108] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[124] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[140] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[160] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B2};
		this.m_nActionAr[164] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[184] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[196] = {type:ACTION_TYPE_OBJECT, value:128};
		this.m_nActionAr[232] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area02, Area );
function Area02( objApp ) {
	this.base(objApp, 2);
	this.m_nMapOftX = -800;

	Area02.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Zolbak;      this.RegisterObject( obj,   48, 126 );
		obj  = new Derota;      this.RegisterObject( obj,   64, 126 );
		obj  = new Derota;      this.RegisterObject( obj,   80, 126 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 126 );
		obj  = new Logram;      this.RegisterObject( obj,   64, 158 );
		obj  = new Logram;      this.RegisterObject( obj,   80, 158 );
		obj  = new Barra;       this.RegisterObject( obj,  144, 222 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 238 );
		obj  = new Barra;       this.RegisterObject( obj,  112, 254 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 270 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 286 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 430 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 430 );
		obj  = new Sol;         this.RegisterObject( obj,  113, 471 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 287+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  112, 334+512 );
		obj  = new Logram;      this.RegisterObject( obj,  128, 334+512 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 350+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 350+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 430+512 );
		obj  = new Logram;      this.RegisterObject( obj,  120, 142+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 254+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 254+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  120, 382+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  112,  46+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  128,  46+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 126+1536 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 126+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 206+1536 );
		obj  = new Barra;       this.RegisterObject( obj,  128, 206+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,  120, 278 );      obj.SetMotionData(6);
		obj  = new Domogram;    this.RegisterObject( obj,  172,  15+512 );  obj.SetMotionData(5);
		obj  = new Domogram;    this.RegisterObject( obj,   51,  34+512 );  obj.SetMotionData(4);
		obj  = new Domogram;    this.RegisterObject( obj,   17, 294+512 );  obj.SetMotionData(3);
		obj  = new Domogram;    this.RegisterObject( obj,   76, 295+1024 ); obj.SetMotionData(2);
		obj  = new Domogram;    this.RegisterObject( obj,   76, 455+1024 ); obj.SetMotionData(1);
		obj  = new Domogram;    this.RegisterObject( obj,   68, 295+1536 ); obj.SetMotionData(0);

		this.m_nActionAr[  0] = {type:ACTION_TYPE_OBJECT, value:129};
		this.m_nActionAr[ 92] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[108] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[124] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[164] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[180] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[204] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[220] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[228] = {type:ACTION_TYPE_OBJECT, value:129};
		this.m_nActionAr[232] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area03, Area );
function Area03( objApp ) {
	this.base(objApp, 3);
	this.m_nMapOftX = -128;

	Area03.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj, obj2;
		obj  = new GaruDerota;  this.RegisterObject( obj,  124, 155 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 159 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 222 );
		obj  = new Logram;      this.RegisterObject( obj,  129, 222 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 222 );
		obj  = new Zolbak;      this.RegisterObject( obj,   81, 326 );
		obj  = new Barra;       this.RegisterObject( obj,   32, 406 );
		obj  = new Logram;      this.RegisterObject( obj,   56, 406 );
		obj  = new Zolbak;      this.RegisterObject( obj,   80, 406 );
		obj  = new Barra;       this.RegisterObject( obj,  104, 406 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16,  46+512 );
		obj  = new Logram;      this.RegisterObject( obj,   64,  46+512 );
		obj  = new Grobda3;     this.RegisterObject( obj,  104, 158+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 190+512 );
		obj  = new Logram;      this.RegisterObject( obj,  128, 254+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 318+512 );
		obj  = new Logram;      this.RegisterObject( obj,   64, 318+512 );
		obj  = new Barra;       this.RegisterObject( obj,   80,  30+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96,  30+1024 );
		obj  = new Special;     this.RegisterObject( obj,  104,  70+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   96,  94+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   96, 110+1024 );
		obj  = new Sol;         this.RegisterObject( obj,    1, 223+1024 );
		obj  = new GaruBarra;   this.RegisterObject( obj,   28, 250+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64, 446+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   64, 462+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 350+1536 );

		this.m_nActionAr[  1] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[  6] = {type:ACTION_TYPE_OBJECT, value:130}; //바큘라x10 120까지
		this.m_nActionAr[108] = {type:ACTION_TYPE_OBJECT, value:131};
		this.m_nActionAr[124] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[132] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[156] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[168] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[180] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[188] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[213] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area04, Area );
function Area04( objApp ) {
	this.base(objApp, 4);
	this.m_nMapOftX = -688;

	Area04.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Logram;      this.RegisterObject( obj,  160, 286+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  144, 310+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 334+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144, 350+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   48,  14+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64,  14+1536 );
		obj  = new Sol;         this.RegisterObject( obj,  129,  14+1536 );
		obj  = new Barra;       this.RegisterObject( obj,  128, 190+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144, 190+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,  188, 294+1024 ); obj.SetMotionData(11);
		obj  = new Domogram;    this.RegisterObject( obj,  188, 471+1024 ); obj.SetMotionData(10);
		obj  = new Domogram;    this.RegisterObject( obj,  100, 119+1536 ); obj.SetMotionData(9);
		obj  = new Domogram;    this.RegisterObject( obj,  180, 263+1536 ); obj.SetMotionData(8);
		obj  = new Domogram;    this.RegisterObject( obj,   68, 343+1536 ); obj.SetMotionData(7);

		this.m_nActionAr[  0] = {type:ACTION_TYPE_OBJECT, value:132};
		this.m_nActionAr[ 52] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 68] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 96] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[116] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[124] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[140] = {type:ACTION_TYPE_OBJECT, value:133};
		this.m_nActionAr[143] = {type:ACTION_TYPE_OBJECT, value:134};
		this.m_nActionAr[144] = {type:ACTION_TYPE_OBJECT, value:133};
		this.m_nActionAr[176] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[197] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[205] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[210] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[212] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[215] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[223] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[239] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[255] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area05, Area );
function Area05( objApp ) {
	this.base(objApp, 5);
	this.m_nMapOftX = -288;

	Area05.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 158 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   92, 154 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 158 );
		obj  = new Sol;         this.RegisterObject( obj,  161, 367 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 398 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32,  62+512 );
		obj  = new Logram;      this.RegisterObject( obj,   96, 270+512 );
		obj  = new Barra;       this.RegisterObject( obj,   96, 286+512 );
		obj  = new Logram;      this.RegisterObject( obj,   96, 302+512 );
		obj  = new Barra;       this.RegisterObject( obj,   96, 318+512 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 367+512 );
		obj  = new Special;     this.RegisterObject( obj,  104, 445+512 );
		obj  = new Grobda2;     this.RegisterObject( obj,   32, 133+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,   64, 150+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,   96, 166+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,  160, 198+1024 );  obj.m_bNeedCinder = false;
		obj  = new GaruDerota;  this.RegisterObject( obj,  116, 267+1024 );
		obj  = new Grobda3;     this.RegisterObject( obj,  192, 350+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda3;     this.RegisterObject( obj,  128, 382+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,   64, 422+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,  128, 453+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,   64, 486+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda1;     this.RegisterObject( obj,   32, 111+1536 );  obj.m_bNeedCinder = false;
		obj  = new Barra;       this.RegisterObject( obj,   64, 190+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   80, 189+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64, 206+1536 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 206+1536 );
		obj  = new GaruDerota;  this.RegisterObject( obj,  109, 187+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,   49, 206 );      obj.SetMotionData(16);
		obj  = new Domogram;    this.RegisterObject( obj,  175, 230 );      obj.SetMotionData(15);
		obj  = new Domogram;    this.RegisterObject( obj,   49, 254 );      obj.SetMotionData(14);
		obj  = new Domogram;    this.RegisterObject( obj,   25, 372 );      obj.SetMotionData(13);
		obj  = new Domogram;    this.RegisterObject( obj,  128, 375+512 );  obj.SetMotionData(12);

		this.m_nActionAr[  2] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 16] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 28] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 52] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 68] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 88] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[108] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[132] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[156] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[180] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[192] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[208] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area06, Area );
function Area06( objApp ) {
	this.base(objApp, 6);
	this.m_nMapOftX = -592;

	Area06.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj, obj2;
		obj  = new GaruDerota;  this.RegisterObject( obj,   28, 155 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   60, 155 );
		obj  = new Logram;      this.RegisterObject( obj,   48, 254 );
		obj  = new Logram;      this.RegisterObject( obj,   80, 270 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 286 );
		obj  = new Zolbak;      this.RegisterObject( obj,  112, 382 );
		//obj  = new Bridge(1);   this.RegisterObject( obj,  148, 503 );
		obj  = new Sol;         this.RegisterObject( obj,   14,  94+512 );
		obj  = new Logram;      this.RegisterObject( obj,   96,  94+512 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 142+512 );
		obj  = new Logram;      this.RegisterObject( obj,  112, 206+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 222+512 );
		obj  = new Grobda4;     this.RegisterObject( obj,  152, 294+512 );
		obj  = new Grobda4;     this.RegisterObject( obj,  128, 326+512 );
		obj  = new Grobda4;     this.RegisterObject( obj,  176, 326+512 );
		obj  = new Grobda7;     this.RegisterObject( obj,  152, 358+512 );
		obj  = new BozaLogram;  this.RegisterObject( obj,   32, 426+512 );
		obj2 = new Logram;      this.RegisterObject( obj2,  20, 426+512 );  obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2,  32, 415+512 );  obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2,  32, 438+512 );  obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2,  44, 426+512 );  obj.AddLogram(obj2);
		obj  = new Sol;         this.RegisterObject( obj,  177,  63+1024 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   60, 219+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   48, 310+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64, 310+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   16, 406+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   32, 406+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   16, 142+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 158+1536 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 382+1536 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 382+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,  152, 503 );       obj.SetMotionData(23);
		obj  = new Domogram;    this.RegisterObject( obj,   17,  42+512 );   obj.SetMotionData(22);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 159+512 );   obj.SetMotionData(21);
		obj  = new Domogram;    this.RegisterObject( obj,  196, 455+1024 );  obj.SetMotionData(20);
		obj  = new Domogram;    this.RegisterObject( obj,  196,  71+1536 );  obj.SetMotionData(19);
		obj  = new Domogram;    this.RegisterObject( obj,  168, 199+1536 );  obj.SetMotionData(18);
		obj  = new Domogram;    this.RegisterObject( obj,  164, 327+1536 );  obj.SetMotionData(17);

		this.m_nActionAr[100] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[124] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area07, Area );
function Area07( objApp ) {
	this.base(objApp, 7);
	this.m_nMapOftX = 0;

	Area07.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Sol;         this.RegisterObject( obj,  193, 111 );
		obj  = new Grobda9;     this.RegisterObject( obj,   64, 205 );
		obj  = new Grobda8;     this.RegisterObject( obj,   32, 326 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 406 );
		obj  = new Zolbak;      this.RegisterObject( obj,  192, 406 );
		obj  = new Special;     this.RegisterObject( obj,  104, 278+512 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 318+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 318+512 );
		obj  = new Barra;       this.RegisterObject( obj,  144, 318+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  192, 318+512 );
		obj  = new Sol;         this.RegisterObject( obj,    9, 447+512 );
		obj  = new Logram;      this.RegisterObject( obj,  160, 494+512 );
		obj  = new Barra;       this.RegisterObject( obj,  160, 190+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144, 206+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  128, 222+1024 );
		obj  = new Barra;       this.RegisterObject( obj,  112, 238+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   96, 350+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 366+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,  121, 423+1024 );  obj.SetMotionData(29);
		obj  = new Domogram;    this.RegisterObject( obj,  145, 447+1024 );  obj.SetMotionData(28);
		obj  = new Domogram;    this.RegisterObject( obj,  160, 471+1024 );  obj.SetMotionData(27);
		obj  = new Domogram;    this.RegisterObject( obj,  160, 495+1024 );  obj.SetMotionData(26);
		obj  = new Domogram;    this.RegisterObject( obj,  152,   7+1536 );  obj.SetMotionData(25);
		obj  = new Domogram;    this.RegisterObject( obj,  128,  31+1536 );  obj.SetMotionData(24);

		this.m_nActionAr[  1] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[  6] = {type:ACTION_TYPE_OBJECT, value:159}; //바큘라x8 145까지
		this.m_nActionAr[124] = {type:ACTION_TYPE_OBJECT, value:135}; //단발 카피
		this.m_nActionAr[181] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[186] = {type:ACTION_TYPE_OBJECT, value:160}; //바큘라x12 239까지
		this.m_nActionAr[232] = {type:ACTION_TYPE_OBJECT, value:136}; //단발 테라지
	}
}

_inherit( Area08, Area );
function Area08( objApp ) {
	this.base(objApp, 8);
	this.m_nMapOftX = -768;

	Area08.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Derota;      this.RegisterObject( obj,   88, 126 );
		obj  = new Derota;      this.RegisterObject( obj,  152, 126 );
		obj  = new Zolbak;      this.RegisterObject( obj,   88, 174 );
		obj  = new Zolbak;      this.RegisterObject( obj,  120, 174 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 174 );
		obj  = new Derota;      this.RegisterObject( obj,   40, 414 );
		obj  = new Derota;      this.RegisterObject( obj,  152, 414 );
		obj  = new Grobda2;     this.RegisterObject( obj,  204, 246+512 );
		obj  = new Grobda2;     this.RegisterObject( obj,  204, 266+512 );
		obj  = new Logram;      this.RegisterObject( obj,  136, 382+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 382+512 );
		obj  = new Sol;         this.RegisterObject( obj,   17, 415+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144, 126+1024 );
		obj  = new Logram;      this.RegisterObject( obj,  160, 126+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 382+1024 );
		obj  = new Barra;       this.RegisterObject( obj,  160,   0+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  128,  38+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  192,  38+1536 );
		obj  = new GaruDerota;  this.RegisterObject( obj,  148,  27+1536 );
		obj  = new Barra;       this.RegisterObject( obj,  160,  70+1536 );
		obj  = new Logram;      this.RegisterObject( obj,   72, 222+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  128, 222+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   48, 246+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 246+1536 );
		obj  = new Logram;      this.RegisterObject( obj,   24, 270+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  176, 270+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,   41, 183 );       obj.SetMotionData(46);
		obj  = new Domogram;    this.RegisterObject( obj,   65, 207 );       obj.SetMotionData(45);
		obj  = new Domogram;    this.RegisterObject( obj,   84, 231 );       obj.SetMotionData(44);
		obj  = new Domogram;    this.RegisterObject( obj,  184, 247 );       obj.SetMotionData(43);
		obj  = new Domogram;    this.RegisterObject( obj,  160, 271 );       obj.SetMotionData(42);
		obj  = new Domogram;    this.RegisterObject( obj,  136, 295 );       obj.SetMotionData(41);
		obj  = new Domogram;    this.RegisterObject( obj,   87,  33+512 );   obj.SetMotionData(40);
		obj  = new Domogram;    this.RegisterObject( obj,  111,  34+512 );   obj.SetMotionData(39);
		obj  = new Domogram;    this.RegisterObject( obj,  153,  34+512 );   obj.SetMotionData(38);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 319+512 );   obj.SetMotionData(37);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 295+512 );   obj.SetMotionData(37);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 319+512 );   obj.SetMotionData(37);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 343+512 );   obj.SetMotionData(37);
		obj  = new Domogram;    this.RegisterObject( obj,   92, 487+512 );   obj.SetMotionData(36);
		obj  = new Domogram;    this.RegisterObject( obj,  100, 135+1024 );  obj.SetMotionData(35);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 133+1024 );  obj.SetMotionData(34);
		obj  = new Domogram;    this.RegisterObject( obj,   58, 278+1024 );  obj.SetMotionData(33);
		obj  = new Domogram;    this.RegisterObject( obj,  108, 278+1024 );  obj.SetMotionData(32);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 278+1024 );  obj.SetMotionData(31);
		obj  = new Domogram;    this.RegisterObject( obj,  195, 345+1536 );  obj.SetMotionData(30);

		this.m_nActionAr[ 12] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 13] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 68] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 87] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[100] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[124] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[140] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area09, Area );
function Area09( objApp ) {
	this.base(objApp, 9);
	this.m_nMapOftX = -464;

	Area09.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new GaruDerota;  this.RegisterObject( obj,  140, 139+1536 );
		obj  = new Sol;         this.RegisterObject( obj,  161, 351+1536 );
		obj  = new Sol;         this.RegisterObject( obj,  129, 367+1536 );
		obj  = new Sol;         this.RegisterObject( obj,   97, 383+1536 );
		obj  = new Sol;         this.RegisterObject( obj,   65, 399+1536 );

		this.m_nActionAr[  4] = {type:ACTION_TYPE_OBJECT, value:137};
		this.m_nActionAr[ 21] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 28] = {type:ACTION_TYPE_OBJECT, value:138};
		this.m_nActionAr[ 44] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 46] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 48] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 56] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 60] = {type:ACTION_TYPE_OBJECT, value:139};
		this.m_nActionAr[ 64] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 76] = {type:ACTION_TYPE_OBJECT, value:140};
		this.m_nActionAr[120] = {type:ACTION_TYPE_OBJECT, value:141};
		this.m_nActionAr[127] = {type:ACTION_TYPE_OBJECT, value:134};
		this.m_nActionAr[140] = {type:ACTION_TYPE_OBJECT, value:142};
		this.m_nActionAr[156] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[164] = {type:ACTION_TYPE_OBJECT, value:143};
		this.m_nActionAr[180] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[192] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[208] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[224] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[239] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area10, Area );
function Area10( objApp ) {
	this.base(objApp, 10);
	this.m_nMapOftX = -64;

	Area10.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Derota;      this.RegisterObject( obj,   16, 126 );
		obj  = new Derota;      this.RegisterObject( obj,  192, 126 );
		obj  = new Derota;      this.RegisterObject( obj,   16, 174 );
		obj  = new Derota;      this.RegisterObject( obj,  192, 174 );
		obj  = new GaruBarra;   this.RegisterObject( obj,   92, 187 );
		obj  = new GaruBarra;   this.RegisterObject( obj,   92, 235 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144, 318 );
		obj  = new Barra;       this.RegisterObject( obj,   96, 406 );
		obj  = new Logram;      this.RegisterObject( obj,  128, 406 );
		obj  = new Barra;       this.RegisterObject( obj,  160, 406 );
		obj  = new Sol;         this.RegisterObject( obj,   33,  -1+512 );
		obj  = new Sol;         this.RegisterObject( obj,   65,  -1+512 );
		obj  = new Sol;         this.RegisterObject( obj,   97,  -1+512 );
		obj  = new Sol;         this.RegisterObject( obj,  129,  -1+512 );
		obj  = new Sol;         this.RegisterObject( obj,   33,  31+512 );
		obj  = new Sol;         this.RegisterObject( obj,   65,  31+512 );
		obj  = new Sol;         this.RegisterObject( obj,   97,  31+512 );
		obj  = new Sol;         this.RegisterObject( obj,  129,  31+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 350+512 );
		obj  = new Barra;       this.RegisterObject( obj,   64, 350+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 350+512 );
		obj  = new Barra;       this.RegisterObject( obj,  144,  30+1024 );
		obj  = new Barra;       this.RegisterObject( obj,  160,  30+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160,  94+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 110+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 270+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 270+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   64, 286+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 302+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 302+1024 );
		
		obj  = new Domogram;    this.RegisterObject( obj,   89, 262+512 );    obj.SetMotionData(55);
		obj  = new Domogram;    this.RegisterObject( obj,   33, 430+1024 );   obj.SetMotionData(54);
		obj  = new Domogram;    this.RegisterObject( obj,   72, 430+1024 );   obj.SetMotionData(53);
		obj  = new Domogram;    this.RegisterObject( obj,  112, 430+1024 );   obj.SetMotionData(52);
		obj  = new Domogram;    this.RegisterObject( obj,   23, 470+1024 );   obj.SetMotionData(51);
		obj  = new Domogram;    this.RegisterObject( obj,  121, 470+1024 );   obj.SetMotionData(50);
		obj  = new Domogram;    this.RegisterObject( obj,   48, 494+1024 );   obj.SetMotionData(49);
		obj  = new Domogram;    this.RegisterObject( obj,   72, 494+1024 );   obj.SetMotionData(48);
		obj  = new Domogram;    this.RegisterObject( obj,   97, 494+1024 );   obj.SetMotionData(47);

		this.m_nActionAr[  0] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[  8] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 12] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 16] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 28] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 36] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 48] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[100] = {type:ACTION_TYPE_OBJECT, value:141};
		this.m_nActionAr[116] = {type:ACTION_TYPE_OBJECT, value:141};
		this.m_nActionAr[132] = {type:ACTION_TYPE_OBJECT, value:141};
	}
}

_inherit( Area11, Area );
function Area11( objApp ) {
	this.base(objApp, 11);
	this.m_nMapOftX = -688;

	Area11.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj, obj2;
		obj  = new Sol;         this.RegisterObject( obj,  121, 143 );
		obj  = new Sol;         this.RegisterObject( obj,  145, 167 );
		obj  = new Sol;         this.RegisterObject( obj,  169, 191 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 215 );
		obj  = new Barra;       this.RegisterObject( obj,   16, 158 );
		obj  = new Barra;       this.RegisterObject( obj,   64, 158 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 206 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64, 206 );
		obj  = new GaruDerota;  this.RegisterObject( obj,  116, 283 );
		obj  = new Barra;       this.RegisterObject( obj,   16, 286+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 302+512 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 318+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64, 334+512 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 350+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 366+512 );
		obj  = new Barra;       this.RegisterObject( obj,  112, 382+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 398+512 );
		obj  = new Sol;         this.RegisterObject( obj,  113,   7+1024 );
		obj  = new Sol;         this.RegisterObject( obj,  113,  63+1024 );
		obj  = new Grobda8;     this.RegisterObject( obj,  188, 294+1024 );
		obj  = new Grobda8;     this.RegisterObject( obj,  188, 358+1024 );
		obj  = new Grobda5;     this.RegisterObject( obj,  100, 414+1024 );
		obj  = new Grobda2;     this.RegisterObject( obj,  100, 454+1024 );
		obj  = new Grobda2;     this.RegisterObject( obj,  100, 486+1024 );
		obj  = new Grobda2;     this.RegisterObject( obj,  100,   5+1536 );
		obj  = new Logram;      this.RegisterObject( obj,   48,  62+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64,  62+1536 );
		obj  = new BozaLogram;  this.RegisterObject( obj,  128, 314+1536 );
		obj2 = new Logram;      this.RegisterObject( obj2, 128, 302+1536 ); obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2, 116, 314+1536 ); obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2, 140, 314+1536 ); obj.AddLogram(obj2);
		obj2 = new Logram;      this.RegisterObject( obj2, 128, 326+1536 ); obj.AddLogram(obj2);
		
		obj  = new Domogram;    this.RegisterObject( obj,    9, 322 );      obj.SetMotionData(60);
		obj  = new Domogram;    this.RegisterObject( obj,  172, 423+512 );  obj.SetMotionData(59);
		obj  = new Domogram;    this.RegisterObject( obj,  180,  70+1536 ); obj.SetMotionData(58);
		obj  = new Domogram;    this.RegisterObject( obj,  180, 207+1536 ); obj.SetMotionData(57);
		obj  = new Domogram;    this.RegisterObject( obj,   68, 271+1536 ); obj.SetMotionData(56);

		this.m_nActionAr[  0] = {type:ACTION_TYPE_OBJECT, value:136};
		this.m_nActionAr[ 14] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[ 19] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[ 23] = {type:ACTION_TYPE_OBJECT, value:161}; //바큘라x10 60까지
		this.m_nActionAr[ 97] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[100] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[110] = {type:ACTION_TYPE_OBJECT, value:162}; //바큘라x10 139까지
		this.m_nActionAr[116] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[152] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[156] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A2};
		this.m_nActionAr[178] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[183] = {type:ACTION_TYPE_OBJECT, value:163}; //바큘라x10 231까지
		this.m_nActionAr[188] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[196] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area12, Area );
function Area12( objApp ) {
	this.base(objApp, 12);
	this.m_nMapOftX = -768;

	Area12.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new GaruDerota;  this.RegisterObject( obj,  108, 155 );
		obj  = new Grobda6;     this.RegisterObject( obj,  204, 172 );
		obj  = new Grobda3;     this.RegisterObject( obj,  204, 222 );
		obj  = new Grobda3;     this.RegisterObject( obj,  204, 254 );
		obj  = new Grobda3;     this.RegisterObject( obj,  204, 286 );
		obj  = new Derota;      this.RegisterObject( obj,  168, 310 );
		obj  = new Derota;      this.RegisterObject( obj,  152, 326 );
		obj  = new Derota;      this.RegisterObject( obj,  136, 342 );
		obj  = new Derota;      this.RegisterObject( obj,  120, 358 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 414 );
		obj  = new Zolbak;      this.RegisterObject( obj,   48, 414 );
		obj  = new Derota;      this.RegisterObject( obj,   56, 142+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 350+512 );
		obj  = new Barra;       this.RegisterObject( obj,  144, 350+512 );
		obj  = new Barra;       this.RegisterObject( obj,  128, 414+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144, 414+512 );
		obj  = new Sol;         this.RegisterObject( obj,    1,  63+1024 );
		obj  = new Sol;         this.RegisterObject( obj,   17,  63+1024 );
		obj  = new Sol;         this.RegisterObject( obj,    1,  79+1024 );
		obj  = new Sol;         this.RegisterObject( obj,   17,  79+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 430+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 446+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   80, 446+1024 );
		obj  = new Barra;       this.RegisterObject( obj,   48, 462+1024 );
		obj  = new Grobda2;     this.RegisterObject( obj,  152,  37+1536 );
		obj  = new Grobda2;     this.RegisterObject( obj,  168,  37+1536 );
		obj  = new Grobda2;     this.RegisterObject( obj,  152,  53+1536 );
		obj  = new Grobda2;     this.RegisterObject( obj,  168,  53+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 254+1536 );
		obj  = new Derota;      this.RegisterObject( obj,   48, 254+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  152, 254+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,  168, 254+1536 );
		obj  = new Derota;      this.RegisterObject( obj,   32, 270+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   48, 270+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,  152, 270+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  168, 270+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,  134, 134 );      obj.SetMotionData(72);
		obj  = new Domogram;    this.RegisterObject( obj,   88, 175 );      obj.SetMotionData(71);
		obj  = new Domogram;    this.RegisterObject( obj,   65,  34+512 );  obj.SetMotionData(70);
		obj  = new Domogram;    this.RegisterObject( obj,   89,  34+512 );  obj.SetMotionData(69);
		obj  = new Domogram;    this.RegisterObject( obj,  113,  34+512 );  obj.SetMotionData(68);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 390+512 );  obj.SetMotionData(67);
		obj  = new Domogram;    this.RegisterObject( obj,  100, 135+1024 ); obj.SetMotionData(66);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 247+1024 ); obj.SetMotionData(65);
		obj  = new Domogram;    this.RegisterObject( obj,  204, 263+1024 ); obj.SetMotionData(65);
		obj  = new Domogram;    this.RegisterObject( obj,  108, 295+1024 ); obj.SetMotionData(64);
		obj  = new Domogram;    this.RegisterObject( obj,   20, 391+1024 ); obj.SetMotionData(63);
		obj  = new Domogram;    this.RegisterObject( obj,  100, 203+1536 ); obj.SetMotionData(62);
		obj  = new Domogram;    this.RegisterObject( obj,  195, 346+1536 ); obj.SetMotionData(61);

		this.m_nActionAr[ 12] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 92] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[103] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[120] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[124] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[140] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[148] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[164] = {type:ACTION_TYPE_END,    value:0};

	}
}

_inherit( Area13, Area );
function Area13( objApp ) {
	this.base(objApp, 13);
	this.m_nMapOftX = -352;

	Area13.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Derota;      this.RegisterObject( obj,   32, 406 );
		obj  = new Sol;         this.RegisterObject( obj,  177, 487 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 487 );
		obj  = new Zolbak;      this.RegisterObject( obj,   80, 302+512 );
		obj  = new Logram;      this.RegisterObject( obj,   64, 318+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   48, 334+512 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 350+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 366+512 );
		obj  = new Grobda2;     this.RegisterObject( obj,   49, 502+512 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,   80,  21+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,  112,  54+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda8;     this.RegisterObject( obj,  144,  86+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,  176, 150+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda8;     this.RegisterObject( obj,  144, 182+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,  112, 214+1024 );  obj.m_bNeedCinder = false;
		obj  = new Grobda2;     this.RegisterObject( obj,   80, 246+1024 );  obj.m_bNeedCinder = false;
		obj  = new GaruDerota;  this.RegisterObject( obj,   44, 363+1024 );
		obj  = new GaruDerota;  this.RegisterObject( obj,  140, 363+1024 );
		obj  = new Derota;      this.RegisterObject( obj,   32, 174+1536 );
		obj  = new Derota;      this.RegisterObject( obj,   32, 222+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,  112, 286+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 302+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   80, 318+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   64, 334+1536 );
		obj  = new Derota;      this.RegisterObject( obj,   64, 382+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  112, 382+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  192, 414+1536 );

		obj  = new Domogram;    this.RegisterObject( obj,   32, 255 );      obj.SetMotionData(76);
		obj  = new Domogram;    this.RegisterObject( obj,  176, 255 );      obj.SetMotionData(75);
		obj  = new Domogram;    this.RegisterObject( obj,   17, 270 );      obj.SetMotionData(74);
		obj  = new Domogram;    this.RegisterObject( obj,  191, 270 );      obj.SetMotionData(73);

		this.m_nActionAr[ 28] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 44] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 68] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 84] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[108] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[132] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[156] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[160] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[164] = {type:ACTION_TYPE_OBJECT, value:144};
		this.m_nActionAr[188] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[196] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[220] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[228] = {type:ACTION_TYPE_OBJECT, value:145};
		this.m_nActionAr[241] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area14, Area );
function Area14( objApp ) {
	this.base(objApp, 14);
	this.m_nMapOftX = -128;

	Area14.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );

		this.m_nActionAr[  0] = {type:ACTION_TYPE_OBJECT, value:146};
		this.m_nActionAr[ 16] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[ 21] = {type:ACTION_TYPE_OBJECT, value:158}; //단발 바큘라
		this.m_nActionAr[ 24] = {type:ACTION_TYPE_OBJECT, value:147};
		this.m_nActionAr[ 31] = {type:ACTION_TYPE_OBJECT, value:134}; //안도어 제네시스
		this.m_nActionAr[ 36] = {type:ACTION_TYPE_OBJECT, value:148};
		this.m_nActionAr[ 52] = {type:ACTION_TYPE_OBJECT, value:149};
		this.m_nActionAr[ 68] = {type:ACTION_TYPE_OBJECT, value:150};
		this.m_nActionAr[ 94] = {type:ACTION_TYPE_OBJECT, value:151}; //시오나이트
		this.m_nActionAr[128] = {type:ACTION_TYPE_OBJECT, value:152};
		this.m_nActionAr[140] = {type:ACTION_TYPE_OBJECT, value:153};
		this.m_nActionAr[152] = {type:ACTION_TYPE_OBJECT, value:154};
		this.m_nActionAr[155] = {type:ACTION_TYPE_OBJECT, value:134};
		this.m_nActionAr[164] = {type:ACTION_TYPE_OBJECT, value:155};
		this.m_nActionAr[180] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[196] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[200] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[204] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[220] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[228] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[255] = {type:ACTION_TYPE_END,    value:0};
	}
}

_inherit( Area15, Area );
function Area15( objApp ) {
	this.base(objApp, 15);
	this.m_nMapOftX = -592;

	Area15.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		let obj;
		obj  = new Grobda8;     this.RegisterObject( obj,  188, 134 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   28, 139 );
		obj  = new Grobda8;     this.RegisterObject( obj,  188, 166 );
		obj  = new Derota;      this.RegisterObject( obj,  112, 190 );
		obj  = new Grobda2;     this.RegisterObject( obj,  188, 197 );
		obj  = new Derota;      this.RegisterObject( obj,   80, 222 );
		obj  = new Derota;      this.RegisterObject( obj,  112, 222 );
		obj  = new Derota;      this.RegisterObject( obj,  144, 222 );
		obj  = new Zolbak;      this.RegisterObject( obj,   80, 414 );
		obj  = new Logram;      this.RegisterObject( obj,   48, 446 );
		//obj  = new Bridge(0);   this.RegisterObject( obj,  148, 498 );
		obj  = new Zolbak;      this.RegisterObject( obj,  160, 158+512 );
		obj  = new Logram;      this.RegisterObject( obj,  128, 190+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 222+512 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 190+512 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   20, 419+512 );
		obj  = new Logram;      this.RegisterObject( obj,   64, 230+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   80, 230+1024 );
		obj  = new Sol;         this.RegisterObject( obj,   49, 303+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 406+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 406+1024 );
		obj  = new Sol;         this.RegisterObject( obj,  145, 406+1024 );
		obj  = new Grobda8;     this.RegisterObject( obj,  196, 446+1024 );
		obj  = new Grobda2;     this.RegisterObject( obj,  196, 478+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144,  22+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  144, 118+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   16, 142+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   32, 158+1536 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 270+1536 );
		obj  = new Sol;         this.RegisterObject( obj,   17, 343+1536 );
 		obj  = new Logram;      this.RegisterObject( obj,   96, 342+1536 );
 		
 		obj  = new Domogram;    this.RegisterObject( obj,   21,  40+512 );  obj.SetMotionData(90);
 		obj  = new Domogram;    this.RegisterObject( obj,  156,  40+512 );  obj.SetMotionData(89);
 		obj  = new Domogram;    this.RegisterObject( obj,   52,  95+512 );  obj.SetMotionData(88);
 		obj  = new Domogram;    this.RegisterObject( obj,   60, 247+512 );  obj.SetMotionData(87);
 		obj  = new Domogram;    this.RegisterObject( obj,  120, 326+512 );  obj.SetMotionData(86);
 		obj  = new Domogram;    this.RegisterObject( obj,  185, 326+512 );  obj.SetMotionData(85);
 		obj  = new Domogram;    this.RegisterObject( obj,  136, 374+512 );  obj.SetMotionData(84);
 		obj  = new Domogram;    this.RegisterObject( obj,  169, 374+512 );  obj.SetMotionData(83);
 		obj  = new Domogram;    this.RegisterObject( obj,  196,  -1+1536 ); obj.SetMotionData(82);
 		obj  = new Domogram;    this.RegisterObject( obj,  196,  97+1536 ); obj.SetMotionData(81);
 		obj  = new Domogram;    this.RegisterObject( obj,  182, 166+1536 ); obj.SetMotionData(80);
 		obj  = new Domogram;    this.RegisterObject( obj,  164, 223+1536 ); obj.SetMotionData(79);
 		obj  = new Domogram;    this.RegisterObject( obj,  164, 287+1536 ); obj.SetMotionData(78);
 		obj  = new Domogram;    this.RegisterObject( obj,  164, 358+1536 ); obj.SetMotionData(77);
 
		this.m_nActionAr[  0] = {type:ACTION_TYPE_OBJECT, value:156};
		this.m_nActionAr[ 12] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 76] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 92] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[108] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[116] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[132] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[228] = {type:ACTION_TYPE_OBJECT, value:150};
		this.m_nActionAr[240] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[254] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
	}
}

_inherit( Area16, Area );
function Area16( objApp ) {
	this.base(objApp, 16);
	this.m_nMapOftX = -800;

	let obj;

	Area16.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		obj  = new GaruDerota;  this.RegisterObject( obj,   76, 154 );
		obj  = new GaruDerota;  this.RegisterObject( obj,  108, 154 );
		obj  = new Derota;      this.RegisterObject( obj,  112, 421 );
		obj  = new Derota;      this.RegisterObject( obj,   32, 469 );
		obj  = new Sol;         this.RegisterObject( obj,  113, 470 );
		obj  = new Derota;      this.RegisterObject( obj,  200, 468 );
		obj  = new Derota;      this.RegisterObject( obj,  112,   6+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  120,  70+512 );
		obj  = new Logram;      this.RegisterObject( obj,   96,  96+512 );
		obj  = new Sol;         this.RegisterObject( obj,   65, 271+512 );
		obj  = new Sol;         this.RegisterObject( obj,   49, 287+512 );
		obj  = new Grobda8;     this.RegisterObject( obj,  172, 326+512 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   92, 347+512 );
		obj  = new Grobda8;     this.RegisterObject( obj,  172, 357+512 );
		obj  = new Logram;      this.RegisterObject( obj,   32, 430+512 );
		obj  = new Logram;      this.RegisterObject( obj,  116, 430+512 );
		obj  = new Logram;      this.RegisterObject( obj,  200, 430+512 );
		obj  = new Logram;      this.RegisterObject( obj,    0, 462+512 );
		obj  = new Logram;      this.RegisterObject( obj,   88, 462+512 );
		obj  = new Logram;      this.RegisterObject( obj,  144, 462+512 );
		obj  = new Zolbak;      this.RegisterObject( obj,  144,  94+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  128, 110+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,  112, 126+1024 );
		obj  = new Zolbak;      this.RegisterObject( obj,   96, 142+1024 );
		obj  = new Grobda9;     this.RegisterObject( obj,  112, 414+1024 );
		obj  = new Grobda8;     this.RegisterObject( obj,  144, 421+1024 );
		obj  = new Grobda8;     this.RegisterObject( obj,  112, 454+1024 );
		obj  = new Grobda8;     this.RegisterObject( obj,  144, 454+1024 );
		obj  = new Logram;      this.RegisterObject( obj,   24,  62+1536 );
		obj  = new Logram;      this.RegisterObject( obj,  128,  62+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  128, 126+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  104, 158+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  152, 158+1536 );
		obj  = new Derota;      this.RegisterObject( obj,  128, 270+1536 );
		obj  = new Sol;         this.RegisterObject( obj,  193, 383+1536 );
		
		obj  = new Domogram;    this.RegisterObject( obj,  152, 198 );      obj.SetMotionData(99);
		obj  = new Domogram;    this.RegisterObject( obj,  144, 254 );      obj.SetMotionData(98);
		obj  = new Domogram;    this.RegisterObject( obj,  172, 254 );      obj.SetMotionData(97);
		obj  = new Domogram;    this.RegisterObject( obj,   60, 422 );      obj.SetMotionData(96);
		obj  = new Domogram;    this.RegisterObject( obj,  172, 422 );      obj.SetMotionData(96);
		obj  = new Domogram;    this.RegisterObject( obj,  164,  70+512 );  obj.SetMotionData(95);
		obj  = new Domogram;    this.RegisterObject( obj,   68,  22+1536 ); obj.SetMotionData(94);
		obj  = new Domogram;    this.RegisterObject( obj,  188,  22+1536 ); obj.SetMotionData(93);
		obj  = new Domogram;    this.RegisterObject( obj,  188,  87+1536 ); obj.SetMotionData(92);
		obj  = new Domogram;    this.RegisterObject( obj,   68, 135+1536 ); obj.SetMotionData(92);
		obj  = new Domogram;    this.RegisterObject( obj,  188, 166+1536 ); obj.SetMotionData(92);
		obj  = new Domogram;    this.RegisterObject( obj,   68, 215+1536 ); obj.SetMotionData(92);
		obj  = new Domogram;    this.RegisterObject( obj,  188, 247+1536 ); obj.SetMotionData(92);
		obj  = new Domogram;    this.RegisterObject( obj,   68, 295+1536 ); obj.SetMotionData(91);

		this.m_nActionAr[  0] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 16] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[ 57] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_B1};
		this.m_nActionAr[ 60] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 76] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 92] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[108] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[122] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[148] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[156] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[172] = {type:ACTION_TYPE_END,    value:0};
		this.m_nActionAr[204] = {type:ACTION_TYPE_OBJECT, value:145};
		this.m_nActionAr[232] = {type:ACTION_TYPE_OBJECT, value:157};
	}
}

_inherit( Area17, Area );
function Area17( objApp ) {
	this.base(objApp, 17);
	this.m_nMapOftX = -480;

	let obj;

	Area17.prototype.Initialize = function( nGroundNo ) {
		Area.prototype.Initialize.call( this, nGroundNo );
		obj  = new Derota;      this.RegisterObject( obj,   138, 1688 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   124, 1420 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   156, 1322 );
		obj  = new GaruDerota;  this.RegisterObject( obj,   172, 1244 );
		obj  = new Derota;      this.RegisterObject( obj,   132,  924 );
		obj  = new Zolbak;      this.RegisterObject( obj,   148,  924 );
		obj  = new Derota;      this.RegisterObject( obj,   148,  940 );
		obj  = new Zolbak;      this.RegisterObject( obj,   132,  940 );
/*		
		this.m_nActionAr[  0] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[  6] = {type:ACTION_TYPE_OBJECT, value:158}; // 단발 바큘라
		this.m_nActionAr[ 18] = {type:ACTION_TYPE_OBJECT, value:166}; // ZKATO+BZAKATO
		this.m_nActionAr[ 22] = {type:ACTION_TYPE_OBJECT, value:134}; // 안도어 제네시스
		this.m_nActionAr[ 23] = {type:ACTION_TYPE_OBJECT, value:166}; // ZKATO+BZAKATO
		this.m_nActionAr[ 72] = {type:ACTION_TYPE_OBJECT, value:153}; // GZAKATO
		this.m_nActionAr[ 82] = {type:ACTION_TYPE_OBJECT, value:153}; // GZAKATO
		this.m_nActionAr[ 87] = {type:ACTION_TYPE_OBJECT, value:153}; // GZAKATO
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value:150}; // JARA
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value:137}; // GSPARIO
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value:148}; // ZOSHI
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value:111}; // TERRAZI
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value: 80}; // KAPI
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value:164}; // OGAWA
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_OBJECT, value:165}; // GALBOSS
		this.m_nActionAr[ 90] = {type:ACTION_TYPE_INDEX,  value:ACTION_VALUE_A1};
		this.m_nActionAr[ 95] = {type:ACTION_TYPE_END,    value:0}
*/;
	}
}

function Map( objApp ) {
	const m_objApp = objApp;
	const m_objAreaAr = [];
	m_objAreaAr[ 0]= new Area00( m_objApp );
	m_objAreaAr[ 1]= new Area01( m_objApp );
	m_objAreaAr[ 2]= new Area02( m_objApp );
	m_objAreaAr[ 3]= new Area03( m_objApp );
	m_objAreaAr[ 4]= new Area04( m_objApp );
	m_objAreaAr[ 5]= new Area05( m_objApp );
	m_objAreaAr[ 6]= new Area06( m_objApp );
	m_objAreaAr[ 7]= new Area07( m_objApp );
	m_objAreaAr[ 8]= new Area08( m_objApp );
	m_objAreaAr[ 9]= new Area09( m_objApp );
	m_objAreaAr[10]= new Area10( m_objApp );
	m_objAreaAr[11]= new Area11( m_objApp );
	m_objAreaAr[12]= new Area12( m_objApp );
	m_objAreaAr[13]= new Area13( m_objApp );
	m_objAreaAr[14]= new Area14( m_objApp );
	m_objAreaAr[15]= new Area15( m_objApp );
	m_objAreaAr[16]= new Area16( m_objApp );
	m_objAreaAr[17]= new Area17( m_objApp );

	let m_nCurArea = 0;
	let m_nNxtArea = 1;
	let m_objCurArea = m_objAreaAr[1];
	let m_objPrvArea = m_objAreaAr[0];
	let m_nodeGround = m_objCurArea.GetNode();

	let m_nIndicatorColor = 0;
	let m_nIndicatorColorDelta = 16;

	let m_nCinderColor = 0;
	let m_nCinderColorDelta = 64;

	this.Delete = function() {
		m_objCurArea.Show( false );
		m_objCurArea.DeleteAllObjects();
		if( m_objPrvArea ) {
			m_objPrvArea.Show( false );
			m_objPrvArea.DeleteAllObjects();
		}
	}

	this.GetArea = function( nAreaNo ) {
		return m_objAreaAr[nAreaNo];
	}

	this.GetCurrentArea = function() {
		return this.GetArea( m_nCurArea );
	}

	this.GetCurrentAreaNumber = function() {
		return m_nCurArea;
	}

	this.SetStartArea = function( nAreaNo ) {
		let nPrevGroundNo = 1;
		if( m_objPrvArea ) {
			m_objPrvArea.Show( false );
			m_objPrvArea.DeleteAllObjects();
			nPrevGroundNo = m_objPrvArea.m_nGroundNo;
		}
		if( m_objCurArea ) {
			m_objCurArea.Show( false );
			m_objCurArea.DeleteAllObjects();
		}

		m_nNxtArea = nAreaNo;
		m_nCurArea = 0;	// 0:Ready!의 숲
		m_objCurArea = m_objAreaAr[m_nCurArea];
		m_objCurArea.Initialize( 1-nPrevGroundNo );
		m_objCurArea.Show( true );
		m_objPrvArea = null;
	}

	this.SetNextArea = function() {
		m_objPrvArea = m_objAreaAr[m_nCurArea];
		let nPrevGroundNo = m_objPrvArea.m_nGroundNo;

		if( m_nCurArea == 0 ) {
			m_nCurArea = m_nNxtArea;
		}
		else {
			m_nCurArea++;
			let nFinalArea = 16;
			if( g_nExtraAreaFlag == 0x3f )
				nFinalArea = 17;
			if( m_nCurArea > nFinalArea )
				m_nCurArea = 7;
		}
		m_objCurArea = m_objAreaAr[m_nCurArea];
		m_objCurArea.Initialize( 1-nPrevGroundNo );
		m_objCurArea.Show( true );
	}

	this.Scroll = function() {
		if( m_objPrvArea )
			m_objPrvArea.Scroll(false);
		m_objCurArea.Scroll(true);

		// 오브젝트 깜박임
		m_nIndicatorColor += m_nIndicatorColorDelta;
		if( m_nIndicatorColor > 255 ) {
			m_nIndicatorColor = 255;
			m_nIndicatorColorDelta = -16;
		}
		if( m_nIndicatorColor < 0 ) {
			m_nIndicatorColor = 0;
			m_nIndicatorColorDelta = 16;
		}
		let strColor = 'rgb(' + m_nIndicatorColor + ',0,0)';
		let nodePaletteAr = document.getElementsByClassName( 'palette' );
		for( let i=0; i<nodePaletteAr.length; i++ ) {
			nodePaletteAr[i].style.backgroundColor = strColor;
		}
		nodePaletteAr = null;

		// 불탄 흔적 깜박임
		m_nCinderColor += m_nCinderColorDelta;
		if( m_nCinderColor > 255 ) {
			m_nCinderColor = 255;
			m_nCinderColor = -64;
		}
		if( m_nCinderColor < 0 ) {
			m_nCinderColor = 0;
			m_nCinderColor = 64;
		}
		strColor = 'rgb(' + m_nCinderColor + ',0,0)';
		nodePaletteAr = document.getElementsByClassName( 'palette_cinder' );
		for( let i=0; i<nodePaletteAr.length; i++ ) {
			nodePaletteAr[i].style.backgroundColor = strColor;
		}
		nodePaletteAr = null;
	}
	
	this.HitTest = function( nX, nY, objAr ) {
		objAr.splice( 0, objAr.length );

		if( m_objPrvArea ) {
			for( let i=0; i<m_objPrvArea.m_objObjectAr.length; i++ ) {
				const obj = m_objPrvArea.m_objObjectAr[i];
				if( obj.HitTest(nX, nY, false) ) {
					objAr[objAr.length] = obj;
				}
			}
		}
		if( m_objCurArea ) {
			for( let i=0; i<m_objCurArea.m_objObjectAr.length; i++ ) {
				const obj = m_objCurArea.m_objObjectAr[i];
				if( obj.HitTest(nX, nY, false) ) {
					objAr[objAr.length] = obj;
				}
			}
		}
		return (objAr.length > 0)? true : false;
	}
}
