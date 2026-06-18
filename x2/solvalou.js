
const SIGHT_OFFSET_Y = 100;
const SOLVALOU_Z_INDEX = 5;

_inherit( Blaster, FlyingObject );
function Blaster( objSolvalou ) {
	this.base();
	this.m_bNeedPalette = false;
	this.m_bBreakable = false;
	this.m_nBKOftX = 0;
	this.m_nBKOftY = 0;

	let m_nCount = 0;
	let m_nPos = objSolvalou.GetPos();
	let nTargetY = m_nPos.y-SIGHT_OFFSET_Y;

	this.Create( m_nPos.x+4, m_nPos.y+4 );
	this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX-1;
	this.m_nodeThis.classList.remove( 'size16' );
	this.m_nodeThis.classList.add( 'size8' );
	this.m_nodePicture.classList.remove( 'size16' );
	this.m_nodePicture.classList.add( 'size8' );
	this.m_nodePicture.classList.add( 'blaster' );

	let m_objTarget = new FlyingObject;
	m_objTarget.m_bNeedPalette = false;
	m_objTarget.m_bBreakable = false;
	m_objTarget.m_nBKOftX = -80;
	m_objTarget.m_nBKOftY = -160;
	m_objTarget.Create( m_nPos.x, m_nPos.y-SIGHT_OFFSET_Y );
	m_objTarget.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX-2;
	m_objTarget.m_nodeThis.classList.remove( 'flying-shadow' );
	m_objTarget.Show( true );

	let m_nShadowX = 15;
	let m_nShadowY = 15;
	const bShadow = g_App.GetConfigObject().IsShadow();

	this.Action = function() {
		let nDY;
		if( m_nCount == 0 )
			nDY = 0;
		else if( m_nCount == 1 )
			nDY = 0;
		else if( m_nCount == 2 )
			nDY = 1;
		else if( m_nCount == 3 )
			nDY = 1;
		else if( m_nCount == 4 )
			nDY = 2;
		else if( m_nCount == 5 )
			nDY = 2;
		else if( m_nCount == 6 )
			nDY = 4;
		else if( m_nCount >= 7 )
			nDY = 8;

		if( m_nCount == 10 ) {
			g_objSound.Stop( 'idSndBlaster' );
			g_objSound.Play( 'idSndBlaster' );
		}

		if( m_nCount < 15 ) {
			m_nPos.y -= nDY;
			this.m_nodeThis.style.top = m_nPos.y + 'px';
			this.m_nodePicture.style.backgroundPosition = (-8*m_nCount) + 'px 0px';
			m_objTarget.m_nodeThis.style.top = nTargetY + 'px';
			nTargetY++;

			if( bShadow ) {
				this.m_nodeThis.style['-webkit-filter'] = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
				this.m_nodeThis.style['-moz-filter']     = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
				this.m_nodeThis.style['-ms-filter']     = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
				this.m_nodeThis.style.filter            = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
				m_nShadowX--;
				m_nShadowY--;
			}
		}

		if( m_nCount == 15 ) {
			this.m_nodeThis.style.visibility = 'hidden';

			let x = parseInt(m_objTarget.m_nodeThis.style.left)+7;
			let y = parseInt(m_objTarget.m_nodeThis.style.top)+7;
			let objHitAr = [];
			if( g_App.GetMapObject().HitTest(x, y, objHitAr) ) {
				for( let i=0; i<objHitAr.length; i++ ) {
					objHitAr[i].Hit();
				}
			}
			// 안도어 제네시스용
			const objAndorGen = g_App.GetObjectManager().GetObject( OBJECT_ANDORGEN );
			if( objAndorGen ) {
				if( objAndorGen.HitTest(x, y, false) )
					objAndorGen.Hit();
			}

			m_objTarget.Delete();
			m_objTarget = null;
		}
		if( m_nCount >= 16 ) {
			return false;
		}
		m_nCount++;

		return true;
	}

	Blaster.prototype.Delete = function() {
		FlyingObject.prototype.Delete.call( this );
		if( m_objTarget ) {
			m_objTarget.Delete();
			m_objTarget = null;
		}
	}

	this.GetBombingPos = function() {
		if( !m_objTarget )
			return {x:-999, y:-999};
		return {
			x:parseInt(m_objTarget.m_nodeThis.style.left)+7,
			y:parseInt(m_objTarget.m_nodeThis.style.top)+7
		}
	}
}

