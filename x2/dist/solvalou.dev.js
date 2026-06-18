"use strict";

var SIGHT_OFFSET_Y = 100;
var SOLVALOU_Z_INDEX = 5;

_inherit(Blaster, FlyingObject);

function Blaster(objSolvalou) {
  this.base();
  this.m_bNeedPalette = false;
  this.m_bBreakable = false;
  this.m_nBKOftX = 0;
  this.m_nBKOftY = 0;
  var m_nCount = 0;
  var m_nPos = objSolvalou.GetPos();
  var nTargetY = m_nPos.y - SIGHT_OFFSET_Y;
  this.Create(m_nPos.x + 4, m_nPos.y + 4);
  this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX - 1;
  this.m_nodeThis.classList.remove('size16');
  this.m_nodeThis.classList.add('size8');
  this.m_nodePicture.classList.remove('size16');
  this.m_nodePicture.classList.add('size8');
  this.m_nodePicture.classList.add('blaster');
  var m_objTarget = new FlyingObject();
  m_objTarget.m_bNeedPalette = false;
  m_objTarget.m_bBreakable = false;
  m_objTarget.m_nBKOftX = -80;
  m_objTarget.m_nBKOftY = -160;
  m_objTarget.Create(m_nPos.x, m_nPos.y - SIGHT_OFFSET_Y);
  m_objTarget.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX - 2;
  m_objTarget.m_nodeThis.classList.remove('flying-shadow');
  m_objTarget.Show(true);
  var m_nShadowX = 15;
  var m_nShadowY = 15;
  var bShadow = g_App.GetConfigObject().IsShadow();

  this.Action = function () {
    var nDY;
    if (m_nCount == 0) nDY = 0;else if (m_nCount == 1) nDY = 0;else if (m_nCount == 2) nDY = 1;else if (m_nCount == 3) nDY = 1;else if (m_nCount == 4) nDY = 2;else if (m_nCount == 5) nDY = 2;else if (m_nCount == 6) nDY = 4;else if (m_nCount >= 7) nDY = 8;

    if (m_nCount == 10) {
      g_objSound.Stop('idSndBlaster');
      g_objSound.Play('idSndBlaster');
    }

    if (m_nCount < 15) {
      m_nPos.y -= nDY;
      this.m_nodeThis.style.top = m_nPos.y + 'px';
      this.m_nodePicture.style.backgroundPosition = -8 * m_nCount + 'px 0px';
      m_objTarget.m_nodeThis.style.top = nTargetY + 'px';
      nTargetY++;

      if (bShadow) {
        this.m_nodeThis.style['-webkit-filter'] = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
        this.m_nodeThis.style['-moz-filter'] = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
        this.m_nodeThis.style['-ms-filter'] = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
        this.m_nodeThis.style.filter = 'drop-shadow(' + m_nShadowX + 'px ' + m_nShadowY + 'px 2px rgba(0,0,0,0.5))';
        m_nShadowX--;
        m_nShadowY--;
      }
    }

    if (m_nCount == 15) {
      this.m_nodeThis.style.visibility = 'hidden';
      var x = parseInt(m_objTarget.m_nodeThis.style.left) + 7;
      var y = parseInt(m_objTarget.m_nodeThis.style.top) + 7;
      var objHitAr = [];

      if (g_App.GetMapObject().HitTest(x, y, objHitAr)) {
        for (var i = 0; i < objHitAr.length; i++) {
          objHitAr[i].Hit();
        }
      } // アンドアジェネシス用


      var objAndorGen = g_App.GetObjectManager().GetObject(OBJECT_ANDORGEN);

      if (objAndorGen) {
        if (objAndorGen.HitTest(x, y, false)) objAndorGen.Hit();
      }

      m_objTarget.Delete();
      m_objTarget = null;
    }

    if (m_nCount >= 16) {
      return false;
    }

    m_nCount++;
    return true;
  };

  Blaster.prototype.Delete = function () {
    FlyingObject.prototype.Delete.call(this);

    if (m_objTarget) {
      m_objTarget.Delete();
      m_objTarget = null;
    }
  };

  this.GetBombingPos = function () {
    if (!m_objTarget) return {
      x: -999,
      y: -999
    };
    return {
      x: parseInt(m_objTarget.m_nodeThis.style.left) + 7,
      y: parseInt(m_objTarget.m_nodeThis.style.top) + 7
    };
  };
}

