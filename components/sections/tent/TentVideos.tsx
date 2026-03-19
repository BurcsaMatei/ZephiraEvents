// components/sections/TentVideos.tsx

// ==============================
// Imports
// ==============================
import * as s from "../../../styles/sections/tent/tentVideos.css";
import Appear from "../../animations/Appear";

// ==============================
// Constante
// ==============================
const VIDEOS = Array.from(
  { length: 8 },
  (_, i) => `/videos/tent/${String(i + 1).padStart(2, "0")}.mp4`,
);

// ==============================
// Component
// ==============================
export default function TentVideos() {
  return (
    <Appear immediate kind="fade">
      <div className={s.grid}>
        {VIDEOS.map((src) => (
          <div key={src} className={s.videoWrap}>
            <video src={src} className={s.video} autoPlay muted loop playsInline />
          </div>
        ))}
      </div>
    </Appear>
  );
}
