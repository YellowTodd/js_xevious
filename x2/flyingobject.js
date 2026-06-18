
const OBJECT_SPARIO   = 201;
const OBJECT_GSPARIO  = 202;
const OBJECT_BSPARIO  = 203;
const OBJECT_TOROID   = 204;
const OBJECT_JARA     = 205;
const OBJECT_TORKAN   = 206;
const OBJECT_KAPI     = 207;
const OBJECT_TERRAZI  = 208;
const OBJECT_ZOSHI    = 209;
const OBJECT_ZAKATO   = 210;
const OBJECT_BZAKATO  = 211;
const OBJECT_GZAKATO  = 212;
const OBJECT_BACURA   = 213;
const OBJECT_SHEONITE = 214;
const OBJECT_BRAGZA   = 217;
const OBJECT_ANDORGEN = 218;
const OBJECT_OGAWA    = 219;
const OBJECT_GALBOSS  = 220;

const PI = 3.1415926537;

_inherit( FlyingObject, Object );
function FlyingObject() {
	this.base();
	this.m_nodeBack = document.getElementById('idInTheAir');
	this.m_nHitAreaX = -3;
	this.m_nHitAreaY = 0;
	this.m_nHitAreaW = 22;
	this.m_nHitAreaH = 16;
	this.m_nRadiusToHitSolvalou = 7;
	this.m_pos = {x:0, y:0};
	this.m_vec = {u:0, v:1};
	this.m_nSpeed = 1;
	this.m_nEvacDir = 0;
	this.m_fAccelX = 0;
	this.m_fAccelY = 0;
	this.m_nCount = 0;

	FlyingObject.prototype.Create = function( nX, nY ) {
		Object.prototype.Create.call( this, null, nX, nY );
		this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX+1;
		this.m_nodePicture.classList.add( 'flying_object' );
		if( this.m_bNeedPalette )
			this.m_nodePalette.classList.add( 'flying_palette' );

		if( this.m_bBreakable ) {
			this.m_nodeExplosion = document.createElement('div');
			this.m_nodeExplosion.classList.add( 'object' );
			this.m_nodeExplosion.classList.add( 'size32' );
			this.m_nodeExplosion.classList.add( 'flying_explosion' );
			this.m_nodeExplosion.style.left = '-8px';
			this.m_nodeExplosion.style.top = '-8px';
			this.m_nodeExplosion.style.zIndex = 2;
			this.m_nodeExplosion.style.backgroundPosition = '0px 0px';
			this.m_nodeThis.appendChild( this.m_nodeExplosion );
		}

		if( g_App.GetConfigObject().IsShadow() )
			this.m_nodeThis.classList.add( 'flying-shadow' );
	}

	FlyingObject.prototype.GetVectorToSolvalou = function( nX, nY ) {
		const posSolvalou = g_App.GetSolvalouObject().GetPos();
		const nU = (posSolvalou.x+8) - nX;
		const nV = (posSolvalou.y+8) - nY;
		const fLen = Math.sqrt( nU*nU + nV*nV );
		const fCos = nU / fLen;
		const fRad = Math.acos( fCos );
		let fDeg = Math.round((fRad * 180 / PI) / (90/8)) * (90/8);
		if( nV < 0 )
			fDeg = -fDeg;
		const fRad2 = fDeg*PI / 180;
		const fU = Math.cos(fRad2);
		const fV = Math.sin(fRad2);
		return {u:fU, v:fV};
	}

	FlyingObject.prototype.GetEvacuationDir = function( nRange ) {
		const objSolvalou = g_App.GetSolvalouObject();
		const nSolvalouXByte = (parseInt(objSolvalou.m_nodeThis.style.left)/8)|0;
		const nXByte = (parseInt(this.m_nodeThis.style.left)/8)|0;
		const nDist = nXByte - nSolvalouXByte;
		if( nDist >= -nRange && nDist < nRange )
			return nDist;
		return 0;
	}

	FlyingObject.prototype.Move = function() {
		if( g_App.GetSolvalouObject().HitTest(this) )
			return false;

		this.m_pos.x += this.m_vec.u*this.m_nSpeed;
		this.m_pos.y += this.m_vec.v*this.m_nSpeed;
		const nLeft = Math.round(this.m_pos.x-this.m_nSize/2);
		const nTop = Math.round(this.m_pos.y-this.m_nSize/2);
		this.m_nodeThis.style.left = nLeft + 'px';
		this.m_nodeThis.style.top = nTop + 'px';

		if( this.m_nHitCount != 0  ) {
			const nIndex = (this.m_nHitCount/2)|0;
			this.m_nodeExplosion.style.backgroundPosition = -nIndex*32 + 'px 0px';
			this.m_nHitCount++;
			if( this.m_nHitCount > 20 )
				return false;
			return true;
		}

		if( this.m_pos.x < -this.m_nSize || this.m_pos.x >= SCREEN_WIDTH )
			return false;
		if( this.m_vec.v >= 0 ) {
			if( this.m_pos.y >= SCREEN_HEIGHT+this.m_nSize/2 )
				return false;
		}
		else {
			if( this.m_pos.y < -16 )
				return false;
		}

		return true;
	}

	FlyingObject.prototype.Hit = function() {
		if( !Object.prototype.Hit.call(this) )
			return false;
		
		if( this.m_nHitCount != 0  ) {
			this.m_nodePicture.style.visibility = 'hidden';
			if( this.m_nodePalette )
				this.m_nodePalette.style.visibility = 'hidden';
			this.m_nodeExplosion.style.visibility = 'visible';
			g_objSound.Stop('idSndFExp');
			g_objSound.Play('idSndFExp');
		}
	}
}

