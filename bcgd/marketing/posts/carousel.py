"""Render the 'What happens when you call us' carousel. Same tokens as build.py. Run: python3 -I carousel.py"""
import subprocess, os
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.dirname(H); F = M + '/fonts/'
HEAD, BODY, SEMI = F+'BarlowCondensed-Bold.ttf', F+'OpenSans-Variable.ttf', F+'BarlowCondensed-SemiBold.ttf'
TEAL, DARK, ORANGE, SAGE, SAGE2 = '#1B5959', '#134040', '#F47216', '#C9D8D8', '#8DA6A6'
STEPS = [('INSPECT', 'We check springs, cables, rollers, hinges, panels and the opener.'),
         ('EXPLAIN', 'You hear what we found, in plain language, before any work starts.'),
         ('FIX', 'Dependable parts and proven techniques.'),
         ('TEST', 'We check balance, movement and the safety features.'),
         ('FINISH', 'We go over the work with you and leave the area clean.')]
def base():
    return ['magick', '-size', '1080x1350', f'xc:{TEAL}', '(', '-size', '1080x230', f'xc:{DARK}', ')', '-gravity', 'north', '-composite',
            '(', M+'/site/bcgd-logo.png', '-resize', '400x', ')', '-gravity', 'north', '-geometry', '+0+38', '-composite']
def url(c): return c + ['-font', BODY, '-fill', SAGE, '-pointsize', '30', '-gravity', 'south', '-annotate', '+0+22', 'bcgaragedoors.ca']
def run(c, out): subprocess.run(c + [out], check=True); print('ok', out)
# cover
c = base() + ['-font', HEAD, '-fill', 'white', '-pointsize', '118', '-interline-spacing', '-24', '-gravity', 'north', '-annotate', '+0+262', 'A GARAGE DOOR VISIT,\nSTART TO FINISH.',
   '-interline-spacing', '0', '-font', BODY, '-fill', SAGE, '-pointsize', '44', '-annotate', '+0+520', 'Here is what happens when you call us.',
   '(', M+'/site/brian-with-truck.jpg', '-gravity', 'center', '-crop', '1707x1138+0+-230', '+repage', '-resize', '960x520^', '-gravity', 'center', '-extent', '960x520', ')', '-gravity', 'north', '-geometry', '+0+620', '-composite',
   '-font', SEMI, '-fill', 'white', '-pointsize', '60', '-gravity', 'south', '-annotate', '+0+110', 'SWIPE  >']
run(url(c), f'{H}/carousel-1.png')
for i, (h, t) in enumerate(STEPS, 1):
    c = base() + ['-font', HEAD, '-fill', SAGE2, '-pointsize', '380', '-gravity', 'north', '-annotate', '+0+250', str(i),
       '-font', HEAD, '-fill', 'white', '-pointsize', '190', '-annotate', '+0+700', h,
       '-interline-spacing', '6', '-background', TEAL, '-font', BODY, '-fill', '#F2F2F2', '-pointsize', '50', '-gravity', 'north', '-size', '880x', 'caption:' + t, '-geometry', '+0+950', '-composite', '+size', '-background', 'none',
       '-font', SEMI, '-fill', SAGE2, '-pointsize', '40', '-gravity', 'south', '-annotate', '+0+80', f'{i} OF 5']
    run(url(c), f'{H}/carousel-{i+1}.png')
c = base() + ['-font', HEAD, '-fill', 'white', '-pointsize', '150', '-interline-spacing', '-24', '-gravity', 'north', '-annotate', '+0+330', 'CALL ANYTIME.',
   '-interline-spacing', '0', '-font', BODY, '-fill', SAGE, '-pointsize', '48', '-annotate', '+0+540', 'Open 24 hours. Same-day emergency repair.',
   '(', M+'/site/brian-portrait.jpg', '-gravity', 'center', '-crop', '2560x1707+0+0', '+repage', '-resize', '960x470^', '-gravity', 'center', '-extent', '960x470', ')', '-gravity', 'north', '-geometry', '+0+640', '-composite',
   '(', '-size', '960x112', 'xc:none', '-fill', ORANGE, '-draw', 'roundrectangle 0,0 959,111 6,6', ')', '-gravity', 'south', '-geometry', '+0+62', '-composite',
   '-font', SEMI, '-fill', 'white', '-pointsize', '78', '-gravity', 'south', '-annotate', '+0+90', 'CALL OR TEXT 604-240-0180']
run(url(c), f'{H}/carousel-7.png')
