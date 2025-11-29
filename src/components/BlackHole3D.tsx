'use client';

/**
 * BlackHole 3D Background
 * Uses video from auto-roan.vercel.app (proven working!)
 * Keep it simple - don't overcomplicate
 */
export default function BlackHole3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="rotate-180 absolute top-[-340px] left-0 z-[1] w-full h-full object-cover opacity-40"
      >
        <source src="/blackhole.webm" type="video/webm" />
      </video>
    </div>
  );
}
