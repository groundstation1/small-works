// The gallery's manifest. Oldest first; the overview shows newest first.
// No descriptions: titles live in the browser tab, nothing is written on the wall.
//
//   id       deep link: index.html?w=<id>   (one plate of a series: &plate=<n>)
//   ground   the colour around the work; the gallery takes it on while you look
//   interactive  it takes clicks (otherwise the gallery keeps clicks for itself)
//   plates   a series made by one page: works/<id>/index.html?plate=<n>
//   items    a series made of separate works: each its own folder under works/
//   grounds  per-plate ground colours, if they differ
//   cover    which plate or item stands for the series in the overview
// Stills live in thumbs/<id>-<n>.jpg (made by lab/thumbs.html, served by lab/serve.py).
window.WORKS = [
  {
    id: 'early',
    title: 'Early Works',
    year: 2026,
    ground: '#1b1b1a',
    cover: 4,
    items: [
      { folder: 'reread', title: 'Reread', ground: '#1d201c' },
      { folder: 'west-window', title: 'West Window', ground: '#16171a' },
      { folder: 'any-other-business', title: 'Any Other Business', ground: '#8e4331', interactive: true },
      { folder: 'self-portrait', title: 'Self-Portrait', ground: '#efe39c' },
    ],
  },
  {
    id: 'drag',
    title: 'Drag',
    year: 2026,
    ground: '#f1f0ec',
    plates: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    cover: 4,
  },
  {
    id: 'self-portrait-ii',
    title: 'Self-Portrait II',
    year: 2026,
    ground: '#edebe3',
  },
  {
    id: 'room',
    title: 'Room',
    year: 2026,
    ground: '#2b2f26',
    grounds: ['#2b2f26', '#2b2f26', '#2b2f26', '#2b2f26', '#1f1d1e', '#1d1f1e'],
    plates: ['I', 'II', 'III', 'IV', 'V', 'VI'],
    cover: 1,
  },
  {
    id: 'grey',
    title: 'Grey',
    year: 2026,
    ground: '#bcbcbc',
    plates: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
    cover: 2,
  },
];

// Every entry is a list of views: one for a single work, several for a series.
function views(w) {
  if (w.items) return w.items.map((it, k) => ({ ...it, params: {}, name: it.title, thumb: `thumbs/${w.id}-${k + 1}.jpg` }));
  if (w.plates) return w.plates.map((p, k) => ({ ...w, ground: (w.grounds || [])[k] || w.ground, folder: w.id, params: { plate: k + 1 }, name: `${w.title} ${p}`, thumb: `thumbs/${w.id}-${k + 1}.jpg` }));
  return [{ ...w, folder: w.id, params: {}, name: w.title, thumb: `thumbs/${w.id}-1.jpg` }];
}
function workSrc(v, extra = {}) {
  const s = new URLSearchParams({ ...v.params, ...extra }).toString();
  return `works/${encodeURIComponent(v.folder)}/index.html${s ? '?' + s : ''}`;
}
