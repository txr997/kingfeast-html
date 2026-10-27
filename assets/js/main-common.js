/*
	Template Name: SaasRiver - SaaS & StartUp HTML Template
	Author: https://themexriver.com/
	Version: 1.0
*/


(function ($) {
"use strict";

// 	lenis-smooth-scroll-activation
const lenis = new Lenis({
	duration: .5,
    easing: (t) => 1 - Math.pow(1 - t, 3),
	direction: 'vertical', 
	wheelMultiplier: 0.85,
	smoothWheel: true,
	smoothTouch: false,
});
function raf(time) {
	lenis.raf(time);
	requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
$('a[href^="#"]').on('click', function (e) {
	e.preventDefault(); 

	const target = $(this.getAttribute('href')); 

	if (target.length) {
        lenis.scrollTo(target[0], {
            duration: 1.15,
            easing: (t) => 1 - Math.pow(1 - t, 3),
        });
	}
});


CustomEase.create("ease1", "0.16,1,0.3,1");
gsap.registerPlugin(
	ScrollTrigger,
	CustomEase,
	SplitText
);
gsap.config({
	nullTargetWarn: false,
});

// sticky-header-function
function waStickyHeader() {
    var $window = $(window);
    var lastScrollTop = 0;
    var $header = $('.wa_sticky_header');
    var headerHeight = $header.outerHeight() + 30;

    $window.scroll(function () {
      var windowTop = $window.scrollTop();

      if (windowTop >= headerHeight) {
        $header.addClass('wa_sticky');
      } else {
        $header.removeClass('wa_sticky');
        $header.removeClass('wa_sticky_show');
      }

      if ($header.hasClass('wa_sticky')) {
        if (windowTop < lastScrollTop) {
          $header.addClass('wa_sticky_show');
        } else {
          $header.removeClass('wa_sticky_show');
        }
      }

      lastScrollTop = windowTop;
    });
}
waStickyHeader();




// 	offcanvas-function
$('.offcanvas_toggle').on('click', function() {
    $('.wa-overly, .offcanvas_box_active').addClass('active');
});

$('.wa-overly, .offcanvas_box_close').on('click', function() {
    $('.offcanvas_box_active').removeClass('active');
    $('.wa-overly').removeClass('active');
});

$(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
        $('.offcanvas_box_active').removeClass('active');
        $('.wa-overly').removeClass('active');
    }
});

$('.offcanvas_box_active a').on('click', function() {
    $('.offcanvas_box_active').removeClass('active'); 
    $('.wa-overly').removeClass('active'); 
});




/* 
	mobile menu dropdown function
*/
jQuery(".mobile-main-navigation li.dropdown").append(
  '<span class="dropdown-btn"><i class="fa-solid fa-angle-right"></i></span>'
);
jQuery(".mobile-main-navigation li .dropdown-btn").on("click", function () {
  const $btn = jQuery(this);
  const $dropdownMenu = $btn.parent().find("> .dropdown-menu");

  if ($btn.hasClass("active")) {
    $btn.removeClass("active");
    $dropdownMenu.removeClass("active").slideUp();
  } else {
    const $parentUl = $btn.closest("ul");
    $parentUl.find(".dropdown-btn.active").removeClass("active");
    $parentUl.find(".dropdown-menu.active").removeClass("active").slideUp();

    // Open this one
    $btn.addClass("active");
    $dropdownMenu.addClass("active").slideDown();
  }
});


// search-popup-function
$('.search_btn_toggle').on('click', function() {
    $('.wa-overly, .search_box_active').addClass('active');
});

$('.wa-overly, .search_box_close').on('click', function() {
    $('.search_box_active').removeClass('active');
    $('.wa-overly').removeClass('active');
});

$(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
        $('.search_box_active').removeClass('active');
        $('.wa-overly').removeClass('active');
    }
});


// current-year-function
if ($('.wa_current_year').length) {
    const currentYear = new Date().getFullYear();
    $('.wa_current_year').text(currentYear);
}


