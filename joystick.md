# 모바일 조이스틱 구현 기록

- 작업일: 2026-08-04
- 대상 게임: XEVIOUS (`x2`)
- 목적: 모바일 터치 화면에서 조이스틱, 시작 버튼, A/B 액션 버튼으로 게임을 조작

## 1. 구현 결과

모바일 환경에서 다음 컨트롤을 표시한다.

| UI | 기능 | 게임 입력 |
| --- | --- | --- |
| 가상 조이스틱 | 상하좌우 및 대각선 이동 | `g_bKeyUp`, `g_bKeyDown`, `g_bKeyLeft`, `g_bKeyRight` |
| `S` 버튼 | 게임 시작 | `KEY_S` |
| `A` 버튼 | 기존 키 설정에 따른 액션 | 기본 `KEY_X`, 설정 변경 시 `KEY_Z` |
| `B` 버튼 | 기존 키 설정에 따른 액션 | 기본 `KEY_Z`, 설정 변경 시 `KEY_X` |

조이스틱은 게임 내부가 방향별 boolean 상태를 사용하므로, 화면상으로는 아날로그 입력을 받지만 게임에는 4방향 디지털 입력으로 전달한다. 두 축의 임계값을 동시에 넘으면 대각선 이동도 가능하다.

## 2. 최종 구조

최종 구현은 외부 NippleJS 라이브러리가 아닌 Pointer Events 기반의 로컬 구현이다.

```text
pointerdown
    ↓
조이스틱 중심과 포인터 좌표 비교
    ↓
바깥 원 내부로 이동 거리 제한
    ↓
방향 상태 계산
    ↓
g_bKeyUp / Down / Left / Right 갱신
    ↓
기존 게임 루프에서 이동 처리
```

버튼도 동일하게 Pointer Events를 사용하며, 눌림 상태에서는 `OnKeyDown()`을 호출하고 놓으면 `OnKeyUp()`을 호출한다.

## 3. 변경 파일

### `x2/index.html`

모바일 컨트롤 DOM을 추가했다.

```html
<div class="mobile-controls" aria-label="Mobile controls">
  <div id="idJoyStick">
    <div id="idKnob"></div>
  </div>
  <div id="idActionButtons">
    <button id="idButtonStart" type="button">S</button>
    <button id="idButtonA" type="button">A</button>
    <button id="idButtonB" type="button">B</button>
  </div>
</div>
```

처음에는 NippleJS를 CDN에서 불러오는 방식으로 시작했지만, 최종 버전에서는 CDN `<script>`를 제거했다. 따라서 모바일 조작을 위해 별도 인터넷 연결이 필요하지 않다.

### `x2/mobile-control.js`

모바일 컨트롤의 동작을 담당한다.

- `pointerdown`: 조이스틱 포인터를 확보하고 이동 시작
- `pointermove`: 포인터 캡처 중인 포인터만 처리
- `pointerup`: 방향을 초기화하고 손잡이를 중앙으로 복귀
- `pointercancel`: 운영체제나 브라우저가 터치를 취소한 경우 초기화
- `lostpointercapture`: 포인터 캡처가 사라진 경우 초기화
- `window.blur`: 브라우저 포커스가 사라질 때 모든 버튼과 방향 해제

조이스틱 방향은 `SetDirectionKeyState()`에서 기존 게임 상태 변수에 직접 반영한다. 초기 구현에서는 방향 이동마다 `OnKeyDown()`과 `OnKeyUp()`을 호출했으나, 모바일 브라우저의 전역 터치 이벤트와 충돌할 가능성이 있어 방향 입력은 직접 상태 갱신으로 분리했다.

버튼 입력은 기존 키 입력 처리와의 호환을 위해 `SetKeyState()`를 통해 `OnKeyDown()`과 `OnKeyUp()`을 사용한다.

### `x2/xevious.css`

모바일 컨트롤의 위치와 모양을 정의한다.

게임 기준 크기는 `240 x 288px`이다.

| 요소 | 위치 및 크기 |
| --- | --- |
| 조이스틱 바깥 원 | 왼쪽 `8px`, 위 `196px`, `76 x 76px` |
| A/B 버튼 그룹 | 오른쪽 `8px`, 위 `216px`, `80 x 36px` |
| S 버튼 | A/B 그룹 중앙 위, `22 x 22px` |

컨트롤은 다음 미디어 조건에서만 표시한다.

```css
@media (hover: none), (pointer: coarse)
```

