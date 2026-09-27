# Builds works/exposure/ from the tracer in lab/light.html and the six views kept from 44.
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lab = open(os.path.join(ROOT, 'lab', 'light.html'), encoding='utf8').read()

def grab(start, end):
    s = lab.index(start)
    return lab[s:lab.index(end, s)]

tubes = grab("  const TUBES", "\n\n") + "\n"
vs = grab("  const VS", "  const FS")
fs = grab("  const FS", "  const SHOW")
show = grab("  const SHOW", "  function tracer(")
tracer = grab("  function tracer(", "  const q = new URLSearchParams")

barrier = [{"a": [x, 0.02, -2.9189459493769983], "b": [x, 2.44, -2.9189459493769983], "c": c}
           for x, c in zip([-2.4, -1.7142857142857144, -1.0285714285714287, -0.34285714285714297,
                            0.3428571428571425, 1.0285714285714285, 1.714285714285714, 2.4],
                           ["red", "green"] * 4)]
room6 = {"W": 7.60218349378556, "D": 5.436026459559798, "H": 3.4613403263967486, "w": 0.035, "boxes": []}
plates = [
    {**room6, "tubes": barrier, "eye": [-1.8152668157798284, 1.55, -0.3739089336711913],
     "look": [3.80109174689278, 1.3297330249100923, -5.436026459559798], "fov": 61.41263082274236,
     "power": 22.469801906961948, "albedo": 0.764300415054895},
    {**room6, "tubes": barrier, "eye": [2.087421209481545, 0.9149694523774088, -3.3752102940808983],
     "look": [3.80109174689278, 1.7817094192374494, -5.436026459559798], "fov": 38.14404029515572,
     "power": 38.3567680134438, "albedo": 0.7468747856421396},
    {"W": 7.138816208578646, "D": 6.108864046633244, "H": 3.160193180595525, "w": 0.035, "boxes": [],
     "tubes": [{"a": [3.439408104289323, 0.02, -5.978864046633244], "b": [1.781408104289323, 1.708, -5.978864046633244], "c": "coolwhite"},
               {"a": [3.3694081042893234, 0.02, -5.908864046633243], "b": [1.7114081042893232, 1.708, -5.908864046633243], "c": "daylight"},
               {"a": [3.299408104289323, 0.02, -5.838864046633244], "b": [1.641408104289323, 1.708, -5.838864046633244], "c": "blue"}],
     "eye": [1.8443768850993365, 0.9161128757987171, -4.172646990907379], "look": [3.569408104289323, 0.8571608603931963, -6.108864046633244],
     "fov": 51.13463579444215, "power": 23.93476917501539, "albedo": 0.7422238605236634},
    {"W": 7.499872795306146, "D": 4.833140998147428, "H": 3.3995710463728757, "w": 0.035, "boxes": [],
     "tubes": [{"a": [3.619936397653073, 0.02, -4.703140998147428], "b": [1.961936397653073, 1.708, -4.703140998147428], "c": "blue"},
               {"a": [3.5499363976530733, 0.02, -4.633140998147428], "b": [1.8919363976530732, 1.708, -4.633140998147428], "c": "uv"}],
     "eye": [2.284988546115346, 2.0645744553301486, -2.929975375928916], "look": [3.749936397653073, 1.7994882602244613, -4.833140998147428],
     "fov": 54.78458016412333, "power": 16.19272919651121, "albedo": 0.8073272501584142},
    {"W": 6.608852834440768, "D": 6.310736492276192, "H": 3.5322537902276965, "w": 0.035, "boxes": [],
     "tubes": [{"a": [0.019889184898853163, 0.54591317670982, -6.250736492276192], "b": [2.459889184898853, 0.54591317670982, -6.250736492276192], "c": "red"},
               {"a": [0.019889184898853163, 2.98591317670982, -6.250736492276192], "b": [2.459889184898853, 2.98591317670982, -6.250736492276192], "c": "yellow"},
               {"a": [0.019889184898853163, 0.54591317670982, -6.250736492276192], "b": [0.019889184898853163, 2.98591317670982, -6.250736492276192], "c": "red"},
               {"a": [2.459889184898853, 0.54591317670982, -6.250736492276192], "b": [2.459889184898853, 2.98591317670982, -6.250736492276192], "c": "red"}],
     "eye": [-2.804426417220384, 0.35, -0.5], "look": [3.304426417220384, 0.05, -6.010736492276192],
     "fov": 37.61244330089539, "power": 37.31734055560082, "albedo": 0.816372746839188},
    {"W": 7.940970168448985, "D": 7.86210235580802, "H": 3.1845810703234747, "w": 0.035, "boxes": [],
     "tubes": [{"a": [3.8904850842244922, 0.02, -7.78210235580802], "b": [3.8904850842244922, 2.46, -7.78210235580802], "c": "green"},
               {"a": [3.8204850842244924, 0.02, -7.712102355808019], "b": [3.8204850842244924, 2.46, -7.712102355808019], "c": "blue"},
               {"a": [3.750485084224492, 0.02, -7.64210235580802], "b": [3.750485084224492, 2.46, -7.64210235580802], "c": "daylight"}],
     "eye": [-3.4704850842244923, 0.35, -0.5], "look": [3.9704850842244923, 0.05, -7.56210235580802],
     "fov": 38.51529270410538, "power": 39.589507893659174, "albedo": 0.8562440539430827},
]

