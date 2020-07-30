
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Components/Header.svelte generated by Svelte v3.24.0 */

    const file = "src/Components/Header.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let nav;
    	let div2;
    	let div1;
    	let div0;
    	let h1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			nav = element("nav");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Primer proyecto con Svelte";
    			attr_dev(h1, "class", "svelte-1ew9jie");
    			add_location(h1, file, 31, 10, 426);
    			attr_dev(div0, "class", "logo-characters svelte-1ew9jie");
    			add_location(div0, file, 30, 8, 386);
    			attr_dev(div1, "class", "logo-container svelte-1ew9jie");
    			add_location(div1, file, 29, 6, 349);
    			attr_dev(div2, "class", "logo svelte-1ew9jie");
    			add_location(div2, file, 28, 4, 324);
    			attr_dev(nav, "class", "svelte-1ew9jie");
    			add_location(nav, file, 27, 2, 314);
    			attr_dev(div3, "class", "Header svelte-1ew9jie");
    			add_location(div3, file, 26, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, nav);
    			append_dev(nav, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Components/Hero.svelte generated by Svelte v3.24.0 */

    const file$1 = "src/Components/Hero.svelte";

    function create_fragment$1(ctx) {
    	let div5;
    	let div4;
    	let div1;
    	let div0;
    	let h2;
    	let t1;
    	let div3;
    	let div2;
    	let h3;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Rick and Morty";
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Con Svelte";
    			attr_dev(h2, "class", "svelte-l6y7dh");
    			add_location(h2, file$1, 52, 8, 818);
    			attr_dev(div0, "class", "title svelte-l6y7dh");
    			add_location(div0, file$1, 51, 6, 790);
    			attr_dev(div1, "class", "title-container svelte-l6y7dh");
    			add_location(div1, file$1, 50, 4, 754);
    			attr_dev(h3, "class", "svelte-l6y7dh");
    			add_location(h3, file$1, 57, 8, 940);
    			attr_dev(div2, "class", "subtitle svelte-l6y7dh");
    			add_location(div2, file$1, 56, 6, 909);
    			attr_dev(div3, "class", "subtitle-container svelte-l6y7dh");
    			add_location(div3, file$1, 55, 4, 870);
    			attr_dev(div4, "class", "container svelte-l6y7dh");
    			add_location(div4, file$1, 49, 2, 726);
    			attr_dev(div5, "class", "Hero svelte-l6y7dh");
    			add_location(div5, file$1, 48, 0, 705);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hero", $$slots, []);
    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Components/TotalC.svelte generated by Svelte v3.24.0 */

    const file$2 = "src/Components/TotalC.svelte";

    function create_fragment$2(ctx) {
    	let div5;
    	let div4;
    	let div1;
    	let div0;
    	let h3;
    	let t1;
    	let div3;
    	let div2;
    	let h4;
    	let t2;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Personajes Totales";
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h4 = element("h4");
    			t2 = text(/*count*/ ctx[0]);
    			attr_dev(h3, "class", "svelte-yqxmjn");
    			add_location(h3, file$2, 49, 8, 822);
    			attr_dev(div0, "class", "title-container svelte-yqxmjn");
    			add_location(div0, file$2, 48, 6, 784);
    			attr_dev(div1, "class", "title svelte-yqxmjn");
    			add_location(div1, file$2, 47, 4, 758);
    			attr_dev(h4, "class", "svelte-yqxmjn");
    			add_location(h4, file$2, 54, 8, 948);
    			attr_dev(div2, "class", "subtitle-container svelte-yqxmjn");
    			add_location(div2, file$2, 53, 6, 907);
    			attr_dev(div3, "class", "subtitle svelte-yqxmjn");
    			add_location(div3, file$2, 52, 4, 878);
    			attr_dev(div4, "class", "container svelte-yqxmjn");
    			add_location(div4, file$2, 46, 2, 730);
    			attr_dev(div5, "class", "TotalC svelte-yqxmjn");
    			add_location(div5, file$2, 45, 0, 707);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h4);
    			append_dev(h4, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*count*/ 1) set_data_dev(t2, /*count*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { count } = $$props;
    	const writable_props = ["count"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TotalC> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TotalC", $$slots, []);

    	$$self.$set = $$props => {
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    	};

    	$$self.$capture_state = () => ({ count });

    	$$self.$inject_state = $$props => {
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [count];
    }

    class TotalC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { count: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TotalC",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*count*/ ctx[0] === undefined && !("count" in props)) {
    			console.warn("<TotalC> was created without expected prop 'count'");
    		}
    	}

    	get count() {
    		throw new Error("<TotalC>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<TotalC>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Card.svelte generated by Svelte v3.24.0 */

    const file$3 = "src/Components/Card.svelte";

    function create_fragment$3(ctx) {
    	let div4;
    	let div3;
    	let figure;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let ul;
    	let li0;
    	let h20;
    	let t1;
    	let t2_value = /*location*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let li1;
    	let h21;
    	let t4;
    	let t5;
    	let t6;
    	let li2;
    	let h22;
    	let t7;
    	let t8;
    	let t9;
    	let div2;
    	let span;
    	let t10;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			figure = element("figure");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			h20 = element("h2");
    			t1 = text("Location: ");
    			t2 = text(t2_value);
    			t3 = space();
    			li1 = element("li");
    			h21 = element("h2");
    			t4 = text("Status: ");
    			t5 = text(/*status*/ ctx[3]);
    			t6 = space();
    			li2 = element("li");
    			h22 = element("h2");
    			t7 = text("Species: ");
    			t8 = text(/*species*/ ctx[4]);
    			t9 = space();
    			div2 = element("div");
    			span = element("span");
    			t10 = text(/*name*/ ctx[1]);
    			if (img.src !== (img_src_value = /*image*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*name*/ ctx[1]);
    			add_location(img, file$3, 48, 8, 818);
    			add_location(h20, file$3, 52, 14, 922);
    			add_location(li0, file$3, 51, 12, 903);
    			add_location(h21, file$3, 55, 14, 1006);
    			add_location(li1, file$3, 54, 12, 987);
    			add_location(h22, file$3, 58, 14, 1081);
    			add_location(li2, file$3, 57, 12, 1062);
    			attr_dev(ul, "class", "svelte-2s9l15");
    			add_location(ul, file$3, 50, 10, 886);
    			attr_dev(div0, "class", "capa svelte-2s9l15");
    			add_location(div0, file$3, 49, 8, 857);
    			attr_dev(div1, "class", "box svelte-2s9l15");
    			add_location(div1, file$3, 47, 6, 792);
    			attr_dev(figure, "class", "svelte-2s9l15");
    			add_location(figure, file$3, 46, 4, 777);
    			add_location(span, file$3, 65, 6, 1224);
    			attr_dev(div2, "class", "container-info");
    			add_location(div2, file$3, 64, 4, 1189);
    			attr_dev(div3, "class", "card-container");
    			add_location(div3, file$3, 45, 2, 744);
    			attr_dev(div4, "class", "Card svelte-2s9l15");
    			add_location(div4, file$3, 44, 0, 723);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, figure);
    			append_dev(figure, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h20);
    			append_dev(h20, t1);
    			append_dev(h20, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, h21);
    			append_dev(h21, t4);
    			append_dev(h21, t5);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, h22);
    			append_dev(h22, t7);
    			append_dev(h22, t8);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			append_dev(span, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 1 && img.src !== (img_src_value = /*image*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*name*/ 2) {
    				attr_dev(img, "alt", /*name*/ ctx[1]);
    			}

    			if (dirty & /*location*/ 4 && t2_value !== (t2_value = /*location*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*status*/ 8) set_data_dev(t5, /*status*/ ctx[3]);
    			if (dirty & /*species*/ 16) set_data_dev(t8, /*species*/ ctx[4]);
    			if (dirty & /*name*/ 2) set_data_dev(t10, /*name*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { image } = $$props;
    	let { name } = $$props;
    	let { location } = $$props;
    	let { status } = $$props;
    	let { species } = $$props;
    	const writable_props = ["image", "name", "location", "status", "species"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);

    	$$self.$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("location" in $$props) $$invalidate(2, location = $$props.location);
    		if ("status" in $$props) $$invalidate(3, status = $$props.status);
    		if ("species" in $$props) $$invalidate(4, species = $$props.species);
    	};

    	$$self.$capture_state = () => ({ image, name, location, status, species });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("location" in $$props) $$invalidate(2, location = $$props.location);
    		if ("status" in $$props) $$invalidate(3, status = $$props.status);
    		if ("species" in $$props) $$invalidate(4, species = $$props.species);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, name, location, status, species];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			image: 0,
    			name: 1,
    			location: 2,
    			status: 3,
    			species: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[0] === undefined && !("image" in props)) {
    			console.warn("<Card> was created without expected prop 'image'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Card> was created without expected prop 'name'");
    		}

    		if (/*location*/ ctx[2] === undefined && !("location" in props)) {
    			console.warn("<Card> was created without expected prop 'location'");
    		}

    		if (/*status*/ ctx[3] === undefined && !("status" in props)) {
    			console.warn("<Card> was created without expected prop 'status'");
    		}

    		if (/*species*/ ctx[4] === undefined && !("species" in props)) {
    			console.warn("<Card> was created without expected prop 'species'");
    		}
    	}

    	get image() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get species() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set species(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Characters.svelte generated by Svelte v3.24.0 */

    const { console: console_1 } = globals;
    const file$4 = "src/Components/Characters.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (48:6) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading..";
    			add_location(p, file$4, 48, 8, 1021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(48:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:8) {#if result == results[0] || result == results[1] || result == results[2] || result == results[3] || result == results[4]}
    function create_if_block(ctx) {
    	let card;
    	let current;
    	const card_spread_levels = [/*result*/ ctx[2]];
    	let card_props = {};

    	for (let i = 0; i < card_spread_levels.length; i += 1) {
    		card_props = assign(card_props, card_spread_levels[i]);
    	}

    	card = new Card({ props: card_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = (dirty & /*results*/ 2)
    			? get_spread_update(card_spread_levels, [get_spread_object(/*result*/ ctx[2])])
    			: {};

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(45:8) {#if result == results[0] || result == results[1] || result == results[2] || result == results[3] || result == results[4]}",
    		ctx
    	});

    	return block;
    }

    // (44:6) {#each results as result}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*result*/ ctx[2] == /*results*/ ctx[1][0] || /*result*/ ctx[2] == /*results*/ ctx[1][1] || /*result*/ ctx[2] == /*results*/ ctx[1][2] || /*result*/ ctx[2] == /*results*/ ctx[1][3] || /*result*/ ctx[2] == /*results*/ ctx[1][4]) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*result*/ ctx[2] == /*results*/ ctx[1][0] || /*result*/ ctx[2] == /*results*/ ctx[1][1] || /*result*/ ctx[2] == /*results*/ ctx[1][2] || /*result*/ ctx[2] == /*results*/ ctx[1][3] || /*result*/ ctx[2] == /*results*/ ctx[1][4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*results*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(44:6) {#each results as result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let h4;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	let each_value = /*results*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(h4, "class", "svelte-1y5evw1");
    			add_location(h4, file$4, 40, 6, 730);
    			attr_dev(div0, "class", "title svelte-1y5evw1");
    			add_location(div0, file$4, 39, 4, 704);
    			attr_dev(div1, "class", "card-container svelte-1y5evw1");
    			add_location(div1, file$4, 42, 4, 762);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$4, 38, 2, 676);
    			attr_dev(div3, "class", "Characters svelte-1y5evw1");
    			add_location(div3, file$4, 37, 0, 649);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*results*/ 2) {
    				each_value = /*results*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div1, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { results = [] } = $$props;
    	console.log(results);
    	const writable_props = ["title", "results"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Characters> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Characters", $$slots, []);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({ Card, title, results });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, results];
    }

    class Characters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { title: 0, results: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Characters",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console_1.warn("<Characters> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<Characters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Characters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<Characters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<Characters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Prefooter.svelte generated by Svelte v3.24.0 */

    const file$5 = "src/Components/Prefooter.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let a0;
    	let i0;
    	let t0;
    	let div1;
    	let a1;
    	let i1;
    	let t1;
    	let div2;
    	let a2;
    	let i2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			div2 = element("div");
    			a2 = element("a");
    			i2 = element("i");
    			attr_dev(i0, "class", "fab fa-linkedin svelte-8fpud1");
    			add_location(i0, file$5, 74, 8, 1268);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/mateo-aquino-3466291aa/");
    			attr_dev(a0, "target", "__blank");
    			add_location(a0, file$5, 71, 6, 1164);
    			attr_dev(div0, "class", "item1 svelte-8fpud1");
    			add_location(div0, file$5, 70, 4, 1138);
    			attr_dev(i1, "class", "fab fa-github-square svelte-8fpud1");
    			add_location(i1, file$5, 79, 8, 1413);
    			attr_dev(a1, "href", "https://github.com/mateoaq");
    			attr_dev(a1, "target", "__blank");
    			add_location(a1, file$5, 78, 6, 1350);
    			attr_dev(div1, "class", "item2 svelte-8fpud1");
    			add_location(div1, file$5, 77, 4, 1324);
    			attr_dev(i2, "class", "fab fa-whatsapp-square svelte-8fpud1");
    			add_location(i2, file$5, 86, 8, 1673);
    			attr_dev(a2, "href", "https://api.whatsapp.com/send?phone=5493794375990&text=Me%20interesa%20que%20trabajemos%20juntos%20en%20un%20desarrollo!");
    			attr_dev(a2, "target", "__blank");
    			add_location(a2, file$5, 83, 6, 1500);
    			attr_dev(div2, "class", "item3 svelte-8fpud1");
    			add_location(div2, file$5, 82, 4, 1474);
    			attr_dev(div3, "class", "wrapper svelte-8fpud1");
    			add_location(div3, file$5, 69, 2, 1112);
    			attr_dev(div4, "class", "Prefooter svelte-8fpud1");
    			add_location(div4, file$5, 68, 0, 1086);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, i0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, a1);
    			append_dev(a1, i1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, a2);
    			append_dev(a2, i2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefooter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Prefooter", $$slots, []);
    	return [];
    }

    class Prefooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefooter",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Components/Footer.svelte generated by Svelte v3.24.0 */

    const file$6 = "src/Components/Footer.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h5;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text("2020 | Desarrollado por\n        ");
    			a = element("a");
    			a.textContent = "Aquino Mateo";
    			attr_dev(a, "href", "https://www.linkedin.com/in/mateo-aquino-3466291aa/");
    			attr_dev(a, "target", "__blank");
    			attr_dev(a, "class", "svelte-1qc3w2v");
    			add_location(a, file$6, 29, 8, 450);
    			attr_dev(h5, "class", "svelte-1qc3w2v");
    			add_location(h5, file$6, 27, 6, 405);
    			attr_dev(div0, "class", "text svelte-1qc3w2v");
    			add_location(div0, file$6, 26, 4, 380);
    			attr_dev(div1, "class", "text-container svelte-1qc3w2v");
    			add_location(div1, file$6, 25, 2, 347);
    			attr_dev(div2, "class", "Footer svelte-1qc3w2v");
    			add_location(div2, file$6, 24, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t0);
    			append_dev(h5, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.0 */

    const { console: console_1$1 } = globals;
    const file$7 = "src/App.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let header;
    	let t0;
    	let hero;
    	let t1;
    	let totalc;
    	let t2;
    	let characters;
    	let t3;
    	let prefooter;
    	let t4;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	hero = new Hero({ $$inline: true });

    	totalc = new TotalC({
    			props: { count: /*counts*/ ctx[0] },
    			$$inline: true
    		});

    	characters = new Characters({
    			props: {
    				title: "5 Principales",
    				results: /*results*/ ctx[1]
    			},
    			$$inline: true
    		});

    	prefooter = new Prefooter({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(hero.$$.fragment);
    			t1 = space();
    			create_component(totalc.$$.fragment);
    			t2 = space();
    			create_component(characters.$$.fragment);
    			t3 = space();
    			create_component(prefooter.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1rwqnc8");
    			add_location(main, file$7, 30, 0, 738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(hero, main, null);
    			append_dev(main, t1);
    			mount_component(totalc, main, null);
    			append_dev(main, t2);
    			mount_component(characters, main, null);
    			append_dev(main, t3);
    			mount_component(prefooter, main, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const totalc_changes = {};
    			if (dirty & /*counts*/ 1) totalc_changes.count = /*counts*/ ctx[0];
    			totalc.$set(totalc_changes);
    			const characters_changes = {};
    			if (dirty & /*results*/ 2) characters_changes.results = /*results*/ ctx[1];
    			characters.$set(characters_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(totalc.$$.fragment, local);
    			transition_in(characters.$$.fragment, local);
    			transition_in(prefooter.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(totalc.$$.fragment, local);
    			transition_out(characters.$$.fragment, local);
    			transition_out(prefooter.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(hero);
    			destroy_component(totalc);
    			destroy_component(characters);
    			destroy_component(prefooter);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const API = "https://rickandmortyapi.com/api/character";

    function instance$7($$self, $$props, $$invalidate) {
    	let data = {};
    	let counts = "";
    	let results = "";

    	onMount(async () => {
    		const response = await fetch(API);
    		data = await response.json();
    		$$invalidate(0, counts = data.info.count);
    		$$invalidate(1, results = data.results);
    		console.log(results[5]);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		Header,
    		Hero,
    		TotalC,
    		Characters,
    		Prefooter,
    		Footer,
    		data,
    		counts,
    		results,
    		API
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) data = $$props.data;
    		if ("counts" in $$props) $$invalidate(0, counts = $$props.counts);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [counts, results];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
