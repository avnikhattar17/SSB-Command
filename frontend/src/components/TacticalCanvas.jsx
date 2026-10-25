import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

function drawJet(ctx, x, y, angle, color, glow, scale = 1, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  ctx.shadowColor = glow; ctx.shadowBlur = 10; ctx.fillStyle = 'rgba(9,31,45,.94)'; ctx.strokeStyle = color; ctx.lineWidth = 1.25;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-7, -12); ctx.lineTo(-4, -3); ctx.lineTo(-13, -2.5); ctx.lineTo(-13, 2.5); ctx.lineTo(-4, 3); ctx.lineTo(-7, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

// Detailed top-down destroyer illustration adapted from the supplied canvas reference.
function drawDestroyer(ctx, x, y, scale, time, accent, bright, flir, bank = 0, scanGlow = 0) {
  const roll = Math.sin(time * .72) * .013;
  const heave = Math.sin(time * 1.35) * 2.6;
  ctx.save(); ctx.translate(x, y + heave); ctx.rotate(roll + bank); ctx.scale(scale, scale);
  const hullLeft = flir ? '#011926' : '#263544'; const hullRight = flir ? '#07364d' : '#607187';
  const deck = flir ? '#02243a' : '#354354'; const line = flir ? '#00e5ff' : accent;
  const wake = ctx.createLinearGradient(0, 35, 0, 168); wake.addColorStop(0, `${accent}62`); wake.addColorStop(.36, `${accent}20`); wake.addColorStop(1, `${accent}00`);
  ctx.fillStyle = wake; ctx.beginPath(); ctx.moveTo(-8, 31); ctx.bezierCurveTo(-48, 75, -72, 128, -103, 169); ctx.lineTo(103, 169); ctx.bezierCurveTo(72, 128, 48, 75, 8, 31); ctx.closePath(); ctx.fill();
  ctx.shadowColor = accent; ctx.shadowBlur = (flir ? 10 : 7) + scanGlow * 18;
  ctx.fillStyle = hullLeft; ctx.beginPath(); ctx.moveTo(0, -106); ctx.lineTo(-38, -91); ctx.lineTo(-62, -54); ctx.lineTo(-66, -6); ctx.lineTo(-45, 25); ctx.lineTo(0, 42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hullRight; ctx.beginPath(); ctx.moveTo(0, -106); ctx.lineTo(38, -91); ctx.lineTo(62, -54); ctx.lineTo(66, -6); ctx.lineTo(45, 25); ctx.lineTo(0, 42); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -106); ctx.lineTo(38, -91); ctx.lineTo(62, -54); ctx.lineTo(66, -6); ctx.lineTo(45, 25); ctx.lineTo(0, 42); ctx.lineTo(-45, 25); ctx.lineTo(-66, -6); ctx.lineTo(-62, -54); ctx.lineTo(-38, -91); ctx.closePath();
  ctx.globalAlpha = .16 + scanGlow * .64; ctx.strokeStyle = bright; ctx.lineWidth = 1.8 + scanGlow; ctx.shadowColor = bright; ctx.shadowBlur = 7 + scanGlow * 22; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.strokeStyle = `${bright}cf`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -106); ctx.lineTo(0, 42); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.strokeStyle = `${line}b5`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-56, -46); ctx.lineTo(-42, 2); ctx.lineTo(0, 32); ctx.lineTo(42, 2); ctx.lineTo(56, -46); ctx.stroke();
  // Flight deck and breakwater details.
  ctx.fillStyle = deck; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(-48, 1); ctx.lineTo(-40, -43); ctx.lineTo(40, -43); ctx.lineTo(48, 1); ctx.closePath(); ctx.fill(); ctx.strokeStyle = `${bright}76`; ctx.stroke();
  ctx.strokeStyle = `${bright}79`; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-31, -20); ctx.lineTo(0, -9); ctx.lineTo(31, -20); ctx.stroke();
  // Main gun, VLS deck, bridge and faceted mast.
  ctx.fillStyle = flir ? '#044366' : '#65768a'; ctx.strokeStyle = line; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-9, -18); ctx.lineTo(-8, -29); ctx.lineTo(0, -33); ctx.lineTo(8, -29); ctx.lineTo(9, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#202a36'; ctx.fillRect(-1.4, -15, 2.8, 15);
  ctx.fillStyle = flir ? '#03304a' : '#445365'; ctx.fillRect(-16, -52, 32, 16); ctx.strokeStyle = '#d4af37'; ctx.strokeRect(-16, -52, 32, 16);
  ctx.beginPath(); ctx.moveTo(-29, -56); ctx.lineTo(-22, -80); ctx.lineTo(22, -80); ctx.lineTo(29, -56); ctx.closePath(); ctx.fill();
  ctx.fillStyle = flir ? '#00e5ff' : '#16334a'; for (let i = -3; i <= 3; i++) ctx.fillRect(i * 6 - 2, -72, 4, 3);
  ctx.fillStyle = flir ? '#034563' : '#394655'; ctx.beginPath(); ctx.moveTo(-19, -80); ctx.lineTo(-10, -111); ctx.lineTo(10, -111); ctx.lineTo(19, -80); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d4af37'; ctx.strokeRect(-13, -98, 7, 13); ctx.strokeRect(6, -98, 7, 13);
  ctx.strokeStyle = `${bright}c0`; ctx.beginPath(); ctx.moveTo(-19, -104); ctx.lineTo(19, -104); ctx.moveTo(0, -111); ctx.lineTo(0, -124); ctx.stroke();
  ctx.fillStyle = '#ff4b4b'; ctx.beginPath(); ctx.arc(-20, -104, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#4cff9b'; ctx.beginPath(); ctx.arc(20, -104, 1.8, 0, Math.PI * 2); ctx.fill();
  // Small ensign and pennant marking.
  ctx.fillStyle = '#fff'; ctx.fillRect(0, -120, 13, 7); ctx.fillStyle = '#ff9933'; ctx.fillRect(0, -120, 13, 2.3); ctx.fillStyle = '#138808'; ctx.fillRect(0, -115.3, 13, 1.7);
  ctx.restore();

}

export default function TacticalCanvas({ branch, backgroundLayer = false }) {
  const canvasRef = useRef(null);
  const pingsRef = useRef([]);
  const frameRef = useRef(null);
  const audioRef = useRef(null);
  const parallaxTargetRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const [sound, setSound] = useState(false);
  const controlsRef = useRef({ flank: true, flir: true, sound: false });
  controlsRef.current = { flank: true, flir: true, sound };
  const [telemetry, setTelemetry] = useState('RADAR ONLINE · TAP TO PING');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return undefined;
    let width = 1; let height = 1; let dpr = 1; let animationId = 0; let lastTime = 0; let hexGridCache = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buildHexGrid = () => {
      hexGridCache = document.createElement('canvas');
      hexGridCache.width = canvas.width; hexGridCache.height = canvas.height;
      const gridCtx = hexGridCache.getContext('2d');
      if (!gridCtx) return;
      gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0); gridCtx.strokeStyle = `${branch.accent}0b`; gridCtx.lineWidth = .65; gridCtx.beginPath();
      const hex = width < 480 ? 19 : 27; const hexH = Math.sqrt(3) * hex;
      for (let row = -1; row < height / hexH + 1; row++) for (let col = -1; col < width / (hex * 1.5) + 1; col++) {
        const hx = col * hex * 1.5; const hy = row * hexH + (col % 2 ? hexH / 2 : 0);
        gridCtx.moveTo(hx + hex, hy);
        for (let side = 1; side <= 6; side++) { const a = side * Math.PI / 3; gridCtx.lineTo(hx + Math.cos(a) * hex, hy + Math.sin(a) * hex); }
        gridCtx.closePath();
      }
      gridCtx.stroke();
    };
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = Math.max(1, box.width); height = Math.max(1, box.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildHexGrid();
      draw(0);
    };

    function draw(timestamp) {
      const controls = controlsRef.current;
      const t = reduced ? 0 : timestamp / 1000 * (controls.flank ? 1.7 : .65);
      const parallax = parallaxRef.current; const target = parallaxTargetRef.current;
      parallax.x += (target.x - parallax.x) * .035; parallax.y += (target.y - parallax.y) * .035;
      const { accent, bright, deep, glow } = branch;
      const centerX = width * .57; const centerY = height * .51; const radius = Math.min(width * .43, height * .46);
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height); bg.addColorStop(0, controls.flir ? '#102431' : deep); bg.addColorStop(.56, controls.flir ? '#0b1c29' : '#081c2a'); bg.addColorStop(1, controls.flir ? '#06131f' : '#061520'); ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

      // Soft underwater haze and distant light shafts, kept inside this canvas.
      const haze = ctx.createRadialGradient(width * .48, height * .34, 0, width * .48, height * .34, Math.max(width, height) * .78);
      haze.addColorStop(0, 'rgba(49,157,190,.13)'); haze.addColorStop(.48, 'rgba(22,97,133,.075)'); haze.addColorStop(1, 'rgba(2,13,23,0)');
      ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);
      ctx.save(); ctx.globalAlpha = .3; ctx.translate(width * .5, 0);
      for (let ray = 0; ray < 4; ray++) {
        const drift = Math.sin(t * .12 + ray * 1.7) * width * .035;
        const x = -width * .42 + ray * width * .27 + drift;
        const beam = ctx.createLinearGradient(x, 0, x + width * .12, height * .72);
        beam.addColorStop(0, 'rgba(116,222,255,0)'); beam.addColorStop(.32, 'rgba(116,222,255,.34)'); beam.addColorStop(1, 'rgba(116,222,255,0)');
        ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + width * .07, 0); ctx.lineTo(x + width * .34, height * .76); ctx.lineTo(x + width * .12, height * .76); ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // Sparse suspended particles drift at varied rates to suggest depth.
      for (let i = 0; i < 30; i++) {
        const speed = .12 + (i % 5) * .045; const phase = (t * speed + i * .137) % 1;
        const x = ((i * 83.7 + Math.sin(t * .16 + i) * 12) % width + width) % width;
        const y = (i * 47.9 - phase * (height + 24) + height + 24) % (height + 24) - 12;
        ctx.save(); ctx.globalAlpha = .28 + (i % 4) * .055; ctx.fillStyle = i % 3 ? '#9beaff' : bright;
        ctx.beginPath(); ctx.arc(x, y, .9 + (i % 3) * .38, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }

      // Faint ambient sonar echoes sit beneath the brighter interactive sweep.
      if (backgroundLayer) {
        ctx.save(); ctx.strokeStyle = '#79dcff'; ctx.lineWidth = .8;
        for (let i = 0; i < 3; i++) {
          const phase = (t * .035 + i / 3) % 1; const ringRadius = 34 + phase * Math.min(width, height) * .28;
          ctx.globalAlpha = (1 - phase) * .18; ctx.beginPath(); ctx.ellipse(width * .5, height * .57, ringRadius * 1.2, ringRadius * .58, -.12, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      }

      // Subtle hex field under the fine coordinate grid.
      ctx.save(); ctx.translate(parallax.x * 5, parallax.y * 5);
      if (hexGridCache) ctx.drawImage(hexGridCache, 0, 0, width, height);
      ctx.restore();

      // Navigational mesh and fine coordinate grid.
      ctx.save(); ctx.translate(parallax.x * 8, parallax.y * 8); ctx.strokeStyle = `${accent}12`; ctx.lineWidth = .6;
      const grid = width < 480 ? 28 : 36;
      for (let x = (t * 3) % grid; x < width; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = (t * 2) % grid; y < height; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
      ctx.restore();

      // Quiet contour rings and crosshairs.
      ctx.save(); ctx.translate(parallax.x * 11, parallax.y * 11); ctx.strokeStyle = `${accent}20`; ctx.lineWidth = .8;
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(width * (.19 + k * .16), height * (.52 + Math.sin(k * 1.4) * .12), 55 + k * 15, 23 + k * 8, -.35, 0, Math.PI * 2); ctx.stroke(); }
      ctx.setLineDash([2, 7]); ctx.beginPath(); ctx.moveTo(centerX - radius, centerY); ctx.lineTo(centerX + radius, centerY); ctx.moveTo(centerX, centerY - radius); ctx.lineTo(centerX, centerY + radius); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(centerX, centerY, radius * i / 4, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.strokeStyle = `${accent}66`; ctx.stroke();
      // Compass crosshair.
      ctx.beginPath(); ctx.moveTo(centerX - 6, centerY); ctx.lineTo(centerX + 6, centerY); ctx.moveTo(centerX, centerY - 6); ctx.lineTo(centerX, centerY + 6); ctx.strokeStyle = `${bright}9a`; ctx.stroke();
      ctx.restore();

      // Circular beam with soft radial sweep and a crisp leading edge.
      const angle = t * .47 - Math.PI / 2;
      ctx.save(); ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, angle - .72, angle); ctx.closePath();
      const sweep = ctx.createRadialGradient(centerX, centerY, radius * .05, centerX, centerY, radius); sweep.addColorStop(0, `${accent}00`); sweep.addColorStop(.75, `${accent}08`); sweep.addColorStop(1, `${accent}24`); ctx.fillStyle = sweep; ctx.fill();
      ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius); ctx.strokeStyle = bright; ctx.lineWidth = 1.6; ctx.shadowColor = accent; ctx.shadowBlur = 13; ctx.stroke(); ctx.restore();

      // Fixed contacts and geometric target pips.
      const contacts = [[-.4, -.28], [.23, -.63], [.58, -.13], [-.1, .52], [.67, .37]];
      contacts.forEach(([dx, dy], i) => {
        const x = centerX + dx * radius; const y = centerY + dy * radius;
        const illumination = Math.max(0, Math.min(1, (Math.cos(angle - Math.atan2(dy, dx)) + .25) / 1.25));
        const pulse = reduced ? 0 : (Math.sin(t * 1.8 + i * 2.4) + 1) / 2;
        ctx.save(); ctx.globalAlpha = .28 + illumination * .68; ctx.fillStyle = illumination > .62 ? bright : `${accent}ad`; ctx.shadowColor = accent; ctx.shadowBlur = 4 + illumination * 9;
        ctx.beginPath(); ctx.arc(x, y, (i % 2 ? 2.2 : 1.7) + pulse * .55, 0, Math.PI * 2); ctx.fill();
        if (illumination > .04) { ctx.globalAlpha = illumination * (.28 + pulse * .48); ctx.beginPath(); ctx.arc(x, y, 5 + pulse * 5 + (i % 3), 0, Math.PI * 2); ctx.strokeStyle = bright; ctx.lineWidth = .8; ctx.stroke(); }
        ctx.restore();
      });

      // Main FLIR view.
      // Main destroyer render with FLIR lighting and wake.
      const baseScale = backgroundLayer ? Math.min(width / 500, height / 440, 1.3) : Math.min(width / 550, height / 300, .82);
      const glide = backgroundLayer && !reduced ? Math.sin(t * .14) : 0;
      const shipX = width * (backgroundLayer ? .5 + glide * .105 : .25);
      const shipY = height * (backgroundLayer ? .57 + (reduced ? 0 : Math.sin(t * .2) * .018) : .52);
      const shipScale = baseScale * (backgroundLayer && !reduced ? 1 + Math.sin(t * .25) * .018 : 1);
      const bearing = backgroundLayer && !reduced ? Math.cos(t * .14) * .045 : 0;
      const shipAngle = Math.atan2(shipY - centerY, shipX - centerX);
      let scanDistance = Math.atan2(Math.sin(angle - shipAngle), Math.cos(angle - shipAngle));
      const scanGlow = backgroundLayer ? Math.max(0, 1 - Math.abs(scanDistance) / .24) : 0;

      // Soft cone of cyan light below the moving vessel.
      if (backgroundLayer) {
        ctx.save(); ctx.translate(shipX + parallax.x * 14, shipY + shipScale * 26 + parallax.y * 10); ctx.rotate(bearing); ctx.globalCompositeOperation = 'screen';
        const cone = ctx.createLinearGradient(0, 0, 0, Math.min(height * .4, 330)); cone.addColorStop(0, `rgba(53,207,244,${.14 + scanGlow * .12})`); cone.addColorStop(.42, 'rgba(32,159,205,.075)'); cone.addColorStop(1, 'rgba(20,112,170,0)');
        ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(-shipScale * 21, 0); ctx.lineTo(shipScale * 21, 0); ctx.lineTo(width * .2, Math.min(height * .4, 330)); ctx.lineTo(-width * .2, Math.min(height * .4, 330)); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      drawDestroyer(ctx, shipX + parallax.x * 14, shipY + parallax.y * 10, shipScale, t, controls.flir ? '#00c9e8' : accent, controls.flir ? '#a9f5ff' : bright, controls.flir, bearing, scanGlow);

      // A few tiny bubbles rise from the wake; their low contrast keeps the scene calm.
      if (backgroundLayer) {
        const sternX = width * .5; const sternY = height * .57 + shipScale * 48;
        for (let i = 0; i < 7; i++) {
          const phase = (t * (.11 + (i % 3) * .025) + i * .143) % 1;
          const x = sternX + Math.sin(t * .22 + i * 2.1) * (5 + phase * 22) + (i % 2 ? 1 : -1) * (8 + (i % 3) * 5);
          const y = sternY + 42 - phase * (45 + (i % 3) * 17);
          const radius = .8 + (i % 3) * .45;
          ctx.save(); ctx.globalAlpha = (1 - phase) * .58; ctx.strokeStyle = '#b8f1ff'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
      }

      // Bow spray particles give the destroyer wake a little motion.
      for (let i = 0; i < 18; i++) {
        const phase = (t * .8 + i * .173) % 1; const side = i % 2 ? 1 : -1;
        const trailX = backgroundLayer ? shipX - (Math.sin(t * .14) - Math.sin(t * .14 - phase * .38)) * width * .105 : width * .25;
        const x = trailX + side * (10 + phase * 34 + Math.sin(t * .18 + i) * 5);
        const y = backgroundLayer ? shipY + shipScale * 34 + phase * Math.min(height * .19, 150) : height * .52 - phase * height * .28;
        ctx.save(); ctx.globalAlpha = (1 - phase) * (backgroundLayer ? .52 : .36); ctx.fillStyle = i % 3 ? bright : '#ffffff';
        ctx.beginPath(); ctx.ellipse(x + parallax.x * 12, y + parallax.y * 8, 1 + phase * 2, 2 + phase * 4, side * -.28, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }

      // Two patrol aircraft with a short, fading particle exhaust.
      for (let j = 0; j < 2; j++) {
        const phase = t * (j ? -.14 : .11) + (j ? 2.5 : -.55);
        const orbit = radius * (j ? 1.09 : .96);
        const x = centerX + Math.cos(phase) * orbit; const y = centerY + Math.sin(phase) * orbit * .69;
        const heading = Math.atan2(Math.cos(phase) * (j ? -.69 : .69), -Math.sin(phase)) + (j ? Math.PI : 0);
        ctx.save();
        for (let p = 1; p <= 6; p++) {
          const px = x - Math.cos(heading) * p * 4.3; const py = y - Math.sin(heading) * p * 4.3;
          ctx.globalAlpha = (1 - p / 7) * .62; ctx.fillStyle = p < 3 ? bright : accent; ctx.beginPath(); ctx.arc(px, py, 1.7 - p * .16, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        const illumination = Math.max(0, Math.min(1, (Math.cos(angle - phase) + .25) / 1.25));
        drawJet(ctx, x, y, heading, illumination > .68 ? bright : accent, glow, Math.max(.58, Math.min(.88, width / 660)), .58 + illumination * .42);
      }

      // Rolling wave vectors below the main radar.
      ctx.save(); ctx.strokeStyle = `${accent}24`; ctx.lineWidth = .8;
      for (let row = 0; row < 5; row++) {
        const baseY = height * (.83 + row * .035); ctx.beginPath();
        for (let x = 0; x <= width; x += 7) { const y = baseY + Math.sin(x * .023 + t * .75 + row) * 2.6 + Math.sin(x * .008 - t * .38) * 2; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();


      // Tap-to-ping sonar telemetry.
      pingsRef.current = pingsRef.current.filter((ping) => timestamp - ping.time < 2600);
      pingsRef.current.forEach((ping) => {
        const age = Math.max(0, timestamp - ping.time); const progress = Math.min(1, age / 2600); const eased = 1 - (1 - progress) ** 3;
        const maxRadius = Math.max(width, height) * .72; const ring = eased * maxRadius;
        ctx.save(); ctx.beginPath(); ctx.arc(ping.x, ping.y, ring, 0, Math.PI * 2); ctx.strokeStyle = `${bright}${Math.round((1 - progress) * 190).toString(16).padStart(2, '0')}`; ctx.lineWidth = 1.5; ctx.shadowColor = accent; ctx.shadowBlur = 10 * (1 - progress); ctx.stroke();
        ctx.beginPath(); ctx.arc(ping.x, ping.y, 3, 0, Math.PI * 2); ctx.fillStyle = bright; ctx.fill(); ctx.font = '9px monospace'; ctx.fillStyle = bright; ctx.fillText(`PING · ${ping.distance.toFixed(1)} KM`, ping.x + 10, ping.y - 10); ctx.restore();
      });

      // Fine phosphor scan lines.
      ctx.save(); ctx.fillStyle = 'rgba(190,228,241,.025)';
      for (let y = 1; y < height; y += 4) ctx.fillRect(0, y, width, .6);
      ctx.restore();
    }
    frameRef.current = draw;
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const desktopPointer = window.matchMedia('(pointer: fine)').matches;
    const onPointerMove = (event) => {
      if (!backgroundLayer || reduced || !desktopPointer || event.pointerType !== 'mouse') return;
      parallaxTargetRef.current = {
        x: Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - .5) * 2)),
        y: Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - .5) * 2)),
      };
    };
    const onPointerLeave = (event) => { if (!event.relatedTarget) parallaxTargetRef.current = { x: 0, y: 0 }; };
    if (backgroundLayer && desktopPointer && !reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerout', onPointerLeave, { passive: true });
      window.addEventListener('blur', onPointerLeave);
    }
    resize();
    const tick = (time) => { if (time - lastTime > 15) { draw(time); lastTime = time; } if (!reduced) animationId = requestAnimationFrame(tick); };
    if (!reduced) animationId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationId); observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerout', onPointerLeave); window.removeEventListener('blur', onPointerLeave);
    };
  }, [branch]);

  const ping = (event) => {
    const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    const cx = rect.width * .57; const cy = rect.height * .51; const radarRadius = Math.min(rect.width * .43, rect.height * .46);
    const distance = Math.min(12, Math.hypot(x - cx, y - cy) / radarRadius * 12);
    pingsRef.current.push({ x, y, time: performance.now(), distance });
    if (pingsRef.current.length > 5) pingsRef.current.splice(0, pingsRef.current.length - 5);
    if (!backgroundLayer) setTelemetry(`SONAR PING ? EST. ${distance.toFixed(1)} KM`);
    if (controlsRef.current.sound && audioRef.current) {
      try {
        const audio = audioRef.current;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(760, audio.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(260, audio.currentTime + 0.22);
        gain.gain.setValueAtTime(0.08, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.24);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(); oscillator.stop(audio.currentTime + 0.24);
      } catch { /* Audio is optional; sonar visuals still work. */ }
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) frameRef.current?.(performance.now());
  };
  const keyPing = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const rect = canvasRef.current.getBoundingClientRect(); ping({ clientX: rect.left + rect.width * .57, clientY: rect.top + rect.height * .51 }); } };

  useEffect(() => {
    if (!backgroundLayer) return undefined;
    const pingFromBackdrop = (event) => { if (event.target.closest?.('[data-sound-control]')) return; ping(event); };
    window.addEventListener('pointerdown', pingFromBackdrop);
    return () => window.removeEventListener('pointerdown', pingFromBackdrop);
  }, [backgroundLayer]);

  const toggleSound = () => { setSound((value) => { const next = !value; if (next) { try { const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (AudioContextClass) { audioRef.current ||= new AudioContextClass(); audioRef.current.resume(); } } catch { /* Audio is optional. */ } } return next; }); };

  const canvas = <canvas ref={canvasRef} className={backgroundLayer ? 'tactical-canvas tactical-canvas-background' : 'tactical-canvas'} onClick={backgroundLayer ? undefined : ping} onKeyDown={backgroundLayer ? undefined : keyPing} tabIndex={backgroundLayer ? -1 : 0} role={backgroundLayer ? 'presentation' : 'button'} aria-label={backgroundLayer ? undefined : 'Interactive tactical radar. Click or tap to create a sonar ping.'} />;
  const soundControl = <button type="button" className="sound-corner-toggle" aria-label={sound ? 'Turn ping sound off' : 'Turn ping sound on'} aria-pressed={sound} data-sound-control onClick={toggleSound}><Volume2 size={15} /><span>{sound ? 'Sound on' : 'Sound off'}</span></button>;
  if (backgroundLayer) return <>
    <div className="tactical-background">{canvas}</div>
    {soundControl}
  </>;

  return <div className="tactical-canvas-shell">
    {canvas}
    <div className="canvas-bottom-hud"><span className="canvas-status"><i /> {telemetry}</span><span>CLICK / TAP TO PING</span></div>
  </div>;
}