_inherit( Spario, FlyingObject );
function Spario() {
	this.base();
	this.m_nType = OBJECT_SPARIO;
	this.m_strName = 'SPARIO';
	this.m_bNeedPalette = false;
	this.m_bBreakable = false;
	this.m_nHitAreaX = 0;
	this.m_nHitAreaY = 0;
	this.m_nHitAreaW = 4;
	this.m_nHitAreaH = 4;
	this.m_nRadiusToHitSolvalou = 2;
	this.m_nSize = 4;
	this.m_nSpeed = 2;

	this.Create( 0, -16 );
	this.m_nodeThis.classList.remove( 'size16' );
	this.m_nodeThis.classList.add( 'size4' );

	this.m_nodePicture.classList.remove( 'size16' );
	this.m_nodePicture.classList.remove( 'flying_object' );
	this.m_nodePicture.classList.add( 'size4' );
	this.m_nodePicture.classList.add( 'spario' );

	this.Show( true );

	this.SetPos = function( nX, nY ) {
		this.m_pos = {x:nX+2, y:nY+2};
		this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );
	}

	this.SetVec = function( fU, fV ) {
		this.m_vec.u = fU;
		this.m_vec.v = fV;
	}

	Spario.prototype.HitTest = function( nX, nY ) {
		return false;
	}

	Spario.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		const nIndex = ((this.m_nCount/2)|0) % 4;
		const nOftXAr = [0, -4, -8, -12 ];
		this.m_nodePicture.style.backgroundPosition = nOftXAr[nIndex] + 'px 0px';
		this.m_nCount++;
		if( this.m_nCount >= 8 )
			this.m_nCount = 0;

		return true;
	}
}

_inherit( GSpario, FlyingObject );
function GSpario() {
	this.base();
	this.m_nType = OBJECT_GSPARIO;
	this.m_strName = 'GIDO SPARIO';
	this.m_bNeedPalette = false;
	this.m_nHitAreaX = 2;
	this.m_nHitAreaY = 2;
	this.m_nHitAreaW = 14;
	this.m_nHitAreaH = 14;
	this.m_nRadiusToHitSolvalou = 3;
	this.m_nSpeed = 4;
	this.m_nScore = 10;

	this.Create( 0, -16 );
	this.SetInitialXPos(0);
	this.m_nodePicture.classList.remove( 'flying_object' );
	this.m_nodePicture.classList.add( 'garu_spario' );
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	GSpario.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		const nIndex = ((this.m_nCount/2)|0) % 16;
		this.m_nodePicture.style.backgroundPosition = -nIndex*16 + 'px 0px';
		this.m_nCount++;
		if( this.m_nCount >= 32 )
			this.m_nCount = 0;

		return true;
	}
}

_inherit( BSpario, FlyingObject );
function BSpario() {
	this.base();
	this.m_nType = OBJECT_BSPARIO;
	this.m_strName = 'BRAG SPARIO';
	this.m_bNeedPalette = false;
	this.m_bBreakable = false;
	this.m_nSize = 4;
	this.m_nSpeed = 2;
	this.m_nHitAreaX = -2;
	this.m_nHitAreaY = -2;
	this.m_nHitAreaW = 8;
	this.m_nHitAreaH = 8;
	this.m_nRadiusToHitSolvalou = 2;
	this.m_nScore = 500;

	this.Create( 0, -16 );
	this.m_nodeThis.classList.remove( 'size16' );
	this.m_nodeThis.classList.add( 'size4' );

	this.m_nodePicture.classList.remove( 'size16' );
	this.m_nodePicture.classList.add( 'size4' );
	this.m_nodePicture.classList.remove( 'flying_object' );
	this.m_nodePicture.classList.add( 'brag_spario' );

	this.SetPos = function( nX, nY ) {
		this.m_pos = {x:nX+2, y:nY+2};
	}

	this.SetVec = function( fU, fV ) {
		this.m_vec.u = fU;
		this.m_vec.v = fV;
	}

	BSpario.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		const vecToSolvalou = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );
		this.m_vec.u += vecToSolvalou.u*(1/8);
		this.m_vec.v += vecToSolvalou.v*(1/8)

		const nIndex = ((this.m_nCount/2)|0) % 4;
		this.m_nodePicture.style.backgroundPosition = -nIndex*4 + 'px 0px';
		this.m_nCount++;
		if( this.m_nCount >= 8 )
			this.m_nCount = 0;

		return true;
	}

	BSpario.prototype.Hit = function() {
		g_App.GetScoreObject().AddScore( this.m_nScore );
		g_objSound.Stop('idSndFExp');
		g_objSound.Play('idSndFExp');
		return false;
	}
}

