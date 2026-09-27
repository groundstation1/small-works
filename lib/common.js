// Shared parameters for every work in the gallery, whatever its medium.
//   ?still      jump straight to the finished state (used for gallery thumbnails)
//   ?seed=123   a different variation, where a work supports it

const PARAMS = new URLSearchParams(location.search);
const STILL = PARAMS.has('still');

function paramSeed(fallback) {
  const s = parseInt(PARAMS.get('seed'), 10);
  return Number.isFinite(s) ? s : fallback;
}

// No signature here: every work signs itself, in its own code.
