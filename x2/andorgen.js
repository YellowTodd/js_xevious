
_inherit( Argo, GroundObject );
function Argo( objParent, nOpt ) {
	this.base();
	this.m_nType = OBJECT_ANDORGEN+nOpt+1;
	this.m_strName = 'ARGO';
	this.m_nScore = 1000;
	this.m_nSize = 14;
	this.m_nHitAreaX = 4-4;
	this.m_nHitAreaY = 6-4;
	this.m_nHitAreaW = 7+4;
	this.m_nHitAreaH = 7+4;
	this.m_nBKOftX = -384;
	this.m_nBKOftY = 0;
	this.m_bNeedPalette = false;

	this.m_bCanFire = true;
	this.m_nRestPeriod = 80;
	this.m_nFiringPossibility = 10;
	this.m_nMaxConsec = 2;	

	this.m_nodeParent = objParent.m_nodeThis;
	this.m_nOption = nOpt;

	let nLeft, nTop;
	switch( nOpt ) {
		case 0: nLeft=24;  nTop=24;  this.m_nBKOftY =   0;  break;
		case 1: nLeft=57;  nTop=24;  this.m_nBKOftY = -14;  break;
		case 2: nLeft=24;  nTop=57;  this.m_nBKOftY = -28;  break;
		case 3: nLeft=57;  nTop=57;  this.m_nBKOftY = -42;  break;
	}
	this.m_nBKOftX = -384;
	this.Create( objParent.m_objCurArea, nLeft, nTop);
	this.m_nodeParent.appendChild( this.m_nodeThis );
	this.m_nodeThis.classList.remove('size16');
	this.m_nodeThis.classList.remove('ground-shadow');
	this.m_nodeThis.classList.add('size14');
	this.m_nodeThis.style.zIndex = 10;
	this.m_nodePicture.classList.remove('size16');
	this.m_nodePicture.classList.add('size14');
	this.m_nodePicture.classList.remove('ground_object');
	this.m_nodePicture.classList.add('andor_genesis');
	this.m_nodeExplosion.style.left = '-9px';
	this.m_nodeExplosion.style.top = '-9px';
	this.Show( true );

	Argo.prototype.HitTest = function( nX, nY ) {
		let nLeft, nRight, nTop, nBottom;
		nLeft = parseInt(this.m_nodeParent.style.left)+parseInt(this.m_nodeThis.style.left) + this.m_nHitAreaX;
		nRight = nLeft + this.m_nHitAreaW;
		nTop = parseInt(this.m_nodeParent.style.top)+parseInt(this.m_nodeThis.style.top) + this.m_nHitAreaY;
		nBottom = nTop + this.m_nHitAreaH;

		if( nX >= nLeft && nX <= nRight &&
		    nY >= nTop  && nY <= nBottom )
			return true;
		return false
	}

	Argo.prototype.ShootSpario = function( nOftX, nOftY ) {
		/*
		if( _random(100) > this.m_nFiringPossibility )
			return null;
		*/
		const nX = parseInt(this.m_nodeParent.style.left)+parseInt(this.m_nodeThis.style.left)+this.m_nSize/2;
		const nY = parseInt(this.m_nodeParent.style.top)+parseInt(this.m_nodeThis.style.top)+this.m_nSize/2;
		const objSpario = g_App.GetObjectManager().Create( OBJECT_SPARIO );
		if( objSpario )
			objSpario.SetPos( nX, nY );
		return objSpario;
	}
	
	Argo.prototype.Move = function() {
		if( this.m_nHitCount == 0 ) {
			this.Fire();
		}
		else if( this.m_nHitCount > 0 ) {
			const nOftX = -32 * ((this.m_nHitCount/4)|0);
			this.m_nodeExplosion.style.backgroundPosition = nOftX + 'px 0px';
			this.m_nHitCount++;
			if( this.m_nHitCount > 32 ) {
				this.m_nHitCount = -1;
				this.m_nodeExplosion.style.visibility = 'hidden';
			}
		}
	}

	Argo.prototype.Hit = function( bScore ) {
		if( this.m_nHitCount != 0 )
			return;
		this.m_nHitCount = 1;

		if( bScore )
			g_App.GetScoreObject().AddScore( this.m_nScore );

		this.m_nBKOftX -= 14;
		this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX + 'px ' + this.m_nBKOftY + 'px';
		this.m_nodeExplosion.style.visibility = 'visible';
		if( bScore ) {
			g_objSound.Stop('idSndGExp');
			g_objSound.Play('idSndGExp');
		}
	}
}

