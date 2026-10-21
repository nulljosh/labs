# Choice Display: Best Choice's headline face, made from Barlow Condensed (OFL 1.1, no reserved name).
# Changes: new family name, +16/1000 em open tracking for big headlines, Latin subset, no hinting, woff2.
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from fontTools.ttLib import TTFont
from fontTools import subset
TRACK = 16
for style, weight in [('SemiBold', 600), ('Bold', 700)]:
    f = TTFont(f'BarlowCondensed-{style}.ttf')
    hmtx = f['hmtx']
    for g in f.getGlyphOrder():
        adv, lsb = hmtx[g]
        if adv: hmtx[g] = (adv + TRACK, lsb)
    name = f['name']
    full = f'Choice Display {style}'
    ps = f'ChoiceDisplay-{style}'
    for rec in list(name.names):
        if rec.nameID in (1, 16): rec.string = 'Choice Display'
        elif rec.nameID in (2, 17): rec.string = style if rec.nameID == 17 else ('Bold' if style == 'Bold' else 'Regular')
        elif rec.nameID == 4: rec.string = full
        elif rec.nameID == 6: rec.string = ps
        elif rec.nameID == 3: rec.string = f'1.000;BCGD;{ps}'
        elif rec.nameID == 0: rec.string = 'Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow). Modified 2026 for Best Choice Garage Doors.'
    if style == 'SemiBold':
        name.setName('Choice Display', 1, 3, 1, 0x409); name.setName('SemiBold', 2, 3, 1, 0x409)
    f['OS/2'].usWeightClass = weight
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'ccmp', 'locl', 'pnum', 'tnum', 'case']
    opts.hinting = False
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    s = subset.Subsetter(opts)
    s.populate(unicodes=list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2605, 0x20AC])
    s.subset(f)
    f.flavor = 'woff2'
    f.save(f'../../src/web/fonts/ChoiceDisplay-{style}.woff2')
    print(style, 'ok')
