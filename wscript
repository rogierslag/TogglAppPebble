
#
# This file is the default set of rules to compile a Pebble project.
#
# Feel free to customize this to your needs.
#

from sh import jshint, ErrorReturnCode_2
hint = jshint

top = '.'
out = 'build'

def options(ctx):
    ctx.load('pebble_sdk')

def configure(ctx):
    ctx.load('pebble_sdk')
    global hint
    hint = hint.bake(['--config', 'pebble-jshintrc'])

def build(ctx):
    if False:
        try:
            hint("src/js/pebble-js-app.js", _tty_out=False) # no tty because there are none in the cloudpebble sandbox.
        except ErrorReturnCode_2 as e:
            ctx.fatal("\nJavaScript linting failed (you can disable this in Project Settings):\n" + e.stdout)

    ctx.load('pebble_sdk')

    ctx.pbl_program(source=ctx.path.ant_glob('src/**/*.c'),
                    target='pebble-app.elf')

    ctx.pbl_bundle(elf='pebble-app.elf',
                   js=ctx.path.ant_glob('src/js/**/*.js'))

