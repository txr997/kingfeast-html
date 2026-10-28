/*
	Template Name: KingFeast - Restaurant HTML Template
	Author: https://themexriver.com/
	Version: 1.0
*/

(function ($) {
"use strict";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/*
	preloader-1 — the counter follows the images that are loaded and jumps to 100 on
	window load, the food photos keep wiping over each other, then the panel fades out
*/
function kfPreloaderInit() {

	var loader = document.querySelector(".kf-preloader-1");
	if (!loader) return null;

	if (prefersReducedMotion()) {
		return {
			done: function () {
				loader.remove();
				afterPreloader();
			}
		};
	}

	var count = loader.querySelector(".kf-preloader-1-count");
	var items = loader.querySelectorAll(".kf-preloader-1-item");
	var num = { val: 0 };
	var shown = 0;
	var layer = 1;
	var exited = false;

	gsap.from(loader.querySelectorAll(".kf-preloader-1-logo, .kf-preloader-1-label, .kf-preloader-1-frame, .kf-preloader-1-counter"), {
		y: 30,
		opacity: 0,
		duration: .8,
		ease: "power3.out",
		stagger: .1
	});

	// the next photo wipes up over the one before; one that is not loaded yet is skipped
	function nextPhoto() {
		for (var n = 1; n <= items.length; n++) {
			var i = (shown + n) % items.length;
			var photo = items[i].querySelector("img");

			if (!photo.complete || !photo.naturalWidth) continue;

			shown = i;
			gsap.set(items[i], { zIndex: layer++ });
			gsap.fromTo(items[i],
				{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.3 },
				{ clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: .6, ease: "power3.inOut" }
			);
			return;
		}
	}

	var swapper = gsap.to({}, { duration: .5, repeat: -1, onRepeat: nextPhoto });

	function render() {
		count.textContent = Math.round(num.val);
	}

	function setProgress(p) {
		gsap.to(num, {
			val: p,
			duration: p >= 100 ? .4 : .7,
			ease: "power1.out",
			overwrite: true,
			onUpdate: render,
			onComplete: p >= 100 ? exit : null
		});
	}

	function exit() {
		if (exited) return;
		exited = true;

		var tl = gsap.timeline();

		tl.to(loader.querySelectorAll(".kf-preloader-1-top, .kf-preloader-1-frame, .kf-preloader-1-bottom"), {
			y: -30,
			opacity: 0,
			duration: .5,
			ease: "power2.in",
			stagger: .06
		});
		tl.to(loader, {
			opacity: 0,
			duration: .8,
			ease: "power2.inOut"
		}, .4);

		// the intro starts while the panel is still fading
		tl.call(afterPreloader, null, .7);
		tl.call(function () {
			swapper.kill();
			loader.remove();
		}, null, 1.3);
	}

	// lazy images do not hold the page
	var imgs = Array.prototype.filter.call(document.images, function (el) {
		return el.loading !== "lazy" && !loader.contains(el);
	});
	var loaded = 0;

	function imgDone() {
		loaded++;
		setProgress(Math.min(90, (loaded / imgs.length) * 90));
	}

	imgs.forEach(function (el) {
		if (el.complete) {
			loaded++;
		} else {
			el.addEventListener("load", imgDone);
			el.addEventListener("error", imgDone);
		}
	});
	setProgress(imgs.length ? Math.min(90, (loaded / imgs.length) * 90) : 10);

	return {
		done: function () {
			setProgress(100);
		}
	};
}

var kfPreloader = kfPreloaderInit();


/*
	hero-1 intro — parked before the preloader lifts, played right after: the two red lights swell in, then the
	letters of the big title come up from behind the bottom edge one after another, clearing from a blur
*/
var kfHero1 = null;
var kfHero1First = null;
var kfHero1Swiper = null;

// the plain words of a title become masked words, anything else inside it stays as it is
function kfHeroWords(title) {
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

function kfHero1Park() {
	if (prefersReducedMotion()) return;

	if (kfHero1First) kfHero1First.park();

	var letters = document.querySelectorAll(".kf-hero-1-big-title span");
	var glows = document.querySelectorAll(".kf-hero-1-glow");
	if (!letters.length && !glows.length) return;

	gsap.set(glows, { opacity: 0, scale: .3 });
	gsap.set(letters, { yPercent: 120, opacity: 0, filter: "blur(12px)" });

	kfHero1 = { letters: letters, glows: glows };
}

function kfHero1Play() {
	if (kfHero1First) kfHero1First.play();
	if (!kfHero1) return;
	var hero = kfHero1;

	gsap.timeline({
		defaults: { ease: "power3.out" },
		onComplete: function () {
			gsap.set(Array.prototype.slice.call(hero.glows).concat(Array.prototype.slice.call(hero.letters)), { clearProps: "opacity,filter,transform" });
		}
	})
		.to(hero.glows, { opacity: 1, scale: 1, duration: 2.2, ease: "power2.out", stagger: .25 }, 0)
		.to(hero.letters, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.3, stagger: .08 }, .3);
}


/*
	hero-1 sliders — the big slider opens each slide like an iris (plate reveal) and serves its text after it; the
	card slider turns its cards like a drum
*/
function kfHero1Slider() {
	if (!$(".kf-hero-1-slider").length) return;

	var slider = document.querySelector(".kf-hero-1-slider");
	var scenes = [];
	var rim = null;

	if (!prefersReducedMotion()) {
		$(".kf-hero-1-slider .swiper-slide").each(function () {
			var title = this.querySelector(".kf-hero-1-title");

			scenes.push({
				item: this.querySelector(".kf-hero-1-item"),
				img: this.querySelector(".kf-hero-1-img"),
				words: title ? kfHeroWords(title) : [],
				rest: Array.prototype.slice.call(this.querySelectorAll(".kf-hero-1-disc, .kf-pr-btn-1"))
			});
		});

		rim = document.createElement("div");
		rim.className = "kf-hero-1-rim";
		slider.appendChild(rim);
		gsap.set(rim, { autoAlpha: 0 });
	}

	// parked: the slide is closed (a circle of nothing) and its text is waiting below its line
	function park(scene) {
		gsap.killTweensOf([scene.item, scene.img].concat(scene.words, scene.rest));
		gsap.killTweensOf(rim);
		// the button has a css transition for its hover, it would lag behind gsap
		gsap.set(scene.rest, { transition: "none", y: 28, opacity: 0, filter: "blur(6px)" });
		gsap.set(scene.words, { yPercent: 115, rotate: 5, opacity: 0, filter: "blur(10px)", transformOrigin: "0% 100%" });
		scene.item.style.clipPath = "circle(0px at 50% 58%)";
	}

	function serve(scene) {
		var targets = [scene.item, scene.img].concat(scene.words, scene.rest);
		var iris = { r: 0 };
		// the circle opens at 50% 58% and has to reach the farthest corner
		var reach = Math.hypot(slider.clientWidth / 2, slider.clientHeight * .58) + 10;

		gsap.timeline({
			defaults: { ease: "power3.out" },
			onComplete: function () {
				scene.item.style.clipPath = "";
				gsap.set(targets, { clearProps: "transform,opacity,filter,transition" });
			}
		})
			.to(iris, {
				r: reach,
				duration: 1.5,
				ease: "power3.inOut",
				onUpdate: function () {
					scene.item.style.clipPath = "circle(" + iris.r + "px at 50% 58%)";
					rim.style.width = rim.style.height = iris.r * 2 + "px";
				}
			}, 0)
			.fromTo(rim, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2 }, 0)
			.to(rim, { autoAlpha: 0, duration: .3 }, 1.2)
			.fromTo(scene.img, { scale: 1.2 }, { scale: 1, duration: 2, ease: "power2.out" }, 0)
			// the words wait until the circle has reached the text
			.to(scene.words, { yPercent: 0, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out", stagger: .08 }, .9)
			.to(scene.rest, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: .15 }, 1.25);
	}

	kfHero1Swiper = new Swiper(".kf-hero-1-slider", {
		effect: "fade",
		fadeEffect: { crossFade: true },
		speed: 1500,
		rewind: true,
		on: {
			slideChange: function (swiper) {
				var scene = scenes[swiper.activeIndex];
				var leaving = swiper.slides[swiper.previousIndex];

				// the slide that goes out stays on screen until the circle has covered it
				Array.prototype.forEach.call(swiper.slides, function (slide) {
					slide.classList.remove("is-leaving");
				});
				if (leaving) leaving.classList.add("is-leaving");

				if (!scene) return;

				park(scene);
				serve(scene);
			},
			slideChangeTransitionEnd: function (swiper) {
				Array.prototype.forEach.call(swiper.slides, function (slide) {
					slide.classList.remove("is-leaving");
				});
			}
		},
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
		},
	});

	// the slider waits behind the preloader, afterPreloader starts it; the first slide opens right then too,
	// parked before the preloader lifts like the rest of the hero
	kfHero1Swiper.autoplay.stop();

	if (scenes.length) {
		kfHero1First = {
			park: function () {
				park(scenes[0]);
			},
			play: function () {
				serve(scenes[0]);
			}
		};
	}

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
	menu-1 scroll motion — the big round dish turns with the scroll, one full turn while the section passes
*/
function kfMenu1Rotate() {
	var dish = document.querySelector(".kf-menu-1-big-img");
	if (!dish || prefersReducedMotion()) return;

	gsap.fromTo(dish, { rotation: 0 }, {
		rotation: 360,
		ease: "none",
		scrollTrigger: {
			trigger: ".kf-menu-1-area",
			start: "top bottom",
			end: "bottom top",
			scrub: true
		}
	});
}


/*
	menu-1 background pieces — the red strip at the bottom and the pizza slide up into place when they scroll into view;
	parked with a class, played by a second class (css, see _menu.scss)
*/
function kfMenu1BgIn() {
	if (prefersReducedMotion()) return;

	document.querySelectorAll(".kf-menu-1-bg-shape, .kf-menu-1-bg-img").forEach(function (el) {
		el.classList.add("is-ani");

		ScrollTrigger.create({
			trigger: el,
			start: "top 100%",
			once: true,
			onEnter: function () {
				el.classList.add("is-in");
			}
		});
	});
}


/*
	menu-1 card dishes — every round dish in the cards turns 45deg into place while it fades in, once its card scrolls
	into view; parked with a class, played by a second class (css, see _menu.scss)
*/
function kfMenu1CardImgIn() {
	if (prefersReducedMotion()) return;

	document.querySelectorAll(".kf-menu-1-card-img").forEach(function (el) {
		el.classList.add("is-ani");

		ScrollTrigger.create({
			trigger: el,
			start: "top 90%",
			once: true,
			onEnter: function () {
				el.classList.add("is-in");
			}
		});
	});
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
		allowTouchMove: false,
	});

	new Swiper(".kf-choose-1-img-slider", {
		grabCursor: true,
		effect: "creative",
		creativeEffect: {
			prev: {
				shadow: true,
				origin: "left center",
				translate: ["-5%", 0, -200],
				rotate: [0, 100, 0],
			},
			next: {
				origin: "right center",
				translate: ["5%", 0, -200],
				rotate: [0, -100, 0],
			},
		},
		speed: 900,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
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
		// without a loop the autoplay would stop on the last slide, rewind sends it back to the first
		rewind: true,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false
		},
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
	// hero-1 card stack — the two cards under the top one fade down into place (css, see _hero.scss)
	$(".kf-hero-1-area").addClass("is-ready");

	kfHero1Play();
	if (kfHero1Swiper) kfHero1Swiper.autoplay.start();
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

	ScrollTrigger.refresh();

	// park the hero while the curtain is still up
	kfHero1Park();

	if (kfPreloader) {
		kfPreloader.done();
	} else {
		afterPreloader();
	}

	afterPageLoad();
});

kfHero1Slider();
kfProducts1Slider();
kfAbout1Slider();
kfAbout1Parallax();
kfMenu1Rotate();
kfMenu1BgIn();
kfMenu1CardImgIn();
kfOpening1Parallax();
kfChoose1Slider();
kfTestimonial1Slider();
kfTestimonial1BgText();
kfFooter1BigTitle();
kfFooter1Images();

})(jQuery);
