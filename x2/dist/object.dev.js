"use strict";

function Object() {
  this.m_objArea = null;
  this.m_nodeBack = null;
  this.m_nodeThis = null;
  this.m_nodePicture = null;
  this.m_nodePalette = null;
  this.m_nodeExplosion = null;
  this.m_nType = 0;
  this.m_strName = '';
  this.m_nScore = 0;
  this.m_nBKOftX = -16;
  this.m_nBKOftY = 0;
  this.m_nSize = 16;
  this.m_nHitAreaX = 7 - 4 - 5;
  this.m_nHitAreaY = 7 - 4 - 5;
  this.m_nHitAreaW = 8 + 4 + 5;
  this.m_nHitAreaH = 8 + 4 + 5;
  this.m_bBreakable = true;
  this.m_bShow = true;
  this.m_nHitCount = 0;
  this.m_bHidden = false;
  this.m_bCanFire = false;
  this.m_nFiredFrame = 0;
  this.m_nFiring = 0;
  this.m_nRestPeriod = 0;
  this.m_nFiringPossibility = 0;
  this.m_bHasHatch = false;
  this.m_bNeedPalette = true;
  this.m_bSetInitialXPos = false; // 空中キャラとスペシャルフラッグの初期X位置設定

  this.m_bSetInitialXPos = false;

  this.SetInitialXPos = function (nDist) {
    if (this.m_bSetInitialXPos) return; // X位置を決定

    this.m_bSetInitialXPos = true;
    var objSolvalou = g_App.GetSolvalouObject();
    var nSolvalouX = parseInt(objSolvalou.m_nodeThis.style.left) / 8 | 0;
    var nX = 1;
    var nRetry = 200;

    while (nRetry) {
      nX = _random((SCREEN_WIDTH / 8 | 0) - 3) + 1;
      if (nX < nSolvalouX - nDist || nX >= nSolvalouX + nDist + 2) break;
      nRetry--;
    }

    g_Debug.Clear();
    g_Debug.Print("InitialXPos=" + nX + "  Retry=" + (200 - nRetry));
    this.m_nodeThis.style.left = nX * 8 + 'px';
  };

  Object.prototype.Create = function (objArea, nX, nY) {
    this.m_objArea = objArea;
    this.m_nodeThis = document.createElement('div');
    this.m_nodeThis.classList.add('object');
    this.m_nodeThis.classList.add('size16');
    this.m_nodeThis.style.left = nX + 'px';
    this.m_nodeThis.style.top = nY + 'px';
    this.m_nodeThis.style.zIndex = 0;
    this.m_nodeThis.style.visibility = this.m_bShow ? 'visible' : 'hidden';
    this.m_nodeBack.appendChild(this.m_nodeThis);
    this.m_nodeThis.classList.add('object');
    this.m_nodePicture = document.createElement('div');
    this.m_nodePicture.classList.add('object');
    this.m_nodePicture.classList.add('size16');
    this.m_nodePicture.style.left = '0px';
    this.m_nodePicture.style.top = '0px';
    this.m_nodePicture.style.zIndex = 1;
    this.m_nodePicture.style.backgroundPosition = this.m_nBKOftX + 'px ' + this.m_nBKOftY + 'px';
    this.m_nodeThis.appendChild(this.m_nodePicture);

    if (this.m_bNeedPalette) {
      this.m_nodePalette = document.createElement('div');
      this.m_nodePalette.classList.add('object');
      this.m_nodePalette.classList.add('size16');
      this.m_nodePalette.classList.add('palette');
      this.m_nodePalette.style.left = '0px';
      this.m_nodePalette.style.top = '0px';
      this.m_nodePalette.style.zIndex = 0;
      this.m_nodePalette.style.backgroundColor = 'yellow';
      this.m_nodePalette.style['-webkit-mask-position'] = '0px ' + this.m_nBKOftY + 'px';
      this.m_nodeThis.appendChild(this.m_nodePalette);
    }
  };

  Object.prototype.GetNode = function () {
    return this.m_nodeThis;
  };

  Object.prototype.GetPictureNode = function () {
    return this.m_nodePicture;
  };

  Object.prototype.GetPaletteNode = function () {
    return this.m_nodePalette;
  };

  Object.prototype.Delete = function () {
    if (this.m_nodeBack && this.m_nodeThis) this.m_nodeBack.removeChild(this.m_nodeThis);
  };

  Object.prototype.Show = function (bShow) {
    this.m_bShow = bShow;
    var str = bShow ? 'block' : 'none';
    this.m_nodeThis.style.display = str;
  };

  Object.prototype.HitTest = function (nX, nY, bGrobda) {
    if (this.m_nHitCount == 0) {
      var nLeft, nRight, nTop, nBottom;

      if (!bGrobda) {
        nLeft = parseInt(this.m_nodeThis.style.left) + this.m_nHitAreaX;
        nRight = nLeft + this.m_nHitAreaW;
        nTop = parseInt(this.m_nodeThis.style.top) + this.m_nHitAreaY;
        nBottom = nTop + this.m_nHitAreaH;
      } else {
        nX = (nX / 8 | 0) * 8;
        nY = (nY / 8 | 0) * 8;
        nLeft = (parseInt(this.m_nodeThis.style.left) / 8 | 0) * 8 - 8;
        nRight = nLeft + 40;
        nTop = (parseInt(this.m_nodeThis.style.top) / 8 | 0) * 8 - 16;
        nBottom = nTop + 40;
      }

      if (nX >= nLeft && nX <= nRight && nY >= nTop && nY <= nBottom) return true;
    }

    return false;
  };

  Object.prototype.Hit = function () {
    if (!this.m_bBreakable) return false;
    if (this.m_nHitCount != 0) return false;
    this.m_nHitCount = 1;
    g_App.GetScoreObject().AddScore(this.m_nScore);
    return true;
  };

  Object.prototype.Move = function () {
    if (this.m_nHitCount) return true;
    this.Fire();
    return true;
  };

  Object.prototype.Fire = function () {};

  Object.prototype.ShootSpario = function (nOftX, nOftY) {
    var nX = parseInt(this.m_nodeThis.style.left) + this.m_nSize / 2 - 2 + nOftX;
    var nY = parseInt(this.m_nodeThis.style.top) + this.m_nSize / 2 - 2 + nOftY;
    var objSpario = g_App.GetObjectManager().Create(OBJECT_SPARIO);
    if (objSpario) objSpario.SetPos(nX, nY);
    return objSpario;
  };
}
//# sourceMappingURL=object.dev.js.map
