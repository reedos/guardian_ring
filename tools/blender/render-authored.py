"""Render story images from the exact shipped GLBs, not stale prototype meshes.

Blender --background --python tools/blender/render-authored.py -- satellite payload focal-plane
The images are schematic product views, not real spacecraft imagery. Reuses the
approved story lighting and responsive fitting. All inputs are local GLBs.
"""
import ast
import bpy
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'research' / 'look' / 'renders'
OUT.mkdir(parents=True, exist_ok=True)
source = Path(__file__).with_name('build-hardware-look.py')
tree = ast.parse(source.read_text(encoding='utf-8'), filename=str(source))
definitions = [node for node in tree.body if isinstance(node, (ast.Import, ast.ImportFrom, ast.FunctionDef))]
helpers = {'__file__':str(source), '__name__':'authored_story_render', 'OUT':OUT}
exec(compile(ast.Module(body=definitions,type_ignores=[]),str(source),'exec'),helpers)

def from_three(p):
    return (p[0],-p[2],p[1])

views = {
    'satellite': ([0,.5,0],[8,7,11]),
    'payload': ([.6,-.3,.15],[12,10,15]),
    'focal-plane': ([.4,.25,-.2],[4.5,4.8,6]),
    'pixel': ([0,1.25,0],[4.7,3.6,6]),
    'plume': ([0,3.2,0],[8,5.8,11]),
}
kinds = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(views)
for kind in kinds:
    target, eye = views[kind]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT/'public'/'models'/f'{kind}.glb'))
    helpers['setup_render'](kind,from_three(target))
    helpers['render'](kind,from_three(target),from_three(eye))
    helpers['render'](kind,from_three(target),from_three(eye),phone=True)
print('AUTHORED_STILLS_COMPLETE',','.join(kinds),flush=True)
