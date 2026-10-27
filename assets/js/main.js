/*
	Template Name: SaasRiver - SaaS & StartUp HTML Template
	Author: https://themexriver.com/
	Version: 1.0
*/

(function ($) {
"use strict";

// a reload half-way down the page would otherwise restore the old offset after
// the scroll triggers were measured
if ("scrollRestoration" in history) {
	history.scrollRestoration = "manual";
}

const isRtl = () => getComputedStyle(document.body).direction === "rtl";
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/*
	preloader-1 — the counter follows the images that are loaded, jumps to 100 on
	window load, then the panel slides up on a curved edge
*/
function sbPreloaderInit() {

	var loader = document.querySelector(".sb-preloader-1");
	if (!loader) return null;

	if (prefersReducedMotion()) {
		return {
			done: function () {
				loader.remove();
				afterPreloader();
			}
		};
	}

	var count = loader.querySelector(".count");
	var bar = loader.querySelector(".bar span");
	var words = loader.querySelectorAll(".word");
	var curve = loader.querySelector(".curve path");
	var num = { val: 0 };
	var current = 0;
	var exited = false;
	var startTime = Date.now();
	var minTime = 1200; // the counter never just flashes by on a fast load

	gsap.set(words, { yPercent: 110, opacity: 1 });
	gsap.set(words[0], { yPercent: 0 });
	gsap.from(loader.querySelectorAll(".js-in"), {
		y: 30,
		opacity: 0,
		duration: .8,
		ease: "power3.out",
		stagger: .1
	});

	function showWord(i) {
		if (i === current) return;
		gsap.to(words[current], { yPercent: -110, duration: .5, ease: "power3.inOut" });
		gsap.fromTo(words[i], { yPercent: 110 }, { yPercent: 0, duration: .5, ease: "power3.inOut" });
		current = i;
	}

	function render() {
		count.textContent = Math.round(num.val);
		gsap.set(bar, { scaleX: num.val / 100 });
		showWord(Math.min(words.length - 1, Math.floor(num.val / (100 / words.length))));
	}

	function setProgress(p) {
		gsap.to(num, {
			val: p,
			duration: .7,
			ease: "power1.out",
			overwrite: true,
			onUpdate: render,
			onComplete: p >= 100 ? finish : null
		});
	}

	function finish() {
		var wait = Math.max(0, minTime - (Date.now() - startTime)) / 1000;
		gsap.delayedCall(wait, exit);
	}

	function exit() {
		if (exited) return;
		exited = true;

		var curveH = window.innerHeight * .14;
		var tl = gsap.timeline();

		tl.to(loader.querySelectorAll(".top, .middle, .bottom"), {
			y: -40,
			opacity: 0,
			duration: .5,
			ease: "power2.in",
			stagger: .06
		});
		tl.to(loader, {
			y: -(window.innerHeight + curveH),
			duration: 1.1,
			ease: "power4.inOut"
		}, .4);
		tl.to(curve, { attr: { d: "M0 0H1440Q720 0 0 0Z" }, duration: 1.1, ease: "power2.in" }, .4);

		// the intro starts once the panel is mostly gone
		tl.call(afterPreloader, null, .9);
		tl.call(function () {
			loader.remove();
		}, null, 1.6);
	}

	// lazy images do not hold the page
	var imgs = Array.prototype.filter.call(document.images, function (img) {
		return img.loading !== "lazy" && !loader.contains(img);
	});
	var loaded = 0;

	function imgDone() {
		loaded++;
		setProgress(Math.min(90, (loaded / imgs.length) * 90));
	}

	imgs.forEach(function (img) {
		if (img.complete) {
			loaded++;
		} else {
			img.addEventListener("load", imgDone);
			img.addEventListener("error", imgDone);
		}
	});
	setProgress(imgs.length ? Math.min(90, (loaded / imgs.length) * 90) : 10);

	return {
		done: function () {
			setProgress(100);
		}
	};
}

var sbPreloader = sbPreloaderInit();


/*
	section titles (.wa_title_ani_2) — words rise out of their masks, sharpen from
	a blur and turn from purple to white; split and parked behind the preloader
*/
var sbTitleItems = [];

function sbTitleSplit() {
	if (isRtl() || prefersReducedMotion()) return;
	if (!$(".wa_title_ani_2").length) return;

	$(".wa_title_ani_2").each(function (index, el) {

		var split = new SplitText(el, {
			type: "words",
			wordsClass: "sb-split-word"
		});

		split.words.forEach(function (word) {
			var mask = document.createElement("span");
			mask.className = "sb-split-mask";
			word.parentNode.insertBefore(mask, word);
			mask.appendChild(word);
		});

		gsap.set(split.words, {
			yPercent: 115,
			rotate: 6,
			opacity: 0,
			filter: "blur(10px)",
			color: "#8b72ff",
			transformOrigin: "0% 100%"
		});

		sbTitleItems.push({ el: el, words: split.words });
	});
}

function sbTitlePlay() {
	if (isRtl()) return;

	sbTitleItems.forEach(function (item) {
		gsap.to(item.words, {
			scrollTrigger: {
				trigger: item.el,
				start: "top 86%",
			},
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: "#fff",
			duration: 1.1,
			ease: "power4.out",
			stagger: .07,
			onComplete: function () {
				gsap.set(item.words, { clearProps: "filter,color,transform,opacity" });
			}
		});
	});
}


/*
	hero-1 — parked before the preloader lifts, played right after
*/
var sbHero = null;

// the plain words of a hero title become masked words, anything else inside it (capsule, icons) stays as it is
function sbHeroWords(title) {
	var words = [];

	Array.prototype.slice.call(title.childNodes).forEach(function (node) {
		if (node.nodeType !== 3) return;

		var frag = document.createDocumentFragment();
		node.textContent.split(/(\s+)/).forEach(function (part) {
			if (!part) return;
			if (!part.trim()) {
				frag.appendChild(document.createTextNode(" "));
				return;
			}

			var mask = document.createElement("span");
			var word = document.createElement("span");
			mask.className = "sb-split-mask";
			word.className = "sb-split-word";
			word.textContent = part;
			mask.appendChild(word);
			frag.appendChild(mask);
			words.push(word);
		});
		title.replaceChild(frag, node);
	});

	return words;
}

function sbHeroPark() {
	if (prefersReducedMotion()) return;

	var title = document.querySelector(".sb-hero-1-title");
	if (!title) return;

	var hero = {
		pill: document.querySelector(".sb-hero-1-content .sb-subtitle-1"),
		title: title,
		box: title.querySelector(".sb-hero-1-title-box"),
		boxText: title.querySelector(".sb-hero-1-title-box-text"),
		disc: document.querySelector(".sb-hero-1-disc"),
		btns: document.querySelector(".sb-hero-1-content .btn-wrap"),
		img: document.querySelector(".sb-hero-1-img"),
		robot: document.querySelector(".sb-hero-1-robot"),
		words: []
	};

	hero.words = sbHeroWords(title);

	gsap.set(hero.words, {
		yPercent: 115,
		rotate: 6,
		opacity: 0,
		filter: "blur(10px)",
		color: "#8b72ff",
		transformOrigin: "0% 100%"
	});
	gsap.set(hero.pill, { opacity: 0, y: 20, clipPath: "inset(0% 50% 0% 50% round 100px)" });
	gsap.set(hero.box, { opacity: 0, filter: "blur(12px)" });
	gsap.set(hero.boxText, { clipPath: "inset(0% 100% 0% 0%)" });
	gsap.set([hero.disc, hero.btns], { opacity: 0, y: 28, filter: "blur(6px)" });
	gsap.set(hero.img, { autoAlpha: 0, y: 90 });
	// the robot is never faded: half see-through it would show the dashboard behind it
	gsap.set(hero.robot, { visibility: "hidden", y: 90 });

	sbHero = hero;
}

function sbHeroPlay() {
	if (!sbHero) return;
	var hero = sbHero;

	gsap.timeline({
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set([hero.pill, hero.box, hero.boxText, hero.disc, hero.btns, hero.img, hero.robot].concat(hero.words), { clearProps: "all" });
		}
	})
		.to(hero.pill, {
			opacity: 1,
			y: 0,
			clipPath: "inset(0% 0% 0% 0% round 100px)",
			duration: 1
		}, 0)
		.to(hero.words, {
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: "#fff",
			duration: 1.1,
			ease: "power4.out",
			stagger: .08
		}, .15)
		.to(hero.box, { opacity: 1, filter: "blur(0px)", duration: .8 }, .55)
		.to(hero.boxText, { clipPath: "inset(0% 0% 0% 0%)", duration: .9, ease: "power2.inOut" }, .65)
		.to(hero.disc, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .8)
		.to(hero.btns, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .95)
		.to(hero.img, { autoAlpha: 1, y: 0, duration: 1.3, ease: "power4.out" }, ">-.5")
		// the robot waits until the image has landed, so the two never cross mid-slide
		.set(hero.robot, { visibility: "visible" }, ">-.5")
		.to(hero.robot, { y: 0, duration: 1.1, ease: "power3.out" }, "<");
}

/*
	section titles 2 (.sb-sec-title-2) — the same word cascade, then the icon pops in;
	the words end on the colour the title already has, some of them sit on a dark section
*/
var sbTitle2Items = [];

function sbTitle2Split() {
	if (isRtl() || prefersReducedMotion()) return;

	document.querySelectorAll(".sb-sec-title-2").forEach(function (el) {
		var color = getComputedStyle(el).color;
		var icons = el.querySelectorAll(".sb-sec-title-2-icon");
		var words = sbHeroWords(el);

		gsap.set(words, {
			yPercent: 115,
			rotate: 6,
			opacity: 0,
			filter: "blur(10px)",
			color: "#8b72ff",
			transformOrigin: "0% 100%"
		});
		gsap.set(icons, { opacity: 0, scale: .4, rotate: -25 });

		sbTitle2Items.push({ el: el, words: words, icons: icons, color: color });
	});
}

function sbTitle2Play() {
	if (isRtl()) return;

	sbTitle2Items.forEach(function (item) {
		gsap.timeline({
			scrollTrigger: {
				trigger: item.el,
				start: "top 86%"
			},
			onComplete: function () {
				gsap.set(item.words.concat(Array.prototype.slice.call(item.icons)), { clearProps: "all" });
			}
		})
			.to(item.words, {
				yPercent: 0,
				rotate: 0,
				opacity: 1,
				filter: "blur(0px)",
				color: item.color,
				duration: 1.1,
				ease: "power4.out",
				stagger: .07
			}, 0)
			.to(item.icons, { opacity: 1, scale: 1, rotate: 0, duration: .9, ease: "back.out(1.7)" }, .45);
	});
}


/*
	section titles 3 (.sb-sec-title-3) — the same word cascade for the light pages: the words
	start in the brand green and settle on the colour the title already has
*/
var sbTitle3Items = [];

function sbTitle3Split() {
	if (isRtl() || prefersReducedMotion()) return;

	document.querySelectorAll(".sb-sec-title-3").forEach(function (el) {
		var color = getComputedStyle(el).color;
		var words = sbHeroWords(el);

		gsap.set(words, {
			yPercent: 115,
			rotate: 6,
			opacity: 0,
			filter: "blur(10px)",
			color: "#14ae86",
			transformOrigin: "0% 100%"
		});

		sbTitle3Items.push({ el: el, words: words, color: color });
	});
}

function sbTitle3Play() {
	if (isRtl()) return;

	sbTitle3Items.forEach(function (item) {
		gsap.to(item.words, {
			scrollTrigger: {
				trigger: item.el,
				start: "top 86%"
			},
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: item.color,
			duration: 1.1,
			ease: "power4.out",
			stagger: .07,
			onComplete: function () {
				gsap.set(item.words, { clearProps: "all" });
			}
		});
	});
}


/*
	section titles 4 (.wa_title_ani_4, on every .sb-sec-title-4) — the same word cascade for home-4: the words
	start in the brand violet and settle on the colour the title already has; the gradient words (.has-gd-clr)
	stay one piece each, a background-clip text does not survive being split, so they rise and sharpen in their turn
*/
var sbTitle4Items = [];

function sbTitle4Split() {
	if (isRtl() || prefersReducedMotion()) return;

	document.querySelectorAll(".wa_title_ani_4").forEach(function (el) {
		var color = getComputedStyle(el).color;
		var words = sbHeroWords(el);
		var grads = Array.prototype.slice.call(el.querySelectorAll(".has-gd-clr"));
		// words and gradient pieces in reading order, so the stagger runs along the title
		var pieces = Array.prototype.slice.call(el.querySelectorAll(".sb-split-word, .has-gd-clr"));

		gsap.set(words, {
			yPercent: 115,
			rotate: 6,
			opacity: 0,
			filter: "blur(10px)",
			color: "#5641f2",
			transformOrigin: "0% 100%"
		});
		// inline-block so the piece can be moved, it keeps it afterwards (a two word piece never splits over two lines)
		gsap.set(grads, { display: "inline-block", opacity: 0, y: 40, filter: "blur(10px)" });

		sbTitle4Items.push({ el: el, color: color, words: words, grads: grads, pieces: pieces });
	});
}

function sbTitle4Play() {
	if (isRtl()) return;

	sbTitle4Items.forEach(function (item) {
		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: item.el,
				start: "top 86%"
			},
			onComplete: function () {
				gsap.set(item.words, { clearProps: "all" });
				gsap.set(item.grads, { clearProps: "opacity,filter,transform,visibility" });
			}
		});

		item.pieces.forEach(function (piece, i) {
			if (item.grads.indexOf(piece) > -1) {
				tl.to(piece, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power4.out" }, i * .07);
			} else {
				tl.to(piece, {
					yPercent: 0,
					rotate: 0,
					opacity: 1,
					filter: "blur(0px)",
					color: item.color,
					duration: 1.1,
					ease: "power4.out"
				}, i * .07);
			}
		});
	});
}