_inherit( Toroid, FlyingObject );
function Toroid( nOption ) {
	this.base();
	this.m_nType = OBJECT_TOROID;
	this.m_strName = 'TOROID';
	this.m_nScore = 30;
	this.m_nSpeed = 1.5;
	this.m_bShootSpario = nOption? true : false;

	this.Create( 0, -16 );
	this.SetInitialXPos(8);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	Toroid.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nEvacDir == 0 ) {
			this.m_nEvacDir = this.GetEvacuationDir(4);
			if( this.m_nEvacDir != 0 ) {
				if( this.m_bShootSpario ) {
					if( _random(10) < 5 )
						this.ShootSpario(0,7);
				}

				if( this.m_nEvacDir < 0 )
					this.m_fAccelX = -1/32;
				else if( this.m_nEvacDir > 0 )
					this.m_fAccelX = 1/32;
			}
		}
		if( this.m_nEvacDir != 0 ) {
			let nIndex = ((this.m_nCount/2)|0) % 8;
			if( this.m_nEvacDir > 0 )
				nIndex = 7 - nIndex;
			this.m_vec.u += this.m_fAccelX;

			this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px 0px';
			this.m_nCount++;
			if( this.m_nCount >= 16 )
				this.m_nCount = 0;
		}

		return true;
	}
}

_inherit( Jara, FlyingObject );
function Jara( nOption ) {
	this.base();
	this.m_nType = OBJECT_JARA;
	this.m_strName = 'JARA';
	this.m_nBKOftY = -128;
	this.m_nScore = 150;
	this.m_nSpeed = 3;
	this.m_bShootSpario = nOption? true : false;

	this.Create( 0, -16 );
	this.SetInitialXPos(8);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	Jara.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nEvacDir == 0 ) {
			this.m_nEvacDir = this.GetEvacuationDir(6);
			if( this.m_nEvacDir != 0 ) {
				if( this.m_bShootSpario ) {
					if( _random(10) < 5 )
						this.ShootSpario(0,7);
				}

				if( this.m_nEvacDir < 0 )
					this.m_fAccelX = -1/32;
				else if( this.m_nEvacDir > 0 )
					this.m_fAccelX = 1/32;
			}
		}
		if( this.m_nEvacDir != 0 ) {
			let nIndex = ((this.m_nCount/2)|0) % 6;
			if( this.m_nEvacDir > 0 )
				nIndex = 5 - nIndex;
			this.m_vec.u += this.m_fAccelX;

			this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px ' + this.m_nBKOftY + 'px';
			this.m_nCount++;
			if( this.m_nCount >= 12 )
				this.m_nCount = 0;
		}

		return true;
	}
}

_inherit( Torkan, FlyingObject );
function Torkan() {
	this.base();
	this.m_nType = OBJECT_TORKAN;
	this.m_strName = 'TORKAN';
	this.m_nBKOftY = -32;
	this.m_nScore = 50;
	this.m_nSpeed = 2;

	this.m_nTurnPoint = Math.round((_random(64)+64)/2);
	this.m_nFrame = 0;

	this.Create( 0, -16 );
	this.m_nodePalette.style['-webkit-mask-position'] = this.m_nBKOftX + 'px ' + (this.m_nBKOftY+16) + 'px';

	this.SetInitialXPos(0);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	Torkan.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nFrame >= this.m_nTurnPoint && this.m_nCount == 0 ) {
			this.m_nSpeed = 0;
		}
		if( this.m_nSpeed == 0 ) {
			let nIndex = ((this.m_nCount/4)|0) % 7;
			this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px ' + this.m_nBKOftY + 'px';
			this.m_nodePalette.style['-webkit-mask-position'] = -(nIndex+1)*16 + 'px ' + (this.m_nBKOftY+16) + 'px';
			if( this.m_nCount == 8 ) {
				this.ShootSpario(0,7);
			}
			if( this.m_nCount == 24 ) {
				this.m_nSpeed = 1.5;
				this.m_vec.u *= -1;
				this.m_vec.v *= -1;
			}
			this.m_nCount++;

		}
		this.m_nFrame++;

		return true;
	}
}

_inherit( Kapi, FlyingObject );
function Kapi() {
	this.base();
	this.m_nType = OBJECT_KAPI;
	this.m_strName = 'KAPI';
	this.m_nBKOftY = -80;
	this.m_nScore = 50;
	this.m_nSpeed = 2;

	this.m_nTurnPoint = Math.round((_random(63)+48)/2);
	this.m_nFrame = 0;

	this.Create( 0, -16 );
	this.m_nodePalette.style['-webkit-mask-position'] = this.m_nBKOftX + 'px ' + (this.m_nBKOftY+16) + 'px';

	this.SetInitialXPos(0);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	Kapi.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nCount != 0 ) {
			if( _random(100) < 3 ) {
				this.ShootSpario(0,7);
			}
		}

		if( this.m_nFrame >= this.m_nTurnPoint && this.m_nCount == 0 ) {
			this.m_nEvacDir = this.GetEvacuationDir(100);
			if( this.m_nEvacDir < 0 )
				this.m_fAccelX = -1/32;
			else if( this.m_nEvacDir > 0 )
				this.m_fAccelX = 1/32;
			this.m_fAccelY = -1/16;
		}
		if( this.m_nEvacDir != 0 ) {
			this.m_vec.u += this.m_fAccelX;
			this.m_vec.v += this.m_fAccelY;

			let nIndex = ((this.m_nCount/4)|0) % 7;
			this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px ' + this.m_nBKOftY + 'px';
			this.m_nodePalette.style['-webkit-mask-position'] = -(nIndex+1)*16 + 'px ' + (this.m_nBKOftY+16) + 'px';

			if( this.m_nCount == 24 )
				this.m_nEvacDir = 0;
			this.m_nCount++;
		}
		this.m_nFrame++;

		return true;
	}
}