_inherit( Zapper, FlyingObject );
function Zapper( objSolvalou ) {
	this.base();
	this.m_bNeedPalette = false;

	let m_bHitBacura = false;
	let m_nCount = 0;
	let m_nPos = objSolvalou.GetPos();

	m_nPos.y += 2;
	this.Create( m_nPos.x, m_nPos.y );
	this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX+2;
	this.m_nodePicture.classList.add( 'zapper' );
	this.Show( true );

	this.Action = function() {
		const objectAr = g_App.GetObjectManager().GetObjectAr();
		// 바큘라에 맞지 않은 경우
		if( !m_bHitBacura ) { 
			function hitTest( nX, nY ) {
				for( let i=0; i<objectAr.length; i++ ) {
					// 안도어 제네시스는 지상 캐릭터지만 스크롤 영향을 받지 않도록 Area에는 등록하지 않는다
					// 그래서 ObjectManager가 관리하지만, 그대로 두면 Blaster에 맞아버리므로 HitTest하지 않도록 한다
					if( objectAr[i].m_nType == OBJECT_ANDORGEN )
						continue;
					// 일반 공중 캐릭터의 충돌 판정
					if( objectAr[i].HitTest(nX, nY, false) ) {
						// 바큘라에 맞았다
						if( objectAr[i].m_nType == OBJECT_BACURA ) {
							m_bHitBacura = true;
							m_nCount = 4;
							g_objSound.Stop('idSndBacura');
							g_objSound.Play('idSndBacura');
							break;
						}
						objectAr[i].Hit();
						return false;
					}
				}
			}
			for( let nOftY=-2; nOftY<8; nOftY++ ) {
				let objHit = hitTest(m_nPos.x+2, m_nPos.y+nOftY, false);
				if( objHit ) {
					objHit.Hit();
					return false;
				}
				objHit = hitTest(m_nPos.x+13, m_nPos.y+nOftY, false);
				if( objHit ) {
					objHit.Hit();
					return false;
				}
			}
		}
		// 바큘라에 맞고 있는 경우 불꽃(?)을 그린다
		if( m_bHitBacura ) {
			let nIndexX = ((m_nCount/2)|0) % 7;
			this.m_nBKOftX = -nIndexX*16;
			this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX +'px ' + this.m_nBKOftY + 'px';
			m_nCount++;
			if( m_nCount > 12 )
				return false;
		}
		else {
			let nIndexX = ((m_nCount/2)|0) % 2;
			let nIndexY = ((m_nCount/1)|0) % 2;
			this.m_nBKOftX = -nIndexX*16;
			this.m_nBKOftY = -nIndexY*16;
			this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX +'px ' + this.m_nBKOftY + 'px';
			m_nCount++;

			m_nPos.y -= 8;
			if( m_nPos.y < -16 ) {
				return false;
			}
			this.m_nodeThis.style.top = m_nPos.y + 'px';
		}
		return true;
	}

	this.GetCount = function() {
		return m_nCount;
	}
}