/*
	section titles 5 (.sb-sec-title-5) — the same word cascade for home-5: the words start in the brand
	orange and settle on the colour the title already has (white on the dark sections)
*/
var sbTitle5Items = [];

function sbTitle5Split() {
	if (isRtl() || prefersReducedMotion()) return;

	document.querySelectorAll(".sb-sec-title-5").forEach(function (el) {
		var color = getComputedStyle(el).color;
		var words = sbHeroWords(el);

		gsap.set(words, {
			yPercent: 115,
			rotate: 6,
			opacity: 0,
			filter: "blur(10px)",
			color: "#fb6514",
			transformOrigin: "0% 100%"
		});

		sbTitle5Items.push({ el: el, words: words, color: color });
	});
}

function sbTitle5Play() {
	if (isRtl()) return;

	sbTitle5Items.forEach(function (item) {
		gsap.to(item.words, {
			scrollTrigger: {
				trigger: item.el,
				start: "top 86%"
			},
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: item.color,
			duration: 1.1,
			ease: "power4.out",
			stagger: .07,
			onComplete: function () {
				gsap.set(item.words, { clearProps: "all" });
			}
		});
	});
}


/*
	use-case-4 — the two blue corner shapes slide in from their own side once the section scrolls into
	view (the area clips them, so they come out from behind its edges)
*/
function sbUseCase4Shapes() {
	var area = document.querySelector(".sb-use-case-4-area");
	if (!area || prefersReducedMotion()) return;

	var left = area.querySelector(".sb-use-case-4-bg-shape.is-left");
	var right = area.querySelector(".sb-use-case-4-bg-shape.is-right");
	var shapes = [left, right].filter(Boolean);
	if (!shapes.length) return;

	var tl = gsap.timeline({
		defaults: { duration: 1.6, ease: "power3.out" },
		scrollTrigger: {
			trigger: area,
			start: "top 75%",
			once: true
		},
		onComplete: function () {
			gsap.set(shapes, { clearProps: "opacity,transform" });
		}
	});

	if (left) tl.from(left, { xPercent: -100, opacity: 0 }, 0);
	if (right) tl.from(right, { xPercent: 100, opacity: 0 }, 0);
}


/*
	integration-4 — the blue glow at the bottom rises out of the bottom edge once that edge scrolls into view
	(the area clips it, so it comes up from behind the rounded corners)
*/
function sbIntegration4Glow() {
	var area = document.querySelector(".sb-integration-4-area");
	var glow = area ? area.querySelector(".sb-integration-4-color-bottom img") : null;
	if (!glow || prefersReducedMotion()) return;

	gsap.from(glow, {
		yPercent: 70,
		opacity: 0,
		duration: 1.8,
		ease: "power3.out",
		scrollTrigger: {
			trigger: area,
			start: "bottom 99%",
			once: true
		},
		onComplete: function () {
			gsap.set(glow, { clearProps: "opacity,transform" });
		}
	});
}


/*
	integration-5 — once the artwork scrolls into view the three colour-blob lines draw themselves from the logo
	out to the right edge (a wipe along the line), and the glow at the end of each one lights up as the line reaches it
*/
function sbIntegration5Blobs() {
	var art = document.querySelector(".sb-integration-5-art");
	if (!art || prefersReducedMotion()) return;

	var tl = gsap.timeline({
		scrollTrigger: {
			trigger: art,
			start: "top 70%",
			once: true
		},
		onComplete: function () {
			gsap.set(art.querySelectorAll(".sb-integration-5-blob-line, .sb-integration-5-blob-glow"), { clearProps: "clipPath,opacity,transform" });
		}
	});

	[1, 2, 3].forEach(function (n, i) {
		var line = art.querySelector(".sb-integration-5-blob-line-" + n);
		var glow = art.querySelector(".sb-integration-5-blob-glow-" + n);
		var at = i * .35;

		if (line) tl.from(line, { clipPath: "inset(0 100% 0 0)", duration: 1.8, ease: "power2.inOut" }, at);
		if (glow) tl.from(glow, { opacity: 0, scale: .85, duration: 1.4, ease: "power2.out" }, at + 1.2);
	});
}


/*
	cta-5 — the glass shapes slide in from their own corner (the card clips them) and the astronaut flies in
	from the bottom right once the card scrolls into view; then he keeps floating, a slow drift with a small
	tilt, and only while the card is on screen
*/
function sbCta5Intro() {
	var wrap = document.querySelector(".sb-cta-5-wrap");
	if (!wrap || prefersReducedMotion()) return;

	var shapeLeft = wrap.querySelector(".sb-cta-5-shape-2");
	var shapeRight = wrap.querySelector(".sb-cta-5-shape-1");
	var man = wrap.querySelector(".sb-cta-5-man");
	var float;

	var tl = gsap.timeline({
		defaults: { ease: "power3.out" },
		scrollTrigger: {
			trigger: wrap,
			start: "top 85%",
			once: true
		},
		onComplete: function () {
			gsap.set([shapeLeft, shapeRight, man].filter(Boolean), { clearProps: "opacity,transform" });
			if (man) startFloat();
		}
	});

	if (shapeLeft) tl.from(shapeLeft, { xPercent: -40, yPercent: -40, opacity: 0, duration: 1.6 }, 0);
	if (shapeRight) tl.from(shapeRight, { xPercent: 40, yPercent: -40, opacity: 0, duration: 1.6 }, .1);
	if (man) tl.from(man, { xPercent: 35, yPercent: 35, rotate: 8, opacity: 0, duration: 1.8 }, .3);

	// the float stops while the card is off screen
	function startFloat() {
		float = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 3.2, ease: "sine.inOut" } });
		float.to(man, { y: -18, rotate: -2.5, x: 6 }, 0);

		new IntersectionObserver(function (entries) {
			float.paused(!entries[0].isIntersecting);
		}).observe(wrap);
	}
}


/*
	footer-4 — the glass ribbons drop in from the top edge of the footer, and the line art in the two
	corners of the box slides in from its own side (the box clips it); each part has its own trigger
*/
function sbFooter4Intro() {
	var area = document.querySelector(".sb-footer-4-area");
	if (!area || prefersReducedMotion()) return;

	var ribbons = area.querySelector(".sb-footer-4-bg-img");
	var box = area.querySelector(".sb-footer-4-box");
	var left = box ? box.querySelector(".box-bg-1") : null;
	var right = box ? box.querySelector(".box-bg-2") : null;

	if (ribbons) {
		gsap.from(ribbons, {
			y: -120,
			opacity: 0,
			duration: 1.8,
			ease: "power3.out",
			scrollTrigger: {
				trigger: area,
				start: "top 85%",
				once: true
			},
			onComplete: function () {
				gsap.set(ribbons, { clearProps: "opacity,transform" });
			}
		});
	}

	var shapes = [left, right].filter(Boolean);
	if (!shapes.length) return;

	var tl = gsap.timeline({
		defaults: { duration: 1.6, ease: "power3.out" },
		scrollTrigger: {
			trigger: box,
			start: "top 85%",
			once: true
		},
		onComplete: function () {
			gsap.set(shapes, { clearProps: "opacity,transform" });
		}
	});

	if (left) tl.from(left, { xPercent: -35, opacity: 0 }, 0);
	if (right) tl.from(right, { xPercent: 35, opacity: 0 }, 0);
}


/*
	hero-2 — same story as hero-1: parked before the preloader lifts, played right after
*/
var sbHero2 = null;

function sbHero2Park() {
	if (prefersReducedMotion()) return;

	var title = document.querySelector(".sb-hero-2-title");
	if (!title) return;

	var hero = {
		pill: document.querySelector(".sb-hero-2-content .sb-subtitle-2"),
		icons: title.querySelectorAll(".sb-hero-2-title-icon"),
		disc: document.querySelector(".sb-hero-2-disc"),
		btns: document.querySelector(".sb-hero-2-content .btn-wrap"),
		bg: document.querySelectorAll(".sb-hero-2-bg-shape, .sb-hero-2-bg-line"),
		land: document.querySelector(".sb-hero-2-land"),
		light1: document.querySelector(".sb-hero-2-light-1"),
		light2: document.querySelector(".sb-hero-2-light-2"),
		dot: document.querySelector(".sb-hero-2-dot"),
		card1: document.querySelector(".sb-hero-2-card-1"),
		card2: document.querySelector(".sb-hero-2-card-2"),
		words: sbHeroWords(title)
	};

	gsap.set(hero.words, {
		yPercent: 115,
		rotate: 6,
		opacity: 0,
		filter: "blur(10px)",
		color: "#8b72ff",
		transformOrigin: "0% 100%"
	});
	gsap.set(hero.pill, { opacity: 0, y: 20, clipPath: "inset(0% 50% 0% 50% round 100px)" });
	gsap.set(hero.icons, { opacity: 0, scale: .4, rotate: -25 });
	gsap.set([hero.disc, hero.btns], { opacity: 0, y: 28, filter: "blur(6px)" });
	gsap.set(hero.bg, { opacity: 0 });
	gsap.set([hero.light1, hero.light2, hero.dot], { opacity: 0 });
	// the cards keep their tilt from the css, gsap only adds the slide on top of it
	gsap.set([hero.land, hero.card1, hero.card2], { opacity: 0, y: 90 });

	sbHero2 = hero;
}

function sbHero2Play() {
	if (!sbHero2) return;
	var hero = sbHero2;

	gsap.timeline({
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set([hero.pill, hero.icons, hero.disc, hero.btns, hero.bg, hero.land, hero.light1, hero.light2, hero.dot, hero.card1, hero.card2].concat(hero.words), { clearProps: "all" });
		}
	})
		.to(hero.bg, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0)
		.to(hero.pill, {
			opacity: 1,
			y: 0,
			clipPath: "inset(0% 0% 0% 0% round 100px)",
			duration: 1
		}, 0)
		.to(hero.words, {
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: "#fff",
			duration: 1.1,
			ease: "power4.out",
			stagger: .08
		}, .15)
		.to(hero.icons, { opacity: 1, scale: 1, rotate: 0, duration: .9, ease: "back.out(1.7)", stagger: .25 }, .6)
		.to(hero.disc, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .8)
		.to(hero.btns, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .95)
		// the visual builds up behind the text: ground first, then the cards with their lights and dots
		.to(hero.land, { opacity: .8, y: 0, duration: 1.3 }, .3)
		.to(hero.light1, { opacity: 1, duration: 1.5, ease: "power2.out" }, .5)
		.to(hero.card1, { opacity: 1, y: 0, duration: 1.3, ease: "power4.out" }, .6)
		.to(hero.light2, { opacity: 1, duration: 1.5, ease: "power2.out" }, .8)
		.to(hero.dot, { opacity: 1, duration: 1.5, ease: "power2.out" }, .9)
		.to(hero.card2, { opacity: 1, y: 0, duration: 1.3, ease: "power4.out" }, .95);
}

/*
	hero-3 — parked before the preloader lifts, played right after; the scroll effect
	below takes over the hills and the dashboard once the intro is done
*/
var sbHero3 = null;

function sbHero3Park() {
	if (prefersReducedMotion()) return;

	var title = document.querySelector(".sb-hero-3-title");
	if (!title) return;

	var hero = {
		pill: document.querySelector(".sb-hero-3-content .sb-subtitle-3"),
		titleColor: getComputedStyle(title).color,
		disc: document.querySelector(".sb-hero-3-disc"),
		btns: document.querySelector(".sb-hero-3-content .btn-wrap"),
		bg: document.querySelectorAll(".sb-hero-3-bg-clr, .sb-hero-3-bg-glow, .sb-hero-3-bg-dot"),
		hills: document.querySelectorAll(".sb-hero-3-hill"),
		logo: document.querySelector(".sb-hero-3-logo"),
		linesLeft: document.querySelectorAll(".sb-hero-3-line-1, .sb-hero-3-line-2"),
		linesRight: document.querySelectorAll(".sb-hero-3-line-3, .sb-hero-3-line-4"),
		lines: document.querySelectorAll(".sb-hero-3-line"),
		icons: document.querySelectorAll(".sb-hero-3-icon"),
		iconImgs: document.querySelectorAll(".sb-hero-3-icon img"),
		dashboard: document.querySelector(".sb-hero-3-dashboard"),
		words: sbHeroWords(title)
	};

	gsap.set(hero.words, {
		yPercent: 115,
		rotate: 6,
		opacity: 0,
		filter: "blur(10px)",
		color: "#14ae86",
		transformOrigin: "0% 100%"
	});
	gsap.set(hero.pill, { opacity: 0, y: 20, clipPath: "inset(0% 50% 0% 50% round 100px)" });
	gsap.set([hero.disc, hero.btns], { opacity: 0, y: 28, filter: "blur(6px)" });
	gsap.set(hero.bg, { opacity: 0 });
	gsap.set(hero.hills, { opacity: 0, y: 120 });
	gsap.set(hero.logo, { opacity: 0, scale: .4 });
	// the lines are drawn out from the logo: the left ones run right to left, the right ones left to right
	gsap.set(hero.linesLeft, { clipPath: "inset(0% 0% 0% 100%)" });
	gsap.set(hero.linesRight, { clipPath: "inset(0% 100% 0% 0%)" });
	// the icons keep their float from the css, so only the box fades and the picture inside pops
	gsap.set(hero.icons, { opacity: 0 });
	gsap.set(hero.iconImgs, { scale: .3, rotate: -25 });
	gsap.set(hero.dashboard, { autoAlpha: 0, y: 90 });

	sbHero3 = hero;
}