_inherit( Terrazi, FlyingObject );
function Terrazi() {
	this.base();
	this.m_nType = OBJECT_TERRAZI;
	this.m_strName = 'TERRAZI';
	this.m_nBKOftY = -112;
	this.m_nScore = 700;
	this.m_nSpeed = 3;

	this.Create( 0, -16 );
	this.m_nodePalette.style['-webkit-mask-position'] = this.m_nBKOftX + 'px ' + (this.m_nBKOftY+16) + 'px';

	this.SetInitialXPos(8);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	Terrazi.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nCount == 0 ) {
			if( _random(100) < 2 )
				this.ShootSpario(0,7);
		}

		if( this.m_nEvacDir == 0 ) {
			this.m_nEvacDir = this.GetEvacuationDir(4);
			if( this.m_nEvacDir != 0 ) {
				if( this.m_nEvacDir < 0 )
					this.m_fAccelX = -1/16;
				else if( this.m_nEvacDir > 0 )
					this.m_fAccelX = 1/16;
				this.m_fAccelY = -1/16;
			}
		}
		if( this.m_nEvacDir != 0 ) {
			this.m_vec.u += this.m_fAccelX;
			this.m_vec.v += this.m_fAccelY;

			let nIndex = ((this.m_nCount/4)|0) % 7;
			this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px ' + this.m_nBKOftY + 'px';
			this.m_nodePalette.style['-webkit-mask-position'] = -(nIndex+1)*16 + 'px ' + (this.m_nBKOftY+16) + 'px';
			
			if( this.m_nCount >= 24 )
				this.m_nEvacDir = 0;
			this.m_nCount++;
		}
		this.m_nFrame++;

		return true;
	}
}

_inherit( Zoshi, FlyingObject );
function Zoshi( nOption ) {
	this.base();
	this.m_nType = OBJECT_ZOSHI;
	this.m_strName = 'ZOSHI';
	this.m_nBKOftY = -144;
	this.m_nSpeed = 1.5;
	this.m_nScore = 100;
	if( this.m_nOption == 0 )
		this.m_nScore = 70;

	this.m_nOption = nOption;

	let nY = -16;
	if( this.m_nOption == 2 )
		nY = SCREEN_HEIGHT;
	this.Create( 0, nY );
	this.SetInitialXPos(0);
	if( this.m_nOption == 2 )
		this.SetInitialXPos(8);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	this.m_nChangeDir = _random(64)+128;

	Zoshi.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nChangeDir == 0 ) {
			if( _random(10) < 4 )
				this.ShootSpario(0,0);
			this.m_nChangeDir = _random(64)+64;
			if( this.m_nOption == 0 ) {
				const fDeg = _random(16) * 22.5;
				const fRad = fDeg*3.141592 / 180;
				this.m_vec.u = Math.cos(fRad);
				this.m_vec.v = Math.sin(fRad);
				this.m_nScore = 70;
			}
			else {
				this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );
				this.m_nScore = 100;
			}
		}
		this.m_nChangeDir--;

		let nIndex = ((this.m_nCount/4)|0) % 4;
		this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px ' + this.m_nBKOftY + 'px';
		this.m_nCount++;
		if( this.m_nCount >= 16 )
			this.m_nCount = 0;

		return true;
	}
}
	