// marquee-activation
$('.wa_marquee').each(function () {

	let $this = $(this);

	let speed = $this.data('speed') || 20;
	let direction = $this.data('direction') || 'left';
	let pauseOnHover = $this.data('pause');

	if (pauseOnHover === undefined) {
		pauseOnHover = false;
	}

	$this.marquee({
		speed: speed,
		gap: 0,
		delayBeforeStart: 0,
		startVisible: true,
		direction: direction,
		duplicated: true,
		pauseOnHover: pauseOnHover,
	});

});

// marquee-down-top
if ($(".wa_marquee_down_top").length) {
  document.querySelectorAll(".wa_marquee_down_top").forEach((waMarqueeTop) => {
    const waMarqueeClone = waMarqueeTop.cloneNode(true);
    waMarqueeTop.parentNode.appendChild(waMarqueeClone);

    const waMarqueeTotalHeight = waMarqueeTop.offsetHeight;

    gsap.to([waMarqueeTop, waMarqueeClone], {
      y: `-${waMarqueeTotalHeight}px`,
      ease: "none",
      duration: 40,
      repeat: -1,
      modifiers: {
        y: gsap.utils.unitize((waY) => parseFloat(waY) % waMarqueeTotalHeight),
      },
    });
  });
}


// marquee-top-down
if ($(".wa_marquee_top_down").length) { 
	const waMarqueeTopDown = document.querySelector('.wa_marquee_top_down');
	const waMarqueeTopDownClone = waMarqueeTopDown.cloneNode(true);
	waMarqueeTopDown.parentNode.appendChild(waMarqueeTopDownClone);
	
	const waMarqueeTopDownHeight = waMarqueeTopDown.offsetHeight;
	
	gsap.to(".wa_marquee_top_down", {
	  y: `${waMarqueeTopDownHeight}px`, 
	  ease: "none",
	  duration: 40,
	  repeat: -1,
	  modifiers: {
		y: gsap.utils.unitize(waY => parseFloat(waY) % waMarqueeTopDownHeight)
	  }
	});
}



// faqs-active-class
$(document).on('click', '.wa_accordion_item', function () {

	if ($(this).hasClass('active')) {
		$(this).removeClass('active');
	} else {
		$(this).addClass('active').siblings().removeClass('active');
	}

});


// placeholder-typing
document.querySelectorAll(".wa_placeholder").forEach(waPlaceholderInput => {
	const waPlaceholderText = waPlaceholderInput.placeholder; 
	const waStartDelay = waPlaceholderInput.dataset.startDelay ? parseInt(waPlaceholderInput.dataset.startDelay) : 0; 
	let waPlaceholderIndex = 0;
	waPlaceholderInput.placeholder = "";

	const waPlaceholderObserver = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				waPlaceholderType();
				waPlaceholderObserver.unobserve(waPlaceholderInput);
			}
		});
	}, { threshold: 0.5 });

	setTimeout(() => {
		waPlaceholderObserver.observe(waPlaceholderInput);
	}, waStartDelay);

	function waPlaceholderType() {
		if (waPlaceholderIndex < waPlaceholderText.length) {
			waPlaceholderInput.placeholder += waPlaceholderText.charAt(waPlaceholderIndex);
			waPlaceholderIndex++;
			setTimeout(waPlaceholderType, 70); 
		}
	}
});

// bootstrap-tooltip-activation
$(function () {
	$('[data-toggle="tooltip"]').tooltip()
})

// back-to-top-button-function
if ($('.wa_backToTop').length) {
    var scrollTopbtn = document.querySelector('.wa_backToTop');
    var offset = 500; 
    var duration = 1000; 

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > offset) {
            $(scrollTopbtn).addClass('active');
        } else {
            $(scrollTopbtn).removeClass('active');
        }
    });

    $(scrollTopbtn).on('click', function (event) {
        event.preventDefault();

        // css has `scroll-behavior: smooth`, which delays every scrollTop we set
        // during the animation, so turn it off while we drive the scroll ourselves
        var rootEl = document.documentElement;
        var prevScrollBehavior = rootEl.style.scrollBehavior;
        rootEl.style.scrollBehavior = 'auto';

        $('html, body').stop(true);

        var startY = window.pageYOffset || rootEl.scrollTop;
        var startTime = null;

        function waScrollStep(now) {
            if (startTime === null) startTime = now;
            var progress = Math.min((now - startTime) / duration, 1);
            // easeOutCubic: moves immediately on click, then eases into the top
            var eased = 1 - Math.pow(1 - progress, 3);

            window.scrollTo(0, Math.round(startY * (1 - eased)));

            if (progress < 1) {
                requestAnimationFrame(waScrollStep);
            } else {
                rootEl.style.scrollBehavior = prevScrollBehavior;
            }
        }

        requestAnimationFrame(waScrollStep);
    });
}

