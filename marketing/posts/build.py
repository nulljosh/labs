"""Render marketing posts. Design tokens come from bcgaragedoors.ca's Elementor CSS:
teal #1B5959, dark #134040, text #3A3E40, sage #8DA6A6, Barlow Condensed 700 uppercase
headlines, Open Sans body, 3px button radius. Orange is the logo/promo accent, used only on the button.
Run: python3 -I build.py [slug ...]"""
import subprocess, sys, os
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.dirname(H)
F = M + '/fonts/'
HEAD, BODY, BOLDHEAD = F+'BarlowCondensed-Bold.ttf', F+'OpenSans-Variable.ttf', F+'BarlowCondensed-SemiBold.ttf'
TEAL, DARK, ORANGE, SAGE, LIGHT = '#1B5959', '#134040', '#F47216', '#C9D8D8', '#F2F2F2'
POSTS = {
 'repair-first': dict(head='NOT EVERY DOOR\nNEEDS REPLACING.', sub='Most just need the right fix.',
                      photo='site/brian-worn-hinges.jpg', crop=(1700, 1133, 0, 0)),
 'emergency': dict(head='STUCK DOOR?\nWE PICK UP 24/7.', sub='Same-day emergency repair.',
                   photo='site/brian-with-truck.jpg', crop=(1707, 1138, 0, -230)),
 'review-lf': dict(head='“WITHIN AN HOUR\nOF MY CALL.”', sub='Port Moody. Broken spring. Car trapped inside.', stars=True,
                   card="Brian was here (Port Moody) within an hour of my call (broken spring and car was trapped) and had the job done within another hour. He even checked my other garage door while he was here. I definitely recommend this company.", who='L.F., customer (excerpt)'),
 'broken-spring': dict(head="BROKEN SPRING?\nDON’T FORCE IT.", sub='Check the spring, then call a pro.',
                       photo='site/brian-worn-hinges.jpg', crop=(1000, 516, 600, 30)),
 'crooked-door': dict(head='DOOR GOING\nCROOKED? STOP.', sub='Do not keep moving it.',
                      card='A crooked door that keeps moving can damage more parts and risk the whole door coming down on your car or your family. Stop it, then call us.', who='Garage door tip'),
 'safety-check': dict(head='FREE GARAGE DOOR\nSAFETY CHECK.', sub='Ask for it when you call.',
                      photo='site/brian-with-truck.jpg', crop=(900, 600, -400, 260)),
 'photo-eyes': dict(head='SINCE 1991, PHOTO\nEYES ARE REQUIRED.', sub='Does your opener have its safety sensors?',
                    card='Photo eyes are mandatory on all new garage door openers in Canada. If your door does not have them, your family is at risk of a tragic and avoidable accident. We can check.', who='Garage door tip'),
 'family': dict(head='THREE GENERATIONS.\nSAME FAMILY.', sub='30+ years. Our own team does every job.',
                photo='site/brian-portrait.jpg', crop=(2560, 1707, 0, 0)),
 'review-bernadette': dict(head='“HE IS HONEST AND\nKNOWLEDGEABLE.”', sub='Maintenance done right, with honest advice.', stars=True,
                   card='Brian provided excellent and prompt maintenance service. He advised on other items that will eventually need to be replaced. He is honest and knowledgeable.', who='Bernadette E., customer (excerpt)'),
 'motor-no-move': dict(head="MOTOR RUNS,\nDOOR WON’T MOVE?", sub='Likely a stripped gear in the opener.',
                       card='Fix the root of the problem or it can happen again. Call Best Choice Garage Doors and get it done right the first time.', who='Garage door tip'),
}

STAR = [(0,-1),(.235,-.324),(.951,-.309),(.38,.124),(.588,.809),(0,.4),(-.588,.809),(-.38,.124),(-.951,-.309),(-.235,-.324)]
def stars_draw(cx, cy, r=20, gap=58):
    pts = []
    for i in range(5):
        x0 = cx + (i-2)*gap
        pts.append('polygon ' + ' '.join(f'{x0+x*r:.0f},{cy+y*r:.0f}' for x, y in STAR))
    return pts
def panel(p, M):
    if 'photo' in p:
        cw, ch, cx, cy = p['crop']
        return ['(', M+'/'+p['photo'], '-gravity', 'center', '-crop', f'{cw}x{ch}+{cx}+{cy}', '+repage', '-resize', '960x510^', '-gravity', 'center', '-extent', '960x510', ')',
                '-gravity', 'north', '-geometry', '+0+636', '-composite']
    card = ['(', '-size', '960x510', f'xc:{LIGHT}', ')', '-gravity', 'north', '-geometry', '+0+636', '-composite']
    y = 636
    body = p['card']; n = len(body)
    ps = 48 if n <= 160 else 40 if n <= 240 else 36
    if p.get('stars'):
        card += ['-fill', ORANGE]
        for d in stars_draw(540, y+60): card += ['-draw', d]
    card += ['-interline-spacing', '4', '-background', LIGHT, '-font', BODY, '-fill', '#3A3E40', '-pointsize', str(ps), '-gravity', 'center', '-size', '860x', 'caption:'+body, '-geometry', '+0+224', '-composite']
    card += ['+size', '-background', 'none', '-font', BODY, '-fill', '#1B5959', '-pointsize', '30', '-gravity', 'north', '-annotate', f'+0+{y+510-46}', p['who']]
    return card
def render(slug, p):
    out = f'{H}/{slug}.png'
    cmd = ['magick', '-size', '1080x1350', f'xc:{TEAL}',
      # dark top band with logo
      '(', '-size', '1080x230', f'xc:{DARK}', ')', '-gravity', 'north', '-composite',
      '(', M+'/site/bcgd-logo.png', '-resize', '400x', ')', '-gravity', 'north', '-geometry', '+0+38', '-composite',
      '-font', HEAD, '-fill', 'white', '-pointsize', str(138 if max(len(l) for l in p['head'].split(chr(10)))<=16 else 118), '-interline-spacing', '-24', '-gravity', 'north',
      '-annotate', '+0+262', p['head'],
      '-interline-spacing', '0', '-font', BODY, '-fill', SAGE, '-pointsize', '44', '-annotate', '+0+548', p['sub'],
      *panel(p, M),
      '(', '-size', '960x112', 'xc:none', '-fill', ORANGE, '-draw', 'roundrectangle 0,0 959,111 6,6', ')',
      '-gravity', 'south', '-geometry', '+0+62', '-composite',
      '-font', BOLDHEAD, '-fill', 'white', '-pointsize', '78', '-gravity', 'south', '-annotate', '+0+90', 'CALL OR TEXT 604-240-0180',
      '-font', BODY, '-fill', SAGE, '-pointsize', '30', '-annotate', '+0+16', 'bcgaragedoors.ca',
      out]
    subprocess.run(cmd, check=True); print('ok', out)
for s in (sys.argv[1:] or POSTS): render(s, POSTS[s])