_inherit( Bacura, FlyingObject );
function Bacura() {
	this.base();
	this.m_nType = OBJECT_BACURA;
	this.m_strName = 'BACURA';
	this.m_nHitAreaX = 0;
	this.m_nHitAreaY = 6;
	this.m_nHitAreaW = 32;
	this.m_nHitAreaH = 4;
	this.m_bBreakable = false;
	this.m_bNeedPalette = false;
	this.m_nSpeed = 1;

	this.m_nBkIndex = 0;

	this.Create( 0, -16 );
	this.m_nodeThis.classList.remove('size16');
	this.m_nodePicture.classList.remove('size16');
	this.m_nodePicture.classList.remove('flying_object');
	this.m_nodePicture.classList.add('bacura');
	this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX-1;
	this.m_nodeThis.style.width = '32px';
	this.m_nodeThis.style.height = '16px';
	this.m_nodePicture.style.width = '32px';
	this.m_nodePicture.style.height = '16px';

	let nodeObjectAr = document.getElementsByClassName( this.m_strName );
	let nX;
	let nCount = 0;
	while(nCount < 100) {
		let bOK = true;
		nX = _random(((SCREEN_WIDTH-32)/8)|0);
		for( let i=0; i<nodeObjectAr.length; i++ ) {
			let nTargetY = ((parseInt(nodeObjectAr[i].style.top)/8)|0);
			if( nTargetY <= 0 ) {
				let nTargetX = ((parseInt(nodeObjectAr[i].style.left)/8)|0);
				if( nX+4 > nTargetX && nX < nTargetX+4  ) {
					bOK = false;
					break;
				}
			}
		}
		if( bOK ) {
			this.m_nodeThis.classList.add(this.m_strName);
			break;
		}
		nCount++;
	}
	nodeObjectAr = null;
	this.m_nodeThis.style.left = nX*8 + 'px';

	this.Show( true );

	Bacura.prototype.Move = function() {
		g_App.GetSolvalouObject().HitTest(this);

		this.m_pos.y = parseInt(this.m_nodeThis.style.top);
		this.m_pos.y += this.m_nSpeed;
		if( this.m_pos.y >= SCREEN_HEIGHT )
			return false;
		this.m_nodeThis.style.top = this.m_pos.y + 'px';

;		this.m_nBkIndex = ((this.m_nCount/4)|0) % 7;
		this.m_nodePicture.style.backgroundPosition = -this.m_nBkIndex*32 + 'px 0px';

		if( this.m_nCount >= 28 )
			this.m_nCount = 0;
		this.m_nCount++;

		return true;
	}

	Bacura.prototype.IsInside = function( nSX1, nSX2, nSY1, nSY2 ) {
		let nX1, nX2, nY1, nY2;
		switch( this.m_nBkIndex ) {
			case 0: nX1 = 0; nX2 = 31;  nY1 = 6; nY2= 9;  break;
			case 1: nX1 = 2; nX2 = 29;  nY1 = 4; nY2=11;  break;
			case 2: nX1 = 3; nX2 = 28;  nY1 = 2; nY2=13;  break;
			case 3: nX1 = 4; nX2 = 27;  nY1 = 1; nY2=14;  break;
			case 4: nX1 = 0; nX2 = 31;  nY1 = 0; nY2=15;  break;
			case 5: nX1 = 4; nX2 = 27;  nY1 = 1; nY2=14;  break;
			case 6: nX1 = 3; nX2 = 28;  nY1 = 2; nY2=13;  break;
			case 7: nX1 = 2; nX2 = 29;  nY1 = 4; nY2=11;  break;
		}
		nX1 += parseInt(this.m_nodeThis.style.left);
		nX2 += parseInt(this.m_nodeThis.style.left);
		nY1 += parseInt(this.m_nodeThis.style.top);
		nY2 += parseInt(this.m_nodeThis.style.top);
		if( ((nSX1 >= nX1 && nSX1 <= nX2) || (nSX2 >= nX1 && nSX2 <= nX2)) &&
			((nSY1 >= nY1 && nSY1 <= nY2) || (nSY2 >= nY1 && nSY2 <= nY2)) )
			return true;
		return false;
	}
}

_inherit( Zakato, FlyingObject );
function Zakato( nOption ) {
	this.base();
	this.m_nType = OBJECT_ZAKATO;
	this.m_strName = 'ZAKATO';
	this.m_nBKOftX = 0;
	this.m_nBKOftY = 0;
	this.m_nSize = 32;
	this.m_nHitAreaX = 16-3;
	this.m_nHitAreaY = 16;
	this.m_nRadiusToHitSolvalou = 4;
	this.m_nSpeed = 1;
	this.m_nHitCount = -1;

	this.m_nOption = nOption;
	this.m_bAppearing = true;
	this.m_nShootingCount;
	this.m_bShooted = false;
	this.m_bTimer = false;

	this.Create( 0, -16 );
	this.SetInitialXPos(6);
	this.m_pos.x = parseInt(this.m_nodeThis.style.left)+16;
	this.m_pos.y = (_random(16)+2)*8;
	this.m_nodeThis.style.left = (this.m_pos.x-16) + 'px';
	this.m_nodeThis.style.top = (this.m_pos.y-16) + 'px';
	this.m_nodeThis.classList.remove('size16');
	this.m_nodeThis.classList.add('size32');
	this.m_nodePicture.classList.remove('size16');
	this.m_nodePicture.classList.add('size32');
	this.m_nodePicture.classList.remove('flying_object');
	this.m_nodePicture.classList.add('zakato');
	this.m_nodePalette.style.visibility = 'hidden';
	this.m_nodeExplosion.style.left = '0px';
	this.m_nodeExplosion.style.top = '0px';

	this.Show( true );

	Zakato.prototype.ShootSpario = function() {
		FlyingObject.prototype.ShootSpario.call( this, 15, 15 );
	}

	Zakato.prototype.SetBehavior = function() {
		this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );
		switch( this.m_nOption ) {
			case 0:
				this.m_nScore = 100;
				this.m_nSpeed = 0.5;
				this.m_vec.u = 0;
				this.m_vec.v = 1;
				this.m_bTimer = true;
				this.m_nCount = _random(256)+1;
				break;
			case 1:
				this.m_nScore = 150;
				this.m_nSpeed = 1;
				this.m_bTimer = true;
				this.m_nCount = _random(64)+1;
				break;
			case 2:
				this.m_nScore = 200;
				this.m_nSpeed = 0.5;
				this.m_vec.u = 0;
				this.m_vec.v = 1;
				break;
			case 3:
				this.m_nScore = 300;
				this.m_nSpeed = 1;
				break;
		}
	}

	Zakato.prototype.Move = function() {
		if( this.m_bAppearing ) {
			this.m_nodePicture.style.backgroundPosition = -this.m_nCount*32 + 'px 0px';
			this.m_nCount++;
			if( this.m_nCount > 21 ) {
				this.m_bAppearing = false;
				this.m_nHitCount = 0;
				this.m_nCount = 0;
				this.m_nShootingCount = 19;
				this.SetBehavior();
				return true;
			}
			this.m_pos.y += 0.25;
			this.m_nodeThis.style.top = ((this.m_pos.y-15)|0) + 'px';
			return true;
		}

		if( this.m_bShooted ) {
			this.m_nodePicture.style.backgroundPosition = -this.m_nShootingCount*32 + 'px -32px';
			this.m_nShootingCount--;
			if( this.m_nShootingCount == 0 )
				return false;
			return true;
		}

		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		this.m_pos.x += this.m_nSpeed * this.m_vec.u;
		this.m_pos.y += this.m_nSpeed * this.m_vec.v;
		this.m_nodeThis.style.left = ((this.m_pos.x-15)|0) + 'px';
		this.m_nodeThis.style.top = ((this.m_pos.y-15)|0) + 'px';

		if( this.m_bTimer ) {
			this.m_nCount--;
			if( this.m_nCount <= 0 ) {
				this.ShootSpario(15,15);
				this.m_nHitCount = -1;
				g_objSound.Stop('idSndZakato');
				g_objSound.Play('idSndZakato');
				this.m_bShooted = true;
			}
		}
		else {
			if( this.GetEvacuationDir(8) != 0 ) {
				this.ShootSpario(15,15);
				this.m_nHitCount = -1;
				g_objSound.Stop('idSndZakato');
				g_objSound.Play('idSndZakato');
				this.m_bShooted = true;
			}
		}
		return true;
	}
}