_inherit( AndorGen, GroundObject );
function AndorGen() {
	const STATUS_COMING   = 0;
	const STATUS_FLOATING = 1;
	const STATUS_GOING    = 2;
	const STATUS_DEAD     = 3;
	const STATUS_ESCAPING = 4;

	this.base();
	this.m_nType = OBJECT_ANDORGEN;
	this.m_strName = 'ANDOR GENESIS';
	this.m_nScore = 4000;
	this.m_nSize = 16;
	this.m_nHitAreaX = 44-5;
	this.m_nHitAreaY = 46-5;
	this.m_nHitAreaW = 8+4+5;
	this.m_nHitAreaH = 8+4+5;
	this.m_nBKOftX = -96;

	this.m_nSpeed = 1;
	this.m_nCount = 0;
	this.m_nStatus = STATUS_COMING;
	this.m_objCurArea = g_App.GetMapObject().GetCurrentArea();
	this.m_nStartPos = this.m_objCurArea.GetScrollPos();
	this.m_nTop = -96;
	this.m_objHit = null;
	this.m_nLeavingTime = 82;
	if( g_App.GetMapObject().GetCurrentArea().GetAreaNo() >= 14 && 
		g_App.GetMapObject().GetCurrentArea().GetScrollPos() < 150 )
		this.m_nLeavingTime = 40;

	this.Create( this.m_objCurArea, ((SCREEN_WIDTH-96)/2)|0, this.m_nTop);
	this.m_nodeThis.classList.remove('size16');
	this.m_nodeThis.classList.add('size96');
	this.m_nodeThis.classList.remove('ground-shadow');
	if( g_App.GetConfigObject().IsShadow() )
		this.m_nodeThis.classList.add('andor-shadow');
	this.m_nodePicture.classList.remove('size16');
	this.m_nodePicture.classList.add('size96');
	this.m_nodePicture.classList.remove('ground_object');
	this.m_nodePicture.classList.add('andor_genesis');
	this.m_nodePalette.classList.remove('size16');
	this.m_nodePalette.classList.add('size96');
	this.m_nodePalette.classList.add('andor_palette');
	this.m_nodeExplosion.style.left = '32px';
	this.m_nodeExplosion.style.top = '32px';
	this.m_objArgoAr = [];
	for( let i=0; i<4; i++ )
		this.m_objArgoAr[i] = new Argo( this, i );
	this.Show(true);
	g_objSound.Play('idSndAndorGen');

	AndorGen.prototype.HitTest = function( nX, nY ) {
		if( Object.prototype.HitTest.call(this, nX, nY, false) ) {
			this.m_objHit = this;
			return true;
		}
		for( let i=0; i<4; i++ ) {
			if( this.m_objArgoAr[i].HitTest(nX, nY) ) {
				this.m_objHit = this.m_objArgoAr[i];
				return true;
			}
		}
		return false;
	}

	AndorGen.prototype.Hit = function() {
		if( !this.m_objHit )
			return false;
		
		if( this.m_objHit == this ) {
			if( this.m_nHitCount == 0 ) {
				this.m_nHitCount = 1;
				//불필요한 점수가 들어가는 버그 재현
				let nAdditionalScore = 0;
				switch( g_App.GetMapObject().GetCurrentAreaNumber() ) {
					case  4: nAdditionalScore = 800;  break;
					case  9: nAdditionalScore = 200;  break;
					case 14: nAdditionalScore = 400;  break;
				}
				if( g_App.GetGameObject().IsRestarted() )
					nAdditionalScore = 10;
				g_App.GetScoreObject().AddScore( this.m_nScore + nAdditionalScore );

				this.m_nodePicture.style.backgroundPosition = '-192px 0px';
				this.m_nodePalette.classList.remove('palette');
				this.m_nodePalette.style.backgroundColor = '#ffffff';
				this.m_nodeExplosion.style.visibility = 'visible';
				this.m_nSpeed = 0.5;
				this.m_nStatus = STATUS_DEAD;
				g_objSound.Stop('idSndAndorGen');
				g_objSound.Stop('idSndGExp');
				g_objSound.Play('idSndGExp');
				for( let i=0; i<4; i++ ) {
					this.m_objArgoAr[i].Hit(false);
				}
				return true;
			}
		}
		for( let i=0; i<4; i++ ) {
			if( this.m_objArgoAr[i] == this.m_objHit ) {
				this.m_objArgoAr[i].Hit(true);
				return true;
			}
		}
		return 
	}

	AndorGen.prototype.Move = function() {
		const nBottom = this.m_nTop+96;
		if( this.m_nStatus == STATUS_COMING ) {
			if( nBottom > 56+96 ) {
				this.m_nSpeed = 0;
				this.m_nStatus = STATUS_FLOATING;
				this.m_nCount = 0;
			}
		}
		else if( this.m_nStatus == STATUS_FLOATING ) {
			const nCurPos = this.m_objCurArea.GetScrollPos();
			if( nCurPos-this.m_nStartPos > this.m_nLeavingTime ) {
				this.m_nSpeed = -1;
				this.m_nStatus = STATUS_GOING;
			}
			this.m_nCount++;
		}
		else if( this.m_nStatus == STATUS_GOING ) {
			if( nBottom < 0 ) {
				g_objSound.Stop('idSndAndorGen');
				return false;
			}
		}
		else if( this.m_nStatus == STATUS_DEAD ) {
			if( this.m_nHitCount > 0 ) {
				const nOftX = -32 * ((this.m_nHitCount/4)|0);
				this.m_nodeExplosion.style.backgroundPosition = nOftX + 'px 0px';
				this.m_nHitCount++;
				if( this.m_nHitCount == 16 )
					this.m_nodePicture.style.backgroundPosition = '-288px 0px';
				if( this.m_nHitCount > 32 ) {
					this.m_nHitCount = -1;
					this.m_nodeExplosion.style.visibility = 'hidden';
					g_App.GetObjectManager().Create( OBJECT_BRAGZA, this.m_nodeThis );
				}
			}
			if( nBottom > SCREEN_HEIGHT+96 )
				return false;
		}

		this.m_nTop += this.m_nSpeed;
		this.m_nodeThis.style.top = Math.round(this.m_nTop) + 'px';

		//포대의 공격
		for( let i=0; i<4; i++ )
			this.m_objArgoAr[i].Move();

		return true;
	}
}

_inherit( Bragza, FlyingObject );
function Bragza( nodeAndorGen ) {
	this.base();
	this.m_nType = OBJECT_BRAGZA;
	this.m_strName = 'BRAGZA';
	this.m_bNeedPalette = false;
	this.m_bBreakable = false;
	this.m_nBKOftY = -176;
	this.m_nSpeed = 4;
	this.m_nodeAndorGen = nodeAndorGen;

	this.Create( 0, -16 );
	this.SetInitialXPos(0);
	this.Show( true );

	this.m_pos = {x:parseInt(this.m_nodeAndorGen.style.left)+48, y:parseInt(this.m_nodeAndorGen.style.top)+48};
	this.m_vec = {u:0, v:-1};

	Bragza.prototype.Move = function() {
		if( !FlyingObject.prototype.Move.call(this) )
			return false;

		const nIndex = ((this.m_nCount/2)|0) % 8;
		this.m_nodePicture.style.backgroundPosition = -(nIndex+1)*16 + 'px ' + this.m_nBKOftY + 'px';
		this.m_nCount++;
		if( this.m_nCount >= 16 )
			this.m_nCount = 0;

		return true;
	}
}