head = """// Exposure: a white room lit only by coloured tubes, path traced in this browser while you look.
// It begins black, grains in, and clears for as long as you stay: light accumulating like film.
// After Flavin's tubes and Sugimoto's Theaters. Six views kept from 44, found in lab/light.html.

"""
tail = """
const PLATES = %s;

const q = new URLSearchParams(location.search);
const p = PLATES[Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1)) - 1];
const STILL = q.has('still');
const size = STILL ? 600 : Math.min(1100, Math.floor(Math.min(innerWidth, innerHeight)));   // one sample per css pixel keeps it alive
const T = tracer(size);
T.canvas.id = 'c'; document.body.append(T.canvas);
T.load(p);

// signed small, below the right edge of the image, on the dark
const mark = document.createElement('div');
mark.textContent = 'Claude Opus 5.5, 2026';
mark.style.cssText = 'position:fixed;font:10px system-ui,-apple-system,"Segoe UI",sans-serif;color:#555;white-space:nowrap';
document.body.append(mark);
const place = () => { const s = Math.min(innerWidth, innerHeight); mark.style.right = (innerWidth - s) / 2 + 10 + 'px'; mark.style.bottom = (innerHeight - s) / 2 + 8 + 'px'; };
place(); addEventListener('resize', place);

if (STILL) {
  (async () => { for (let i = 0; i < 90; i++) { T.step(8); await new Promise(r => setTimeout(r, 0)); } T.show(); window.drawn = true; })();
} else {
  window.drawn = true;
  const loop = () => { T.step(2); T.show(); requestAnimationFrame(loop); };
  loop();
}
""" % json.dumps(plates)

os.makedirs(os.path.join(ROOT, 'works', 'exposure'), exist_ok=True)
open(os.path.join(ROOT, 'works', 'exposure', 'exposure.js'), 'w', encoding='utf8').write(head + tubes + vs + fs + show + tracer + tail)
open(os.path.join(ROOT, 'works', 'exposure', 'index.html'), 'w', encoding='utf8').write("""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Exposure</title>
<style>html, body { margin: 0; height: 100%; overflow: hidden; background: #0a0a0a; } body { display: flex; align-items: center; justify-content: center; }
#c { width: min(100vw, 100vh); height: min(100vw, 100vh); display: block; }</style>
</head><body><script src="exposure.js"></script></body></html>
""")

works = open(os.path.join(ROOT, 'works.js'), encoding='utf8').read()
if "id: 'exposure'" not in works:
    end = works.index("];\n\n// Every entry")
    works = works[:end] + """  {
    id: 'exposure',
    title: 'Exposure',
    year: 2026,
    ground: '#0a0a0a',
    plates: ['I', 'II', 'III', 'IV', 'V', 'VI'],
    cover: 3,
  },
""" + works[end:]
    open(os.path.join(ROOT, 'works.js'), 'w', encoding='utf8').write(works)
print('built')