_inherit( BZakato, Zakato );
function BZakato( nOption ) {
	this.base( nOption );
	this.m_nType = OBJECT_BZAKATO;
	this.m_strName = 'BRAG ZAKATO';
	this.m_nSpeed = 1;

	this.m_nodePicture.classList.remove('zakato');
	this.m_nodePicture.classList.add('brag_zakato');
	this.m_nodePalette.style.left = '8px';
	this.m_nodePalette.style.top = '8px';
	this.m_nodePalette.style.visibility = 'visible';
	this.m_nodePalette.style['-webkit-mask-position'] = '0px 0px';


	BZakato.prototype.ShootSpario = function() {
		const nX = this.m_pos.x;
		const nY = this.m_pos.y;
		const posSolvalou = g_App.GetSolvalouObject().GetPos();
		const nV = (posSolvalou.y+8) - nY;
		const vecToSolvalou = this.GetVectorToSolvalou( nX, nV );
		const fRad = Math.acos( vecToSolvalou.u );
		const fDEGARC = 180;
		let fDeg = Math.round((fRad * 180 / PI) / (fDEGARC/8)) * (fDEGARC/8);
		if( nV < 0 )
			fDeg = -fDeg;
		const fDeltaDegAr = [-(fDEGARC/8)*2, -(fDEGARC/8), 0, (fDEGARC/8), (fDEGARC/8)*2];
		for( let i=0; i<5; i++ ) {
			const objSpario = FlyingObject.prototype.ShootSpario.call( this, 15, 15 );
			if( objSpario ) {
				const fRad = (fDeg+fDeltaDegAr[i])*PI / 180;
				objSpario.SetVec( Math.cos(fRad), Math.sin(fRad) );
				objSpario.m_nSpeed = 3;
			}
		}
	}

	BZakato.prototype.SetBehavior = function() {
		this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );
		switch( this.m_nOption ) {
			case 0:
				this.m_nScore = 600;
				this.m_bTimer = true;
				this.m_nCount = _random(64)+1;
				break;
			case 1:
				this.m_nScore = 1500;
				break;
		}
	}
}

_inherit( GZakato, FlyingObject );
function GZakato() {
	this.base();
	this.m_nType = OBJECT_GZAKATO;
	this.m_strName = 'GARU ZAKATO';
	this.m_nBKOftY = -48;
	this.m_nSpeed = 3;
	this.m_nScore = 1000;
	this.m_nExplodeY = _random(97)+64;

	this.Create( 0, -16 );
	this.SetInitialXPos(0);
	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = {u:0, v:1};
	this.Show( true );

	this.ShootSpario = function() {
		for( let i=0; i<16; i++ ) {
			const objSpario = FlyingObject.prototype.ShootSpario.call( this, 0, 0 );
			if( objSpario ) {
				objSpario.SetPos( this.m_pos.x-2, this.m_pos.y-2 );
				const fRad = i*(360/16)*PI / 180;
				objSpario.SetVec( Math.cos(fRad), Math.sin(fRad) );
				objSpario.m_nSpeed = 3;
			}
		}

		const vecAr = [{u:1, v:0},{u:0, v:1},{u:-1, v:0},{u:0, v:-1}];
		for( let i=0; i<4; i++ ) {
			const objBSpario = g_App.GetObjectManager().Create( OBJECT_BSPARIO );
			if( objBSpario ) {
				objBSpario.SetPos( this.m_pos.x-2, this.m_pos.y-2 );
				objBSpario.SetVec( vecAr[i].u, vecAr[i].v );
			}
		}
	}

	GZakato.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		this.m_nodeThis.style.top = ((this.m_pos.y-8)|0) + 'px';

		if( this.m_pos.y >= this.m_nExplodeY ) {
			this.ShootSpario();
			g_objSound.Stop('idSndGZakato');
			g_objSound.Play('idSndGZakato');
			return false;
		}

		return true;
	}
}