function sbHero3Play() {
	if (!sbHero3) {
		sbHero3Scroll();
		return;
	}
	var hero = sbHero3;

	gsap.timeline({
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set([hero.pill, hero.disc, hero.btns, hero.hills, hero.logo, hero.lines, hero.icons, hero.iconImgs, hero.dashboard].concat(hero.words), { clearProps: "all" });
			// the dot bg gets its image from data-background as an inline style, so only the fade is cleared here
			gsap.set(hero.bg, { clearProps: "opacity" });
			sbHero3Scroll();
		}
	})
		.to(hero.bg, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0)
		.to(hero.hills, { opacity: 1, y: 0, duration: 1.4, ease: "power4.out", stagger: .15 }, .1)
		.to(hero.pill, {
			opacity: 1,
			y: 0,
			clipPath: "inset(0% 0% 0% 0% round 100px)",
			duration: 1
		}, 0)
		.to(hero.words, {
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: hero.titleColor,
			duration: 1.1,
			ease: "power4.out",
			stagger: .08
		}, .15)
		.to(hero.disc, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .8)
		.to(hero.btns, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .95)
		// the logo pops in, then a line runs out to each icon and the icon pops when its line arrives
		.to(hero.logo, { opacity: 1, scale: 1, duration: 1.1, ease: "back.out(1.7)" }, .5)
		.to(hero.lines, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut", stagger: .15 }, 1)
		.to(hero.icons, { opacity: 1, duration: .4, stagger: .15 }, 1.7)
		.to(hero.iconImgs, { scale: 1, rotate: 0, duration: .8, ease: "back.out(1.7)", stagger: .15 }, 1.7)
		.to(hero.dashboard, { autoAlpha: 1, y: 0, duration: 1.4, ease: "power4.out" }, 1);
}

/*
	hero-4 — parked before the preloader lifts, played right after; the dashboard swings up out of
	the depth in 3d, then follows the pointer a few degrees on screens that have one
*/
var sbHero4 = null;

function sbHero4Park() {
	if (prefersReducedMotion()) return;

	var title = document.querySelector(".sb-hero-4-title");
	if (!title) return;

	var blobs = document.querySelectorAll(".sb-hero-4-bg-clr");

	var hero = {
		pill: document.querySelector(".sb-hero-4-content .sb-subtitle-4"),
		titleColor: getComputedStyle(title).color,
		clr: title.querySelector(".has-clr"),
		disc: document.querySelector(".sb-hero-4-disc"),
		btns: document.querySelector(".sb-hero-4-content .btn-wrap"),
		blobs: blobs,
		blobOpacity: blobs.length ? parseFloat(getComputedStyle(blobs[0]).opacity) : 1,
		bg: document.querySelectorAll(".sb-hero-4-bg-img, .sb-hero-4-bg-line-bottom, .sb-hero-4-bg-line, .sb-hero-4-bg-shape, .sb-hero-4-bg-dot"),
		marquee: document.querySelector(".sb-hero-4-marquee"),
		dashboard: document.querySelector(".sb-hero-4-dashboard"),
		words: sbHeroWords(title)
	};

	gsap.set(hero.words, {
		yPercent: 115,
		rotate: 6,
		opacity: 0,
		filter: "blur(10px)",
		color: "#5641f2",
		transformOrigin: "0% 100%"
	});
	gsap.set(hero.pill, { opacity: 0, y: 20, clipPath: "inset(0% 50% 0% 50% round 100px)" });
	// "AI Agents" stays one piece, it needs inline-block to be moved
	gsap.set(hero.clr, { display: "inline-block", opacity: 0, y: 40, filter: "blur(10px)" });
	gsap.set([hero.disc, hero.btns], { opacity: 0, y: 28, filter: "blur(6px)" });
	gsap.set([hero.bg, hero.blobs], { opacity: 0 });
	gsap.set(hero.marquee, { opacity: 0, y: 28 });
	gsap.set(hero.dashboard, {
		autoAlpha: 0,
		y: 150,
		z: -320,
		rotationX: 40,
		rotationY: -26,
		scale: .88,
		transformPerspective: 1600,
		transformOrigin: "50% 50%"
	});

	sbHero4 = hero;
}

function sbHero4Play() {
	if (!sbHero4) return;
	var hero = sbHero4;
	var tilt = window.matchMedia("(hover: hover) and (min-width: 1200px)").matches;

	gsap.timeline({
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set([hero.pill, hero.clr, hero.disc, hero.btns, hero.bg, hero.blobs, hero.marquee].concat(hero.words), { clearProps: "all" });

			if (tilt) {
				sbHero4Tilt(hero.dashboard);
			} else {
				gsap.set(hero.dashboard, { clearProps: "all" });
			}
		}
	})
		.to(hero.bg, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0)
		.to(hero.blobs, { opacity: hero.blobOpacity, duration: 1.8, ease: "power2.out" }, 0)
		.to(hero.pill, {
			opacity: 1,
			y: 0,
			clipPath: "inset(0% 0% 0% 0% round 100px)",
			duration: 1
		}, 0)
		.to(hero.words, {
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: hero.titleColor,
			duration: 1.1,
			ease: "power4.out",
			stagger: .08
		}, .15)
		.to(hero.clr, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power4.out" }, .25)
		.to(hero.disc, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .8)
		.to(hero.btns, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .95)
		.to(hero.marquee, { opacity: 1, y: 0, duration: 1 }, 1.2)
		// the dashboard fades in fast while it is still laid back, then rises and turns to face the screen
		.to(hero.dashboard, { autoAlpha: 1, duration: .9, ease: "power2.out" }, .35)
		.to(hero.dashboard, {
			y: 0,
			z: 0,
			rotationX: 0,
			rotationY: 0,
			scale: 1,
			duration: 1.9,
			ease: "power4.out"
		}, .35);
}

// the dashboard leans toward the pointer while it is over the hero box
function sbHero4Tilt(dashboard) {
	var box = document.querySelector(".sb-hero-4-box");
	if (!box || !dashboard) return;

	var rotY = gsap.quickTo(dashboard, "rotationY", { duration: .9, ease: "power3.out" });
	var rotX = gsap.quickTo(dashboard, "rotationX", { duration: .9, ease: "power3.out" });

	box.addEventListener("pointermove", function (e) {
		var r = box.getBoundingClientRect();
		rotY(((e.clientX - r.left) / r.width - .5) * 10);
		rotX(((e.clientY - r.top) / r.height - .5) * -8);
	});

	box.addEventListener("pointerleave", function () {
		rotY(0);
		rotX(0);
	});
}

/*
	hero-5 — parked before the preloader lifts, played right after: the background comes up, the pill opens, the title words climb in
	from the brand orange, then the composition builds itself: the dashboard rises, the three workflow cards drop in while the connector
	line draws itself and its dots pop, and the integration box, the user chart and the AI button slide in from their sides
*/
var sbHero5 = null;

function sbHero5Park() {
	if (prefersReducedMotion()) return;

	var title = document.querySelector(".sb-hero-5-title");
	if (!title) return;

	var line = document.querySelector(".sb-hero-5-line");
	var strokes = line ? Array.prototype.slice.call(line.querySelectorAll("path")) : [];

	var hero = {
		pill: document.querySelector(".sb-hero-5-content .sb-subtitle-5"),
		titleColor: getComputedStyle(title).color,
		disc: document.querySelector(".sb-hero-5-disc"),
		btns: document.querySelector(".sb-hero-5-content .btn-wrap"),
		bg: document.querySelectorAll(".sb-hero-5-bg-clr, .sb-hero-5-bg-line-top, .sb-hero-5-bg-line-bottom"),
		// the light in the top right corner comes on a little after the rest of the background
		light: document.querySelector(".sb-hero-5-bg-light"),
		dashboard: document.querySelector(".sb-hero-5-dashboard"),
		cards: [".sb-hero-5-card-1", ".sb-hero-5-card-2", ".sb-hero-5-card-3"].map(function (sel) {
			return document.querySelector(sel);
		}),
		strokes: strokes,
		dots: line ? line.querySelectorAll("circle") : [],
		integration: document.querySelector(".sb-hero-5-integration"),
		user: document.querySelector(".sb-hero-5-user"),
		ai: document.querySelector(".sb-hero-5-ai-btn"),
		words: sbHeroWords(title)
	};

	gsap.set(hero.words, {
		yPercent: 115,
		rotate: 6,
		opacity: 0,
		filter: "blur(10px)",
		color: "#FB6514",
		transformOrigin: "0% 100%"
	});
	gsap.set(hero.pill, { opacity: 0, y: 20, clipPath: "inset(0% 50% 0% 50% round 100px)" });
	gsap.set([hero.disc, hero.btns], { opacity: 0, y: 28, filter: "blur(6px)" });
	gsap.set([hero.bg, hero.light], { opacity: 0 });
	gsap.set(hero.dashboard, { autoAlpha: 0, y: 110, scale: .94, transformOrigin: "50% 100%" });
	gsap.set(hero.cards, { autoAlpha: 0, y: -36, scale: .9 });
	gsap.set(hero.dots, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
	gsap.set(hero.integration, { autoAlpha: 0, x: -60, y: 50 });
	gsap.set(hero.user, { autoAlpha: 0, x: 70, y: 30 });
	gsap.set(hero.ai, { autoAlpha: 0, x: 50, scale: .85 });

	// the connector line is drawn by its dash, a hidden svg (xs) can not be measured, it just stays plain
	hero.strokes = strokes.filter(function (path) {
		try {
			var len = path.getTotalLength();
			gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
			return true;
		} catch (e) {
			return false;
		}
	});

	sbHero5 = hero;
}

function sbHero5Play() {
	if (!sbHero5) return;
	var hero = sbHero5;

	gsap.timeline({
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set([hero.pill, hero.disc, hero.btns, hero.bg, hero.light, hero.dashboard, hero.cards, hero.strokes, hero.dots, hero.integration, hero.user, hero.ai].concat(hero.words), { clearProps: "all" });
		}
	})
		.to(hero.bg, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0)
		.to(hero.light, { opacity: 1, duration: 1.8, ease: "power2.inOut" }, 1.3)
		.to(hero.pill, {
			opacity: 1,
			y: 0,
			clipPath: "inset(0% 0% 0% 0% round 100px)",
			duration: 1
		}, 0)
		.to(hero.words, {
			yPercent: 0,
			rotate: 0,
			opacity: 1,
			filter: "blur(0px)",
			color: hero.titleColor,
			duration: 1.1,
			ease: "power4.out",
			stagger: .08
		}, .15)
		.to(hero.disc, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .8)
		.to(hero.btns, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, .95)
		// the dashboard rises first, the rest of the composition builds around it
		.to(hero.dashboard, { autoAlpha: 1, y: 0, scale: 1, duration: 1.6, ease: "power4.out" }, .6)
		.to(hero.cards, { autoAlpha: 1, y: 0, scale: 1, duration: .9, stagger: .15, ease: "back.out(1.5)" }, 1.1)
		.to(hero.strokes, { strokeDashoffset: 0, duration: 1.1, stagger: .1, ease: "power2.inOut" }, 1.45)
		.to(hero.dots, { scale: 1, opacity: 1, duration: .5, stagger: .18, ease: "back.out(2.2)" }, 1.6)
		.to(hero.integration, { autoAlpha: 1, x: 0, y: 0, duration: 1.2, ease: "power4.out" }, 1.35)
		.to(hero.user, { autoAlpha: 1, x: 0, y: 0, duration: 1.2, ease: "power4.out" }, 1.45)
		.to(hero.ai, { autoAlpha: 1, x: 0, scale: 1, duration: 1, ease: "back.out(1.4)" }, 1.75);
}

function sbHeroGlow() {
	gsap.fromTo(".sb-hero-1-bg-clr img, .sb-hero-1-bg-clr-3 img", {
		scaleX: 1,
		opacity: 0
	}, {
		scaleX: 1,
		opacity: 1,
		duration: 1.5,
		delay: .3,
		ease: "power2.out"
	});
}

// bottom glow: fades in once 40% of the hero has scrolled by, out again on the way up
function sbHeroBottomGlow() {
	gsap.to(".sb-hero-1-bg-clr-2", {
		opacity: 1,
		duration: 1.2,
		ease: "power2.out",
		scrollTrigger: {
			trigger: ".sb-hero-1-area",
			start: "top+=20% top",
			toggleActions: "play none none reverse",
		}
	});
}


/*
	hero-3 — once the hero has been scrolled down to its bottom edge it is pinned (the dashboard and the
	hills stay as they are), and while it is pinned the scroll drops the front hill below the bottom edge
	and makes the dashboard grow a little
*/
function sbHero3Scroll() {
	var area = document.querySelector(".sb-hero-3-area");
	var hill = document.querySelector(".sb-hero-3-hill-front");
	var dashboard = document.querySelector(".sb-hero-3-dashboard");
	if (!area || !hill || !dashboard || prefersReducedMotion()) return;

	// only from 992px up; below that the hero stays plain (matchMedia undoes the pin when the screen gets narrower)
	gsap.matchMedia().add("(min-width: 992px)", function () {
		gsap.timeline({
			defaults: { ease: "none" },
			scrollTrigger: {
				trigger: area,
				// pinned the moment the hero's bottom edge reaches the bottom of the screen
				start: "clamp(bottom bottom)",
				// 80% of a screen of scrolling while it holds
				end: function () {
					return "+=" + Math.round(window.innerHeight * .8);
				},
				pin: true,
				anticipatePin: 1,
				scrub: .5,
				invalidateOnRefresh: true
			}
		})
			.to(hill, { yPercent: 100 }, 0)
			.to(dashboard, { scale: 1.05, transformOrigin: "50% 0%" }, 0);
	});

	// the pin adds scroll length, so the triggers below it are measured again
	ScrollTrigger.refresh();
}