따라서 일반 데스크톱 마우스 환경에서는 모바일 컨트롤이 표시되지 않는다.

## 4. 조이스틱 좌표 보정

게임 화면은 `#idMain`에 `transform: scale()`을 적용해 기기 화면에 맞춰 확대한다. 이 때문에 `getBoundingClientRect()`가 반환하는 화면 픽셀과 CSS의 논리 좌표가 서로 달라진다.

최종 구현에서는 다음 순서로 처리한다.

1. `getBoundingClientRect()`로 화면상 조이스틱 영역과 중심을 계산한다.
2. 손잡이의 실제 화면상 크기를 계산한다.
3. 바깥 원 반지름에서 손잡이 반지름과 여백을 뺀 최대 이동 거리를 구한다.
4. 포인터가 최대 이동 거리 밖에 있으면 벡터를 원 경계 안으로 정규화한다.
5. 화면 픽셀 이동량을 CSS 좌표 이동량으로 다시 나눠 손잡이에 적용한다.

이 보정으로 화면이 확대된 iPad에서도 손잡이가 바깥 원을 넘어가거나 화면 중앙까지 과도하게 이동하지 않는다.

## 5. 입력 충돌 방지

기존 `x2/control.js`에는 전역 `mousedown`, `touchstart`, `touchmove`, `touchend` 처리가 있다. 모바일 컨트롤의 터치가 기존 게임 화면 터치로 중복 처리되지 않도록 다음 함수를 추가했다.

```js
function IsMobileControlTarget(e) {
  return !!(e.target && e.target.closest &&
    e.target.closest('#idJoyStick, #idActionButtons'));
}
```

기존 전역 터치 핸들러는 모바일 컨트롤 영역에서 조기 종료한다. 그 결과 조이스틱은 이동 입력만 담당하고, A/B 버튼은 액션 입력만 담당한다.

## 6. NippleJS에서 Pointer Events로 변경한 이유

초기에는 NippleJS `0.10.2`를 사용했다.

- 장점: 조이스틱 시각 효과와 터치 추적을 빠르게 구성할 수 있음
- 문제: iPad 터치 환경에서 조이스틱을 움직인 뒤 놓을 때 `Script error` 발생
- 확인 내용: NippleJS의 `touchend`/`touchcancel` 종료 경로에서 이미 제거된 조이스틱을 다시 정리하는 상황이 발생할 수 있음

특히 NippleJS 내부 종료 처리에서 조이스틱 객체가 없는 경우를 완전히 방어하기 전에 식별자에 접근하는 경로가 있어, 현재 게임처럼 전역 터치 이벤트도 함께 사용하는 구조와 충돌할 가능성이 있었다.

이에 따라 최종 구현에서는 외부 라이브러리를 제거하고 게임에 필요한 기능만 Pointer Events로 구현했다. 현재 구현은 조이스틱 영역, 방향 계산, 경계 제한, 입력 해제만 포함하므로 게임 규모에 비해 동작 범위가 명확하다.

## 7. 검증

다음 검사를 수행했다.

```powershell
node --check x2/mobile-control.js
node --check x2/control.js
git diff --check
```

확인해야 할 실제 기기 동작은 다음과 같다.

- 조이스틱을 상하좌우로 움직일 때 우주선이 해당 방향으로 이동
- 대각선 입력 시 두 방향이 동시에 적용
- 조이스틱을 놓으면 손잡이가 중앙으로 복귀하고 이동이 멈춤
- 조이스틱을 원 밖으로 끌어도 손잡이는 원 경계까지만 이동
- A/B를 각각 누르고 있는 동안 액션이 유지됨
- S를 누르면 기존 `S` 키와 동일하게 게임이 시작됨
- 버튼이나 조이스틱을 누른 채 브라우저 포커스를 잃어도 입력이 고착되지 않음

## 8. 유지보수 시 주의사항

- 게임의 방향 전역 변수 이름을 변경하면 `x2/mobile-control.js`의 `SetDirectionKeyState()`도 함께 수정해야 한다.
- `#idMain`의 확대 방식이나 게임 기준 크기를 변경하면 조이스틱 좌표 보정과 CSS 위치를 함께 확인해야 한다.
- 액션 키 설정 매핑을 변경하면 `GetActionKey()`와 기존 `Config`의 키 설정 동작을 함께 확인해야 한다.
- 모바일 컨트롤 DOM의 ID를 변경하면 `x2/mobile-control.js`의 초기 요소 조회도 변경해야 한다.