_inherit( OneSheonite, FlyingObject );
function OneSheonite( nOpt, nInitialPosX ) {
	this.base();
	this.m_nType = OBJECT_SHEONITE;
	this.m_strName = 'SHEONITE_CHILD';
	this.m_bBreakable = false;
	this.m_bNeedPalette = true;
	this.m_nSpeed = 4;
	this.m_nOption = nOpt;
	this.m_nStatus = 0;
	this.m_nDeltaX1 = 0;
	this.m_nDeltaX2 = 0;
	
	const STATUS_COMING     = 0;
	const STATUS_DOCKING    = 1;
	const STATUS_DOCKED     = 2;
	const STATUS_TILTING    = 3
	const STATUS_COMBINING1 = 4;
	const STATUS_COMBINING2 = 5;
	const STATUS_GOING      = 6;

	this.Create( nInitialPosX, -32 );
	this.m_nodePicture.classList.remove('flying_object');
	this.m_nodePicture.classList.add('sheonite');
	this.m_nodePalette.classList.remove( 'flying_palette' );
	this.m_nodePalette.classList.add('sheonite_palette');

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.Show( true );

	this.GetVector = function() {
		const posTarget = {x:0, y:0};
		const posSolvalou = g_App.GetSolvalouObject().GetPos();
		posTarget.y = posSolvalou.y - 8;
		if( this.m_nOption == 0 )
			posTarget.x = posSolvalou.x + 24;
		else 
			posTarget.x = posSolvalou.x - 8;
		const nU = posTarget.x - Math.round(this.m_pos.x);
		const nV = posTarget.y - Math.round(this.m_pos.y);
		if( Math.abs(nV) <= 4 ) {
			this.m_pos.x = posTarget.x;
			this.m_pos.y = posTarget.y;
			this.m_nStatus = STATUS_DOCKING;
			return {u:0, v:0}
		}
		const fLen = Math.sqrt( nU*nU + nV*nV );
		const fCos = nU / fLen;
		const fRad = Math.acos( fCos );
		let fDeg = Math.round((fRad * 180 / PI) / (90/8)) * (90/8);
		if( nV < 0 )
			fDeg = -fDeg;
		const fRad2 = fDeg*PI / 180;
		let fU = Math.cos(fRad2);
		let fV = Math.sin(fRad2);
		// Y 속도를 항상 1로 한다
		if( Math.abs(fV) < 0.01 ) {
			fU = 0;
		}
		else {
			fU = fU / fV;
			if( Math.abs(fU) == Infinity )
				fU = 0;
		}
		fV = 1;
		return {u:fU, v:fV};
	}

	this.Move = function() {
		FlyingObject.prototype.Move.call(this);
		if( isNaN(this.m_pos.x) || isNaN(this.m_pos.y) ) {
			this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
		}
		if( this.m_pos.y > SCREEN_HEIGHT+32 )
			return false;

		// 날아온다
		if( this.m_nStatus == STATUS_COMING ) {
			const vec = this.GetVector();
			this.m_vec.u = vec.u;
			this.m_vec.v = vec.v;
		}
		// 빙글빙글 돈다
		if( (this.m_nStatus == STATUS_COMING)  ||
		    (this.m_nStatus == STATUS_DOCKING) ||
		    (this.m_nStatus == STATUS_GOING) ) {
			let nIndex;
			if( this.m_nOption == 0 )
		    	nIndex = ((this.m_nCount/2)|0) % 4;
			else
				nIndex = (3-(((this.m_nCount/2)|0) % 4))+1;
			this.m_nodePicture.style.backgroundPosition = -nIndex*16 + 'px -48px';
			this.m_nodePalette.style['-webkit-mask-position'] = -nIndex*16 + 'px 0px';
		}
		// 솔발루 옆에 고정
		if( this.m_nStatus != STATUS_COMING &&
		    this.m_nStatus != STATUS_GOING ) {
			const posSolvalou = g_App.GetSolvalouObject().GetPos();
			if( this.m_nOption == 0 )
				this.m_pos.x = posSolvalou.x+24;
			else
				this.m_pos.x = posSolvalou.x-8;
			this.m_pos.y = posSolvalou.y-8;
		}
		// 회전 종료
		if( this.m_nStatus == STATUS_DOCKING && this.m_nCount > 392 ) {
			if( this.m_nOption == 0 )
				this.m_nBkOftY = -32;
			else
				this.m_nBkOftY = -16;
			this.m_nodePicture.style.backgroundPosition = '0px ' + (this.m_nBkOftY-48) + 'px';
			this.m_nodePalette.style['-webkit-mask-position'] = '0px ' + this.m_nBkOftY + 'px';
			this.m_vec.u = 0;
			this.m_vec.v = 0;
			this.m_nStatus = STATUS_DOCKED;
			this.m_nCount = 0;
			return true;
		}
		// 잠시 정지
		if( this.m_nStatus == STATUS_DOCKED ) {
			if( this.m_nCount > 14 ) {
				this.m_nStatus = STATUS_TILTING;
				this.m_nCount = 0;
				return true;
			}
		}
		// 합체를 위해 기울임
		if( this.m_nStatus == STATUS_TILTING ) {
			let nIndex = ((this.m_nCount/4)|0) % 4;
			this.m_nodePicture.style.backgroundPosition = -nIndex*16 + 'px ' + (this.m_nBkOftY-48) + 'px';
			this.m_nodePalette.style['-webkit-mask-position'] = -nIndex*16 + 'px ' + this.m_nBkOftY + 'px';
			if( this.m_nCount >= 14 ) {
				if( this.m_nOption == 0 )
					this.m_nDeltaX1 = -4;
				else
					this.m_nDeltaX1 = 4;
				this.m_nStatus = STATUS_COMBINING1;
				this.m_nCount = 0;
				return true;
			}
		}
		// 합체 1
		if( this.m_nStatus == STATUS_COMBINING1 ) {
			if( this.m_nCount >= 2 ) {
				if( this.m_nOption == 0 )
					this.m_nDeltaX2 = -1;
				else
					this.m_nDeltaX2 = 1;
				this.m_nStatus = STATUS_COMBINING2;
				this.m_nCount = 0;
				return true;
			}
			this.m_pos.x += this.m_nDeltaX1 * (this.m_nCount+1);
		}
		// 합체 2
		if( this.m_nStatus == STATUS_COMBINING2 ) {
			if( this.m_nCount >= 8 ) {
				if( this.m_nOption != 0 )
					return false;
				this.m_nodePicture.style.backgroundPosition = '-32px -48px';
				this.m_nodePalette.style['-webkit-mask-position'] = '-32px 0px';
				const posSolvalou = g_App.GetSolvalouObject().GetPos();
				this.m_pos.x = posSolvalou.x + 8;
				this.m_pos.y = posSolvalou.y;
				this.m_vec.v = -1;
				this.m_nSpeed = 6;
				this.m_nStatus = STATUS_GOING;
				g_objSound.Play('idSndSheonite');
				return true;
			}
			this.m_pos.x += this.m_nDeltaX1*2 + this.m_nDeltaX2 * (this.m_nCount+1);
		}
		// 날아간다
		if( this.m_nStatus == STATUS_GOING ) {
			if( this.m_pos.y < -16 )
				return false;
		}

		this.m_nCount++;
		return true;
	}
}

