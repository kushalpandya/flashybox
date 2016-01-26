/**
 * Flashybox v0.1.0
 * A jQuery Plugin to Show image collage as flashy boxes.
 *
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 25 January, 2015
 *
 * Flashybox Plugin.
 */

(function(factory) {
    'use strict';

    /**
     * Enable Module System to support CommonJS.
     * courtesy: SO <http://stackoverflow.com/a/11890239/414749>
     */
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else if (typeof exports === 'object') {
        module.exports = factory;
    }
    else {
        factory(jQuery);
    }

}(function($) {
    'use strict';

    var fullBoxTpl,
        lrBoxTpl,
        tbBoxTpl,
        prevBoxOrder = 0,
        fnGetNextBoxTpl,
        fnStrFormat,
        fnGetRandom,
        fnSwapImageSrc;

    fullBoxTpl = [
        '<span class="flashybox-item flashbox-full" style="width: {0}px;">',
            '<span class="image-container"><img src="{1}" alt="" /></span>',
        '</span>'
    ].join('');

    lrBoxTpl = [
        '<span class="flashybox-item flashbox-leftright" style="width: {0}px;">',
            '<span class="childbox-item childbox-full">',
                '<span class="image-container"><img src="{1}" alt="" /></span>',
            '</span>',
            '<span class="childbox-item childbox-topbottom">',
                '<span class="image-container"><img src="{2}" alt="" /></span>',
                '<span class="image-container"><img src="{3}" alt="" /></span>',
            '</span>',
        '</span>'
    ].join('');

    tbBoxTpl = [
        '<span class="flashybox-item flashbox-topbottom" style="width: {0}px;">',
            '<span class="childbox-item childbox-leftright">',
                '<span class="image-container"><img src="{1}" alt="" /></span>',
                '<span class="image-container"><img src="{2}" alt="" /></span>',
            '</span>',
            '<span class="childbox-item childbox-full">',
                '<span class="image-container"><img src="{3}" alt="" /></span>',
            '</span>',
        '</span>'
    ].join('');

    /**
     * String formatter.
     * Accepts first param as target string, and following params as strings to
     * replace placeholders (eg; {0}).
     * courtesy: SO <http://stackoverflow.com/a/1038930/414749>
     */
    fnStrFormat = function() {
        var s = arguments[0],
            reg,
            i;

        for (i = 0; i < arguments.length - 1; i++) {
            reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    };

    /**
     * Gets Next Box Tpl which is not matching the previous (thus keeping unique boxes together).
     */
    fnGetNextBoxTpl = function() {
        if (prevBoxOrder === 0)
        {
            prevBoxOrder = 1;
            return {type: 1, tpl: fullBoxTpl};
        }
        else if (prevBoxOrder === 1)
        {
            prevBoxOrder = 2;
            return {type: 2, tpl: lrBoxTpl};
        }
        else if (prevBoxOrder === 2)
        {
            prevBoxOrder = 3;
            return {type: 1, tpl: fullBoxTpl};
        }
        else
        {
            prevBoxOrder = 0;
            return {type: 3, tpl: tbBoxTpl};
        }
    };

    /**
     * Quick Random number generator between 0 to max.
     */
    fnGetRandom = function(max) {
        return Math.floor(Math.random() * (max - 1 + 1)) + 1;
    };

    /**
     * Core plugin method.
     */
    $.fn.flashybox = function(config) {
        var defaultConfig = {},
            containerWidth = this.width(),
            imagesList = this.find('img'),
            imagesCount = imagesList.length,
            imagesSrcList = [],
            imageIndex = 0,
            totalWidth = 0,
            masterTpl = '',
            intervalObj,
            currentBoxTpl,
            fnSwapImageSrc,
            i;

        /*** Default config options that Flashybox provides. ***/
        defaultConfig = {
            boxWidth: 300,                  // Width to Keep for each Flashy Box containing images.
            boxHeight: 250,                 // Height to keep for each Flasy Box.
            flashInterval: 3000,            // Interval to wait before flash
            animationDuration: "slow",      // Duration for animation; value can be anything that jQuery fadeIn/fadeOut duration supports.
            flashAllAtOnce: false,          // Flash all Images at Once.
            flashAtOnce: 1                  // Provide number of images to flash at once (applicable only if flashAllAtOnce is false)
        };

        // Override with user config.
        config = $.extend(defaultConfig, config);

        /**
         * Core flashing method.
         * It fadesOut the image, then replaces its src with the provided imageSrc
         * and fadesIn the image again.
         */
        fnSwapImageSrc = function($imageRef, imageSrc) {
            $imageRef.fadeOut(config.animationDuration, function() {
                $imageRef.attr('src', imageSrc);
                $imageRef.fadeIn(config.animationDuration);
            });
        };

        // Generate Flashy boxes until combined width of all the generated boxes matches with the container.
        while (totalWidth < containerWidth)
        {
            currentBoxTpl = fnGetNextBoxTpl();

            // If it is Flashy box full && there are enough images available for box to fill in.
            if (currentBoxTpl.type === 1 &&
                imageIndex + 1 <= imagesCount)
            {
                masterTpl += fnStrFormat(currentBoxTpl.tpl,
                                config.boxWidth,
                                $(imagesList[imageIndex]).attr('src')
                             );
                imageIndex++;
                totalWidth += config.boxWidth;
            }
            // If it is Flashy box left-right or top-bottom && there are at least 3 images available.
            else if (imageIndex + 3 <= imagesCount)
            {
                masterTpl += fnStrFormat(currentBoxTpl.tpl,
                    config.boxWidth,
                    $(imagesList[imageIndex++]).attr('src'),
                    $(imagesList[imageIndex++]).attr('src'),
                    $(imagesList[imageIndex++]).attr('src')
                );

                totalWidth += config.boxWidth;
            }

            // If width of all boxes combined is still less than container width.
            // and we have ran out of images, reset the index.
            if (totalWidth < containerWidth &&
                imageIndex >= imagesCount)
                imageIndex = 0;
        }

        this.html(masterTpl);
        this.height(config.boxHeight);

        // Collect all image sources.
        imagesList = this.find('img');
        for (i = 0; i < imagesList.length; i++)
            imagesSrcList.push($(imagesList[i]).attr('src'));

        // Start Slideshow.
        intervalObj = setInterval(function() {
            var imagesListCount = imagesList.length,
                targetImg = imagesList[fnGetRandom(imagesListCount)],
                newImgSrc = imagesSrcList[fnGetRandom(imagesListCount)];

            if (config.flashAllAtOnce)
            {
                imagesList.each(function(index, imgItem) {
                    fnSwapImageSrc($(imgItem), imagesSrcList[fnGetRandom(imagesListCount)]);
                });
            }
            else
            {
                if (config.flashAtOnce > 1)
                {
                    for (i = 0; i < config.flashAtOnce; i++)
                    {
                        fnSwapImageSrc(
                            $(imagesList[fnGetRandom(imagesListCount)]),
                            imagesSrcList[fnGetRandom(imagesListCount)]
                        );
                    }
                }
                else
                    fnSwapImageSrc($(targetImg), newImgSrc);
            }
        }, config.flashInterval);
    };
}));
