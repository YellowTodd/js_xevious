
function Demo( objApp ) {
	const m_objApp = objApp;
	const m_strColorAr = ['#d25900', '#ffa600', '#fffc00', '#00d500', '#106eff', '#873935', '#ff0000']
	const m_nodeTitle = document.getElementById('idTitle');
	const m_nodeLogo = document.getElementById('idLogo');
	const m_nodeLogoPalette = document.getElementById('idLogoPalette');
	const m_nodeSpark = document.getElementById('idSpark');
	const m_nodeCopyright = document.getElementById('idCopyright');
	const m_nodePrompt = document.getElementById('idPrompt');
	const m_nodeLogoDemo = document.getElementById('idLogoDemo');
	const m_nodeRemain = document.getElementById('idRemain');

	const m_objText = m_objApp.GetTextObject();
	const m_objMap = m_objApp.GetMapObject();
	const m_objScore = m_objApp.GetScoreObject();
	const m_objSolvalou = m_objApp.GetSolvalouObject();

	const PHASE_TITLE = 0;
	const PHASE_DEMOPLAY = 1;
	const PHASE_RANKING = 2;

	let m_nFrameCount = 0;
	let m_nPhase = PHASE_TITLE;
	let m_nSparkLeft = 0;
	let m_nSparkOftY = 0;
	let m_nChangeColor = 0;
	let m_nShowRanking = 0;
	let m_bRankingAfterDemoPlay;
	let m_nKeyPressing = 0;

	function hideTitle( bShow ) {
		m_nodeTitle.style.visibility = 'hidden';
		m_nodeLogo.style.visibility = 'hidden';
		m_nodeLogoPalette.style.visibility = 'hidden';
		m_nodeSpark.style.visibility = 'hidden';
		m_nodeCopyright.style.visibility = 'hidden';
		m_objScore.ShowRanking( false );
		m_nodeLogoDemo.style.visibility = 'hidden';
	}

	function blinkPrompt( nFrameCount, nInterval ) {
		let strVisibility = ((m_nFrameCount % nInterval ) < nInterval/2)? 'visible' : 'hidden';
		m_nodePrompt.style.visibility = strVisibility;
		if( strVisibility == 'visible' ) {
			m_objText.Clear( m_nodePrompt );
			m_objText.Print( m_nodePrompt, 24, 40, "PRESS 'S' KEY TO START" );
		}
	}

	this.Initialize = function() {
		m_nFrameCount = 0;
		m_nPhase = PHASE_TITLE;
		m_nKeyPressing = 0;

		m_objScore.ShowScore( true );
		m_nodeTitle.style.visibility = 'visible';
		m_nodeLogo.style.visibility = 'visible';
		m_nodeLogoPalette.style.visibility = 'visible';
		m_nodeLogoPalette.style.backgroundColor = '#ff0000';
		m_nodeCopyright.style.visibility = 'visible';

		m_objText.Clear( m_nodeCopyright );
		m_objText.Print( m_nodeCopyright, 38, 0, '}' );
		m_objText.Print( m_nodeCopyright, 50, 0, '{' );
		m_objText.Print( m_nodeCopyright, 67, 0, '1982 NAMCO LTD.' );
		m_objText.Print( m_nodeCopyright, 64,28, 'Ported by AJ' );
		m_nodeCopyright.style.backgroundPosition = 'center center';
	}

	this.End = function() {
		hideTitle();

		m_objSolvalou.Show( false );
		m_objApp.GetObjectManager().DeleteAllObjects();
		m_objMap.Delete();
	}

	this.Act = function( nFrame ) {
		// 타이틀 화면
		if( m_nPhase == PHASE_TITLE ) {
			if( nFrame != 0 )
				return;

			blinkPrompt( m_nFrameCount, 16 );

			// 데모 화면 초기 상태
			if( m_nFrameCount == 0 ) {
				m_nodeTitle.style.backgroundColor = 'black';

				m_nodeLogo.style.visibility = 'visible';
				m_nodeLogoPalette.style.visibility = 'visible';
				m_nChangeColor = 0;
				m_nodeLogoPalette.style.backgroundColor = m_strColorAr[6];
				m_nodeSpark.style.visibility = 'hidden';

				m_nodeLogoDemo.style.visibility = 'hidden';
				m_nodePrompt.style.visibility = 'hidden';
				m_nodeCopyright.style.visibility = 'visible';

				m_nSparkLeft = 24;
				m_nSparkOftY = 0;
			}
			// 스파크 표시
			if( m_nFrameCount >= 24 && m_nFrameCount < 32 ) {
				m_nodeSpark.style.left = m_nSparkLeft + 'px';
				m_nodeSpark.style.backgroundPosition = '0px -' + m_nSparkOftY + 'px';
				m_nSparkOftY += 16;
				m_nodeSpark.style.visibility = 'visible';
			}
			if( m_nFrameCount >= 32 && m_nFrameCount < 60 ) {
				m_nSparkLeft += 2;
				m_nodeSpark.style.left = m_nSparkLeft + 'px';
				m_nodeSpark.style.backgroundPosition = '0px -' + m_nSparkOftY + 'px';
				m_nSparkOftY += 16;
				if( m_nSparkOftY > 16*12 )
					m_nSparkOftY = 16 * 8;
			}
			if( m_nFrameCount == 60 ) {
				m_nSparkOftY = 16 * 12
			}
			if( m_nFrameCount >= 60 && m_nFrameCount < 99 ) {
				m_nSparkLeft += 2;
				m_nodeSpark.style.left = m_nSparkLeft + 'px';
				m_nodeSpark.style.backgroundPosition = '0px -' + m_nSparkOftY + 'px';
				m_nSparkOftY += 16;
				if( m_nSparkOftY > 16*15 )
					m_nSparkOftY = 16 * 12;
			}
			if( m_nFrameCount == 99 ) {
				m_nSparkOftY = 16 * 7
			}
			if( m_nFrameCount >= 99 && m_nFrameCount < 106 ) {
				m_nodeSpark.style.left = m_nSparkLeft + 'px';
				m_nodeSpark.style.backgroundPosition = '0px -' + m_nSparkOftY + 'px';
				m_nSparkOftY -= 16;
				if( m_nSparkOftY < 0 )
					m_nSparkOftY = 0;
			}
			if( m_nFrameCount == 106  ) {
				m_nodeSpark.style.backgroundPosition = '0px 0px';
			}
			// 로고 배경색 변경
			if( m_nFrameCount > 106 && m_nFrameCount < 362 ) {
				m_nChangeColor++;
				if( m_nChangeColor >= m_strColorAr.length )
					m_nChangeColor = 0;
				m_nodeLogoPalette.style.backgroundColor = m_strColorAr[m_nChangeColor];
			}
			if( m_nFrameCount >= 362 ) {
				m_nodeLogo.style.visibility = 'hidden';
				m_nodeLogoPalette.style.visibility = 'hidden';
				m_bRankingAfterDemoPlay = true;
				m_nPhase = PHASE_DEMOPLAY;
				m_nFrameCount = 0;
				return;
			}
		}
		// 데모 플레이 화면
		else if( m_nPhase == PHASE_DEMOPLAY ) {
			blinkPrompt( m_nFrameCount, 32 );

			if( m_nFrameCount == 0 ) {
				m_nodeTitle.style.backgroundColor = 'transparent';
				m_nodeCopyright.style.visibility = 'visible';
				m_nodeLogoDemo.style.visibility = 'visible';

				m_objApp.GetGameObject().ResetFlyingEnemyIndex();
				m_objMap.SetStartArea( 1 );
				m_objSolvalou.Initialize();
				m_objSolvalou.Show( true );
			}
			if( m_nFrameCount < 2400 ) {
				if( nFrame == 0 )
					m_objMap.Scroll();
				m_objApp.GetObjectManager().Move();

				if( m_objSolvalou.m_nHitCount == 0 ) {
					if( m_nKeyPressing == 0 ) {
						g_bKeyUp = g_bKeyDown = g_bKeyLeft = g_bKeyRight =
						g_bKeyBomb = g_bKeyFire = false;
						const nKey = _random(64);
						const bBomb = (_random(100) < 5)? true : false;
						const bFire = (_random(100) < 40)? true : false;
						if( nKey & 0x01 ) 
							g_bKeyUp = true;
						if( nKey & 0x02 ) 
							g_bKeyDown = true;
						if( nKey & 0x04 ) 
							g_bKeyLeft = true;
						if( nKey & 0x08 ) 
							g_bKeyRight = true;
						if( nKey & 0x10 && bBomb ) 
							g_bKeyBomb = true;
						if( nKey & 0x20 && bFire )
							g_bKeyFire = true;
						m_nKeyPressing = _random(20)+5;
					}
					m_nKeyPressing--;
				}
				if( !m_objSolvalou.m_bDestroyed ) {
					if( !m_objSolvalou.Action(nFrame) )
						m_nFrameCount = 2300;
				}
			}
			if( m_nFrameCount >= 2400 ) {
				m_nodeLogoDemo.style.visibility = 'hidden';
				m_nodePrompt.style.visibility = 'hidden';
				m_nodeCopyright.style.visibility = 'hidden';
				m_objSolvalou.Show( false );
				m_objApp.GetObjectManager().DeleteAllObjects();
				m_objMap.Delete();

				if( m_bRankingAfterDemoPlay ) {
					m_nPhase = PHASE_RANKING;
				}
				else {
					m_nPhase = PHASE_TITLE;
				}
				m_nKeyPressing = 0;
				m_nFrameCount = 0;
				return;
			}
		}

		else if( m_nPhase == PHASE_RANKING ) {
			if( m_nFrameCount == 0 ) {
				m_nodeTitle.style.backgroundColor = 'black';
				m_objScore.ShowRanking( true, -1 );

				m_nodeLogo.style.visibility = 'visible';
				m_nodeLogoPalette.style.visibility = 'visible';
				m_nodeLogoPalette.style.backgroundColor = m_strColorAr[m_strColorAr.length-1];
			}
			if( m_nFrameCount >= 480 ) {
				m_nodeLogo.style.visibility = 'hidden';
				m_nodeLogoPalette.style.visibility = 'hidden';
				m_objScore.ShowRanking( false );
				m_bRankingAfterDemoPlay = false;
				m_nPhase = PHASE_DEMOPLAY;
				m_nFrameCount = 0;
				return;
			}
		}

		m_nFrameCount++;
	}
}