// popup-video-activation
if($('.popup_video').length) {
	$('.popup_video').magnificPopup({
		type: 'iframe'
	});
}

// popup-image-activation
if($('.popup_img').length) {
	$('.popup_img').magnificPopup({
		type: 'image',
		gallery: {
			enabled: true,
		},
	});
}


// nice-selector-activation
if($('.nice-select').length) {
	$('.nice-select select').niceSelect();
}


// background-image-function
$("[data-background]").each(function(){
	$(this).css("background-image","url("+$(this).attr("data-background") + ") ")
})

// data-mask-image
$('[data-mask-image]').each(function() {
    $(this).css({
        'mask-image': 'url('+ $(this).attr('data-mask-image') + ')',
        '-webkit-mask-image': 'url('+ $(this).attr('data-mask-image') + ')'
    });
});



// odomater-activation
$('.odometer').appear(function () {
    var $this = $(this); 
    var countNumber = $this.attr("data-count");
    $this.html(countNumber);
});


// current-year-function
if ($('.wa_current_year').length) {
    const currentYear = new Date().getFullYear();
    $('.wa_current_year').text(currentYear);
}

// get-height
if ($(".wa_height_set").length) { 
	const wa_height_set = document.querySelector('.wa_height_set');
	const wa_height_get = document.querySelector('.wa_height_get');
	function setDynamicHeight() {
	if (wa_height_get && wa_height_set) {
		wa_height_set.style.height = wa_height_get.offsetHeight + 'px';
	}
	}
	setDynamicHeight();
	window.addEventListener('resize', setDynamicHeight);
}


