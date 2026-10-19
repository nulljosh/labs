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
                      card='A crooked door that keeps moving can damage more parts or come down on your car or family. Stop it, then call us.', who='Garage door tip'),
 'safety-check': dict(head='FREE GARAGE DOOR\nSAFETY CHECK.', sub='Ask for it when you call.',
                      photo='site/brian-with-truck.jpg', crop=(900, 600, -400, 260)),
 'photo-eyes': dict(head='SINCE 1991, PHOTO\nEYES ARE REQUIRED.', sub='Does your opener have its safety sensors?',
                    card='Photo eyes are mandatory on all new garage door openers in Canada. No safety sensors on yours? Your family is at risk. We can check.', who='Garage door tip'),
 'family': dict(head='THREE GENERATIONS.\nSAME FAMILY.', sub='30+ years. Our own team does every job.',
                photo='site/brian-portrait.jpg', crop=(2560, 1707, 0, 0)),
 'review-bernadette': dict(head='“HE IS HONEST AND\nKNOWLEDGEABLE.”', sub='Maintenance done right, with honest advice.', stars=True,
                   card='Brian provided excellent and prompt maintenance service. He advised on other items that will eventually need to be replaced. He is honest and knowledgeable.', who='Bernadette E., customer (excerpt)'),
 'google-rating': dict(head='4.9 STARS\nON GOOGLE.', sub='217 customer reviews. Read them for yourself.',
                   photo='site/brian-portrait.jpg', crop=(2200, 1467, 200, 0)),
 'review-brad': dict(head='“EXCELLENT SERVICE,\nEXCELLENT PRICE.”', sub='Efficient, professional, timely, courteous.', stars=True,
                   card='Excellent service, excellent price. Brian is efficient, professional, timely, courteous and thorough.', who='Brad Smith, customer'),
 'review-mary': dict(head='“HIS WORKMANSHIP\nWAS IMPECCABLE.”', sub='Brian called ahead and gave honest advice.', stars=True,
                   card='Excellent service. First, Brian called to give me the heads up just before his arrival. He was informative and honest about the various motors I was considering. His workmanship was impeccable.', who='Mary Kapelus, customer (excerpt)'),
 'review-faye': dict(head='“BRIAN CAME FIRST\nTHING THIS MORNING.”', sub='Called one day, fixed the next morning.', stars=True,
                   card='We called Best Choice Garage yesterday and Brian came first thing this morning ... He replaced springs and handled completely professional. Friendly and reliable.', who='Faye, Google review (excerpt)'),
 'review-mark': dict(head='“THE JOB DONE RIGHT\nAT A FAIR PRICE.”', sub='Fixed fast, with maintenance tips included.', stars=True,
                   card='BRIAN came by and fixed all my issues quickly and professionally with great expertise. He pointed out maintenance issues I should be mindful of and really provided an extra level of fantastic customer service.', who='Mark Kramarik, Google review (excerpt)'),
 'review-pamela': dict(head='“OLD SCHOOL\nWORK ETHIC.”', sub='Called on a Saturday, there within hours.', stars=True,
                   card='Ben just finished fixing our garage door. We called on a Saturday and he arrived within a couple of hours. Great guy, wonderful attitude and old school work ethic! Highly recommend!', who='Pamela Sunshine, Google review'),
 'we-come-to-you': dict(head='WE COME\nTO YOU.', sub='Same-day service across the Lower Mainland.',
   photo='site/truck-from-garage.jpg', crop=(2576, 1370, 0, 52)),
 'svc-cable': dict(head='CABLES LAST\n8 TO 15 YEARS.', sub='In the Lower Mainland they can wear faster.',
   card='Steel cables stretch, fray and weaken, often with no warning until they snap. Past 7 to 10 years, have them inspected.', who='Cable replacement'),
 'svc-rollers': dict(head='YOUR DOOR RIDES\nON ITS ROLLERS.', sub='Nylon rollers are strong and quiet.',
   card='New nylon rollers keep your door rolling smoothly and protect the other moving parts. No bearings to wear out.', who='Roller service'),
 'svc-track': dict(head='A DOOR OFF ITS\nTRACK IS UNSAFE.', sub='Most track repairs are done in one visit.',
   card='Bent tracks make a door bind, jerk or stall halfway. We find the exact cause first, then test the door before we leave.', who='Track repair'),
 'svc-panel': dict(head='DENTED PANEL?\nNO NEW DOOR.', sub='If the panel can be repaired, we fix it.',
   card='A dented, cracked or bent panel does not mean a brand-new door. We never push replacements or unnecessary upgrades.', who='Panel and section repair'),
 'svc-hinge': dict(head='SMALL PART.\nBIG DIFFERENCE.', sub='Hinges can decide how safely a door works.',
   card='Worn or broken hinges affect how safely your door runs. We check them when we inspect the whole door.', who='Hinge repair'),
 'svc-keypad': dict(head='KEYPAD NOT\nRESPONDING?', sub='We reset, reprogram or replace it.',
   card='A dead keypad can lock you out or leave your home unsecured. We use LiftMaster-compatible parts.', who='Keypad repair'),
 'svc-clicker': dict(head='CLICKER DEAD\nOR LOST?', sub='We reprogram or repair yours first.',
   card='If your remote is unresponsive, lost or worn out, we get it working again on site. No parts you do not need.', who='Clicker repair'),
 'svc-weather': dict(head='DRAFTS UNDER\nYOUR DOOR?', sub='Light coming through the bottom is a sign.',
   card='A worn bottom seal lets in water, dirt, pests and cold air. A new weather strip is a small fix that protects your garage.', who='Weather strips'),
 'svc-maintenance': dict(head='A YEARLY CHECK\nBEATS A BREAKDOWN.', sub='Small wear turns into stuck doors.',
   card='Routine maintenance catches early strain before it becomes a stuck door, loud operation or a safety risk.', who='Maintenance'),
 'city-surrey': dict(head='SURREY DOOR\nWON’T LIFT?', sub='Same-day emergency repair, open 24 hours.',
   card='Heard a bang? That is often a broken spring. Do not lift the door. Call us.', who='Surrey'),
 'city-coquitlam': dict(head='COQUITLAM DOOR\nSTUCK?', sub='Open or closed, we can help.',
   card='Stuck open or closed in Coquitlam? We are open 24 hours for emergency repair.', who='Coquitlam'),
 'city-abbotsford': dict(head='ABBOTSFORD\nDRAFTY DOOR?', sub='Worn weather stripping is a common culprit.',
   card='Worn weather stripping lets in cold, water and dirt. We replace it and check the rest of the door.', who='Abbotsford'),
 'city-maple-ridge': dict(head='MAPLE RIDGE DOOR\nGRINDING?', sub='Worn rollers are worth checking first.',
   card='Your whole door rides on its rollers. We find the real problem and fix that.', who='Maple Ridge'),
 'city-port-moody': dict(head='PORT MOODY\nBROKEN SPRING?', sub='One customer had us there within the hour.',
   card='A trapped car and a broken spring in Port Moody. Fixed within another hour.', who='Port Moody (from a customer review)'),
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
    ps = (44 if n <= 160 else 38) if p.get('stars') else (58 if n <= 100 else 50 if n <= 160 else 44)
    if p.get('stars'):
        card += ['-fill', ORANGE]
        for d in stars_draw(540, y+60): card += ['-draw', d]
    card += ['-interline-spacing', '4', '-background', LIGHT, '-font', BODY, '-fill', '#3A3E40', '-pointsize', str(ps), '-gravity', 'center', '-size', '860x', 'caption:'+body, '-geometry', '+0+' + ('232' if p.get('stars') else '215'), '-composite']
    card += ['+size', '-background', 'none', '-font', BODY, '-fill', '#1B5959', '-pointsize', '32', '-gravity', 'north', '-annotate', f'+0+{y+510-50}', p['who']]
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