_inherit( Solvalou, FlyingObject );
function Solvalou() {
	this.base();
	this.m_nType = 0;
	this.m_strName = 'SOLVALOU';
	this.m_bNeedPalette = false;
	// Original Shape
	this.m_nBKOftX = -80;
	this.m_nBKOftY = -144;
	// Realistic Shape
	//this.m_nBKOftX= -112;
	//this.m_nBKOftY = -128;
	// Helicopter Shape
	//this.m_nBKOftX= -48;
	//this.m_nBKOftY = -160;

	this.m_objSight = new FlyingObject;
	this.m_objSight.m_bNeedPalette = false;
	this.m_objSight.m_bBreakable = false;
	this.m_objSight.m_nBKOftX = -96;
	this.m_objSight.m_nBKOftY = -144;
	this.m_bDestroyed = false;

	let m_objBlaster = null;
	let m_objZapperAr = [];

	let m_nX;
	let m_nY;
	let m_nMissed = 0;
	let m_nCount = 0;
	let m_bMouse = false;

	this.Initialize = function() {
		m_bMouse = false;
		if( g_App.GetConfigObject().IsMouse() )
			m_bMouse = true;
		if( this.m_nodeThis ) {
			if( g_App.GetConfigObject().IsShadow() ) {
				this.m_nodeThis.classList.add('flying-shadow');
			}
			else {
				this.m_nodeThis.classList.remove('flying-shadow');
			}
		}

		m_nFrameCount = 0;
		this.m_nHitCount = 0;
		this.m_bDestroyed = false;

		m_nMissed = 0;

		m_nX = ((SCREEN_WIDTH-16)/2)|0;
		m_nY = SCREEN_HEIGHT-16-8;

		g_nMouseX = m_nX+7;
		g_nMouseY = m_nY+7;

		g_bKeyLeft = false;
		g_bKeyRight = false;
		g_bKeyUp = false;
		g_bKeyDown = false;
		g_bKeyFire = false;
		g_bKeyBomb = false;
	}

	this.ReflectPos = function() {
		this.m_nodeThis.style.left = m_nX + 'px';
		this.m_nodeThis.style.top = m_nY + 'px';
		this.m_objSight.m_nodeThis.style.left = m_nX + 'px';
		this.m_objSight.m_nodeThis.style.top = (m_nY-SIGHT_OFFSET_Y) + 'px';
	}

	this.GetPos = function() {
		return {x:m_nX, y:m_nY}
	}

	this.GetTargetPos = function() {
		return {x:m_nX+8, y:m_nY-SIGHT_OFFSET_Y+8};
	}

	this.GetBombingPos = function() {
		if( !m_objBlaster )
			return {x:-999, y:-999};
		return m_objBlaster.GetBombingPos();
	}

	this.NumMiss = function() {
		return m_nMissed;
	}

	Solvalou.prototype.Create = function() {
		this.Initialize();

		FlyingObject.prototype.Create.call( this, m_nX, m_nY );
		this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX;
		this.m_nodeExplosion.classList.remove('flying_explosion');
		this.m_nodeExplosion.classList.add('solvalou_explosion');

		this.m_objSight.Create( m_nX, m_nY-SIGHT_OFFSET_Y );
		this.m_objSight.m_nodeThis.classList.remove( 'flying-shadow' );
	}

	Solvalou.prototype.HitTest = function( objTarget ) {
		if( this.m_nHitCount != 0 )
			return false;

		if( objTarget.m_nHitCount != 0 )
			return false;
		if( objTarget.m_nType == OBJECT_SHEONITE )
			return false;

		if( g_App.GetConfigObject().IsInvincible() && !g_App.IsDemoMode() )
			return false;

		if( objTarget.m_nType == OBJECT_BACURA ) {
			let bHit = false;
			if( objTarget.IsInside(m_nX+6, m_nX+9, m_nY, m_nY+3) )
				bHit = true;
			else if( objTarget.IsInside(m_nX+4, m_nX+11, m_nY+4, m_nY+6) )
				bHit = true;
			else if( objTarget.IsInside(m_nX+2, m_nX+13, m_nY+7, m_nY+9) )
				bHit = true;
			else if( objTarget.IsInside(m_nX, m_nX+15, m_nY+10, m_nY+15) )
				bHit = true;

			if( bHit ) {
				this.m_nHitCount = 1;
				this.m_nodePicture.style.visibility = 'hidden';
				this.m_nodeExplosion.style.visibility = 'visible';
				//g_objSound.Stop('idSndMiss');
				g_objSound.Play('idSndMiss');
				m_nMissed++;
			}
			return bHit;
		}

		const nodeTarget  = objTarget.m_nodeThis;
		const nTargetR    = objTarget.m_nRadiusToHitSolvalou;
		const nTargetCX   = objTarget.m_pos.x;
		const nTargetCY   = objTarget.m_pos.y;
		const nMyCX       = m_nX+7;
		const nMyCY       = m_nY+7;
		const fDist       = Math.sqrt((nTargetCX-nMyCX)*(nTargetCX-nMyCX) + (nTargetCY-nMyCY)*(nTargetCY-nMyCY));
		if( fDist > 6+nTargetR )
			return false;

		this.m_nHitCount = 1;
		this.m_nodePicture.style.visibility = 'hidden';
		this.m_nodeExplosion.style.visibility = 'visible';
		//g_objSound.Stop('idSndMiss');
		g_objSound.Play('idSndMiss');
		m_nMissed++;

		return true;
	}

	Solvalou.prototype.Delete = function() {
		Object.prototype.Delete.call( this );
		this.m_objSight.Delete();
		if( m_objBlaster )
			m_objBlaster.Delete();
	}

	Solvalou.prototype.Show = function( bShow ) {
		Object.prototype.Show.call( this, bShow );
		this.m_objSight.Show( bShow );
		if( bShow ) {
			this.m_nodePicture.style.visibility = 'visible';
			this.m_nodeExplosion.style.visibility = 'hidden';
		}
	}

	this.Action = function( nFrame, nFrameCount ) {
		// 블래스터
		if( m_objBlaster ) {
			if( nFrame == 1 ) {
				if( !m_objBlaster.Action() ) {
					m_objBlaster.Delete();
					m_objBlaster = null;
					m_nBombingY = -999;
				}
			}
		}
		if( g_bKeyBomb ) {
			if( !m_objBlaster ) {
				m_objBlaster = new Blaster( this );
			}
		}

		// 재퍼
		for( let i=m_objZapperAr.length-1; i>=0; i-- ) {
			const bOK = m_objZapperAr[i].Action();
			if( !bOK ) {
				m_objZapperAr[i].Delete();
				m_objZapperAr[i] = null;
				m_objZapperAr.splice( i, 1 );
			}
		}
		if( g_bKeyFire ) {
			if( m_objZapperAr.length < 3 ) {
				let nMinCount = 9999;
				let nZappers = m_objZapperAr.length;
				for( let i=nZappers-1; i>=0; i-- ) {
					const nCount = m_objZapperAr[i].GetCount();
					if( nMinCount > nCount )
						nMinCount = nCount;
				}
				if( g_bKeyFireOK ) {
					g_bKeyFireOK = false;
					nMinCount = 9999;
				}
				if( nMinCount > 19 ) {	//이전 샷과의 간격이 짧으면 쏘지 않음
					if(nZappers < 3 ) {	//3발 이상은 연사하지 않음
						const objZapper = new Zapper( this );
						m_objZapperAr[m_objZapperAr.length] = objZapper;
						g_objSound.Play( 'idSndZapper' );
					}
				}
			}
		}

		// 폭발
		if( this.m_nHitCount != 0 ) {
			const nRatio = 4;
			const nIndex = (((this.m_nHitCount-1)/nRatio)|0) % 13;
			this.m_nodeExplosion.style.backgroundPosition = -nIndex*32 + 'px 0px';
			this.m_nHitCount++;
			if( this.m_nHitCount > 13*nRatio ) {
				this.m_bDestroyed = true;	// 데모 플레이에서 사용
				this.m_nodeExplosion.style.visibility = 'hidden';
				g_objSound.Stop('idSndAndorGen');

				// Blaster 제거
				if( m_objBlaster ) {
					m_objBlaster.Delete();
					m_objBlaster = null;
					m_nBombingY = -999;
				}
				// Zapper 제거
				for( let i=m_objZapperAr.length-1; i>=0; i-- ) {
					m_objZapperAr[i].Delete();
					m_objZapperAr[i] = null;
					m_objZapperAr.splice( i, 1 );
				}

				// 난이도 낮춤
				const nDifficulty = g_App.GetConfigObject().GetDifficulty();
				let nDelta = 24;
				switch( nDifficulty ) {
					case 1: nDelta = 16;  break;
					case 2: nDelta =  8;  break;
					case 3: nDelta =  0;  break;
				}
				g_App.GetGameObject().AddFlyingEnemyIndex( -nDelta );

				//실기 버그 재현: 당하면 위치가 화면 밖이 된다
				m_nX = SCREEN_WIDTH;
				m_nY = -32;
				return false;
			}
			return true;
		}

		// 이동
		let nDX = (nFrame==0)? 1 : 2;	//가로 방향은 1픽셀과 2픽셀을 번갈아 이동
		let nDY = 1;					//세로 방향은 1픽셀씩 이동

		// 마우스 위치 가져오기
		if( m_bMouse && nFrameCount > 100 ) {	//시작 직후에는 가져오지 않음
			m_nX = g_nMouseX-7;
			if( m_nX < 0 )
				m_nX = 0;
			if( m_nX >= SCREEN_WIDTH-16 )
				m_nX = SCREEN_WIDTH-16;
			m_nY = g_nMouseY-7;
			if( m_nY < SIGHT_OFFSET_Y+16 )
				m_nY = SIGHT_OFFSET_Y+16 ;
			if( m_nY >= SCREEN_HEIGHT-16 )
				m_nY = SCREEN_HEIGHT-16;
		}

		if( g_bKeyUp ) {
			m_nY -= nDY;
			if( (m_nY-SIGHT_OFFSET_Y-16) < 0 )
				m_nY = SIGHT_OFFSET_Y+16;
			g_nMouseY = m_nY+7;
			nDX = 1;	//대각선 이동의 경우 가로 방향은 항상 1픽셀 이동
		}
		if( g_bKeyDown ) {
			m_nY += nDY;
			if( m_nY+16 >= SCREEN_HEIGHT )
				m_nY = SCREEN_HEIGHT-16;
			g_nMouseY = m_nY+7;
			nDX = 1;	//대각선 이동의 경우 가로 방향은 항상 1픽셀 이동
		}
		if( g_bKeyLeft ) {
			m_nX -= nDX;
			if( m_nX < 0 )
				m_nX = 0;
			g_nMouseX = m_nX + 7;
		}
		if( g_bKeyRight ) {
			m_nX += nDX;
			if( m_nX+16 >= SCREEN_WIDTH )
				m_nX = SCREEN_WIDTH-16;
			g_nMouseX = m_nX + 7;
		}
		this.ReflectPos();

		// 타깃 스코프
		let nSightOftY = this.m_objSight.m_nBKOftY;
		if( m_objBlaster )
			nSightOftY -= 16;
		let nSightOftX = this.m_objSight.m_nBKOftX;
		let x = parseInt(this.m_objSight.m_nodeThis.style.left)+7;
		let y = parseInt(this.m_objSight.m_nodeThis.style.top)+7;
		let objHitAr = [];
		if( g_App.GetMapObject().HitTest(x, y, objHitAr) ) {
			if( !objHitAr[0].m_bHidden ) {
				const nIndex = ((m_nCount/4)|0) % 2;
				if( nIndex == 1 )
					nSightOftX -= 16;
				m_nCount++;
				if( m_nCount > 100 )
					m_nCount = 0;
			}
		}
		objHitAr = null;
		this.m_objSight.GetPictureNode().style.backgroundPosition = nSightOftX + 'px '+ nSightOftY +'px';

		// 스페셜 플래그와의 접촉
		let nodeSpecialAr = document.getElementsByClassName( 'special' );
		if( nodeSpecialAr.length && g_objSpecial ) {
			x = parseInt(this.m_nodeThis.style.left)+7;
			y = parseInt(this.m_nodeThis.style.top)+7;
			if( g_objSpecial.HitTest(x, y) ) {
				g_objSpecial.FlagTaken();
			}
		}
		nodeSpecialAr = null;

		if( this.m_nBKOftY == -160 ) {
			this.m_nBKOftX= -48;
			if( (g_App.m_nFrameCount % 8) < 4 )
				this.m_nBKOftX= -64;
			this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX + 'px ' + this.m_nBKOftY + 'px';
		}

		return true;
	}
}