if ($(".wa_cursor_magnetic_1").length) {
    var waMagnets3 = document.querySelectorAll('.wa_cursor_magnetic_1');
    var waStrength3 = 100;

    waMagnets3.forEach((magnet) => {
        magnet.addEventListener('mousemove', moveMagnet3);
        magnet.addEventListener('mouseout', function(event) {
            const innerElements = event.currentTarget.querySelectorAll('.wa_cursor_magnetic_1_elm');
            innerElements.forEach((elm) => {
                gsap.to(elm, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    });

    function moveMagnet3(event) {
        var magnetButton = event.currentTarget;
        var bounding = magnetButton.getBoundingClientRect();
        const innerElements = magnetButton.querySelectorAll('.wa_cursor_magnetic_1_elm');

        const xMove = (((event.clientX - bounding.left) / magnetButton.offsetWidth) - 0.5) * waStrength3;
        const yMove = (((event.clientY - bounding.top) / magnetButton.offsetHeight) - 0.5) * waStrength3;

        innerElements.forEach((elm) => {
            gsap.to(elm, {
                x: xMove,
                y: yMove,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    }
}

if ($(".wa_cursor_magnetic_2").length) {
    var waMagnets4 = document.querySelectorAll('.wa_cursor_magnetic_2');
	// data-strength="100"
    waMagnets4.forEach((magnet) => {
        magnet.addEventListener('mousemove', moveMagnet4);
        magnet.addEventListener('mouseout', function(event) {
            const innerElements = event.currentTarget.querySelectorAll('.wa_cursor_magnetic_2_elm');
            innerElements.forEach((elm) => {
                gsap.to(elm, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    });

    function moveMagnet4(event) {
        var magnetButton = event.currentTarget;
        var bounding = magnetButton.getBoundingClientRect();
        const innerElements = magnetButton.querySelectorAll('.wa_cursor_magnetic_2_elm');

        var waStrength4 = parseFloat(magnetButton.dataset.strength) || 100;

        const xMove = (((event.clientX - bounding.left) / magnetButton.offsetWidth) - 0.5) * waStrength4;
        const yMove = (((event.clientY - bounding.top) / magnetButton.offsetHeight) - 0.5) * waStrength4;

        innerElements.forEach((elm) => {
            gsap.to(elm, {
                x: xMove,
                y: yMove,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    }
}



// progress-animation
const wa_progress_ani = document.querySelectorAll('.wa_progress_ani');
wa_progress_ani.forEach((elm) => {
	gsap.from(elm, {
		width: "0",
		duration: 2,
		ease: "power1.inOut",

		scrollTrigger: {
			trigger: elm,
			start: "top 90%",   
			toggleActions: "play none none none",
		}
	});
});


// hover-toggle-class
if($(".wa_hover_class_toggle").length) {
    const wa_hover_class = document.querySelectorAll(".wa_hover_class_toggle");
    const defaultActive = document.querySelector(".wa_hover_class_toggle.active");
    wa_hover_class.forEach(card => {
        card.addEventListener("mouseenter", function () {
            wa_hover_class.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
        });
        card.addEventListener("mouseleave", function () {
            wa_hover_class.forEach(c => c.classList.remove("active"));
            if (defaultActive) {
                defaultActive.classList.add("active");
            }

        });
    });
};

// hover-toggle-class for .wa_hover_class_toggle2
if($(".wa_hover_class_toggle2").length) {
    const wa_hover_class2 = document.querySelectorAll(".wa_hover_class_toggle2");
    const defaultActive2 = document.querySelector(".wa_hover_class_toggle2.active");
    wa_hover_class2.forEach(card => {
        card.addEventListener("mouseenter", function () {
            wa_hover_class2.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
        });
        card.addEventListener("mouseleave", function () {
            wa_hover_class2.forEach(c => c.classList.remove("active"));
            if (defaultActive2) {
                defaultActive2.classList.add("active");
            }

        });
    });
};

// hover-toggle-class for .wa_hover_class_toggle3
if($(".wa_hover_class_toggle3").length) {
    const wa_hover_class3 = document.querySelectorAll(".wa_hover_class_toggle3");
    const defaultActive3 = document.querySelector(".wa_hover_class_toggle3.active");
    wa_hover_class3.forEach(card => {
        card.addEventListener("mouseenter", function () {
            wa_hover_class3.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
        });
        card.addEventListener("mouseleave", function () {
            wa_hover_class3.forEach(c => c.classList.remove("active"));
            if (defaultActive3) {
                defaultActive3.classList.add("active");
            }

        });
    });
};


// wa-bg-parallax
gsap.utils.toArray(".wa_parallax_bg").forEach(element => {
	gsap.fromTo(
		element,
		{ backgroundPosition: "50% 0%" }, 
		{ 
			backgroundPosition: "50% 100%", 
			ease: "none",
			scrollTrigger: {
				trigger: element,
				scrub: 1,    
				markers: false,  
			},
		}
	);
});

// wa-parallax-img
gsap.utils.toArray(".wa_parallax_img").forEach(element => {
	gsap.fromTo(
		element,
		{ objectPosition: "50% 110%" }, 
		{ 
			objectPosition: "50% 0%", 
			ease: "none",
			scrollTrigger: {
				trigger: element,
				scrub: true,    
				markers: false,     
			},
		}
	);
});

// wa_zoomOut_img
gsap.utils.toArray(".wa_zoomOut_img").forEach(wa_zoomOut_img => {
	gsap.fromTo(
		wa_zoomOut_img,
		{ scale: 1.15 }, 
		{ 
			scale: 1, 
			ease: "power1.inOut",
			duration: .5,
			scrollTrigger: {
				trigger: wa_zoomOut_img,
				start: "top 70%",
				markers: false,     
			},
		}
	);
});

	

// wa_parallax_elm
if($(".wa_parallax_elm").length) {
	document.addEventListener("mousemove", wa_parallax_handler);
	function wa_parallax_handler(e) {
		const items = document.querySelectorAll(".wa_parallax_elm");
	
		items.forEach((el) => {
			const speed = parseFloat(el.getAttribute("data-value")) || 0;
			const x = (e.clientX * speed) / 250;
			const y = (e.clientY * speed) / 250;
	
			el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
		});
	}
}




})(jQuery);