/*
	partner title — the left line comes in from the left, the right one from the right
*/
function sbPartnerTitle() {
	if (!document.querySelector(".sb-partner-1-title")) return;

	var lines = document.querySelectorAll(".sb-partner-1-title-line");
	var trigger = {
		trigger: ".sb-partner-1-title",
		start: "top 90%"
	};

	gsap.fromTo(lines[0], {
		clipPath: "inset(0% 100% 0% 0%)",
		xPercent: -25
	}, {
		clipPath: "inset(0% 0% 0% 0%)",
		xPercent: 0,
		duration: 1.5,
		ease: "power3.out",
		scrollTrigger: trigger
	});

	gsap.fromTo(lines[1], {
		clipPath: "inset(0% 0% 0% 100%)",
		xPercent: 25
	}, {
		clipPath: "inset(0% 0% 0% 0%)",
		xPercent: 0,
		duration: 1.5,
		ease: "power3.out",
		scrollTrigger: trigger
	});
}


/*
	partner-5 — the orange stroke of each title line keeps running along its path (MotionPath). Both leave
	the title: the left one runs to the left, turns the corner and climbs up to its dot, the right one runs
	to the right, turns and climbs up to its dot. The guide path is drawn from the real size of the line,
	so it is redrawn (and the run restarted) on resize
*/
function sbPartner5Line() {
	var title = document.querySelector(".sb-partner-5-title");
	if (!title) return;

	var runs = [];
	var visible = false;
	var timer;
	var tl;

	title.querySelectorAll(".sb-partner-5-title-line").forEach(function (line) {
		runs.push({
			line: line,
			left: line.classList.contains("sb-partner-5-title-line-left"),
			guide: line.querySelector(".sb-partner-5-title-guide"),
			accent: line.querySelector(".sb-partner-5-title-accent")
		});
	});

	// centre line of the 1px border, the same shape as the css (x / y start at the padding box of the line)
	function draw(run) {
		var w = run.line.offsetWidth;
		var h = run.line.offsetHeight;
		var cs = getComputedStyle(run.line);
		var r = parseFloat(run.left ? cs.borderBottomLeftRadius : cs.borderBottomRightRadius);
		var ox = run.line.clientLeft;
		var d;

		if (run.left) {
			// from the title (right end) to the left, round the corner, up to the dot
			d = "M" + (w - ox) + " " + (h - .5) + "H" + (r - ox) + "A" + (r - .5) + " " + (r - .5) + " 0 0 1 " + (.5 - ox) + " " + (h - r) + "V1";
		} else {
			// from the title along the line, round the corner, up to the dot
			d = "M" + (-ox) + " " + (h - .5) + "H" + (w - r - ox) + "A" + (r - .5) + " " + (r - .5) + " 0 0 0 " + (w - .5 - ox) + " " + (h - r) + "V1";
		}

		run.guide.setAttribute("d", d);
	}

	function build() {
		if (tl) tl.kill();

		runs.forEach(function (run) {
			gsap.killTweensOf(run.accent);
			gsap.set(run.accent, { clearProps: "all" });
			draw(run);
		});

		// still: the stroke rests where the design has it, 32px away from the free end of the line
		if (prefersReducedMotion()) {
			runs.forEach(function (run) {
				gsap.set(run.accent, {
					x: run.left ? run.line.offsetWidth - run.line.clientLeft - 84 : 32,
					y: run.line.offsetHeight - 2,
					opacity: 1
				});
			});
			return;
		}

		tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: !visible });

		runs.forEach(function (run) {
			tl.fromTo(run.accent, { opacity: 0 }, { opacity: 1, duration: .4, ease: "none" }, 0)
				.to(run.accent, {
					motionPath: {
						path: run.guide,
						align: run.guide,
						alignOrigin: [1, .5],
						autoRotate: true
					},
					duration: 3.2,
					ease: "none"
				}, 0)
				.to(run.accent, { opacity: 0, duration: .4, ease: "none" }, 2.8);
		});
	}

	build();

	// only runs while the title is on screen
	new IntersectionObserver(function (entries) {
		visible = entries[0].isIntersecting;
		if (tl) tl.paused(!visible);
	}).observe(title);

	window.addEventListener("resize", function () {
		clearTimeout(timer);
		timer = setTimeout(build, 200);
	});
}


/*
	features
*/

// card-1 — toolbar fills and gets a sheen, tabs run in, chat panel is scanned in top-down
function sbFeaturesCard1() {
	if (!document.querySelector(".sb-features-1-card-1-top")) return;

	var el = {
		bar: document.querySelector(".sb-features-1-card-1-tags .bar"),
		tags: document.querySelector(".sb-features-1-card-1-tags .tag-img"),
		panel: document.querySelector(".sb-features-1-card-1-img"),
		panelImg: document.querySelector(".sb-features-1-card-1-img img")
	};

	gsap.set(el.bar, { opacity: 0, scaleX: 0, transformOrigin: "0% 50%" });
	gsap.set(el.tags, { opacity: 0, x: -24, clipPath: "inset(0% 100% 0% 0%)" });
	gsap.set(el.panel, { opacity: 0, y: 36 });
	gsap.set(el.panelImg, { clipPath: "inset(0% 0% 100% 0%)" });

	gsap.timeline({
		scrollTrigger: {
			trigger: ".sb-features-1-card-1",
			start: "top 75%",
			once: true
		},
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set(Object.values(el), { clearProps: "all" });
		}
	})
		.to(el.bar, { opacity: 1, scaleX: 1, duration: .9 })
		.fromTo(el.bar, { "--sweep": "-100%" }, { "--sweep": "100%", duration: 1.1, ease: "power2.inOut" }, "-=.4")
		.to(el.tags, { opacity: 1, x: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 }, .25)
		.to(el.panel, { opacity: 1, y: 0, duration: .8 }, .5)
		.fromTo(el.panel, { "--scan-o": 1, "--scan": "0%" }, { "--scan": "100%", duration: 1.4, ease: "power2.inOut" }, .6)
		.to(el.panelImg, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.inOut" }, .6)
		.to(el.panel, { "--scan-o": 0, duration: .3 }, "-=.3");
}

// card-2 — bg slides down, badge-1 pops in, the arc draws out from the centre, badge-2 and 3 follow
function sbFeaturesCard2() {
	if (!document.querySelector(".sb-features-1-card-2-diagram")) return;

	var el = {
		bg: document.querySelector(".sb-features-1-card-2-bg"),
		badge1: document.querySelector(".sb-features-1-card-2-diagram .icon-badge-1"),
		line: document.querySelector(".sb-features-1-card-2-diagram .icon-line"),
		badges: document.querySelectorAll(".sb-features-1-card-2-diagram .icon-badge-2, .sb-features-1-card-2-diagram .icon-badge-3")
	};

	gsap.set(el.bg, { yPercent: -100, opacity: 0 });
	gsap.set([el.badge1, el.badges], { scale: 0, opacity: 0 });
	gsap.set(el.line, { "--a": "-10deg" });

	gsap.timeline({
		scrollTrigger: {
			trigger: ".sb-features-1-card-2",
			start: "top 75%",
			once: true
		},
		onComplete: function () {
			gsap.set([el.bg, el.badge1, el.line, el.badges], { clearProps: "all" });
		}
	})
		.to(el.bg, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power3.out" })
		.to(el.badge1, { scale: 1, opacity: 1, duration: .7, ease: "back.out(1.7)" }, "-=.3")
		.to(el.line, { "--a": "100deg", duration: 1.3, ease: "sine.inOut" }, "<")
		.to(el.badges, { scale: 1, opacity: 1, duration: .7, ease: "back.out(1.7)" }, "-=.15");
}

/*
	features-5 — every card tells its own little story when it reaches the lower part of the screen: its layers come in one after the other
	(card 1: the trigger card, then the two lines draw themselves and end on their dots, then the two side cards, the search pill last;
	card 2: the chart wipes in, the task badge pops; card 3: the logo, the three orbits and then their icons; card 4: the chat window, the
	messages one by one, the robot; card 5: the logo, the connectors, the role chips) and the title and the text close it.
	The timelines are built as soon as the page is ready (the from() tweens hide the layers right away), each one plays once
*/
function sbFeatures5Cards() {
	var cards = document.querySelectorAll(".sb-features-5-card");
	if (!cards.length || prefersReducedMotion()) return;

	// the layers of a card, by class
	function layer(card, sel) {
		return card.querySelectorAll(".sb-features-5-" + sel);
	}

	// a stroke that is drawn by its dash
	function dashed(paths) {
		var lens = [];

		Array.prototype.forEach.call(paths, function (path) {
			var len = 0;

			try {
				len = path.getTotalLength();
			} catch (e) {}

			lens.push(len);
			if (len) gsap.set(path, { strokeDasharray: len });
		});

		return lens;
	}

	var stories = {
		// visual workflow builder: trigger, then the lines, then the side cards
		1: function (card, tl) {
			var glows = card.querySelectorAll(".sb-features-5-glow-bottom, .sb-features-5-glow-top, .sb-features-5-c1-bg");
			var paths = card.querySelectorAll(".sb-features-5-c1-line path");
			var lens = dashed(paths);

			// the lines are only 8% bright on the design, while they are drawn they are brighter so the draw can be seen, then they settle
			gsap.set(paths, { opacity: .7 });

			tl.from(glows, { opacity: 0, duration: .9, ease: "power2.out" }, 0)
				.from(layer(card, "c1-trigger"), { opacity: 0, y: 50, scale: .92, duration: 1, ease: "power3.out" }, .25)
				.from(paths, {
					strokeDashoffset: function (i) {
						return lens[i];
					},
					duration: .9,
					ease: "power2.inOut"
				}, 1)
				.to(paths, {
					opacity: function (i, path) {
						return parseFloat(path.getAttribute("opacity")) || .08;
					},
					duration: .7,
					ease: "power2.out"
				}, 1.85)
				.from(card.querySelectorAll(".sb-features-5-c1-line rect"), { opacity: 0, duration: .5 }, 1.3)
				.from(card.querySelectorAll(".sb-features-5-c1-line circle"), {
					scale: 0,
					opacity: 0,
					transformOrigin: "50% 50%",
					duration: .5,
					ease: "back.out(2.4)"
				}, 1.7)
				.from(layer(card, "c1-mini"), { opacity: 0, y: 34, duration: .9, stagger: .15, ease: "power3.out" }, 1.8)
				.from(layer(card, "c1-search"), { opacity: 0, y: -18, scale: .95, duration: .9, ease: "power3.out" }, 2.15);

			return 2.35;
		},

		// real-time analytics: the chart wipes in from the left, the task badge pops in
		2: function (card, tl) {
			var graph = layer(card, "c2-graph-1");

			tl.from(card.querySelectorAll(".sb-features-5-glow-bottom, .sb-features-5-c2-bg"), { opacity: 0, duration: .9, ease: "power2.out" }, 0)
				.from(graph, { opacity: 0, y: 36, scale: .96, duration: 1.2, ease: "power3.out" }, .2)
				.fromTo(graph, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power2.inOut" }, .2)
				.from(layer(card, "c2-graph-2"), { opacity: 0, x: 46, y: 24, scale: .9, duration: 1, ease: "back.out(1.4)" }, 1.1);

			return 1.6;
		},

		// seamless integrations: the logo, the orbits from the inside out, then the icons and the dots that sit on them
		3: function (card, tl) {
			tl.from(card.querySelectorAll(".sb-features-5-glow-bottom, .sb-features-5-c3-bg"), { opacity: 0, duration: .9, ease: "power2.out" }, 0)
				.from(layer(card, "c3-logo"), { opacity: 0, scale: .4, transformOrigin: "50% 50%", duration: .9, ease: "back.out(1.7)" }, .2)
				.from(layer(card, "c3-orbit-1"), { opacity: 0, scale: .55, transformOrigin: "50% 50%", duration: 1, ease: "power3.out" }, .6)
				.from(layer(card, "c3-orbit-2"), { opacity: 0, scale: .55, transformOrigin: "50% 50%", duration: 1, ease: "power3.out" }, .85)
				.from(layer(card, "c3-arc"), { opacity: 0, duration: .9, ease: "power2.out" }, .9)
				.from(layer(card, "c3-orbit-3"), { opacity: 0, scale: .55, transformOrigin: "50% 50%", duration: 1.1, ease: "power3.out" }, 1.1)
				// only the opacity: the rings and the icons turn all the time with their own css animation
				.from(layer(card, "icon"), { opacity: 0, duration: .5, stagger: .07 }, 1.2)
				.from(layer(card, "c3-dot"), { opacity: 0, duration: .5, stagger: .03 }, 1.3);

			return 2;
		},

		// ai-powered agents: the window, the chat box on it, the three dots, the messages one by one, the robot
		4: function (card, tl) {
			tl.from(card.querySelectorAll(".sb-features-5-glow-bottom, .sb-features-5-c4-bg"), { opacity: 0, duration: .9, ease: "power2.out" }, 0)
				.from(layer(card, "c4-window"), { opacity: 0, y: 30, scale: .96, duration: 1, ease: "power3.out" }, .15)
				.from(layer(card, "c4-chat"), { opacity: 0, y: 22, scale: .96, duration: .9, ease: "power3.out" }, .55)
				.from(card.querySelectorAll(".sb-features-5-c4-dots i"), {
					scale: 0,
					opacity: 0,
					transformOrigin: "50% 50%",
					duration: .4,
					stagger: .1,
					ease: "back.out(2.4)"
				}, .9)
				.from(layer(card, "c4-feed"), { opacity: 0, duration: .6 }, 1)
				.from(layer(card, "c4-row"), { opacity: 0, x: -18, duration: .7, stagger: .16, ease: "power3.out" }, 1.05)
				.from(layer(card, "c4-robot"), { opacity: 0, x: 46, y: 24, scale: .88, duration: 1, ease: "back.out(1.5)" }, 1.6);

			return 2;
		},

		// work together: the logo, the connectors grow outwards, the role chips and the two dots
		5: function (card, tl) {
			var left = card.querySelectorAll(".sb-features-5-c5-line-l1, .sb-features-5-c5-line-l2, .sb-features-5-c5-line-l3");
			var right = card.querySelectorAll(".sb-features-5-c5-line-r1, .sb-features-5-c5-line-r2, .sb-features-5-c5-line-r3");
			// the chips come in pairs, one of each side, top to bottom
			var chips = ["l1", "r1", "l2", "r2", "l3", "r3"].map(function (key) {
				return card.querySelector(".sb-features-5-chip-" + key);
			});

			tl.from(card.querySelectorAll(".sb-features-5-glow-bottom, .sb-features-5-c5-light, .sb-features-5-c5-bg"), { opacity: 0, duration: 1, ease: "power2.out" }, 0)
				.from(layer(card, "c5-logo"), { opacity: 0, scale: .5, transformOrigin: "50% 50%", duration: .9, ease: "back.out(1.6)" }, .2)
				.fromTo(left, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .8, stagger: .12, ease: "power2.inOut" }, .75)
				.fromTo(right, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .8, stagger: .12, ease: "power2.inOut" }, .75)
				.from(chips, { opacity: 0, filter: "blur(6px)", duration: .7, stagger: .09, ease: "power2.out" }, 1.2)
				.from(layer(card, "c5-dot"), { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: .5, stagger: .1, ease: "back.out(2.4)" }, 1.6);

			return 2;
		}
	};

	Array.prototype.forEach.call(cards, function (card) {
		var key = (card.className.match(/sb-features-5-card-(\d)/) || [])[1];
		if (!stories[key]) return;

		var tl = gsap.timeline({
			paused: true,
			onComplete: function () {
				// everything is back on its css, the rings and the chat go on turning with their own animation
				var targets = [];

				tl.getChildren().forEach(function (tween) {
					targets = targets.concat(tween.targets());
				});

				gsap.set(targets, { clearProps: "all" });
			}
		});

		var end = stories[key](card, tl);

		// the title and the text close the story
		tl.from(card.querySelectorAll(".sb-features-5-card-title, .sb-features-5-card-disc"), {
			opacity: 0,
			y: 22,
			duration: .8,
			stagger: .12,
			ease: "power3.out"
		}, end);

		ScrollTrigger.create({
			trigger: card,
			start: "top 80%",
			once: true,
			onEnter: function () {
				tl.play();
			}
		});
	});
}