_inherit( Sheonite, FlyingObject );
function Sheonite() {
	this.base();
	this.m_nType = OBJECT_SHEONITE;
	this.m_strName = 'SHEONITE';
	this.m_bBreakable = false;
	this.m_bNeedPalette = false;

	this.Create(0,-16);
	this.Show( false );

	let m_objSheoniteL = new OneSheonite( 0, -16 );
	let m_objSheoniteR = new OneSheonite( 1, SCREEN_WIDTH+16 );

	Sheonite.prototype.HitTest = function( nX, nY ) {
		return false;
	}
	
	Sheonite.prototype.Move = function() {
		if( m_objSheoniteL ) {
			if( !m_objSheoniteL.Move() ) {
				m_objSheoniteL.Delete();
				m_objSheoniteL = null;
				if( m_objSheoniteR ) {
					m_objSheoniteR.Delete();
					m_objSheoniteR = null;
				}
				return false;
			}
		}
		if( m_objSheoniteR ) {
			if( !m_objSheoniteR.Move() ) {
				m_objSheoniteR.Delete();
				m_objSheoniteR = null;
			}
		}
		return true;
	}
}

_inherit( Ogawa, FlyingObject );
function Ogawa() {
	this.base();
	this.m_nType = OBJECT_OGAWA;
	this.m_strName = 'OGAWA';
	this.m_nBKOftY = -112;
	this.m_nScore = 700;
	this.m_nSpeed = 3;
	this.m_bNeedPalette = false;

	this.Create( 0, -16 );
	this.m_nodePalette.style['-webkit-mask-position'] = this.m_nBKOftX + 'px ' + (this.m_nBKOftY+16) + 'px';

	this.SetInitialXPos(8);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	Ogawa.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		if( this.m_nCount == 0 ) {
			if( _random(100) < 2 )
				this.ShootSpario(0,7);
		}
		
		return true;
	}
}

_inherit( GalBoss, FlyingObject );
function GalBoss() {
	this.base();
	this.m_nType = OBJECT_GALBOSS;
	this.m_strName = 'GALBOSS';
	this.m_nBKOftX = -48;
	this.m_nBKOftY = 0;
	this.m_nScore = 150;
	this.m_nSpeed = 3;
	this.m_bNeedPalette = false;

	this.Create( 0, -16 );
	this.SetInitialXPos(0);
	this.m_nodePicture.classList.remove('flying_object');
	this.m_nodePicture.classList.add('galboss');
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeThis.style.left)+8, y:parseInt(this.m_nodeThis.style.top)+8};
//중앙보다 오른쪽이면 왼쪽 이동, 중앙보다 왼쪽이면 오른쪽 이동으로 설정
//화면 끝까지의 거리에 따라 턴까지의 카운트를 설정
	
	this.m_vec = this.GetVectorToSolvalou( this.m_pos.x, this.m_pos.y );

	GalBoss.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

	//턴이 아니면 평행 이동
	//턴 중 1(처음과 같은 방향으로 이동)
	//턴 중 2(바로 아래로 이동)
	//턴 중 3(처음과 반대 방향으로 이동)
	//스파리오 발사
		if( this.m_nCount == 0 ) {
			if( _random(100) < 2 ) {
				const objSpario = this.ShootSpario(0,7);
				objSpario.SetVec( 0, 1 );
			}
		}
		
		return true;
	}
}