_inherit(Zapper, FlyingObject);

function Zapper(objSolvalou) {
  this.base();
  this.m_bNeedPalette = false;
  var m_bHitBacura = false;
  var m_nCount = 0;
  var m_nPos = objSolvalou.GetPos();
  m_nPos.y += 2;
  this.Create(m_nPos.x, m_nPos.y);
  this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX + 2;
  this.m_nodePicture.classList.add('zapper');
  this.Show(true);

  this.Action = function () {
    var objectAr = g_App.GetObjectManager().GetObjectAr(); // バキュラに当たっていない場合

    if (!m_bHitBacura) {
      var hitTest = function hitTest(nX, nY) {
        for (var i = 0; i < objectAr.length; i++) {
          // アンドアジェネシスは地上キャラだがスクロールの影響を受けないようにAreaには登録していない
          // このためにObjectManager管理にしているが、そのままだとBlasterに当たってしまうのでHitTestしないようにする
          if (objectAr[i].m_nType == OBJECT_ANDORGEN) continue; // 通常の空中キャラの当たり判定

          if (objectAr[i].HitTest(nX, nY, false)) {
            // バキュラに当たった
            if (objectAr[i].m_nType == OBJECT_BACURA) {
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
      };

      for (var nOftY = -2; nOftY < 8; nOftY++) {
        var objHit = hitTest(m_nPos.x + 2, m_nPos.y + nOftY, false);

        if (objHit) {
          objHit.Hit();
          return false;
        }

        objHit = hitTest(m_nPos.x + 13, m_nPos.y + nOftY, false);

        if (objHit) {
          objHit.Hit();
          return false;
        }
      }
    } // バキュラに当たっている場合は火花(?)を描画


    if (m_bHitBacura) {
      var nIndexX = (m_nCount / 2 | 0) % 7;
      this.m_nBKOftX = -nIndexX * 16;
      this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX + 'px ' + this.m_nBKOftY + 'px';
      m_nCount++;
      if (m_nCount > 12) return false;
    } else {
      var _nIndexX = (m_nCount / 2 | 0) % 2;

      var nIndexY = (m_nCount / 1 | 0) % 2;
      this.m_nBKOftX = -_nIndexX * 16;
      this.m_nBKOftY = -nIndexY * 16;
      this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX + 'px ' + this.m_nBKOftY + 'px';
      m_nCount++;
      m_nPos.y -= 8;

      if (m_nPos.y < -16) {
        return false;
      }

      this.m_nodeThis.style.top = m_nPos.y + 'px';
    }

    return true;
  };

  this.GetCount = function () {
    return m_nCount;
  };
}

_inherit(Solvalou, FlyingObject);

function Solvalou() {
  this.base();
  this.m_nType = 0;
  this.m_strName = 'SOLVALOU';
  this.m_bNeedPalette = false; // Original Shape

  this.m_nBKOftX = -80;
  this.m_nBKOftY = -144; // Realistic Shape
  //this.m_nBKOftX= -112;
  //this.m_nBKOftY = -128;
  // Helicopter Shape
  //this.m_nBKOftX= -48;
  //this.m_nBKOftY = -160;

  this.m_objSight = new FlyingObject();
  this.m_objSight.m_bNeedPalette = false;
  this.m_objSight.m_bBreakable = false;
  this.m_objSight.m_nBKOftX = -96;
  this.m_objSight.m_nBKOftY = -144;
  this.m_bDestroyed = false;
  var m_objBlaster = null;
  var m_objZapperAr = [];
  var m_nX;
  var m_nY;
  var m_nMissed = 0;
  var m_nCount = 0;
  var m_bMouse = false;

  this.Initialize = function () {
    m_bMouse = false;
    if (g_App.GetConfigObject().IsMouse()) m_bMouse = true;

    if (this.m_nodeThis) {
      if (g_App.GetConfigObject().IsShadow()) {
        this.m_nodeThis.classList.add('flying-shadow');
      } else {
        this.m_nodeThis.classList.remove('flying-shadow');
      }
    }

    m_nFrameCount = 0;
    this.m_nHitCount = 0;
    this.m_bDestroyed = false;
    m_nMissed = 0;
    m_nX = (SCREEN_WIDTH - 16) / 2 | 0;
    m_nY = SCREEN_HEIGHT - 16 - 8;
    g_nMouseX = m_nX + 7;
    g_nMouseY = m_nY + 7;
    g_bKeyLeft = false;
    g_bKeyRight = false;
    g_bKeyUp = false;
    g_bKeyDown = false;
    g_bKeyFire = false;
    g_bKeyBomb = false;
  };

  this.ReflectPos = function () {
    this.m_nodeThis.style.left = m_nX + 'px';
    this.m_nodeThis.style.top = m_nY + 'px';
    this.m_objSight.m_nodeThis.style.left = m_nX + 'px';
    this.m_objSight.m_nodeThis.style.top = m_nY - SIGHT_OFFSET_Y + 'px';
  };

  this.GetPos = function () {
    return {
      x: m_nX,
      y: m_nY
    };
  };

  this.GetTargetPos = function () {
    return {
      x: m_nX + 8,
      y: m_nY - SIGHT_OFFSET_Y + 8
    };
  };

  this.GetBombingPos = function () {
    if (!m_objBlaster) return {
      x: -999,
      y: -999
    };
    return m_objBlaster.GetBombingPos();
  };

  this.NumMiss = function () {
    return m_nMissed;
  };

  Solvalou.prototype.Create = function () {
    this.Initialize();
    FlyingObject.prototype.Create.call(this, m_nX, m_nY);
    this.m_nodeThis.style.zIndex = SOLVALOU_Z_INDEX;
    this.m_nodeExplosion.classList.remove('flying_explosion');
    this.m_nodeExplosion.classList.add('solvalou_explosion');
    this.m_objSight.Create(m_nX, m_nY - SIGHT_OFFSET_Y);
    this.m_objSight.m_nodeThis.classList.remove('flying-shadow');
  };

  Solvalou.prototype.HitTest = function (objTarget) {
    if (this.m_nHitCount != 0) return false;
    if (objTarget.m_nHitCount != 0) return false;
    if (objTarget.m_nType == OBJECT_SHEONITE) return false;
    if (g_App.GetConfigObject().IsInvincible() && !g_App.IsDemoMode()) return false;

    if (objTarget.m_nType == OBJECT_BACURA) {
      var bHit = false;
      if (objTarget.IsInside(m_nX + 6, m_nX + 9, m_nY, m_nY + 3)) bHit = true;else if (objTarget.IsInside(m_nX + 4, m_nX + 11, m_nY + 4, m_nY + 6)) bHit = true;else if (objTarget.IsInside(m_nX + 2, m_nX + 13, m_nY + 7, m_nY + 9)) bHit = true;else if (objTarget.IsInside(m_nX, m_nX + 15, m_nY + 10, m_nY + 15)) bHit = true;

      if (bHit) {
        this.m_nHitCount = 1;
        this.m_nodePicture.style.visibility = 'hidden';
        this.m_nodeExplosion.style.visibility = 'visible'; //g_objSound.Stop('idSndMiss');

        g_objSound.Play('idSndMiss');
        m_nMissed++;
      }

      return bHit;
    }

    var nodeTarget = objTarget.m_nodeThis;
    var nTargetR = objTarget.m_nRadiusToHitSolvalou;
    var nTargetCX = objTarget.m_pos.x;
    var nTargetCY = objTarget.m_pos.y;
    var nMyCX = m_nX + 7;
    var nMyCY = m_nY + 7;
    var fDist = Math.sqrt((nTargetCX - nMyCX) * (nTargetCX - nMyCX) + (nTargetCY - nMyCY) * (nTargetCY - nMyCY));
    if (fDist > 6 + nTargetR) return false;
    this.m_nHitCount = 1;
    this.m_nodePicture.style.visibility = 'hidden';
    this.m_nodeExplosion.style.visibility = 'visible'; //g_objSound.Stop('idSndMiss');

    g_objSound.Play('idSndMiss');
    m_nMissed++;
    return true;
  };

  Solvalou.prototype.Delete = function () {
    Object.prototype.Delete.call(this);
    this.m_objSight.Delete();
    if (m_objBlaster) m_objBlaster.Delete();
  };

  Solvalou.prototype.Show = function (bShow) {
    Object.prototype.Show.call(this, bShow);
    this.m_objSight.Show(bShow);

    if (bShow) {
      this.m_nodePicture.style.visibility = 'visible';
      this.m_nodeExplosion.style.visibility = 'hidden';
    }
  };

  this.Action = function (nFrame, nFrameCount) {
    // ブラスター
    if (m_objBlaster) {
      if (nFrame == 1) {
        if (!m_objBlaster.Action()) {
          m_objBlaster.Delete();
          m_objBlaster = null;
          m_nBombingY = -999;
        }
      }
    }

    if (g_bKeyBomb) {
      if (!m_objBlaster) {
        m_objBlaster = new Blaster(this);
      }
    } // ザッパー


    for (var i = m_objZapperAr.length - 1; i >= 0; i--) {
      var bOK = m_objZapperAr[i].Action();

      if (!bOK) {
        m_objZapperAr[i].Delete();
        m_objZapperAr[i] = null;
        m_objZapperAr.splice(i, 1);
      }
    }

    if (g_bKeyFire) {
      if (m_objZapperAr.length < 3) {
        var nMinCount = 9999;
        var nZappers = m_objZapperAr.length;

        for (var _i = nZappers - 1; _i >= 0; _i--) {
          var nCount = m_objZapperAr[_i].GetCount();

          if (nMinCount > nCount) nMinCount = nCount;
        }

        if (g_bKeyFireOK) {
          g_bKeyFireOK = false;
          nMinCount = 9999;
        }

        if (nMinCount > 19) {
          //前ショットとの間隔が短いと撃たない
          if (nZappers < 3) {
            //3発以上は連射しない
            var objZapper = new Zapper(this);
            m_objZapperAr[m_objZapperAr.length] = objZapper;
            g_objSound.Play('idSndZapper');
          }
        }
      }
    } // 爆発


    if (this.m_nHitCount != 0) {
      var nRatio = 4;
      var nIndex = ((this.m_nHitCount - 1) / nRatio | 0) % 13;
      this.m_nodeExplosion.style.backgroundPosition = -nIndex * 32 + 'px 0px';
      this.m_nHitCount++;

      if (this.m_nHitCount > 13 * nRatio) {
        this.m_bDestroyed = true; // デモプレイで使用

        this.m_nodeExplosion.style.visibility = 'hidden';
        g_objSound.Stop('idSndAndorGen'); // Blasterの消去

        if (m_objBlaster) {
          m_objBlaster.Delete();
          m_objBlaster = null;
          m_nBombingY = -999;
        } // Zapperの消去


        for (var _i2 = m_objZapperAr.length - 1; _i2 >= 0; _i2--) {
          m_objZapperAr[_i2].Delete();

          m_objZapperAr[_i2] = null;
          m_objZapperAr.splice(_i2, 1);
        } // 難易度の引下げ


        var nDifficulty = g_App.GetConfigObject().GetDifficulty();
        var nDelta = 24;

        switch (nDifficulty) {
          case 1:
            nDelta = 16;
            break;

          case 2:
            nDelta = 8;
            break;

          case 3:
            nDelta = 0;
            break;
        }

        g_App.GetGameObject().AddFlyingEnemyIndex(-nDelta); //実機のバグ再現：やられると位置が画面外になる

        m_nX = SCREEN_WIDTH;
        m_nY = -32;
        return false;
      }

      return true;
    } // 移動


    var nDX = nFrame == 0 ? 1 : 2; //横方向は1pixelと2pixelの交互に移動

    var nDY = 1; //縦方向は1pixelずつ移動
    // マウス位置の取得

    if (m_bMouse && nFrameCount > 100) {
      //スタート直後は取得しない
      m_nX = g_nMouseX - 7;
      if (m_nX < 0) m_nX = 0;
      if (m_nX >= SCREEN_WIDTH - 16) m_nX = SCREEN_WIDTH - 16;
      m_nY = g_nMouseY - 7;
      if (m_nY < SIGHT_OFFSET_Y + 16) m_nY = SIGHT_OFFSET_Y + 16;
      if (m_nY >= SCREEN_HEIGHT - 16) m_nY = SCREEN_HEIGHT - 16;
    }

    if (g_bKeyUp) {
      m_nY -= nDY;
      if (m_nY - SIGHT_OFFSET_Y - 16 < 0) m_nY = SIGHT_OFFSET_Y + 16;
      g_nMouseY = m_nY + 7;
      nDX = 1; //斜め移動の場合は横方向は常に1pixel移動
    }

    if (g_bKeyDown) {
      m_nY += nDY;
      if (m_nY + 16 >= SCREEN_HEIGHT) m_nY = SCREEN_HEIGHT - 16;
      g_nMouseY = m_nY + 7;
      nDX = 1; //斜め移動の場合は横方向は常に1pixel移動
    }

    if (g_bKeyLeft) {
      m_nX -= nDX;
      if (m_nX < 0) m_nX = 0;
      g_nMouseX = m_nX + 7;
    }

    if (g_bKeyRight) {
      m_nX += nDX;
      if (m_nX + 16 >= SCREEN_WIDTH) m_nX = SCREEN_WIDTH - 16;
      g_nMouseX = m_nX + 7;
    }

    this.ReflectPos(); // ターゲットスコープ

    var nSightOftY = this.m_objSight.m_nBKOftY;
    if (m_objBlaster) nSightOftY -= 16;
    var nSightOftX = this.m_objSight.m_nBKOftX;
    var x = parseInt(this.m_objSight.m_nodeThis.style.left) + 7;
    var y = parseInt(this.m_objSight.m_nodeThis.style.top) + 7;
    var objHitAr = [];

    if (g_App.GetMapObject().HitTest(x, y, objHitAr)) {
      if (!objHitAr[0].m_bHidden) {
        var _nIndex = (m_nCount / 4 | 0) % 2;

        if (_nIndex == 1) nSightOftX -= 16;
        m_nCount++;
        if (m_nCount > 100) m_nCount = 0;
      }
    }

    objHitAr = null;
    this.m_objSight.GetPictureNode().style.backgroundPosition = nSightOftX + 'px ' + nSightOftY + 'px'; // スペシャルフラッグとの接触

    var nodeSpecialAr = document.getElementsByClassName('special');

    if (nodeSpecialAr.length && g_objSpecial) {
      x = parseInt(this.m_nodeThis.style.left) + 7;
      y = parseInt(this.m_nodeThis.style.top) + 7;

      if (g_objSpecial.HitTest(x, y)) {
        g_objSpecial.FlagTaken();
      }
    }

    nodeSpecialAr = null;

    if (this.m_nBKOftY == -160) {
      this.m_nBKOftX = -48;
      if (g_App.m_nFrameCount % 8 < 4) this.m_nBKOftX = -64;
      this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX + 'px ' + this.m_nBKOftY + 'px';
    }

    return true;
  };
}
//# sourceMappingURL=solvalou.dev.js.map