/*
	core-features-5 — the four steps tell their story when each one reaches the lower part of the screen. The white panel slides in from its
	own side and its number, title and text follow; the picture builds up layer by layer (step 1: the box, the message, the star, the arrow;
	step 2: the logo, then the five lines grow outwards and every app pops in at its end; step 3: the sheet, its title and flow, the button,
	the rocket; step 4: the five circles from the inside out, then the charts). Timelines are built at once (from() hides the layers), play once
*/
function sbCoreFeatures5Cards() {
	var cards = document.querySelectorAll(".sb-core-features-5-card");
	if (!cards.length || prefersReducedMotion()) return;

	// from md down a step is a column, so the panel comes from below instead of from the side
	var column = window.matchMedia("(max-width: 991px)").matches;

	function layer(card, sel) {
		return card.querySelectorAll(".sb-core-features-5-" + sel);
	}

	function one(card, sel) {
		return card.querySelector(".sb-core-features-5-" + sel);
	}

	// the panel: it slides in from its side (steps 1 and 3 have it on the right, 2 and 4 on the left), then number, title and text
	function panel(card, tl, side) {
		tl.from(one(card, "panel"), column ? { opacity: 0, y: 44, duration: 1, ease: "power3.out" } : { opacity: 0, x: side * 60, duration: 1, ease: "power3.out" }, .1)
			.from(one(card, "panel-dot"), { opacity: 0, duration: 1 }, .3)
			.from(one(card, "num"), { opacity: 0, scale: .4, rotate: -20, duration: .7, ease: "back.out(1.8)" }, .5)
			.from(card.querySelectorAll(".sb-core-features-5-panel-title, .sb-core-features-5-panel-disc"), {
				opacity: 0,
				y: 24,
				duration: .8,
				stagger: .12,
				ease: "power3.out"
			}, .65);
	}

	var stories = {
		// choose a workflow
		1: function (card, tl) {
			panel(card, tl, 1);

			tl.from(one(card, "glow"), { opacity: 0, duration: 1, ease: "power2.out" }, 0)
				.from(one(card, "box"), { opacity: 0, y: 50, scale: .92, duration: 1, ease: "power3.out" }, .25)
				.from(one(card, "sms"), { opacity: 0, x: 24, y: -24, scale: .85, duration: .9, ease: "back.out(1.6)" }, .85)
				.from(one(card, "star"), { opacity: 0, scale: .3, rotate: -30, duration: .8, ease: "back.out(1.8)" }, 1.15)
				.from(one(card, "arrow"), { opacity: 0, x: -30, duration: .7, ease: "power3.out" }, 1.45);
		},

		// build your automation: the logo, the lines grow outwards from it, every app pops in at the end of its line
		2: function (card, tl) {
			panel(card, tl, -1);

			// every line is revealed from the logo outwards: 1 and 5 run to the left, 2 and 3 to the right, 4 downwards
			var wipe = {
				1: "inset(0% 0% 0% 100%)",
				2: "inset(0% 100% 0% 0%)",
				3: "inset(0% 100% 0% 0%)",
				4: "inset(0% 0% 100% 0%)",
				5: "inset(0% 0% 0% 100%)"
			};

			tl.from(one(card, "logo"), { opacity: 0, scale: .5, duration: .9, ease: "back.out(1.6)" }, .2);

			[1, 2, 3, 4, 5].forEach(function (n, i) {
				var at = .75 + i * .2;

				tl.fromTo(one(card, "wire-" + n), { clipPath: wipe[n] }, { clipPath: "inset(0% 0% 0% 0%)", duration: .7, ease: "power2.inOut" }, at)
					.from(one(card, "icon-" + n), { opacity: 0, scale: .3, duration: .6, ease: "back.out(2)" }, at + .45)
					.from(one(card, "node-" + n), { opacity: 0, scale: 0, duration: .4, ease: "back.out(2.4)" }, at + .55)
					.from(one(card, "spark-" + n), { opacity: 0, duration: .5 }, at + .7);
			});
		},

		// launch and automate: the sheet, the title and the flow under it, the button, then the rocket takes off
		3: function (card, tl) {
			panel(card, tl, 1);

			tl.from(one(card, "glow"), { opacity: 0, duration: 1, ease: "power2.out" }, 0)
				.from(one(card, "sheet"), { opacity: 0, y: 40, scale: .95, duration: 1, ease: "power3.out" }, .2)
				.from(one(card, "ready"), { opacity: 0, y: 16, duration: .7, ease: "power3.out" }, .65)
				.fromTo(one(card, "curve"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .8, ease: "power2.inOut" }, .8)
				// trigger, the arrow, the ai agent, the arrow, the action
				.from(card.querySelectorAll(".sb-core-features-5-steps > *"), { opacity: 0, y: 16, duration: .6, stagger: .14, ease: "power3.out" }, 1.05)
				.from(one(card, "launch"), { opacity: 0, y: 20, scale: .9, duration: .8, ease: "back.out(1.5)" }, 1.85)
				.from(one(card, "rocket"), { opacity: 0, x: -60, y: 70, rotate: -10, scale: .8, duration: 1.1, ease: "power3.out" }, 2.1);
		},

		// charts: the circles open from the inside out, then the line chart, the bars and the big chart
		4: function (card, tl) {
			panel(card, tl, -1);

			var rings = [5, 4, 3, 2, 1].map(function (n) {
				return one(card, "ring-" + n);
			});

			tl.from(rings, { opacity: 0, scale: .5, duration: .9, stagger: .12, ease: "power3.out" }, .15)
				.fromTo(one(card, "graph-2"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power2.inOut" }, .8)
				.from(one(card, "graph-2"), { opacity: 0, duration: .6 }, .8)
				// the bars grow up from their base
				.fromTo(one(card, "bars"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.out" }, 1.4)
				.from(one(card, "graph-1"), { opacity: 0, x: 40, scale: .92, duration: 1, ease: "power3.out" }, 1.8);
		}
	};

	Array.prototype.forEach.call(cards, function (card) {
		var key = (card.className.match(/sb-core-features-5-card-(\d)/) || [])[1];
		if (!stories[key]) return;

		var tl = gsap.timeline({
			paused: true,
			onComplete: function () {
				// everything is back on its css
				var targets = [];

				tl.getChildren().forEach(function (tween) {
					targets = targets.concat(tween.targets());
				});

				gsap.set(targets, { clearProps: "all" });
			}
		});

		stories[key](card, tl);

		ScrollTrigger.create({
			trigger: card,
			start: "top 75%",
			once: true,
			onEnter: function () {
				tl.play();
			}
		});
	});
}

// card-5 — the active menu item jumps to a random other item every 2s while on screen
function sbFeaturesMenu() {
	var menu = document.querySelector(".sb-features-1-card-5-menu");
	if (!menu) return;

	var items = menu.querySelectorAll("li");
	var visible = false;

	new IntersectionObserver(function (entries) {
		visible = entries[0].isIntersecting;
	}).observe(menu);

	setInterval(function () {
		if (!visible) return;

		var current = Math.max(Array.prototype.findIndex.call(items, function (li) {
			return li.classList.contains("active");
		}), 0);
		var next = (current + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;

		items[current].classList.remove("active");
		items[next].classList.add("active");
	}, 2000);
}


/*
	features-2 panels — every panel builds up its own elements when it scrolls into view;
	the css values (tilt, resting opacity) are the end state, so these are all "from" tweens
*/
function sbFeatures2Panels() {
	if (prefersReducedMotion()) return;

	document.querySelectorAll(".sb-features-2-panel").forEach(function (panel) {
		var card = panel.parentNode.classList;
		var targets = [];
		var wipe = "inset(0% 100% 0% 0%)";

		var tl = gsap.timeline({
			defaults: { duration: 1, ease: "power3.out" },
			scrollTrigger: {
				trigger: panel,
				start: "top 85%",
				once: true
			},
			onComplete: function () {
				gsap.set(targets, { clearProps: "opacity,transform,clipPath" });
			}
		});

		// collects what is animated so it can be cleaned up in one go
		function from(sel, vars, pos) {
			var els = panel.querySelectorAll(sel);
			if (!els.length) return;
			targets = targets.concat(Array.prototype.slice.call(els));
			tl.from(els, vars, pos);
		}

		if (card.contains("sb-features-2-card-1")) {
			from(".sb-features-2-card-1-list", { y: 40, opacity: 0 }, 0);
			from(".sb-features-2-card-1-chart", { clipPath: wipe, opacity: 0, duration: 1.6, ease: "power2.inOut" }, .3);
		}

		if (card.contains("sb-features-2-card-2")) {
			from(".bg-line", { y: -30, opacity: 0, duration: 1.4 }, 0);
			from(".bg-noise", { opacity: 0, duration: 1.4 }, 0);
			from(".card-img", { y: 60, scale: .85, rotate: -22, opacity: 0, duration: 1.2 }, .2);
			from(".arrow", { scale: .4, opacity: 0, duration: .7, stagger: .12 }, .7);
			from(".icon", { scale: 0, opacity: 0, duration: .8, ease: "back.out(1.7)", stagger: .1 }, .5);
		}

		if (card.contains("sb-features-2-card-3")) {
			from(".bg-shape", { opacity: 0, duration: 1.3 }, 0);
			from(".phone", { y: 60, opacity: 0, duration: 1.3, ease: "power4.out" }, .1);
			from(".img-1", { x: -50, opacity: 0, duration: 1.1 }, .5);
			from(".img-2", { x: 50, y: -20, opacity: 0, duration: 1.1 }, .65);
			from(".line", { clipPath: wipe, opacity: 0, duration: 1.2, ease: "power2.inOut" }, .9);
		}

		if (card.contains("sb-features-2-card-4")) {
			from(".bg-shape", { opacity: 0, duration: 1.3 }, 0);
			from(".img-1, .img-2, .img-3", { y: 50, opacity: 0, duration: 1.1, stagger: .15 }, .2);
			from(".flag", { scale: 0, opacity: 0, duration: .8, ease: "back.out(1.7)", stagger: .12 }, .7);
			from(".flag-line", { clipPath: wipe, opacity: 0, duration: 1.2, ease: "power2.inOut" }, .9);
		}
	});
}


/*
	features-3 — every card rises when it scrolls into view and builds up its own pieces;
	the css values are the end state, so these are all "from" tweens. The 372px boards of
	card 1 and 3 keep their own centering and scale, so only their children move.
*/
function sbFeatures3() {
	if (prefersReducedMotion()) return;

	var wipeTop = "inset(0% 0% 100% 0%)";
	var wide = window.innerWidth >= 1200;

	document.querySelectorAll(".sb-features-3-card").forEach(function (card) {
		var cls = card.classList;
		var index = Array.prototype.indexOf.call(card.parentNode.children, card);
		var targets = [card];
		var paths = [];

		var tl = gsap.timeline({
			// the cards of a row come one after the other
			delay: wide ? index * .1 : 0,
			defaults: { duration: 1, ease: "power3.out" },
			scrollTrigger: {
				trigger: card,
				start: "top 85%",
				once: true
			},
			onComplete: function () {
				gsap.set(targets, { clearProps: "opacity,transform,clipPath" });
				gsap.set(paths, { clearProps: "strokeDasharray,strokeDashoffset" });
			}
		});

		// collects what is animated so it can be cleaned up in one go
		function from(sel, vars, pos) {
			var els = card.querySelectorAll(sel);
			if (!els.length) return;
			targets = targets.concat(Array.prototype.slice.call(els));
			tl.from(els, vars, pos);
		}

		tl.from(card, { y: 60, opacity: 0, duration: 1.1 }, 0);
		from(".sb-features-3-glow", { opacity: 0, duration: 1.4, stagger: .1 }, .2);

		// card 1 — the bot pops, the arc opens from its centre, the chips follow (the boxes loop on their own in css)
		if (cls.contains("sb-features-3-card-1")) {
			from(".sb-features-3-dots", { opacity: 0, duration: 1.4 }, .2);
			from(".sb-features-3-bot", { scale: 0, opacity: 0, duration: .8, ease: "back.out(1.7)" }, .8);
			from(".sb-features-3-arc", { clipPath: "inset(0% 50% 0% 50%)", opacity: 0, duration: 1.1, ease: "power2.inOut" }, 1);
			from(".sb-features-3-chip", { scale: 0, opacity: 0, duration: .7, ease: "back.out(1.7)", stagger: .15 }, 1.5);
		}

		// card 2 — the dashboard rises and is scanned in top-down
		if (cls.contains("sb-features-3-card-2")) {
			from(".sb-features-3-chart", { y: 40, opacity: 0, duration: 1.2 }, .45);
			from(".sb-features-3-chart img", { clipPath: wipeTop, duration: 1.6, ease: "power2.inOut" }, .55);
		}

		// card 3 — the meter rises, the connector lines draw, the pills and dots pop on their ends
		if (cls.contains("sb-features-3-card-3")) {
			from(".sb-features-3-meter", { y: 50, opacity: 0, duration: 1.2, ease: "power4.out" }, .35);

			card.querySelectorAll(".sb-features-3-lines path").forEach(function (path, i) {
				var len = path.getTotalLength();

				paths.push(path);
				gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
				tl.to(path, { strokeDashoffset: 0, duration: .9, ease: "power2.inOut" }, .9 + i * .08);
			});

			from(".sb-features-3-pill", { scale: .5, y: 14, opacity: 0, duration: .8, ease: "back.out(1.7)", stagger: .15 }, 1.2);
			from(".sb-features-3-dot", { scale: 0, opacity: 0, duration: .6, ease: "back.out(2)", stagger: .15 }, 1.4);
		}

		// card 4 - 7 — the glow and rings come up first, then the icon pops and the text follows
		if (cls.contains("sb-features-3-card-sm")) {
			from(".sb-features-3-blob", { opacity: 0, duration: 1.4, stagger: .15 }, .2);
			from(".sb-features-3-ring", { scale: .3, opacity: 0, duration: 1.3 }, .3);
			from(".sb-features-3-icon", { scale: 0, rotate: -45, opacity: 0, duration: .9, ease: "back.out(1.7)" }, .5);
		}

		from(".sb-features-3-card-content", { y: 24, opacity: 0, duration: .9 }, cls.contains("sb-features-3-card-sm") ? .75 : .4);
	});
}


/*
	integration-3 — the board has 26 slots (18 tiles + 8 ghosts). Every 1.4s a random tile fades out of
	its slot and then fades in on a random free slot (a ghost or a slot another tile has left); the
	fade is the css transition on the tile, only while the board is on screen
*/
function sbIntegration3Swap() {
	var board = document.querySelector(".sb-integration-3-board");
	if (!board || prefersReducedMotion()) return;

	var visible = false;
	var slots = [];

	var pick = function (list) {
		return list[Math.floor(Math.random() * list.length)];
	};

	// the css gives every tile and ghost its place through --x / --y
	var addSlot = function (el, item) {
		var style = getComputedStyle(el);

		slots.push({
			x: style.getPropertyValue("--x").trim(),
			y: style.getPropertyValue("--y").trim(),
			item: item
		});
	};

	board.querySelectorAll(".sb-integration-3-item").forEach(function (item) {
		addSlot(item, item);
	});
	board.querySelectorAll(".sb-integration-3-ghost").forEach(function (ghost) {
		addSlot(ghost, null);
	});

	new IntersectionObserver(function (entries) {
		visible = entries[0].isIntersecting;
	}).observe(board);

	setInterval(function () {
		if (!visible) return;

		var from = pick(slots.filter(function (slot) { return slot.item; }));
		var item = from.item;

		from.item = null;
		item.classList.add("is-hidden");

		// once it has faded out it moves to a free slot and fades in there
		setTimeout(function () {
			var to = pick(slots.filter(function (slot) { return !slot.item && slot !== from; }));

			// moved while hidden, without the slide of the tile's own transition
			item.style.transition = "none";
			item.style.left = to.x;
			item.style.top = to.y;
			void item.offsetWidth;
			item.style.transition = "";

			item.classList.remove("is-hidden");
			to.item = item;
		}, 450);
	}, 1400);
}


/*
	testimonial-3 author — the photo card is wiped in bottom-up while the picture settles from a zoom,
	then the avatars and the stars pop and the score and text rise; the css is the end state
*/
function sbTestimonial3Author() {
	var author = document.querySelector(".sb-testimonial-3-author");
	if (!author || prefersReducedMotion()) return;

	var q = function (sel) { return author.querySelectorAll(sel); };
	var targets = [author].concat(Array.prototype.slice.call(q(".sb-testimonial-3-author-img, .avatars img, .stars svg, .score, .text")));

	gsap.timeline({
		defaults: { duration: 1, ease: "power3.out" },
		scrollTrigger: {
			trigger: author,
			start: "top 85%",
			once: true
		},
		onComplete: function () {
			gsap.set(targets, { clearProps: "opacity,transform,clipPath" });
		}
	})
		.from(author, { clipPath: "inset(100% 0% 0% 0% round 16px)", duration: 1.3, ease: "power3.inOut" }, 0)
		.from(q(".sb-testimonial-3-author-img"), { scale: 1.25, duration: 1.8 }, 0)
		.from(q(".avatars img"), { scale: 0, x: -14, opacity: 0, duration: .7, ease: "back.out(1.7)", stagger: .12 }, .8)
		.from(q(".stars svg"), { scale: 0, rotate: -90, opacity: 0, duration: .6, ease: "back.out(2)", stagger: .08 }, 1)
		.from(q(".score"), { y: 16, opacity: 0, duration: .8 }, 1.2)
		.from(q(".text"), { y: 16, opacity: 0, duration: .8 }, 1.35);
}


/*
	footer-3 social — the three cards float up one after another (they keep the tilt from the css),
	then the support tile spins in; the cards have a css transition for the hover, which is switched
	off while gsap moves them
*/
function sbFooter3Social() {
	var social = document.querySelector(".sb-footer-3-social");
	if (!social || prefersReducedMotion()) return;

	var cards = social.querySelectorAll(".single-logo");
	var support = social.querySelectorAll(".support");
	var targets = Array.prototype.slice.call(cards).concat(Array.prototype.slice.call(support));

	gsap.set(cards, { transition: "none" });

	gsap.timeline({
		defaults: { duration: 1, ease: "power3.out" },
		scrollTrigger: {
			trigger: social,
			start: "top 90%",
			once: true
		},
		onComplete: function () {
			gsap.set(targets, { clearProps: "transition,opacity,transform" });
		}
	})
		.from(cards, { y: 40, x: 24, scale: .7, opacity: 0, duration: .9, ease: "back.out(1.7)", stagger: .15 }, 0)
		.from(support, { scale: 0, rotate: -60, opacity: 0, duration: .9, ease: "back.out(1.7)" }, .55);
}


/*
	footer-3 big title — the white word rises out of the hills: wiped in bottom-up while it slides up and fades in
*/
function sbFooter3BigTitle() {
	var title = document.querySelector(".sb-footer-3-big-title");
	if (!title || prefersReducedMotion()) return;

	gsap.from(title, {
		y: 100,
		opacity: 0,
		clipPath: "inset(100% 0% 0% 0%)",
		duration: 1.8,
		ease: "power3.out",
		scrollTrigger: {
			trigger: title,
			start: "top 95%",
			once: true
		},
		onComplete: function () {
			gsap.set(title, { clearProps: "opacity,transform,clipPath" });
		}
	});
}


/*
	footer-5 logo — the big word rises into place: wiped in bottom-up while it slides up and fades in
*/
function sbFooter5Logo() {
	var logo = document.querySelector(".sb-footer-5-brand .logo");
	if (!logo || prefersReducedMotion()) return;

	gsap.from(logo, {
		y: 60,
		opacity: 0,
		clipPath: "inset(100% 0% 0% 0%)",
		duration: 1.6,
		ease: "power3.out",
		scrollTrigger: {
			trigger: logo,
			start: "top 95%",
			once: true
		},
		onComplete: function () {
			gsap.set(logo, { clearProps: "opacity,transform,clipPath" });
		}
	});
}


/*
	cta-2 — the card fades up, its side shapes slide in, the text and store badges follow
	and the phone stands up last; the title has its own word cascade (wa_title_ani_2)
*/
function sbCta2Intro() {
	var wrap = document.querySelector(".sb-cta-2-wrap");
	if (!wrap || prefersReducedMotion()) return;

	var q = function (sel) { return wrap.querySelectorAll(sel); };
	var targets = Array.prototype.slice.call(q(".sb-cta-2-bg, .shape, .sb-cta-2-disc, .sb-cta-2-apps a, .sb-cta-2-phone"));

	var tl = gsap.timeline({
		defaults: { duration: 1, ease: "power3.out" },
		scrollTrigger: {
			trigger: wrap,
			start: "top 80%",
			once: true
		},
		onComplete: function () {
			gsap.set(targets, { clearProps: "opacity,transform,filter" });
		}
	});

	tl
		.from(q(".sb-cta-2-bg"), { opacity: 0, scale: .96, duration: 1.2 }, 0)
		.from(q(".shape-1"), { x: -80, opacity: 0, duration: 1.3 }, .2)
		.from(q(".shape-2"), { x: 80, opacity: 0, duration: 1.3 }, .2)
		.from(q(".sb-cta-2-disc"), { y: 28, opacity: 0, filter: "blur(6px)" }, .6)
		.from(q(".sb-cta-2-apps a"), { y: 24, opacity: 0, scale: .9, duration: .8, stagger: .15 }, .8)
		.from(q(".sb-cta-2-phone"), { y: 120, opacity: 0, duration: 1.4, ease: "power4.out" }, .5);
}


/*
	faqs-2 card — the photo is revealed top to bottom, then the blue help box rises over it
	and its title, text and button follow one by one
*/
function sbFaqs2Card() {
	var card = document.querySelector(".sb-faqs-2-card");
	if (!card || prefersReducedMotion()) return;

	var q = function (sel) { return card.querySelectorAll(sel); };
	var targets = Array.prototype.slice.call(q(".img, .sb-faqs-2-help, .title, .disc, .chat"));

	gsap.timeline({
		defaults: { duration: 1, ease: "power3.out" },
		scrollTrigger: {
			trigger: card,
			start: "top 85%",
			once: true
		},
		onComplete: function () {
			gsap.set(targets, { clearProps: "opacity,transform,clipPath" });
		}
	})
		.from(q(".img"), { clipPath: "inset(0% 0% 100% 0% round 20px)", duration: 1.3, ease: "power3.inOut" }, 0)
		.from(q(".sb-faqs-2-help"), { y: 50, opacity: 0, duration: 1.1 }, .7)
		.from(q(".title, .disc, .chat"), { y: 20, opacity: 0, duration: .8, stagger: .12 }, 1);
}


/*
	faqs-4 card — the card rises in, its blue backdrop settles, the robot pops up with its shadow
	spreading under it, then the title, the text and the button follow one by one
*/
function sbFaqs4Card() {
	var card = document.querySelector(".sb-faqs-4-card");
	if (!card || prefersReducedMotion()) return;

	var q = function (sel) { return card.querySelectorAll(sel); };
	var btn = card.querySelector(".sb-signup-btn-4");
	var targets = [card].concat(Array.prototype.slice.call(q(".card-bg, .robot-shadow, .robot, .title, .disc")), btn || []);

	// the button carries an "all" transition for its hover, it would lag behind the tween
	if (btn) btn.style.transition = "none";

	gsap.timeline({
		defaults: { duration: 1, ease: "power3.out" },
		scrollTrigger: {
			trigger: card,
			start: "top 85%",
			once: true
		},
		onComplete: function () {
			if (btn) btn.style.transition = "";
			gsap.set(targets, { clearProps: "opacity,transform" });
		}
	})
		.from(card, { y: 70, opacity: 0, duration: 1.2 }, 0)
		.from(q(".card-bg"), { opacity: 0, scale: 1.15, duration: 1.6, ease: "power2.out" }, .15)
		.from(q(".robot"), { y: 90, scale: .7, rotate: -6, opacity: 0, duration: 1.4, ease: "back.out(1.4)" }, .45)
		.from(q(".robot-shadow"), { opacity: 0, scaleX: .3, duration: 1.2, ease: "power2.out" }, .8)
		.from(q(".title, .disc"), { y: 24, opacity: 0, duration: .8, stagger: .12 }, 1)
		.from(btn, { y: 24, opacity: 0, duration: .8 }, 1.25);
}


/*
	footer-2 — the title cascades word by word (the two gradient phrases rise as one piece each,
	splitting them would break their gradient), the logo is wiped in from the left
*/
function sbFooter2Intro() {
	if (prefersReducedMotion()) return;

	var title = document.querySelector(".sb-footer-2-title");
	var logo = document.querySelector(".sb-footer-2-info .logo img");

	if (title) {
		var words = sbHeroWords(title);

		var grads = Array.prototype.slice.call(title.querySelectorAll(".grad-1, .grad-2"));
		grads.forEach(function (el) {
			var mask = document.createElement("span");
			mask.className = "sb-split-mask";
			el.parentNode.insertBefore(mask, el);
			mask.appendChild(el);
		});

		// plain words and gradient phrases in reading order
		var units = Array.prototype.slice.call(title.querySelectorAll(".sb-split-word, .grad-1, .grad-2"));

		gsap.set(units, { yPercent: 115, rotate: 6, opacity: 0, filter: "blur(10px)", transformOrigin: "0% 100%" });
		gsap.set(words, { color: "#8b72ff" });

		gsap.timeline({
			scrollTrigger: {
				trigger: title,
				start: "top 86%",
				once: true
			},
			onComplete: function () {
				gsap.set(units, { clearProps: "all" });
			}
		})
			.to(units, {
				yPercent: 0,
				rotate: 0,
				opacity: 1,
				filter: "blur(0px)",
				duration: 1.1,
				ease: "power4.out",
				stagger: .1
			}, 0)
			.to(words, { color: "#fff", duration: 1.1, ease: "power4.out", stagger: .1 }, 0);
	}

	if (logo) {
		gsap.from(logo, {
			clipPath: "inset(0% 100% 0% 0%)",
			x: -60,
			opacity: 0,
			duration: 1.6,
			ease: "power3.inOut",
			scrollTrigger: {
				trigger: ".sb-footer-2-info",
				start: "top 90%",
				once: true
			},
			onComplete: function () {
				gsap.set(logo, { clearProps: "opacity,transform,clipPath" });
			}
		});
	}
}


/*
	about-2 — the photo drifts slower than the page (parallax) while the section passes the screen
*/
function sbAbout2Parallax() {
	var img = document.querySelector(".sb-about-2-bg img");
	if (!img || prefersReducedMotion()) return;

	gsap.fromTo(img, { yPercent: -6 }, {
		yPercent: 6,
		ease: "none",
		scrollTrigger: {
			trigger: ".sb-about-2-area",
			start: "top bottom",
			end: "bottom top",
			scrub: true
		}
	});
}


/*
	services — the bg image lights up once half of the section is on screen
*/
function sbServicesBg() {
	var area = document.querySelector(".sb-services-1-area");
	var bg = document.querySelector(".sb-services-1-bg");
	if (!area || !bg) return;

	gsap.set(bg, { opacity: 0, scale: 1.08, filter: "brightness(.2) blur(12px)" });

	gsap.to(bg, {
		opacity: 1,
		scale: 1,
		filter: "brightness(1) blur(0px)",
		duration: 1,
		ease: "power2.out",
		scrollTrigger: {
			trigger: area,
			// half of the section, capped at 80% of the viewport
			start: function () {
				return "top bottom-=" + Math.min(area.offsetHeight * .5, window.innerHeight * .8) + "px";
			},
			once: true,
			invalidateOnRefresh: true
		},
		onComplete: function () {
			gsap.set(bg, { clearProps: "all" });
		}
	});
}


/*
	testimonial — the glow line (::before) spreads out from the centre to both sides
*/
function sbTestimonialGlow() {
	var area = document.querySelector(".sb-testimonial-1-area");
	if (!area) return;

	gsap.set(area, { "--glow-x": 0 });

	gsap.to(area, {
		"--glow-x": 1,
		duration: 1.8,
		ease: "power2.out",
		scrollTrigger: {
			trigger: area,
			// the line sits on the bottom edge, so wait until it is well inside the viewport
			start: "bottom bottom-=150",
			once: true
		},
		onComplete: function () {
			gsap.set(area, { clearProps: "all" });
		}
	});
}


/*
	cta — the robot rolls in from the right in servo steps, then the spot light flickers on
*/
function sbCtaIntro() {
	var robot = document.querySelector(".sb-cta-1-robot");
	var light = document.querySelector(".sb-cta-1-light");
	if (!robot || !light) return;

	gsap.set(robot, { xPercent: 320, opacity: 0 });
	gsap.set(light, { opacity: 0 });

	var tl = gsap.timeline({
		scrollTrigger: {
			trigger: ".sb-cta-1-wrap",
			start: "top 95%",
			once: true
		},
		onComplete: function () {
			gsap.set([robot, light], { clearProps: "all" });
		}
	});

	tl.to(robot, { opacity: 1, duration: .15 });

	// quick slides with a hold and a small head tick at each stop, then a servo correction
	[
		{ x: 235, hold: .22 },
		{ x: 150, hold: .3 },
		{ x: 70, hold: .18 },
		{ x: 14, hold: .25 },
		{ x: -5, hold: .12 },
		{ x: 0, hold: 0 }
	].forEach(function (move) {
		tl
			.to(robot, { xPercent: move.x, duration: .2, ease: "power2.inOut" })
			.to(robot, { rotation: 1.6, duration: .05, ease: "none" })
			.to(robot, { rotation: 0, duration: .05, ease: "none" }, "+=" + move.hold);
	});

	tl
		.to(light, { opacity: .7, duration: .08 }, "+=.15")
		.to(light, { opacity: .1, duration: .1 })
		.to(light, { opacity: .85, duration: .08 })
		.to(light, { opacity: .25, duration: .12 })
		.to(light, { opacity: 1, duration: .9, ease: "power2.out" });
}


/*
	step-1 — falling dots in the background and the two dashes travelling along the connector paths
*/
function sbStepAnimations() {
	$(".sb-step-1-bg-dot circle").each(function () {
		var cy = parseFloat(this.getAttribute("cy"));
		var dur = gsap.utils.random(4, 8);
		var tl = gsap.timeline({ repeat: -1 });

		tl
			.set(this, { y: -cy, opacity: 0 })
			.to(this, { y: 163 - cy, duration: dur, ease: "none" }, 0)
			.to(this, { opacity: 1, duration: dur * 0.2 }, 0)
			.to(this, { opacity: 0, duration: dur * 0.8, ease: "none" }, dur * 0.2);

		// start mid-fall so the field is already populated on load
		tl.progress(Math.random());
	});

	$(".sb-step-1-line svg").each(function () {
		var $paths = $(this).find("path:not(.sb-step-1-line-dot)");
		var $dots = $(this).find(".sb-step-1-line-dot");

		$dots.each(function (index) {
			gsap.timeline({ repeat: -1, delay: index * 0.6 })
				.fromTo(this, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
				.to(this, {
					motionPath: {
						path: $paths[index],
						align: $paths[index],
						alignOrigin: [0.5, 0.5],
						autoRotate: true,
						start: 1,
						end: 0,
					},
					duration: 3.2,
					ease: "none",
				}, 0)
				.to(this, { opacity: 0, duration: 0.4 }, 2.8);
		});
	});
}


/*
	price-1 toggle — swaps every card between the monthly and the annual rate
*/
function sbPriceToggle() {
	$("#sb-price-1-toggle").on("change", function () {
		var yearly = $(this).is(":checked");

		$(".sb-price-1-toggle").toggleClass("is-yearly", yearly);
		$(".sb-price-1-toggle-label.monthly").toggleClass("active", !yearly);
		$(".sb-price-1-toggle-label.yearly").toggleClass("active", yearly);

		$(".sb-price-1-card .price").each(function () {
			var $amount = $(this).find(".amount");

			$amount.text($amount.data(yearly ? "yearly" : "monthly"));
			$(this).find(".duration").text(yearly ? "/per yearly" : "/per monthly");
		});
	});

	// the labels flip the switch as well
	$(".sb-price-1-toggle-label").on("click", function () {
		$("#sb-price-1-toggle").prop("checked", $(this).hasClass("yearly")).trigger("change");
	});
}


/*
	price-5 toggle — swaps the two plans between the monthly and the annual rate
*/
function sbPrice5Toggle() {
	$("#sb-price-5-toggle").on("change", function () {
		var yearly = $(this).is(":checked");

		$(".sb-price-5-toggle-label.monthly").toggleClass("active", !yearly);
		$(".sb-price-5-toggle-label.yearly").toggleClass("active", yearly);

		$(".sb-price-5-price").each(function () {
			var $amount = $(this).find(".amount");

			$amount.text($amount.data(yearly ? "yearly" : "monthly"));
			$(this).find(".duration").text(yearly ? "/yearly" : "/monthly");
		});
	});

	// the labels flip the switch as well
	$(".sb-price-5-toggle-label").on("click", function () {
		$("#sb-price-5-toggle").prop("checked", $(this).hasClass("yearly")).trigger("change");
	});
}


/*
	price-3 toggle — swaps every card between the monthly and the annual rate
*/
function sbPrice3Toggle() {
	$("#sb-price-3-toggle").on("change", function () {
		var yearly = $(this).is(":checked");

		$(".sb-price-3-toggle-label.monthly").toggleClass("active", !yearly);
		$(".sb-price-3-toggle-label.yearly").toggleClass("active", yearly);

		$(".sb-price-3-card-price").each(function () {
			var $amount = $(this).find(".amount");

			$amount.text($amount.data(yearly ? "yearly" : "monthly"));
			$(this).find(".duration").text(yearly ? "/per year" : "/per months");
		});
	});

	// the labels flip the switch as well
	$(".sb-price-3-toggle-label").on("click", function () {
		$("#sb-price-3-toggle").prop("checked", $(this).hasClass("yearly")).trigger("change");
	});
}


/*
	step-2 tabs — hovering (or clicking) a tab or a card opens that card, leaving the block restores the default one
*/
function sbStepTabs() {
	var $wrap = $(".sb-step-2-wrap");

	if (!$wrap.length) return;

	var $items = $wrap.find("[data-step]");
	var defaultStep = $wrap.find(".sb-step-2-card.active").data("step");

	function open(step) {
		$items.removeClass("active").filter("[data-step=\"" + step + "\"]").addClass("active");
	}

	$items.on("mouseenter focus click", function () {
		open($(this).data("step"));
	});

	$wrap.on("mouseleave", function () {
		open(defaultStep);
	});
}


/*
	step-3 tabs — hovering (or clicking) a tab opens it and swaps the screenshot, the last opened tab stays active
*/
function sbStep3Tabs() {
	var $wrap = $(".sb-step-3-wrap");

	if (!$wrap.length) return;

	var $items = $wrap.find("[data-step]");

	$wrap.find(".sb-step-3-tab").on("mouseenter focus click", function () {
		var step = $(this).data("step");

		$items.removeClass("active").filter("[data-step=\"" + step + "\"]").addClass("active");
	});
}


/*
	testimonial-2 slider — cards of a fixed width run past the right edge; the second card is the highlighted one (.swiper-slide-next)
*/
function sbTestimonialSlider() {
	if (!$(".sb-testimonial-2-slider").length) return;

	new Swiper(".sb-testimonial-2-slider", {
		slidesPerView: "auto",
		spaceBetween: 20,
		slidesOffsetBefore: 20,
		loop: true,
		loopAdditionalSlides: 3,
		speed: 900,
		grabCursor: true,
		autoplay: {
			delay: 3200,
			disableOnInteraction: false,
		},
	});
}


/*
	testimonial-3 slider — one review at a time (fade), the avatar row on top opens the matching review
*/
function sbTestimonial3() {
	if (!$(".sb-testimonial-3-slider").length) return;

	var $navItems = $(".sb-testimonial-3-nav-item");

	// the active pill opens exactly as wide as the name, so the growth does not stall at the end
	function measureNames() {
		$navItems.each(function () {
			var name = this.querySelector(".name");
			if (name) this.style.setProperty("--name-w", name.scrollWidth + "px");
		});
	}

	measureNames();
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureNames);
	$(window).on("resize", measureNames);

	var slider = new Swiper(".sb-testimonial-3-slider .swiper", {
		effect: "fade",
		fadeEffect: { crossFade: true },
		speed: 700,
		loop: true,
		initialSlide: $navItems.filter(".active").index() || 0,
		autoplay: {
			delay: 4500,
			disableOnInteraction: false,
		},
	});

	slider.on("slideChange", function () {
		$navItems.removeClass("active").eq(slider.realIndex).addClass("active");
	});

	$navItems.on("click", function () {
		slider.slideToLoop($(this).index());
	});
}


/*
	apps-1 ring — logos are spread around the ring in %, so it scales with the ring
*/
function sbAppsRing() {
	$(".sb-apps-1-logo").each(function () {
		var $items = $(this).find(".single-logo");
		var total = $items.length;

		$items.each(function (index) {
			// half a step of offset keeps two logos straddling the top of the ring
			var angle = ((index + 0.5) / total) * Math.PI * 2 - Math.PI / 2;

			// 45.17% of the ring width = the 542px mid-line of the band on the 1200px ring
			this.style.left = 50 + 45.17 * Math.cos(angle) + "%";
			this.style.top = 50 + 45.17 * Math.sin(angle) + "%";
		});
	});
}


/*
	home-5 smooth scroll — the css animations that never end (spins, sways, glows, shooting stars) wait while their section is
	off screen, and the ones the main thread has to repaint every frame (the header stroke, the rings, the button glow: they animate
	a custom property or a background-position, not a transform) also rest while the page is scrolling, so they never compete with the
	scroll. They are only paused, not changed: every one carries on from where it stopped
*/
function sbHome5Perf() {
	if (!document.body.classList.contains("sb-home-5") || !document.documentElement.getAnimations) return;

	// what the compositor can run alone, everything else is repainted by the main thread
	var smooth = ["offset", "computedOffset", "easing", "composite", "transform", "opacity", "translate", "rotate", "scale"];
	var scrolling = false;
	var timer;
	var groups = [];

	function collect(group) {
		group.items = group.el.getAnimations({ subtree: true }).filter(function (anim) {
			return anim.effect && anim.effect.getComputedTiming().iterations === Infinity;
		}).map(function (anim) {
			return {
				anim: anim,
				heavy: anim.effect.getKeyframes().some(function (frame) {
					return Object.keys(frame).some(function (key) { return smooth.indexOf(key) === -1; });
				})
			};
		});
	}

	function apply(group, onlyHeavy) {
		group.items.forEach(function (item) {
			if (onlyHeavy && !item.heavy) return;

			var target = item.anim.effect.target;

			if (!group.visible || (item.heavy && scrolling)) {
				item.anim.pause();
			// an animation the css itself holds (the hovered button glow) stays held
			} else if (!target || getComputedStyle(target, item.anim.effect.pseudoElement).animationPlayState.indexOf("paused") === -1) {
				item.anim.play();
			}
		});
	}

	document.querySelectorAll("[class*=\"-5-area\"]").forEach(function (el) {
		var group = { el: el, items: [], visible: true };

		groups.push(group);
		collect(group);

		// the header is always on screen, only the scroll rest applies to it
		if (el.tagName === "HEADER") return;

		new IntersectionObserver(function (entries) {
			group.visible = entries[0].isIntersecting;
			collect(group);
			apply(group);
		}, { rootMargin: "300px 0px" }).observe(el);
	});

	window.addEventListener("scroll", function () {
		if (!scrolling) {
			scrolling = true;
			groups.forEach(function (group) { apply(group, true); });
		}

		clearTimeout(timer);
		timer = setTimeout(function () {
			scrolling = false;
			groups.forEach(function (group) { apply(group, true); });
		}, 150);
	}, { passive: true });
}


/*
	hero-1 slider — the background and the text fade together, the food card has its own slider that tips up in 3D
*/
function kfHero1Slider() {
	if (!$(".kf-hero-1-slider").length) return;

	new Swiper(".kf-hero-1-slider", {
		effect: "fade",
		fadeEffect: { crossFade: true },
		speed: 1000,
		rewind: true,
		// autoplay: {
		// 	delay: 5000,
		// 	disableOnInteraction: false,
		// },
	});

	// a looping vertical slider needs more slides than the cards it shows, with only two it jumps instead of sliding
	var $cards = $(".kf-hero-1-card-slider .swiper-wrapper");
	if ($cards.children().length < 4) {
		$cards.append($cards.children().clone().attr("aria-hidden", "true"));
	}

	// the card leaves upwards tipping back into the screen, the next one rises tipped the other way, like cards on a drum
	new Swiper(".kf-hero-1-card-slider", {
		direction: "vertical",
		effect: "creative",
		creativeEffect: {
			perspective: true,
			limitProgress: 1,
			// negative opacity = the card is invisible for the first part of the way: the one leaving is gone just before half way
			// and the one arriving shows up just after it, so the two never overlap as ghosts
			prev: {
				translate: [0, "-40%", -300],
				rotate: [90, 0, 0],
				opacity: -1.2,
			},
			next: {
				translate: [0, "40%", -300],
				rotate: [-90, 0, 0],
				opacity: -0.8,
			},
		},
		speed: 900,
		loop: true,
		autoplay: {
			delay: 3500,
			disableOnInteraction: false,
		},
	});
}


/*
	products-1 slider — cards of a fixed width run past the edges, the line under them shows how far the slider has gone
*/
function kfProducts1Slider() {
	if (!$(".kf-products-1-slider").length) return;

	new Swiper(".kf-products-1-slider", {
		loop: true,
		slidesPerView: "auto",
		spaceBetween: 20,
		slidesOffsetBefore: 20,
		slidesOffsetAfter: 20,
		speed: 700,
		grabCursor: true,
		navigation: {
			prevEl: ".kf-products-1-btn.prev",
			nextEl: ".kf-products-1-btn.next",
		},
		pagination: {
			el: ".kf-products-1-pagination",
			type: "progressbar",
		},
	});
}


/*
	about-1 slider — two pictures that are always both on show, the one on top and the one under it swap places
	(the movement and the layer change are in the css, this only flips which one is in front)
*/
function kfAbout1Slider() {
	var $slides = $(".kf-about-1-slide");
	if ($slides.length < 2) return;

	setInterval(function () {
		$slides.toggleClass("is-front");
	}, 4000);
}


/*
	about-1 scroll motion — while the section passes, the pizza comes down from above and the round dish makes one full turn
*/
function kfAbout1Parallax() {
	var pizza = document.querySelector(".kf-about-1-parallax-img");
	var dish = document.querySelector(".kf-about-1-sm-img");
	if ((!pizza && !dish) || prefersReducedMotion()) return;

	var scrollTrigger = {
		trigger: ".kf-about-1-area",
		start: "top bottom",
		end: "bottom top",
		scrub: true
	};

	if (pizza) {
		gsap.fromTo(pizza, { y: -200 }, { y: 150, ease: "none", scrollTrigger: scrollTrigger });
	}

	if (dish) {
		gsap.fromTo(dish, { rotation: 0 }, { rotation: 360, ease: "none", scrollTrigger: scrollTrigger });
	}
}


/*
	opening-1 parallax — the photo is taller than its frame and runs against the scroll: while the frame passes
	through the screen it slides down inside it, so the picture seems to sit deeper than the page
*/
function kfOpening1Parallax() {
	var photo = document.querySelector(".kf-opening-1-photo");
	if (!photo || prefersReducedMotion()) return;

	gsap.fromTo(photo, { yPercent: -12 }, {
		yPercent: 12,
		ease: "none",
		scrollTrigger: {
			trigger: ".kf-opening-1-img",
			start: "top bottom",
			end: "bottom top",
			scrub: true
		}
	});
}


/*
	choose-1 sliders — the picture slider leads: its arrows also move the text slider and the number
*/
function kfChoose1Slider() {
	if (!$(".kf-choose-1-img-slider").length) return;

	var $current = $(".kf-choose-1-control .current");

	var text = new Swiper(".kf-choose-1-content-slider", {
		effect: "fade",
		fadeEffect: { crossFade: true },
		speed: 700,
		allowTouchMove: false
	});

	new Swiper(".kf-choose-1-img-slider", {
		effect: "fade",
		fadeEffect: { crossFade: true },
		speed: 900,
		navigation: {
			prevEl: ".kf-choose-1-btn.prev",
			nextEl: ".kf-choose-1-btn.next"
		},
		on: {
			slideChange: function (swiper) {
				text.slideTo(swiper.activeIndex);
				$current.text(("0" + (swiper.activeIndex + 1)).slice(-2));
			}
		}
	});
}


/*
	testimonial-1 slider — the portrait and the words fade into the next ones, the dots show which one is on
*/
function kfTestimonial1Slider() {
	if (!$(".kf-testimonial-1-slider").length) return;

	new Swiper(".kf-testimonial-1-slider", {
		effect: "fade",
		fadeEffect: { crossFade: true },
		speed: 800,
		pagination: {
			el: ".kf-testimonial-1-pagination",
			clickable: true
		}
	});
}


/*
	testimonial-1 big word — like the big title of outgrid (service-v1-title): while the page scrolls the letters rise from
	below one after the other (0.4s each, 0.2s apart, power2.out, scrubbed 1.5), fading in on the way so nothing is cut off
	by a hard edge, and the whole word slides in from the right (40% -> 0). The filled word and the outline word move
	together; from 992px up only
*/
function kfTestimonial1BgText() {
	var texts = document.querySelectorAll(".kf-testimonial-1-bg-text");
	if (!texts.length || prefersReducedMotion()) return;

	gsap.matchMedia().add("(min-width: 992px)", function () {
		var splits = [];
		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: texts[0],
				start: "top bottom",
				end: "bottom 50%",
				scrub: 1.5
			}
		});

		tl.fromTo(texts, { xPercent: 40 }, { xPercent: 0, duration: 1.6, ease: "none" }, 0);

		texts.forEach(function (text) {
			var split = new SplitText(text, { type: "chars" });
			splits.push(split);
			tl.fromTo(split.chars, { yPercent: 200, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.2 }, 0);
		});

		return function () {
			splits.forEach(function (split) {
				split.revert();
			});
		};
	});
}


/*
	footer-1 big title — the word is served: the letters come up from behind the line one after another like dishes
	from the pass, each one clearing from a blur (steam) as it lands
*/
function kfFooter1BigTitle() {
	var title = document.querySelector(".kf-footer-1-name-text");
	if (!title || prefersReducedMotion()) return;

	var letters = title.querySelectorAll("span");

	gsap.fromTo(letters, {
		yPercent: 120,
		opacity: 0,
		filter: "blur(12px)"
	}, {
		yPercent: 0,
		opacity: 1,
		filter: "blur(0px)",
		duration: 1.3,
		ease: "power3.out",
		stagger: .1,
		scrollTrigger: {
			trigger: ".kf-footer-1-big-title",
			start: "top 92%",
			once: true
		},
		onComplete: function () {
			gsap.set(letters, { clearProps: "opacity,filter,transform" });
		}
	});
}


/*
	footer-1 photos — every tile is a covered dish: a lid with a gold rim and a knob lifts off it, tile after tile, while
	the photo settles from a closer view; the lids are made here, so without the script (or with reduced motion) the
	photos are simply there. The photos have a css transition for the hover, which is switched off while gsap moves them
*/
function kfFooter1Images() {
	var box = document.querySelector(".kf-footer-1-img-box");
	if (!box || prefersReducedMotion()) return;

	var photos = box.querySelectorAll(".kf-footer-1-img-photo");
	var lids = [];

	box.querySelectorAll(".kf-footer-1-img-item").forEach(function (tile) {
		var lid = document.createElement("div");
		lid.className = "kf-footer-1-img-lid";
		tile.appendChild(lid);
		lids.push(lid);
	});

	gsap.set(photos, { transition: "none", scale: 1.25 });

	gsap.timeline({
		scrollTrigger: {
			trigger: box,
			start: "top 85%",
			once: true
		},
		onComplete: function () {
			gsap.set(photos, { clearProps: "transition,transform" });
			lids.forEach(function (lid) {
				lid.remove();
			});
		}
	})
		.to(lids, { yPercent: -101, duration: 1.1, ease: "power3.inOut", stagger: .14 }, 0)
		.to(photos, { scale: 1, duration: 1.6, ease: "power2.out", stagger: .14 }, 0);
}


/*
	page lifecycle
*/
function afterPreloader() {
	sbHeroGlow();
	sbHero3Play();
	sbHero4Play();
	sbHero5Play();
	sbPartnerTitle();
	sbPartner5Line();
	sbFeaturesCard1();
	sbFeaturesCard2();
	sbFeaturesMenu();
	sbFeatures2Panels();
	sbFeatures3();
	sbFeatures5Cards();
	sbCoreFeatures5Cards();
	sbIntegration3Swap();
	sbTestimonial3Author();
	sbFooter3Social();
	sbFooter3BigTitle();
	sbFooter5Logo();
	sbAbout2Parallax();
	sbCta2Intro();
	sbFaqs2Card();
	sbFooter2Intro();
	sbServicesBg();
	sbTestimonialGlow();
	sbCtaIntro();
	sbHeroPlay();
	sbHero2Play();
	sbTitlePlay();
	sbTitle2Play();
	sbTitle3Play();
	sbTitle4Play();
	sbTitle5Play();
	sbUseCase4Shapes();
	sbIntegration4Glow();
	sbIntegration5Blobs();
	sbCta5Intro();
	sbFooter4Intro();
	sbFaqs4Card();
	sbHome5Perf();
}

function afterPageLoad() {
	if ($(".wow").length) {
		new WOW({
			boxClass: "wow",
			animateClass: "animated",
			offset: 100,
			mobile: true,
			live: true
		}).init();
	}
}

window.addEventListener("load", function () {

	// measure the triggers from a clean top-of-page state
	ScrollTrigger.clearScrollMemory("manual");
	window.scrollTo(0, 0);
	ScrollTrigger.refresh();

	// park the titles and the hero while the curtain is still up
	sbTitleSplit();
	sbTitle2Split();
	sbTitle3Split();
	sbTitle4Split();
	sbTitle5Split();
	sbHeroPark();
	sbHero2Park();
	sbHero3Park();
	sbHero4Park();
	sbHero5Park();

	if (sbPreloader) {
		sbPreloader.done();
	} else {
		afterPreloader();
	}

	afterPageLoad();
});

sbHeroBottomGlow();
sbStepAnimations();
sbStepTabs();
sbStep3Tabs();
kfHero1Slider();
kfProducts1Slider();
kfAbout1Slider();
kfAbout1Parallax();
kfOpening1Parallax();
kfChoose1Slider();
kfTestimonial1Slider();
kfTestimonial1BgText();
kfFooter1BigTitle();
kfFooter1Images();
sbTestimonialSlider();
sbTestimonial3();
sbPriceToggle();
sbPrice3Toggle();
sbPrice5Toggle();
sbAppsRing();

})(jQuery);
