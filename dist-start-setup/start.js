const queue = [
    './config/dev.js',
    // './css/app.css.preload',
    // './app.js.preload',
    './lib/lodash/lodash.min.js',
    './lib/jquery/jquery.3.4.1.min.js',
    './lib/jquery/jquery-ui.min.js',
    './css/app.css',
    './app.js'
].reverse()

const assign = {
    js: ['script', 'src'],
    css: ['link', 'href', ['rel', 'stylesheet']],
    js_pre: ['script', 'src', ['rel', 'preload'], ['as', 'script']],
    css_pre: ['link', 'href', ['rel', 'preload'], ['as', 'style']]
}

const loadNext = () => {
    if (queue.length) {
        let target = queue.pop().split('.')
        let ending = target.pop()
        let attrs = assign[ending]
        if (ending === 'preload') {
            ending = target.pop()
            attrs = assign[`${ending}_pre`]
        }
        attrs = [...attrs].reverse()
        target = `${target.join('.')}.${ending}`
        let elm = document.createElement(attrs.pop())
        elm.setAttribute(attrs.pop(), target)
        while (attrs.length) {
            const attr = attrs.pop()
            elm.setAttribute(attr[0], attr[1])
        }
        document.head.appendChild(elm)
        console.log('INDEX: elm load = ', elm)
        elm.onload = () => loadNext()
    }
}

loadNext()
