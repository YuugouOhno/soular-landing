import { TICKER_ITEMS } from "@/data/landing";

// 無限スクロールは translateX(-50%) で 1 周するため、中身がちょうど 2 周分必要。
// 移行前は mount 後に track.innerHTML を複製していたが、React の管理外で DOM を
// 増やす形になり hydration と相性が悪いため、JSX 側で 2 回描画する形に変えている
// （最終的な DOM は移行前と同じ）。
export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" id="ticker">
        {[0, 1].map((rep) =>
          TICKER_ITEMS.map((item) => (
            <span className="ticker-item" key={`${rep}-${item.label}`}>
              <b>{item.label}</b> {item.body}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
